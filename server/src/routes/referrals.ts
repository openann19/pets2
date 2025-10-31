/**
 * Referral Routes - Referral Program
 */

import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getReferralCode,
  applyReferralCode,
  getReferralStats,
} from '../controllers/referralController';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/referrals/code
 * @desc    Get user's referral code
 * @access  Private
 */
router.get('/code', getReferralCode);

/**
 * @route   POST /api/referrals/apply
 * @desc    Apply a referral code
 * @access  Private
 */
router.post('/apply', applyReferralCode);

/**
 * @route   GET /api/referrals/stats
 * @desc    Get referral statistics
 * @access  Private
 */
router.get('/stats', getReferralStats);

export default router;

