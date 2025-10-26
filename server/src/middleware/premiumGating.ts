import type { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Extended request with user
 */
interface RequestWithUser extends Request {
  user?: {
    premium?: {
      isActive: boolean;
      expiresAt?: Date;
      features?: Record<string, boolean>;
      usage?: {
        swipesUsed?: number;
        superLikesUsed?: number;
        boostsUsed?: number;
        boostsLimit?: number;
        superLikesLimit?: number;
        messagesSent?: number;
      };
    };
    swipedPets?: Array<{
      action: string;
      swipedAt: Date;
    }>;
    _id?: string;
  };
}

/**
 * Middleware to check if user can use unlimited swipes
 */
export const requireUnlimitedSwipes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
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

    if (currentSwipes >= 50) { // Free tier limit
      res.status(403).json({
        success: false,
        message: 'Daily swipe limit exceeded. Upgrade to premium for unlimited swipes.',
        code: 'SWIPE_LIMIT_EXCEEDED',
        upgradeRequired: true,
        currentLimit: 50,
        usedToday: currentSwipes
      });
      return;
    }
  }

  next();
};

/**
 * Middleware to check if user can see who liked them
 */
export const requireSeeWhoLiked = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.seeWhoLiked;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: See who liked you',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'seeWhoLiked',
      upgradeRequired: true
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can boost their profile
 */
export const requireProfileBoost = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.boostProfile;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: Profile boost',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'boostProfile',
      upgradeRequired: true
    });
    return;
  }

  // Check if user has boosts remaining this month
  const now = new Date();
  const boostsThisMonth = user.premium?.usage?.boostsUsed || 0;
  const boostLimit = user.premium?.usage?.boostsLimit || 0;

  if (boostsThisMonth >= boostLimit) {
    res.status(403).json({
      success: false,
      message: 'Monthly boost limit exceeded',
      code: 'BOOST_LIMIT_EXCEEDED',
      usedThisMonth: boostsThisMonth,
      limit: boostLimit,
      resetDate: new Date(now.getFullYear(), now.getMonth() + 1, 1).toISOString()
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can use super likes
 */
export const requireSuperLikes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date());

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium subscription required for super likes',
      code: 'PREMIUM_REQUIRED',
      upgradeRequired: true
    });
    return;
  }

  // Check super like limits
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const superLikesThisWeek = user.swipedPets?.filter(swipe =>
    swipe.action === 'superlike' && swipe.swipedAt >= weekStart
  ).length || 0;

  const superLikeLimit = user.premium?.usage?.superLikesLimit || 5;

  if (superLikesThisWeek >= superLikeLimit) {
    res.status(403).json({
      success: false,
      message: 'Weekly super like limit exceeded',
      code: 'SUPER_LIKE_LIMIT_EXCEEDED',
      usedThisWeek: superLikesThisWeek,
      limit: superLikeLimit,
      resetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can use advanced filters
 */
export const requireAdvancedFilters = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.advancedFilters;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: Advanced filters',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'advancedFilters',
      upgradeRequired: true
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can access AI matching
 */
export const requireAIMatching = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.aiMatching;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: AI-powered matching',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'aiMatching',
      upgradeRequired: true
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can access global passport
 */
export const requireGlobalPassport = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.globalPassport;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: Global passport',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'globalPassport',
      upgradeRequired: true
    });
    return;
  }

  next();
};

/**
 * Middleware to check if user can access priority support
 */
export const requirePrioritySupport = (req: Request, res: Response, next: NextFunction): void => {
  const reqWithUser = req as RequestWithUser;
  const user = reqWithUser.user;

  if (!user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.prioritySupport;

  if (!hasFeature) {
    res.status(403).json({
      success: false,
      message: 'Premium feature required: Priority support',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'prioritySupport',
      upgradeRequired: true
    });
    return;
  }

  next();
};

/**
 * Generic premium feature checker
 */
export const requirePremiumFeatureGate = (featureName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const reqWithUser = req as RequestWithUser;
    const user = reqWithUser.user;

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
      return;
    }

    const hasFeature = user.premium?.isActive &&
                      (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                      user.premium.features?.[featureName];

    if (!hasFeature) {
      res.status(403).json({
        success: false,
        message: `Premium feature required: ${featureName}`,
        code: 'PREMIUM_FEATURE_REQUIRED',
        requiredFeature: featureName,
        upgradeRequired: true
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to track premium feature usage
 */
export const trackPremiumUsage = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const reqWithUser = req as RequestWithUser;
    
    // Store original response methods
    const originalJson = res.json.bind(res);
    const originalSend = res.send.bind(res);

    // Override response methods to track successful usage
    res.json = function(data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300 && reqWithUser.user && reqWithUser.user._id) {
        // Track usage asynchronously (don't block response)
        updatePremiumUsage(reqWithUser.user._id, featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: reqWithUser.user?._id, feature: featureName });
        });
      }
      return originalJson.call(this, data);
    };

    res.send = function(data: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300 && reqWithUser.user && reqWithUser.user._id) {
        // Track usage asynchronously
        updatePremiumUsage(reqWithUser.user._id, featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: reqWithUser.user?._id, feature: featureName });
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Helper function to update premium usage
 */
async function updatePremiumUsage(userId: string, featureName: string): Promise<void> {
  const { User } = await import('../models/User');

  try {
    const updateQuery: { $inc?: Record<string, number> } = {};

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

    await User.findByIdAndUpdate(userId, updateQuery);
  } catch (error) {
    logger.error('Error updating premium usage', { error, userId, featureName });
  }
}
