import { Response } from 'express';
export declare const registerValidation: import("express-validator").ValidationChain[];
export declare const loginValidation: import("express-validator").ValidationChain[];
declare class AuthController {
    register: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    login: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    getProfile: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
    logout: (req: import("express").Request, res: Response, next: import("express").NextFunction) => void;
}
declare const _default: AuthController;
export default _default;
//# sourceMappingURL=authController.d.ts.map