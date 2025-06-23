
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware';
import {
  createBusinessHandler,
  getUserBusinessesHandler,
  getBusinessByIdHandler,
  updateBusinessHandler,
  deleteBusinessHandler,
} from './business.controller';

const router = Router();

// All routes in this module require authentication
router.use(authenticateToken);

/**
 * @route POST /api/businesses
 * @desc Create a new business profile
 * @access Private
 */
router.post('/', (req: Request, res: Response, next: NextFunction) => {
  createBusinessHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route GET /api/businesses
 * @desc Get all businesses for the authenticated user
 * @access Private
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  getUserBusinessesHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route GET /api/businesses/:id
 * @desc Get a specific business by ID
 * @access Private (ensures user owns the business in controller/service)
 */
router.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  getBusinessByIdHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route PUT /api/businesses/:id
 * @desc Update a specific business by ID
 * @access Private (ensures user owns the business)
 */
router.put('/:id', (req: Request, res: Response, next: NextFunction) => {
  updateBusinessHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route DELETE /api/businesses/:id
 * @desc Delete a specific business by ID
 * @access Private (ensures user owns the business)
 */
router.delete('/:id', (req: Request, res: Response, next: NextFunction) => {
  deleteBusinessHandler(req as AuthenticatedRequest, res, next).catch(next);
});

export default router;
