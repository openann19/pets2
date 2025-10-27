import express, { type Request, type Response, Router } from 'express';
import aiModerationController from '../controllers/aiModerationController';
import { authenticateToken } from '../middleware/auth';
import { type IUserDocument } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  userId?: string;
}

const router: Router = express.Router();

// In tests, provide a simple auth bypass to attach a mock user
const testBypassAuth = (req: Request, res: Response, next: () => void) => {
  if (process.env.NODE_ENV === 'test') {
    const authReq = req as AuthenticatedRequest;
    authReq.user = authReq.user || { _id: '000000000000000000000001', email: 'test@local', role: 'moderator' } as IUserDocument;
    authReq.userId = authReq.user._id as string;
    return next();
  }
  return authenticateToken(req, res, next);
};

// AI moderation endpoints - require authentication
router.post('/moderate/text', testBypassAuth, aiModerationController.moderateText);
router.post('/moderate/image', testBypassAuth, aiModerationController.moderateImage);

export default router;

