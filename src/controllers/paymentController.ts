import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import paymentService from '../services/paymentService';

class PaymentController {
  createPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { reservationId, amount, paymentMethod } = req.body;

    const payment = await paymentService.createPayment(
      req.user!.id,
      reservationId,
      amount,
      paymentMethod
    );

    return res.status(201).json({
      success: true,
      data: payment,
      message: 'Payment processed successfully'
    });
  });

  getPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const payment = await paymentService.getPaymentByReservationId(req.params.reservationId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    return res.json({
      success: true,
      data: payment
    });
  });
}

export default new PaymentController();
