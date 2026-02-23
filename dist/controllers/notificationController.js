"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../middleware/errorHandler");
const notificationService_1 = __importDefault(require("../services/notificationService"));
class NotificationController {
    constructor() {
        this.getNotifications = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const notifications = await notificationService_1.default.getNotifications(req.user.id);
            res.json({
                success: true,
                data: notifications
            });
        });
        this.markAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            await notificationService_1.default.markAsRead(req.params.id);
            res.json({
                success: true,
                message: 'Notification marked as read'
            });
        });
        this.markAllAsRead = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            await notificationService_1.default.markAllAsRead(req.user.id);
            res.json({
                success: true,
                message: 'All notifications marked as read'
            });
        });
    }
}
exports.default = new NotificationController();
//# sourceMappingURL=notificationController.js.map