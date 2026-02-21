import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import notificationController from '../controllers/notificationController';

const router = Router();

router.use(authenticateToken);

router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);

export default router;
