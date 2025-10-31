/**
 * Swipe Premium Service
 * Phase 2 Product Enhancement - Premium swipe features
 */

import User from '../models/User';
import Match from '../models/Match';
import logger from '../utils/logger';
import type { SwipePremiumUsage } from '@pawfectmatch/core/types/phase2-contracts';

/**
 * Check if user has premium subscription
 */
interface UserLean {
  premium?: {
    isActive?: boolean;
    plan?: string;
    status?: string;
    tier?: string;
  };
  premiumUsage?: {
    rewind?: number;
    superLike?: number;
    boost?: number;
    resetAt?: string | Date;
  };
}

async function hasPremiumSubscription(userId: string): Promise<boolean> {
  try {
    const user = await User.findById(userId).lean() as UserLean | null;
    if (!user) return false;

    // Check subscription status using premium.isActive
    const premium = user.premium;
    return premium?.isActive === true && 
           (premium?.plan === 'premium' || premium?.plan === 'elite');
  } catch (error) {
    logger.error('Failed to check premium subscription', { error, userId });
    return false;
  }
}

/**
 * Get premium usage for a user
 */
export async function getPremiumUsage(userId: string): Promise<SwipePremiumUsage> {
  try {
    // Check premium status
    const isPremium = await hasPremiumSubscription(userId);
    
    if (!isPremium) {
      return {
        rewindCount: 0,
        superLikeCount: 0,
        boostCount: 0,
        rewindLimit: 0,
        superLikeLimit: 0,
        boostLimit: 0,
        resetAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      };
    }

    // Get today's usage from user document or separate usage tracking
    const user = await User.findById(userId).lean() as UserLean | null;
    const usage = user?.premiumUsage || {
      rewind: 0,
      superLike: 0,
      boost: 0,
      resetAt: new Date().toISOString(),
    };

    // Check if reset date has passed
    const resetDate = new Date(usage.resetAt || new Date());
    const now = new Date();
    let resetAt = resetDate;
    
    if (resetDate < now) {
      // Reset usage
      resetAt = new Date(now);
      resetAt.setHours(24, 0, 0, 0); // Next midnight
    }

    // Premium limits
    const limits = {
      rewind: 1, // 1 per day
      superLike: 5, // 5 per day
      boost: 1, // 1 per day
    };

    return {
      rewindCount: usage.rewind || 0,
      superLikeCount: usage.superLike || 0,
      boostCount: usage.boost || 0,
      rewindLimit: limits.rewind,
      superLikeLimit: limits.superLike,
      boostLimit: limits.boost,
      resetAt: resetAt.toISOString(),
    };
  } catch (error) {
    logger.error('Failed to get premium usage', { error, userId });
    throw error;
  }
}

/**
 * Use rewind feature (undo last swipe)
 */
export async function useRewind(userId: string, petId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check premium
    const isPremium = await hasPremiumSubscription(userId);
    if (!isPremium) {
      return { success: false, error: 'Premium subscription required' };
    }

    // Check usage limits
    const usage = await getPremiumUsage(userId);
    if (usage.rewindCount >= usage.rewindLimit) {
      return { success: false, error: 'Daily rewind limit reached' };
    }

    // Find the last swipe for this user
    const lastSwipe = await Match.findOne({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!lastSwipe) {
      return { success: false, error: 'No swipe found to rewind' };
    }

    // Update usage
    await User.findByIdAndUpdate(userId, {
      $inc: { 'premiumUsage.rewind': 1 },
      $set: { 'premiumUsage.resetAt': usage.resetAt },
    });

    logger.info('Rewind used', { userId, petId, matchId: lastSwipe._id.toString() });

    return { success: true };
  } catch (error) {
    logger.error('Failed to use rewind', { error, userId, petId });
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Use super like feature
 */
export async function useSuperLike(userId: string, matchId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check premium
    const isPremium = await hasPremiumSubscription(userId);
    if (!isPremium) {
      return { success: false, error: 'Premium subscription required' };
    }

    // Check usage limits
    const usage = await getPremiumUsage(userId);
    if (usage.superLikeCount >= usage.superLikeLimit) {
      return { success: false, error: 'Daily super like limit reached' };
    }

    // Find match
    const match = await Match.findById(matchId);
    if (!match) {
      return { success: false, error: 'Match not found' };
    }

    // Mark as super like (add flag or update status)
    // Note: isSuperLike is a dynamic property on Match model
    const matchDoc = match as Match & { isSuperLike?: boolean };
    matchDoc.isSuperLike = true;
    await matchDoc.save();

    // Update usage
    await User.findByIdAndUpdate(userId, {
      $inc: { 'premiumUsage.superLike': 1 },
      $set: { 'premiumUsage.resetAt': usage.resetAt },
    });

    logger.info('Super like used', { userId, matchId });

    return { success: true };
  } catch (error) {
    logger.error('Failed to use super like', { error, userId, matchId });
    return { success: false, error: 'Internal error' };
  }
}

/**
 * Activate profile boost
 */
export async function activateBoost(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Check premium
    const isPremium = await hasPremiumSubscription(userId);
    if (!isPremium) {
      return { success: false, error: 'Premium subscription required' };
    }

    // Check usage limits
    const usage = await getPremiumUsage(userId);
    if (usage.boostCount >= usage.boostLimit) {
      return { success: false, error: 'Daily boost limit reached' };
    }

    // Set boost active (boosts visibility for 24 hours)
    const boostExpiresAt = new Date();
    boostExpiresAt.setHours(boostExpiresAt.getHours() + 24);

    await User.findByIdAndUpdate(userId, {
      $inc: { 'premiumUsage.boost': 1 },
      $set: {
        'premiumUsage.boostExpiresAt': boostExpiresAt.toISOString(),
        'premiumUsage.resetAt': usage.resetAt,
      },
    });

    logger.info('Profile boost activated', { userId, expiresAt: boostExpiresAt.toISOString() });

    return { success: true };
  } catch (error) {
    logger.error('Failed to activate boost', { error, userId });
    return { success: false, error: 'Internal error' };
  }
}

