"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationService = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../../../shared/types");
const errorHandler_1 = require("../middleware/errorHandler");
const date_fns_1 = require("date-fns");
class ReservationService {
    async createReservation(customerId, data) {
        const { restaurantId, reservationDate, reservationTime, guestCount, specialNotes } = data;
        // Check if restaurant exists and is active
        const restaurantCheck = await database_1.default.query('SELECT id, is_active, opening_time, closing_time FROM restaurants WHERE id = $1', [restaurantId]);
        if (restaurantCheck.rows.length === 0) {
            throw new errorHandler_1.AppError('Restaurant not found', 404);
        }
        const restaurant = restaurantCheck.rows[0];
        if (!restaurant.is_active) {
            throw new errorHandler_1.AppError('Restaurant is not accepting reservations', 400);
        }
        // Check if time is within operating hours
        if (!this.isWithinOperatingHours(reservationTime, restaurant.opening_time, restaurant.closing_time)) {
            throw new errorHandler_1.AppError('Reservation time is outside operating hours', 400);
        }
        // Find available table
        const availableTable = await this.findAvailableTable(restaurantId, reservationDate, reservationTime, guestCount);
        if (!availableTable) {
            throw new errorHandler_1.AppError('No tables available for the selected time and guest count', 400);
        }
        // Create reservation
        const result = await database_1.default.query(`INSERT INTO reservations 
       (customer_id, restaurant_id, table_id, reservation_date, reservation_time, guest_count, special_notes, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`, [customerId, restaurantId, availableTable.id, reservationDate, reservationTime, guestCount, specialNotes, types_1.ReservationStatus.PENDING]);
        return this.mapReservation(result.rows[0]);
    }
    async getAvailableTimeSlots(restaurantId, date, guestCount) {
        // Get restaurant operating hours
        const restaurant = await database_1.default.query('SELECT opening_time, closing_time FROM restaurants WHERE id = $1 AND is_active = true', [restaurantId]);
        if (restaurant.rows.length === 0) {
            throw new errorHandler_1.AppError('Restaurant not found', 404);
        }
        const { opening_time, closing_time } = restaurant.rows[0];
        const timeSlots = [];
        // Generate 30-minute time slots
        let currentTime = (0, date_fns_1.parse)(opening_time, 'HH:mm:ss', new Date());
        const endTime = (0, date_fns_1.parse)(closing_time, 'HH:mm:ss', new Date());
        while (currentTime < endTime) {
            const timeString = (0, date_fns_1.format)(currentTime, 'HH:mm:ss');
            // Check how many tables are available at this time
            const availableTables = await this.countAvailableTables(restaurantId, date, timeString, guestCount);
            timeSlots.push({
                time: (0, date_fns_1.format)(currentTime, 'HH:mm'),
                available: availableTables > 0,
                tablesAvailable: availableTables
            });
            currentTime = (0, date_fns_1.addMinutes)(currentTime, 30);
        }
        return timeSlots;
    }
    async getCustomerReservations(customerId) {
        const result = await database_1.default.query(`SELECT r.*, 
              res.name as restaurant_name, 
              res.address as restaurant_address,
              t.table_number
       FROM reservations r
       JOIN restaurants res ON r.restaurant_id = res.id
       LEFT JOIN tables t ON r.table_id = t.id
       WHERE r.customer_id = $1
       ORDER BY r.reservation_date DESC, r.reservation_time DESC`, [customerId]);
        return result.rows.map(row => this.mapReservation(row));
    }
    async getRestaurantReservations(restaurantId, date) {
        let query = `
      SELECT r.*, 
             u.first_name, u.last_name, u.email, u.phone,
             t.table_number, t.capacity
      FROM reservations r
      JOIN users u ON r.customer_id = u.id
      LEFT JOIN tables t ON r.table_id = t.id
      WHERE r.restaurant_id = $1
    `;
        const params = [restaurantId];
        if (date) {
            query += ' AND r.reservation_date = $2';
            params.push(date);
        }
        query += ' ORDER BY r.reservation_date DESC, r.reservation_time ASC';
        const result = await database_1.default.query(query, params);
        return result.rows.map(row => this.mapReservation(row));
    }
    async updateReservationStatus(reservationId, status, vendorId) {
        // If vendor is updating, verify they own the restaurant
        if (vendorId) {
            const check = await database_1.default.query(`SELECT r.id FROM reservations r
         JOIN restaurants res ON r.restaurant_id = res.id
         WHERE r.id = $1 AND res.owner_id = $2`, [reservationId, vendorId]);
            if (check.rows.length === 0) {
                throw new errorHandler_1.AppError('Unauthorized to update this reservation', 403);
            }
        }
        const result = await database_1.default.query('UPDATE reservations SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, reservationId]);
        if (result.rows.length === 0) {
            throw new errorHandler_1.AppError('Reservation not found', 404);
        }
        return this.mapReservation(result.rows[0]);
    }
    async cancelReservation(reservationId, userId) {
        // Verify user owns the reservation
        const check = await database_1.default.query('SELECT id FROM reservations WHERE id = $1 AND customer_id = $2', [reservationId, userId]);
        if (check.rows.length === 0) {
            throw new errorHandler_1.AppError('Reservation not found or unauthorized', 404);
        }
        return this.updateReservationStatus(reservationId, types_1.ReservationStatus.CANCELLED);
    }
    async findAvailableTable(restaurantId, date, time, guestCount) {
        const result = await database_1.default.query(`SELECT t.* FROM tables t
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
       )
       ORDER BY t.capacity ASC
       LIMIT 1`, [restaurantId, guestCount, date, time]);
        return result.rows[0] || null;
    }
    async countAvailableTables(restaurantId, date, time, guestCount) {
        const result = await database_1.default.query(`SELECT COUNT(*) as count FROM tables t
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
       )`, [restaurantId, guestCount, date, time]);
        return parseInt(result.rows[0].count);
    }
    isWithinOperatingHours(reservationTime, openingTime, closingTime) {
        const reservation = (0, date_fns_1.parse)(reservationTime, 'HH:mm', new Date());
        const opening = (0, date_fns_1.parse)(openingTime, 'HH:mm:ss', new Date());
        const closing = (0, date_fns_1.parse)(closingTime, 'HH:mm:ss', new Date());
        return reservation >= opening && reservation <= closing;
    }
    mapReservation(row) {
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
            updatedAt: row.updated_at
        };
    }
}
exports.ReservationService = ReservationService;
exports.default = new ReservationService();
//# sourceMappingURL=reservationService.js.map