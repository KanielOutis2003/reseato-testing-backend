import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import adminController from '../controllers/adminController';
import { UserRole } from '../../../shared/types';

const router = Router();

// Protect all routes
router.use(authenticateToken);
router.use(authorizeRoles(UserRole.ADMIN));

// Dashboard Stats
router.get('/dashboard', adminController.getDashboardStats);

// Reservations Management
router.get('/reservations', adminController.getAllReservations);
router.put('/reservations/:id/status', adminController.updateReservationStatus);

// Restaurants Management
router.get('/restaurants', adminController.getAllRestaurants);
router.post('/restaurants/:id/payout', adminController.markCommissionPaid);

// User Management
router.get('/users', adminController.getAllUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

export default router;
