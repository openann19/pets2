/**
 * Gifts Routes - Gift Shop Feature
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { sendGift, getReceivedGifts } from '../controllers/giftsController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   POST /api/gifts/send
 * @desc    Send a gift to a match
 * @access  Private
 */
router.post('/send', sendGift);

/**
 * @route   GET /api/gifts/received
 * @desc    Get received gifts
 * @access  Private
 */
router.get('/received', getReceivedGifts);

export default router;

