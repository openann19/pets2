import express, { type Request, type Response, Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { strictRateLimiter } from '../middleware/globalRateLimit';
import * as conversationController from '../controllers/conversationController';

interface AuthenticatedRequest extends Request {
  userId?: string;
  user?: {
    _id: string;
    email: string;
    [key: string]: any;
  };
}

const router: Router = express.Router();

// All conversation routes require auth
router.use(authenticateToken);

// Get paginated messages (cursor by message id)
router.get('/:conversationId/messages', conversationController.getMessages);

// Send message
router.post('/:conversationId/messages', strictRateLimiter, conversationController.sendMessage);

// Mark messages as read
router.post('/:conversationId/read', conversationController.markRead);

export default router;
