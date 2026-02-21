import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import notificationService from '../services/notificationService';

class NotificationController {
  getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
    const notifications = await notificationService.getNotifications(req.user!.id);
    res.json({
      success: true,
      data: notifications
    });
  });

  markAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationService.markAsRead(req.params.id);
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  });

  markAllAsRead = asyncHandler(async (req: AuthRequest, res: Response) => {
    await notificationService.markAllAsRead(req.user!.id);
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  });
}

export default new NotificationController();
