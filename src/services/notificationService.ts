import pool from '../config/database';
import { Notification } from '../models/Notification';

class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    const result = await pool.query(
      `SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`,
      [userId]
    );
    return result.rows.map(this.mapNotification);
  }

  async createNotification(userId: string, title: string, message: string): Promise<Notification> {
    const result = await pool.query(
      `INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, title, message]
    );
    return this.mapNotification(result.rows[0]);
  }

  async markAsRead(notificationId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE id = $1`,
      [notificationId]
    );
  }

  async markAllAsRead(userId: string): Promise<void> {
    await pool.query(
      `UPDATE notifications SET is_read = true WHERE user_id = $1`,
      [userId]
    );
  }

  private mapNotification(row: any): Notification {
    return {
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at
    };
  }
}

export default new NotificationService();
