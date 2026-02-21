import pool from '../config/database';
import { 
  Reservation, 
  ReservationStatus, 
  CreateReservationDTO,
  TimeSlot 
} from '../../../shared/types';
import { AppError } from '../middleware/errorHandler';
import { format, parse, addMinutes } from 'date-fns';
import notificationService from './notificationService';

export class ReservationService {
  async createReservation(
    customerId: string, 
    data: CreateReservationDTO
  ): Promise<Reservation> {
    const { restaurantId, reservationDate, reservationTime, guestCount, specialNotes } = data;

    // Check if user exists
    const userCheck = await pool.query(
      'SELECT id FROM users WHERE id = $1',
      [customerId]
    );

    if (userCheck.rows.length === 0) {
      throw new AppError('User not found', 404);
    }

    // Check if restaurant exists and is active
    const restaurantCheck = await pool.query(
      'SELECT id, is_active, opening_time, closing_time FROM restaurants WHERE id = $1',
      [restaurantId]
    );

    if (restaurantCheck.rows.length === 0) {
      throw new AppError('Restaurant not found', 404);
    }

    const restaurant = restaurantCheck.rows[0];

    if (!restaurant.is_active) {
      throw new AppError('Restaurant is not accepting reservations', 400);
    }

    // Check if time is within operating hours
    if (!this.isWithinOperatingHours(reservationTime, restaurant.opening_time, restaurant.closing_time)) {
      throw new AppError('Reservation time is outside operating hours', 400);
    }

    // Find available table
    const availableTable = await this.findAvailableTable(
      restaurantId, 
      reservationDate, 
      reservationTime, 
      guestCount
    );

    if (!availableTable) {
      throw new AppError('No tables available for the selected time and guest count', 400);
    }

    // Create reservation
    const result = await pool.query(
      `INSERT INTO reservations 
       (customer_id, restaurant_id, table_id, reservation_date, reservation_time, guest_count, special_notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [customerId, restaurantId, availableTable.id, reservationDate, reservationTime, guestCount, specialNotes, ReservationStatus.PENDING]
    );

    const reservation = result.rows[0];

    // Create pending payment record
    await pool.query(
      `INSERT INTO payments (reservation_id, amount, payment_method, payment_status)
       VALUES ($1, $2, $3, $4)`,
      [reservation.id, 100.00, 'pending', 'pending']
    );

    // Notify Customer (Payment Pending)
    await notificationService.createNotification(
      customerId,
      'Reservation Initiated',
      'Please complete your payment to confirm the reservation.'
    );

    return this.mapReservation(reservation);
  }

  async getAvailableTimeSlots(
    restaurantId: string,
    date: string,
    guestCount: number
  ): Promise<TimeSlot[]> {
    // Get restaurant operating hours
    const restaurant = await pool.query(
      'SELECT opening_time, closing_time FROM restaurants WHERE id = $1 AND is_active = true',
      [restaurantId]
    );

    if (restaurant.rows.length === 0) {
      throw new AppError('Restaurant not found', 404);
    }

    const { opening_time, closing_time } = restaurant.rows[0];
    const timeSlots: TimeSlot[] = [];

    // Generate 30-minute time slots
    let currentTime = parse(opening_time, 'HH:mm:ss', new Date());
    const endTime = parse(closing_time, 'HH:mm:ss', new Date());

    while (currentTime < endTime) {
      const timeString = format(currentTime, 'HH:mm:ss');
      
      // Check how many tables are available at this time
      const availableTables = await this.countAvailableTables(
        restaurantId,
        date,
        timeString,
        guestCount
      );

      timeSlots.push({
        time: format(currentTime, 'HH:mm'),
        available: availableTables > 0,
        tablesAvailable: availableTables
      });

      currentTime = addMinutes(currentTime, 30);
    }

    return timeSlots;
  }

  async getCustomerReservations(customerId: string): Promise<Reservation[]> {
    const result = await pool.query(
      `SELECT r.*, 
              res.name as restaurant_name, 
              res.address as restaurant_address,
              t.table_number
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       LEFT JOIN tables t ON r.table_id = t.id
       WHERE r.customer_id = $1
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`,
      [customerId]
    );

    return result.rows.map(row => this.mapReservation(row));
  }

  async getRestaurantReservations(
    restaurantId: string,
    date?: string
  ): Promise<Reservation[]> {
    let query = `
      SELECT r.*, 
             u.first_name, u.last_name, u.email, u.phone,
             t.table_number, t.capacity,
             p.payment_status
      FROM reservations r
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN tables t ON r.table_id = t.id
      JOIN payments p ON r.id = p.reservation_id
      WHERE r.restaurant_id = $1
      AND p.payment_status = 'completed'
    `;
    
    const params: any[] = [restaurantId];

    if (date) {
      query += ' AND r.reservation_date = $2';
      params.push(date);
    }

    query += ' ORDER BY r.reservation_date DESC, r.reservation_time ASC';

    const result = await pool.query(query, params);
    return result.rows.map(row => this.mapReservation(row));
  }

  async updateReservationStatus(
    reservationId: string,
    status: ReservationStatus,
    vendorId?: string
  ): Promise<Reservation> {
    // If vendor is updating, verify they own the restaurant
    if (vendorId) {
      const check = await pool.query(
        `SELECT r.id FROM reservations r
         JOIN restaurants res ON r.restaurant_id = res.id
         WHERE r.id = $1 AND res.owner_id = $2`,
        [reservationId, vendorId]
      );

      if (check.rows.length === 0) {
        throw new AppError('Unauthorized to update this reservation', 403);
      }
    }

    const result = await pool.query(
      'UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, reservationId]
    );

    if (result.rows.length === 0) {
      throw new AppError('Reservation not found', 404);
    }

    const reservation = result.rows[0];

    // Notify Customer about status change
    const statusMsg = status === ReservationStatus.CONFIRMED 
      ? 'Your reservation has been confirmed!' 
      : `Your reservation status has been updated to ${status}.`;
    
    await notificationService.createNotification(
      reservation.customer_id,
      'Reservation Update',
      statusMsg
    );

    return this.mapReservation(reservation);
  }

  async cancelReservation(reservationId: string, userId: string): Promise<Reservation> {
    // Verify user owns the reservation
    const check = await pool.query(
      'SELECT id FROM reservations WHERE id = $1 AND customer_id = $2',
      [reservationId, userId]
    );

    if (check.rows.length === 0) {
      throw new AppError('Reservation not found or unauthorized', 404);
    }

    return this.updateReservationStatus(reservationId, ReservationStatus.CANCELLED);
  }

  private async findAvailableTable(
    restaurantId: string,
    date: string,
    time: string,
    guestCount: number
  ): Promise<any> {
    // Find tables that fit capacity and are NOT already booked at this time
    const result = await pool.query(
      `SELECT t.* FROM tables t
       WHERE t.restaurant_id = $1 
       AND t.capacity >= $2
       AND t.id NOT IN (
         SELECT table_id FROM reservations
         WHERE restaurant_id = $1
         AND reservation_date = $3
         AND reservation_time = $4
         AND status IN ('pending', 'confirmed')
       )
       ORDER BY t.capacity ASC
       LIMIT 1`,
      [restaurantId, guestCount, date, time]
    );

    // Fallback: If strict match fails, try finding ANY table that isn't booked
    if (result.rows.length === 0) {
      const anyFreeTable = await pool.query(
        `SELECT id FROM tables 
         WHERE restaurant_id = $1 
         AND id NOT IN (
           SELECT table_id FROM reservations
           WHERE restaurant_id = $1
           AND reservation_date = $2
           AND reservation_time = $3
           AND status IN ('pending', 'confirmed')
         )
         LIMIT 1`,
        [restaurantId, date, time]
      );
      
      if (anyFreeTable.rows.length > 0) {
        return anyFreeTable.rows[0];
      }
      
      return null;
    }

    return result.rows[0];
  }

  private async countAvailableTables(
    restaurantId: string,
    date: string,
    time: string,
    guestCount: number
  ): Promise<number> {
    // Check actual database availability
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM tables t
       WHERE t.restaurant_id = $1 
       AND t.capacity >= $2
       AND t.is_available = true
       AND t.id NOT IN (
         SELECT table_id FROM reservations
         WHERE restaurant_id = $1
         AND reservation_date = $3
         AND reservation_time = $4
         AND status IN ('pending', 'confirmed')
         AND table_id IS NOT NULL
       )`,
      [restaurantId, guestCount, date, time]
    );

    return parseInt(result.rows[0].count);
  }

