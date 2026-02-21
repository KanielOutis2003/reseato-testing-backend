import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import restaurantService from '../services/restaurantService';
import { asyncHandler } from '../middleware/errorHandler';

class RestaurantController {
  getAllRestaurants = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      cuisine: req.query.cuisine as string,
      location: req.query.location as string,
      rating: req.query.rating ? parseFloat(req.query.rating as string) : undefined,
      search: req.query.search as string,
      openNow: req.query.openNow === 'true'
    };

    const restaurants = await restaurantService.getAllRestaurants(filters);

    return res.json({
      success: true,
      data: restaurants,
      count: restaurants.length
    });
  });

  getRestaurantById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const restaurant = await restaurantService.getRestaurantById(req.params.id);

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
  getMyRestaurant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const restaurant = await restaurantService.getRestaurantByOwnerId(req.user!.id);

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

  createRestaurant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const restaurant = await restaurantService.createRestaurant(req.user!.id, req.body);

    return res.status(201).json({
      success: true,
      data: restaurant,
      message: 'Restaurant created successfully. Awaiting admin approval.'
    });
  });

  updateRestaurant = asyncHandler(async (req: AuthRequest, res: Response) => {
    const restaurant = await restaurantService.updateRestaurant(
      req.params.id,
      req.user!.id,
      req.body
    );

    return res.json({
      success: true,
      data: restaurant,
      message: 'Restaurant updated successfully'
    });
  });

  getTables = asyncHandler(async (req: AuthRequest, res: Response) => {
    const tables = await restaurantService.getTables(req.params.id);

    return res.json({
      success: true,
      data: tables
    });
  });

  addTable = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { tableNumber, capacity } = req.body;
    const table = await restaurantService.addTable(req.params.id, tableNumber, capacity);

    return res.status(201).json({
      success: true,
      data: table,
      message: 'Table added successfully'
    });
  });
}

export default new RestaurantController();