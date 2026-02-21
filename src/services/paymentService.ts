import pool from '../config/database';
import { Payment, PaymentStatus } from '../models/Payment';
import notificationService from './notificationService';

class PaymentService {
  async createPayment(
    userId: string,
    reservationId: string,
    amount: number,
    paymentMethod: string
  ): Promise<Payment> {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // 1. Check if payment exists (pending) and update it, OR insert new if missing
      const existingPayment = await client.query(
        'SELECT id FROM payments WHERE reservation_id = $1',
        [reservationId]
      );

      let paymentRes;
      if (existingPayment.rows.length > 0) {
        // Update existing pending payment
        paymentRes = await client.query(
          `UPDATE payments 
           SET amount = $2, payment_method = $3, payment_status = $4, transaction_id = $5, created_at = NOW()
           WHERE reservation_id = $1
           RETURNING *`,
          [
            reservationId,
            amount,
            paymentMethod,
            PaymentStatus.COMPLETED,
            `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          ]
        );
      } else {
        // Insert new (fallback if pending record was deleted or didn't exist)
        paymentRes = await client.query(
          `INSERT INTO payments (reservation_id, amount, payment_method, payment_status, transaction_id)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            reservationId,
            amount,
            paymentMethod,
            PaymentStatus.COMPLETED,
            `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          ]
        );
      }

      // 2. Fetch reservation details to notify vendor
      const reservationRes = await client.query(
        `SELECT r.restaurant_id, res.owner_id, res.name as restaurant_name, u.first_name, u.last_name
         FROM reservations r
         JOIN restaurants res ON r.restaurant_id = res.id
         JOIN users u ON r.customer_id = u.id
         WHERE r.id = $1`,
        [reservationId]
      );

      if (reservationRes.rows.length > 0) {
        const { owner_id, restaurant_name, first_name, last_name } = reservationRes.rows[0];
        
        // Notify Customer
        await notificationService.createNotification(
          userId,
          'Payment Successful',
          `Your payment for ${restaurant_name} has been processed. The restaurant will review your reservation shortly.`
        );

        // Notify Vendor
        await notificationService.createNotification(
          owner_id,
          'New Paid Reservation',
          `New reservation received from ${first_name} ${last_name}. Payment verified.`
        );
      }
      
      await client.query('COMMIT');
      return paymentRes.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getPaymentByReservationId(reservationId: string): Promise<Payment | null> {
    const res = await pool.query(
      'SELECT * FROM payments WHERE reservation_id = $1',
      [reservationId]
    );
    return res.rows[0] || null;
  }
}

export default new PaymentService();

