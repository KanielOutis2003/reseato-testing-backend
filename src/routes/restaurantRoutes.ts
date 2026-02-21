import express from 'express';
import restaurantController from '../controllers/restaurantController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { UserRole } from '../../../shared/types';

const router = express.Router();

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);
router.get('/:id/tables', restaurantController.getTables);

// Vendor routes
router.get(
  '/vendor/my-restaurant',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  restaurantController.getMyRestaurant
);

router.post(
  '/vendor/create',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  restaurantController.createRestaurant
);

router.put(
  '/vendor/:id',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  restaurantController.updateRestaurant
);

router.post(
  '/vendor/:id/tables',
  authenticateToken,
  authorizeRoles(UserRole.VENDOR),
  restaurantController.addTable
);

export default router;