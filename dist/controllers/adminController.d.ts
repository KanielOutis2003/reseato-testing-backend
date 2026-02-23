import { Response } from 'express';
declare class AdminController {
    getDashboardStats: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getAllReservations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getAllRestaurants: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getAllUsers: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateReservationStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    toggleUserStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    markCommissionPaid: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: AdminController;
export default _default;
//# sourceMappingURL=adminController.d.ts.map