  private isWithinOperatingHours(
    reservationTime: string,
    openingTime: string,
    closingTime: string
  ): boolean {
    const reservation = parse(reservationTime, 'HH:mm', new Date());
    const opening = parse(openingTime, 'HH:mm:ss', new Date());
    const closing = parse(closingTime, 'HH:mm:ss', new Date());

    // Fix: Just compare the hours and minutes since dates might differ
    const resMinutes = reservation.getHours() * 60 + reservation.getMinutes();
    const openMinutes = opening.getHours() * 60 + opening.getMinutes();
    const closeMinutes = closing.getHours() * 60 + closing.getMinutes();

    return resMinutes >= openMinutes && resMinutes <= closeMinutes;
  }

  private mapReservation(row: any): Reservation {
    return {
      id: row.id,
      userId: row.customer_id,
      customerId: row.customer_id,
      restaurantId: row.restaurant_id,
      tableId: row.table_id,
      reservationDate: row.reservation_date,
      reservationTime: row.reservation_time,
      guestCount: row.guest_count,
      status: row.status,
      specialNotes: row.special_notes,
      commissionPaid: row.commission_paid,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      restaurantName: row.restaurant_name, // Added
      restaurantAddress: row.restaurant_address, // Added
      tableNumber: row.table_number // Added
    };
  }
}

export default new ReservationService();