"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
class NotificationService {
    async getNotifications(userId) {
        const result = await database_1.default.query(`SELECT * FROM notifications 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT 20`, [userId]);
        return result.rows.map(this.mapNotification);
    }
    async createNotification(userId, title, message) {
        const result = await database_1.default.query(`INSERT INTO notifications (user_id, title, message)
       VALUES ($1, $2, $3)
       RETURNING *`, [userId, title, message]);
        return this.mapNotification(result.rows[0]);
    }
    async markAsRead(notificationId) {
        await database_1.default.query(`UPDATE notifications SET is_read = true WHERE id = $1`, [notificationId]);
    }
    async markAllAsRead(userId) {
        await database_1.default.query(`UPDATE notifications SET is_read = true WHERE user_id = $1`, [userId]);
    }
    mapNotification(row) {
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
exports.default = new NotificationService();
//# sourceMappingURL=notificationService.js.map