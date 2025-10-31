import type { Request, Response, NextFunction } from 'express';
import type { AuthRequest } from '../types/express';
import logger from '../utils/logger';

interface PremiumFeatures {
  unlimitedLikes?: boolean;
  boostProfile?: boolean;
  seeWhoLiked?: boolean;
  advancedFilters?: boolean;
  aiMatching?: boolean;
  globalPassport?: boolean;
  prioritySupport?: boolean;
  readReceipts?: boolean;
  videoCalls?: boolean;
}

interface PremiumUsage {
  swipesUsed?: number;
  swipesLimit?: number;
  superLikesUsed?: number;
  superLikesLimit?: number;
  boostsUsed?: number;
  boostsLimit?: number;
  messagesSent?: number;
  profileViews?: number;
}

interface UserPremium {
  isActive?: boolean;
  plan?: string;
  expiresAt?: Date;
  stripeSubscriptionId?: string;
  cancelAtPeriodEnd?: boolean;
  paymentStatus?: string;
  features?: PremiumFeatures;
  usage?: PremiumUsage;
}

interface SwipedPet {
  petId: string;
  action: string;
  swipedAt: Date;
}

/**
 * Premium Feature Gating Middleware
 * Provides comprehensive access control for premium features
 */

// Middleware to check if user can use unlimited swipes
export const requireUnlimitedSwipes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // Check if user has unlimited swipes (premium feature)
  const hasUnlimitedSwipes = user.premium?.isActive &&
                            (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                            user.premium.features?.unlimitedLikes;

  if (!hasUnlimitedSwipes) {
    // Check if user has exceeded free tier limits
    const currentSwipes = user.swipedPets?.filter(swipe =>
      swipe.swipedAt >= new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    ).length || 0;

    if (currentSwipes >= 5) { // Business Model: Free tier limit is 5 daily swipes
      return res.status(403).json({
        success: false,
        message: 'Daily swipe limit exceeded. Upgrade to premium for unlimited swipes.',
        code: 'SWIPE_LIMIT_EXCEEDED',
        upgradeRequired: true,
        currentLimit: 5,
        usedToday: currentSwipes
      });
    }
  }

  next();
};

// Middleware to check if user can see who liked them
export const requireSeeWhoLiked = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.seeWhoLiked;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: See who liked you',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'seeWhoLiked',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can boost their profile
export const requireProfileBoost = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.boostProfile;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: Profile boost',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'boostProfile',
      upgradeRequired: true
    });
  }

  // Check if user has boosts remaining this month
  const now = new Date();
  const boostsThisMonth = user.premium?.usage?.boostsUsed || 0;
  const boostLimit = user.premium?.usage?.boostsLimit || 0;

  if (boostsThisMonth >= boostLimit) {
    return res.status(403).json({
      success: false,
      message: 'Monthly boost limit exceeded',
      code: 'BOOST_LIMIT_EXCEEDED',
      usedThisMonth: boostsThisMonth,
      limit: boostLimit,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    });
  }

  next();
};

// Middleware to check if user can use super likes
export const requireSuperLikes = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date());

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required for super likes',
      code: 'PREMIUM_REQUIRED',
      upgradeRequired: true
    });
  }

  // Check super like limits
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const superLikesThisWeek = user.swipedPets?.filter(swipe =>
    swipe.action === 'superlike' && swipe.swipedAt >= weekStart
  ).length || 0;

  const superLikeLimit = user.premium?.usage?.superLikesLimit || 5;

  if (superLikesThisWeek >= superLikeLimit) {
    return res.status(403).json({
      success: false,
      message: 'Weekly super like limit exceeded',
      code: 'SUPER_LIKE_LIMIT_EXCEEDED',
      usedThisWeek: superLikesThisWeek,
      limit: superLikeLimit,
      resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }

  next();
};

// Middleware to check if user can use advanced filters
export const requireAdvancedFilters = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.advancedFilters;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: Advanced filters',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'advancedFilters',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can access AI matching
// Business Model: AI recommendations are Ultimate tier only (business.md)
export const requireAIMatching = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  // AI matching requires Ultimate tier per business.md
  const isUltimate = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.plan?.toLowerCase() === 'ultimate' &&
                    user.premium.features?.aiMatching;

  if (!isUltimate) {
    return res.status(403).json({
      success: false,
      message: 'Ultimate tier required: AI-powered recommendations are exclusive to Ultimate subscribers ($19.99/month)',
      code: 'ULTIMATE_TIER_REQUIRED',
      requiredFeature: 'aiMatching',
      requiredTier: 'ultimate',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can access global passport
export const requireGlobalPassport = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.globalPassport;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: Global passport',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'globalPassport',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can access priority support
export const requirePrioritySupport = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.prioritySupport;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: Priority support',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'prioritySupport',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can use read receipts
// Business Model: Read receipts are Premium+ feature (business.md)
export const requireReadReceipts = (req: Request, res: Response, next: NextFunction): Response | void => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    (user.premium.plan?.toLowerCase() === 'premium' || user.premium.plan?.toLowerCase() === 'ultimate') &&
                    user.premium.features?.readReceipts;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium subscription required: Read receipts are available for Premium subscribers ($9.99/month)',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'readReceipts',
      requiredTier: 'premium',
      upgradeRequired: true
    });
  }

  next();
};

// Generic premium feature checker
export const requirePremiumFeatureGate = (featureName: string) => {
  return (req: Request, res: Response, next: NextFunction): Response | void => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasFeature = user.premium?.isActive &&
                      (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                      user.premium.features?.[featureName as keyof PremiumFeatures];

    if (!hasFeature) {
      return res.status(403).json({
        success: false,
        message: `Premium feature required: ${featureName}`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: featureName,
        upgradeRequired: true
      });
    }

    next();
  };
};

// Middleware to track premium feature usage
export const trackPremiumUsage = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Store original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override response methods to track successful usage
    res.json = function(data: unknown): Response {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Track usage asynchronously (don't block response)
        updatePremiumUsage(req.user._id.toString(), featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: req.user?._id?.toString(), feature: featureName });
        });
      }
      return originalJson(data);
    };

    res.send = function(data?: unknown): Response {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Track usage asynchronously
        updatePremiumUsage(req.user._id.toString(), featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: req.user?._id?.toString(), feature: featureName });
        });
      }
      return originalSend(data);
    };

    next();
  };
};

// Helper function to update premium usage
async function updatePremiumUsage(userId: string, featureName: string): Promise<void> {
  const User = await import('../models/User');

  try {
    const updateQuery: {
      $inc?: {
        'premium.usage.swipesUsed'?: number;
        'premium.usage.superLikesUsed'?: number;
        'premium.usage.boostsUsed'?: number;
        'premium.usage.messagesSent'?: number;
        'analytics.totalPremiumFeaturesUsed'?: number;
      };
    } = {};

    switch (featureName) {
      case 'swipe':
        updateQuery.$inc = { 'premium.usage.swipesUsed': 1 };
        break;
      case 'superLike':
        updateQuery.$inc = { 'premium.usage.superLikesUsed': 1 };
        break;
      case 'boost':
        updateQuery.$inc = { 'premium.usage.boostsUsed': 1 };
        break;
      case 'message':
        updateQuery.$inc = { 'premium.usage.messagesSent': 1 };
        break;
      default:
        // Generic feature usage tracking
        updateQuery.$inc = { 'analytics.totalPremiumFeaturesUsed': 1 };
        break;
    }

    await User.default.findByIdAndUpdate(userId, updateQuery);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Error updating premium usage', { error: errorMessage, userId, featureName });
  }
}
