/**
 * Admin Chat Moderation Routes
 * Routes for chat message moderation
 */

import { Router } from 'express';
import {
  getChatMessages,
  moderateMessage,
  getChatModerationStats,
} from '../controllers/admin/chatModerationController';

const router = Router();

/**
 * GET /api/admin/chats/messages
 * Get messages for moderation review
 */
router.get('/messages', getChatMessages);

/**
 * POST /api/admin/chats/messages/:messageId/moderate
 * Moderate a specific message
 */
router.post('/messages/:messageId/moderate', moderateMessage);

/**
 * GET /api/admin/chats/stats
 * Get chat moderation statistics
 */
router.get('/stats', getChatModerationStats);

export default router;

