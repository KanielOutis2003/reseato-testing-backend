import express from 'express';
import reservationController, { createReservationValidation } from '../controllers/reservationController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../../../shared/types';

const router = express.Router();

// Public route
router.get('/availability', reservationController.getAvailableTimeSlots);

// Customer routes
router.post(
  '/',
  authenticateToken,
  authorizeRoles(UserRole.CUSTOMER),
  createReservationValidation,
  reservationController.createReservation
);

router.get(
  '/my-reservations',
  authenticateToken,
  authorizeRoles(UserRole.CUSTOMER),
  reservationController.getMyReservations
);

router.put(
  '/:id/cancel',
  authenticateToken,
  authorizeRoles(UserRole.CUSTOMER),
  reservationController.cancelReservation
);

// Vendor routes
router.get(
  '/restaurant/:restaurantId',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  reservationController.getRestaurantReservations
);

router.put(
  '/:id/status',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  reservationController.updateReservationStatus
);

export default router;