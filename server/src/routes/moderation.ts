import express from 'express';
import type { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  createReport,
  blockUser,
  unblockUser,
  muteUser,
  unmuteUser,
  getModerationState
} from '../controllers/moderationController';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Type-safe wrapper function
const wrapHandler = (handler: (req: Request, res: Response) => Promise<void>) => {
  return async (req: Request, res: Response): Promise<void> => {
    return handler(req, res);
  };
};

// Report inappropriate content or behavior
router.post('/report', wrapHandler(createReport));

// Block/unblock users
router.post('/block', wrapHandler(blockUser));
router.delete('/block/:blockedUserId', wrapHandler(unblockUser));

// Mute/unmute users
router.post('/mute', wrapHandler(muteUser));
router.delete('/mute/:mutedUserId', wrapHandler(unmuteUser));

// Get current user's blocks and mutes
router.get('/me', wrapHandler(getModerationState));

export default router;

