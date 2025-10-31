/**
 * Referral Controller - Referral Program
 * Business Model: Give 1 month free Premium for successful referrals
 * Get: Premium subscription for referrer
 */

import type { Response } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';
import User from '../models/User';

/**
 * @desc    Get referral code for current user
 * @route   GET /api/referrals/code
 * @access  Private
 */
export const getReferralCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    // Generate or get existing referral code
    if (!user.referralCode) {
      // Generate unique referral code: USER_ID + random string
      const randomString = Math.random().toString(36).substring(2, 8).toUpperCase();
      user.referralCode = `${user._id.toString().substring(0, 6)}${randomString}`;
      await user.save();
    }

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink: `pawfectmatch://refer/${user.referralCode}`,
        totalReferrals: user.referralStats?.totalReferrals || 0,
        activeReferrals: user.referralStats?.activeReferrals || 0,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get referral code', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get referral code',
    });
  }
};

/**
 * @desc    Apply referral code during signup
 * @route   POST /api/referrals/apply
 * @access  Private
 */
export const applyReferralCode = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { referralCode } = req.body;
    const userId = req.userId;

    if (!referralCode) {
      res.status(400).json({
        success: false,
        message: 'Referral code is required',
      });
      return;
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      res.status(404).json({
        success: false,
        message: 'Invalid referral code',
      });
      return;
    }

    // Can't use your own code
    if (referrer._id.toString() === userId) {
      res.status(400).json({
        success: false,
        message: 'Cannot use your own referral code',
      });
      return;
    }

    // Check if user already used a referral code
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (user.referredBy) {
      res.status(400).json({
        success: false,
        message: 'You have already used a referral code',
      });
      return;
    }

    // Apply referral
    user.referredBy = referrer._id;
    user.referredAt = new Date();

    // Initialize referral stats for referrer if needed
    if (!referrer.referralStats) {
      referrer.referralStats = {
        totalReferrals: 0,
        activeReferrals: 0,
        totalRewardsEarned: 0,
      };
    }

    referrer.referralStats.totalReferrals = (referrer.referralStats.totalReferrals || 0) + 1;
    referrer.referralStats.activeReferrals = (referrer.referralStats.activeReferrals || 0) + 1;

    // Business Model: Give 1 month free Premium to new user
    if (!user.premium) {
      user.premium = {
        isActive: true,
        plan: 'premium',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        features: {
          unlimitedLikes: true,
          seeWhoLiked: true,
          boostProfile: true,
          advancedFilters: true,
          priorityMatching: true,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: -1, // Unlimited
          superLikesUsed: 0,
          superLikesLimit: -1,
          boostsUsed: 0,
          boostsLimit: -1,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        },
      };
    } else {
      // Extend existing premium
      user.premium.isActive = true;
      const currentExpiry = user.premium.expiresAt
        ? new Date(user.premium.expiresAt)
        : new Date();
      user.premium.expiresAt = new Date(
        Math.max(currentExpiry.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000,
      );
    }

    // Business Model: Give Premium to referrer (if they don't have it)
    if (!referrer.premium?.isActive) {
      referrer.premium = {
        isActive: true,
        plan: 'premium',
        startedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        features: {
          unlimitedLikes: true,
          seeWhoLiked: true,
          boostProfile: true,
          advancedFilters: true,
          priorityMatching: true,
        },
        usage: {
          swipesUsed: 0,
          swipesLimit: -1,
          superLikesUsed: 0,
          superLikesLimit: -1,
          boostsUsed: 0,
          boostsLimit: -1,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0,
          iapSuperLikes: 0,
          iapBoosts: 0,
        },
      };
    } else {
      // Extend referrer's premium
      const currentExpiry = referrer.premium.expiresAt
        ? new Date(referrer.premium.expiresAt)
        : new Date();
      referrer.premium.expiresAt = new Date(
        Math.max(currentExpiry.getTime(), Date.now()) + 30 * 24 * 60 * 60 * 1000,
      );
    }

    await user.save();
    await referrer.save();

    logger.info('Referral code applied', {
      userId,
      referrerId: referrer._id,
      referralCode,
    });

    res.json({
      success: true,
      message: 'Referral code applied successfully! You both got 1 month free Premium!',
      data: {
        referrerName: referrer.name,
        premiumActive: user.premium.isActive,
        premiumExpiresAt: user.premium.expiresAt,
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to apply referral code', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to apply referral code',
    });
  }
};

/**
 * @desc    Get referral stats for current user
 * @route   GET /api/referrals/stats
 * @access  Private
 */
export const getReferralStats = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        referralCode: user.referralCode || null,
        stats: user.referralStats || {
          totalReferrals: 0,
          activeReferrals: 0,
          totalRewardsEarned: 0,
        },
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to get referral stats', {
      error: errorMessage,
      userId: req.userId,
    });
    res.status(500).json({
      success: false,
      message: 'Failed to get referral stats',
    });
  }
};

