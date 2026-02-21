import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import paymentController from '../controllers/paymentController';

const router = Router();

router.use(authenticateToken);

router.post('/', paymentController.createPayment);
router.get('/:reservationId', paymentController.getPayment);

export default router;
