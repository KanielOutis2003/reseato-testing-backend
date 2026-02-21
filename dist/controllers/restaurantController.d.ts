import { Response } from 'express';
declare class RestaurantController {
    getAllRestaurants: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getRestaurantById: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getMyRestaurant: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    createRestaurant: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateRestaurant: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getTables: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    addTable: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: RestaurantController;
export default _default;
//# sourceMappingURL=restaurantController.d.ts.map