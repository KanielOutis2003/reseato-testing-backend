"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReservationValidation = void 0;
const express_validator_1 = require("express-validator");
const reservationService_1 = __importDefault(require("../services/reservationService"));
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../../../shared/types");
exports.createReservationValidation = [
    (0, express_validator_1.body)('restaurantId').isUUID().withMessage('Valid restaurant ID required'),
    (0, express_validator_1.body)('reservationDate').isISO8601().withMessage('Valid date required'),
    (0, express_validator_1.body)('reservationTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time required (HH:mm)'),
    (0, express_validator_1.body)('guestCount').isInt({ min: 1, max: 20 }).withMessage('Guest count must be between 1 and 20'),
    (0, express_validator_1.body)('specialNotes').optional().isString()
];
class ReservationController {
    constructor() {
        // Customer routes
        this.createReservation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const reservation = await reservationService_1.default.createReservation(req.user.id, req.body);
            return res.status(201).json({
                success: true,
                data: reservation,
                message: 'Reservation created successfully'
            });
        });
        this.getMyReservations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const reservations = await reservationService_1.default.getCustomerReservations(req.user.id);
            return res.json({
                success: true,
                data: reservations
            });
        });
        this.cancelReservation = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const reservation = await reservationService_1.default.cancelReservation(req.params.id, req.user.id);
            return res.json({
                success: true,
                data: reservation,
                message: 'Reservation cancelled successfully'
            });
        });
        // Public route
        this.getAvailableTimeSlots = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { restaurantId, date, guestCount } = req.query;
            if (!restaurantId || !date || !guestCount) {
                return res.status(400).json({
                    success: false,
                    error: 'Restaurant ID, date, and guest count are required'
                });
            }
            const timeSlots = await reservationService_1.default.getAvailableTimeSlots(restaurantId, date, parseInt(guestCount));
            return res.json({
                success: true,
                data: timeSlots
            });
        });
        // Vendor routes
        this.getRestaurantReservations = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { restaurantId } = req.params;
            const { date } = req.query;
            const reservations = await reservationService_1.default.getRestaurantReservations(restaurantId, date);
            return res.json({
                success: true,
                data: reservations
            });
        });
        this.updateReservationStatus = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { status } = req.body;
            if (!Object.values(types_1.ReservationStatus).includes(status)) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid status'
                });
            }
            const reservation = await reservationService_1.default.updateReservationStatus(req.params.id, status, req.user.id // Pass vendor ID for authorization
            );
            return res.json({
                success: true,
                data: reservation,
                message: 'Reservation status updated successfully'
            });
        });
    }
}
exports.default = new ReservationController();
//# sourceMappingURL=reservationController.js.map