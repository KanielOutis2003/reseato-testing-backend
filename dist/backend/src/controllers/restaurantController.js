"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const restaurantService_1 = __importDefault(require("../services/restaurantService"));
const errorHandler_1 = require("../middleware/errorHandler");
class RestaurantController {
    constructor() {
        this.getAllRestaurants = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const filters = {
                cuisine: req.query.cuisine,
                location: req.query.location,
                rating: req.query.rating ? parseFloat(req.query.rating) : undefined,
                search: req.query.search,
                openNow: req.query.openNow === 'true'
            };
            const restaurants = await restaurantService_1.default.getAllRestaurants(filters);
            return res.json({
                success: true,
                data: restaurants,
                count: restaurants.length
            });
        });
        this.getRestaurantById = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const restaurant = await restaurantService_1.default.getRestaurantById(req.params.id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    error: 'Restaurant not found'
                });
            }
            return res.json({
                success: true,
                data: restaurant
            });
        });
        // Vendor routes
        this.getMyRestaurant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const restaurant = await restaurantService_1.default.getRestaurantByOwnerId(req.user.id);
            if (!restaurant) {
                return res.status(404).json({
                    success: false,
                    error: 'No restaurant found for this vendor'
                });
            }
            return res.json({
                success: true,
                data: restaurant
            });
        });
        this.createRestaurant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const restaurant = await restaurantService_1.default.createRestaurant(req.user.id, req.body);
            return res.status(201).json({
                success: true,
                data: restaurant,
                message: 'Restaurant created successfully. Awaiting admin approval.'
            });
        });
        this.updateRestaurant = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const restaurant = await restaurantService_1.default.updateRestaurant(req.params.id, req.user.id, req.body);
            return res.json({
                success: true,
                data: restaurant,
                message: 'Restaurant updated successfully'
            });
        });
        this.getTables = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const tables = await restaurantService_1.default.getTables(req.params.id);
            return res.json({
                success: true,
                data: tables
            });
        });
        this.addTable = (0, errorHandler_1.asyncHandler)(async (req, res) => {
            const { tableNumber, capacity } = req.body;
            const table = await restaurantService_1.default.addTable(req.params.id, tableNumber, capacity);
            return res.status(201).json({
                success: true,
                data: table,
                message: 'Table added successfully'
            });
        });
    }
}
exports.default = new RestaurantController();
//# sourceMappingURL=restaurantController.js.map