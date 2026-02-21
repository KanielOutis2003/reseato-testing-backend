"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidation = exports.registerValidation = void 0;
const express_validator_1 = require("express-validator");
const authService_1 = __importDefault(require("../services/authService"));
const errorHandler_1 = require("../middleware/errorHandler");
const types_1 = require("../../../shared/types");
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
    (0, express_validator_1.body)('phone').optional().isMobilePhone('any'),
    (0, express_validator_1.body)('role').optional().isIn(Object.values(types_1.UserRole))
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty()
];
class AuthController {
    constructor() {
        this.register = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { user, token } = await authService_1.default.register(req.body);
            return res.status(201).json({
                success: true,
                data: {
                    user,
                    token
                },
                message: 'Registration successful'
            });
        });
        this.login = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    errors: errors.array()
                });
            }
            const { user, token } = await authService_1.default.login(req.body);
            return res.json({
                success: true,
                data: {
                    user,
                    token
                },
                message: 'Login successful'
            });
        });
        this.getProfile = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const user = await authService_1.default.getUserById(req.user.id);
            return res.json({
                success: true,
                data: user
            });
        });
        this.logout = (0, errorHandler_1.asyncHandler)(async (_req, res) => {
            // Since we're using JWT, logout is handled client-side by removing the token
            return res.json({
                success: true,
                message: 'Logged out successfully'
            });
        });
    }
}
exports.default = new AuthController();
//# sourceMappingURL=authController.js.map