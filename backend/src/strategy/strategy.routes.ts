
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware';
import { performDeepAnalysisHandler, generateMarketingPlanHandler } from './strategy.controller';

const router = Router();

router.use(authenticateToken); // All strategy routes require authentication

/**
 * @route POST /api/strategy/analyze-business
 * @desc Perform deep analysis (SWOT, competitors, personas) for a business
 * @access Private
 * @body { businessId: string, websiteUrl: string }
 */
router.post('/analyze-business', (req: Request, res: Response, next: NextFunction) => {
  performDeepAnalysisHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route POST /api/strategy/generate-plan
 * @desc Generate a marketing plan for a business
 * @access Private
 * @body { businessId: string, marketAnalysisId: string, targetAudienceIds: string[], objectives: string[], customInstructions?: string }
 */
router.post('/generate-plan', (req: Request, res: Response, next: NextFunction) => {
  generateMarketingPlanHandler(req as AuthenticatedRequest, res, next).catch(next);
});

export default router;
