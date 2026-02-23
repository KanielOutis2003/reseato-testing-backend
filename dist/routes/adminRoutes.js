"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const adminController_1 = __importDefault(require("../controllers/adminController"));
const types_1 = require("../../../shared/types");
const router = (0, express_1.Router)();
// Protect all routes
router.use(auth_1.authenticateToken);
router.use((0, auth_1.authorizeRoles)(types_1.UserRole.ADMIN));
// Dashboard Stats
router.get('/dashboard', adminController_1.default.getDashboardStats);
// Reservations Management
router.get('/reservations', adminController_1.default.getAllReservations);
router.put('/reservations/:id/status', adminController_1.default.updateReservationStatus);
// Restaurants Management
router.get('/restaurants', adminController_1.default.getAllRestaurants);
router.post('/restaurants/:id/payout', adminController_1.default.markCommissionPaid);
// User Management
router.get('/users', adminController_1.default.getAllUsers);
router.put('/users/:id/toggle-status', adminController_1.default.toggleUserStatus);
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map