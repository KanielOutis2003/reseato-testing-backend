import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import reservationService from '../services/reservationService';
import { asyncHandler } from '../middleware/errorHandler';
import { ReservationStatus } from '../../../shared/types';

export const createReservationValidation = [
  body('restaurantId').isUUID().withMessage('Valid restaurant ID required'),
  body('reservationDate').isISO8601().withMessage('Valid date required'),
  body('reservationTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:mm)'),
  body('guestCount').isInt({ min: 1, max: 20 }).withMessage('Guest count must be between 1 and 20'),
  body('specialNotes').optional().isString()
];

class ReservationController {
  // Customer routes
  createReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const reservation = await reservationService.createReservation(
      req.user!.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      data: reservation,
      message: 'Reservation created successfully'
    });
  });

  getMyReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reservations = await reservationService.getCustomerReservations(req.user!.id);

    return res.json({
      success: true,
      data: reservations
    });
  });

  cancelReservation = asyncHandler(async (req: AuthRequest, res: Response) => {
    const reservation = await reservationService.cancelReservation(
      req.params.id,
      req.user!.id
    );

    return res.json({
      success: true,
      data: reservation,
      message: 'Reservation cancelled successfully'
    });
  });

  // Public route
  getAvailableTimeSlots = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { restaurantId, date, guestCount } = req.query;

    if (!restaurantId || !date || !guestCount) {
      return res.status(400).json({
        success: false,
        error: 'Restaurant ID, date, and guest count are required'
      });
    }

    const timeSlots = await reservationService.getAvailableTimeSlots(
      restaurantId as string,
      date as string,
      parseInt(guestCount as string)
    );

    return res.json({
      success: true,
      data: timeSlots
    });
  });

  // Vendor routes
  getRestaurantReservations = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { restaurantId } = req.params;
    const { date } = req.query;

    const reservations = await reservationService.getRestaurantReservations(
      restaurantId,
      date as string
    );

    return res.json({
      success: true,
      data: reservations
    });
  });

  updateReservationStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    if (!Object.values(ReservationStatus).includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status'
      });
    }

    const reservation = await reservationService.updateReservationStatus(
      req.params.id,
      status,
      req.user!.id // Pass vendor ID for authorization
    );

    return res.json({
      success: true,
      data: reservation,
      message: 'Reservation status updated successfully'
    });
  });
}

export default new ReservationController();