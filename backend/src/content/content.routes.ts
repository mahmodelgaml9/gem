
import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../auth/auth.middleware';
import { saveGeneratedContentHandler, streamGeneratedContentHandler } from './content.controller';

const router = Router();

router.use(authenticateToken); // All content routes require authentication

/**
 * @route POST /api/content/save
 * @desc Save a piece of generated content
 * @access Private
 */
router.post('/save', (req: Request, res: Response, next: NextFunction) => {
  saveGeneratedContentHandler(req as AuthenticatedRequest, res, next).catch(next);
});

/**
 * @route POST /api/content/generate-stream
 * @desc Generate content and stream it back to the client
 * @access Private
 */
router.post('/generate-stream', (req: Request, res: Response, next: NextFunction) => {
 streamGeneratedContentHandler(req as AuthenticatedRequest, res, next).catch(next);
});

// TODO: Add routes for listing content, getting specific content, updating, deleting, etc.
// router.get('/', listContentHandler);
// router.get('/:id', getContentByIdHandler);

export default router;
