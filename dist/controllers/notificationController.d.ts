import { Response } from 'express';
declare class NotificationController {
    getNotifications: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    markAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    markAllAsRead: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: NotificationController;
export default _default;
//# sourceMappingURL=notificationController.d.ts.map