"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const paymentController_1 = __importDefault(require("../controllers/paymentController"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.post('/', paymentController_1.default.createPayment);
router.get('/:reservationId', paymentController_1.default.getPayment);
exports.default = router;
//# sourceMappingURL=paymentRoutes.js.map