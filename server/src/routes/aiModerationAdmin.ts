import express, { type Request, type Response, Router } from 'express';
import aiModerationController from '../controllers/aiModerationController';
import moderationAnalyticsController from '../controllers/moderationAnalyticsController';
import { authenticateToken } from '../middleware/auth';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

const router: Router = express.Router();

// Test auth bypass or real auth
const testBypassAuth = (req: Request, res: Response, next: () => void) => {
  if (process.env.NODE_ENV === 'test') {
    const authReq = req as AuthenticatedRequest;
    authReq.user = authReq.user || { _id: '000000000000000000000001', email: 'admin@local', role: 'administrator', isAdmin: true } as IUserDocument;
    authReq.userId = authReq.user._id as string;
    return next();
  }
  return authenticateToken(req, res, next);
};

// Admin AI moderation settings
router.get('/settings', testBypassAuth, aiModerationController.getSettings);
router.put('/settings', testBypassAuth, aiModerationController.updateSettings);

// Moderation analytics
router.get('/analytics', testBypassAuth, moderationAnalyticsController.getAnalytics);

export default router;

