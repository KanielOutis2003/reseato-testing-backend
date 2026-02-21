"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const restaurantController_1 = __importDefault(require("../controllers/restaurantController"));
const auth_1 = require("../middleware/auth");
const types_1 = require("../../../shared/types");
const router = express_1.default.Router();
// Public routes
router.get('/', restaurantController_1.default.getAllRestaurants);
router.get('/:id', restaurantController_1.default.getRestaurantById);
router.get('/:id/tables', restaurantController_1.default.getTables);
// Vendor routes
router.get('/vendor/my-restaurant', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.VENDOR), restaurantController_1.default.getMyRestaurant);
router.post('/vendor/create', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.VENDOR), restaurantController_1.default.createRestaurant);
router.put('/vendor/:id', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.VENDOR), restaurantController_1.default.updateRestaurant);
router.post('/vendor/:id/tables', auth_1.authenticateToken, (0, auth_1.authorizeRoles)(types_1.UserRole.VENDOR), restaurantController_1.default.addTable);
exports.default = router;
//# sourceMappingURL=restaurantRoutes.js.map