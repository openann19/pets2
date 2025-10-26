import express, { type Request, type Response, Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import {
  getContentReviewQueue,
  reviewContent,
  bulkReviewContent,
  createModerationRule,
  getModerationAnalytics,
  getQuarantineQueue,
  releaseFromQuarantine
} from '../controllers/adminModerationController';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  userId: string;
  user?: IUserDocument;
}

const router: Router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Type-safe wrapper function
const wrapHandler = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// Content review queue management
router.get('/queue', wrapHandler(getContentReviewQueue));
router.post('/review', wrapHandler(reviewContent));
router.post('/bulk-review', wrapHandler(bulkReviewContent));

// Automated moderation rules
router.post('/rules', wrapHandler(createModerationRule));

// Moderation analytics and reporting
router.get('/analytics', wrapHandler(getModerationAnalytics));

// Content quarantine management
router.get('/quarantine', wrapHandler(getQuarantineQueue));
router.post('/quarantine/:contentId/release', wrapHandler(releaseFromQuarantine));

export default router;

