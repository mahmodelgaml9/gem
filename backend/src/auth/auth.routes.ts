
import { Router, Request, Response, NextFunction } from 'express';
import { signup, login, getCurrentUser } from './auth.controller';
import { authenticateToken, AuthenticatedRequest } from './auth.middleware';

const router = Router();

/**
 * @route POST /api/auth/signup
 * @desc Register a new user
 * @access Public
 */
router.post('/signup', signup);

/**
 * @route POST /api/auth/login
 * @desc Authenticate user and get token
 * @access Public
 */
router.post('/login', login);

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user's profile
 * @access Private
 */
router.get('/me', authenticateToken, (req: Request, res: Response, next: NextFunction) => {
  // The request is cast to AuthenticatedRequest within getCurrentUser or it's implicitly handled
  // if getCurrentUser's first parameter is AuthenticatedRequest and the middleware populates req.user
  getCurrentUser(req as AuthenticatedRequest, res, next).catch(next);
});


// TODO: Add routes for password reset, email verification, etc.
// router.post('/forgot-password', forgotPasswordController);
// router.post('/reset-password/:token', resetPasswordController);

export default router;
