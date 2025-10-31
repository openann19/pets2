/**
 * Likes Routes - See Who Liked You Feature
 * Premium feature endpoints
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { requireSeeWhoLiked } from '../middleware/premiumGating';
import { getReceivedLikes, getMutualLikes } from '../controllers/likesController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/likes/received
 * @desc    Get users who liked your pets (Premium feature)
 * @access  Private (Premium)
 */
router.get('/received', requireSeeWhoLiked, getReceivedLikes);

/**
 * @route   GET /api/likes/mutual
 * @desc    Get mutual likes (potential matches)
 * @access  Private (Premium)
 */
router.get('/mutual', requireSeeWhoLiked, getMutualLikes);

export default router;

