"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const notificationController_1 = __importDefault(require("../controllers/notificationController"));
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
router.get('/', notificationController_1.default.getNotifications);
router.put('/:id/read', notificationController_1.default.markAsRead);
router.put('/read-all', notificationController_1.default.markAllAsRead);
exports.default = router;
//# sourceMappingURL=notificationRoutes.js.map