import { Notification } from '../models/Notification';
declare class NotificationService {
    getNotifications(userId: string): Promise<Notification[]>;
    createNotification(userId: string, title: string, message: string): Promise<Notification>;
    markAsRead(notificationId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    private mapNotification;
}
declare const _default: NotificationService;
export default _default;
//# sourceMappingURL=notificationService.d.ts.map