"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../middleware/errorHandler");
const paymentService_1 = __importDefault(require("../services/paymentService"));
class PaymentController {
    constructor() {
        this.createPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { reservationId, amount, paymentMethod } = req.body;
            const payment = await paymentService_1.default.createPayment(req.user.id, reservationId, amount, paymentMethod);
            return res.status(201).json({
                success: true,
                data: payment,
                message: 'Payment processed successfully'
            });
        });
        this.getPayment = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const payment = await paymentService_1.default.getPaymentByReservationId(req.params.reservationId);
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
}
exports.default = new PaymentController();
//# sourceMappingURL=paymentController.js.map