import { Response } from 'express';
export declare const createReservationValidation: import("express-validator").ValidationChain[];
declare class ReservationController {
    createReservation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getMyReservations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    cancelReservation: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getAvailableTimeSlots: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getRestaurantReservations: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    updateReservationStatus: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: ReservationController;
export default _default;
//# sourceMappingURL=reservationController.d.ts.map