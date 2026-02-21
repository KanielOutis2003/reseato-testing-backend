import { Response } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthRequest } from '../middleware/auth';
import authService from '../services/authService';
import { asyncHandler } from '../middleware/errorHandler';
import { UserRole } from '../../../shared/types';

export const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().isMobilePhone('any'),
  body('role').optional().isIn(Object.values(UserRole))
];

export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

class AuthController {
  register = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { user, token } = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Registration successful'
    });
  });

  login = asyncHandler(async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { user, token } = await authService.login(req.body);

    return res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    });
  });

  getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.getUserById(req.user!.id);

    return res.json({
      success: true,
      data: user
    });
  });

  updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await authService.updateProfile(req.user!.id, req.body);

    return res.json({
      success: true,
      data: user,
      message: 'Profile updated successfully'
    });
  });

  logout = asyncHandler(async (_req: AuthRequest, res: Response) => {
    // Since we're using JWT, logout is handled client-side by removing the token
    return res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
}

export default new AuthController();