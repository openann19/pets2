const logger = require('../utils/logger');

/**
 * Premium Feature Gating Middleware
 * Provides comprehensive access control for premium features
 */

// Middleware to check if user can use unlimited swipes
const requireUnlimitedSwipes = async (req, res, next) => {
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

    if (currentSwipes >= 50) { // Free tier limit
      return res.status(403).json({
        success: false,
        message: 'Daily swipe limit exceeded. Upgrade to premium for unlimited swipes.',
        code: 'SWIPE_LIMIT_EXCEEDED',
        upgradeRequired: true,
        currentLimit: 50,
        usedToday: currentSwipes
      });
    }
  }

  next();
};

// Middleware to check if user can see who liked them
const requireSeeWhoLiked = (req, res, next) => {
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
const requireProfileBoost = (req, res, next) => {
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
const requireSuperLikes = async (req, res, next) => {
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
const requireAdvancedFilters = (req, res, next) => {
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
const requireAIMatching = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasFeature = user.premium?.isActive &&
                    (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                    user.premium.features?.aiMatching;

  if (!hasFeature) {
    return res.status(403).json({
      success: false,
      message: 'Premium feature required: AI-powered matching',
      code: 'PREMIUM_FEATURE_REQUIRED',
      requiredFeature: 'aiMatching',
      upgradeRequired: true
    });
  }

  next();
};

// Middleware to check if user can access global passport
const requireGlobalPassport = (req, res, next) => {
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
const requirePrioritySupport = (req, res, next) => {
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

// Generic premium feature checker
const requirePremiumFeatureGate = (featureName) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasFeature = user.premium?.isActive &&
                      (!user.premium.expiresAt || user.premium.expiresAt > new Date()) &&
                      user.premium.features?.[featureName];

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
const trackPremiumUsage = (featureName) => {
  return async (req, res, next) => {
    // Store original response methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Override response methods to track successful usage
    res.json = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Track usage asynchronously (don't block response)
        updatePremiumUsage(req.user._id, featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: req.user._id, feature: featureName });
        });
      }
      return originalJson.call(this, data);
    };

    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        // Track usage asynchronously
        updatePremiumUsage(req.user._id, featureName).catch(error => {
          logger.error('Failed to track premium usage', { error, userId: req.user._id, feature: featureName });
        });
      }
      return originalSend.call(this, data);
    };

    next();
  };
};

// Helper function to update premium usage
async function updatePremiumUsage(userId, featureName) {
  const User = require('../models/User');

  try {
    const updateQuery = {};

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

module.exports = {
  requireUnlimitedSwipes,
  requireSeeWhoLiked,
  requireProfileBoost,
  requireSuperLikes,
  requireAdvancedFilters,
  requireAIMatching,
  requireGlobalPassport,
  requirePrioritySupport,
  requirePremiumFeatureGate,
  trackPremiumUsage
};
