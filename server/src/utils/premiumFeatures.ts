/**
 * Premium Feature Utilities
 * Business Model: Features aligned with apps/mobile/src/screens/business.md
 */

import type { IUserDocument } from '../types/mongoose.d';

/**
 * Helper function to set feature limits and flags based on plan
 * Business Model: Features aligned with apps/mobile/src/screens/business.md
 */
export function setFeatureLimitsBasedOnPlan(user: IUserDocument): void {
  // Ensure premium object exists
  if (!user.premium) {
    user.premium = {
      isActive: false,
      plan: 'free',
      expiresAt: null,
      cancelAtPeriodEnd: false,
      paymentStatus: 'active',
      features: {
        unlimitedLikes: false,
        boostProfile: false,
        seeWhoLiked: false,
        advancedFilters: false,
        aiMatching: false,
        prioritySupport: false,
        globalPassport: false,
        readReceipts: false,
        videoCalls: false,
      },
      usage: {
        swipesUsed: 0,
        swipesLimit: 5,
        superLikesUsed: 0,
        superLikesLimit: 0,
        boostsUsed: 0,
        boostsLimit: 0,
        messagesSent: 0,
        profileViews: 0,
        rewindsUsed: 0,
      },
    };
  }

  // Ensure usage object exists
  if (!user.premium.usage) {
    user.premium.usage = {
      swipesUsed: user.premium.usage?.swipesUsed || 0,
      swipesLimit: 5,
      superLikesUsed: user.premium.usage?.superLikesUsed || 0,
      superLikesLimit: 0,
      boostsUsed: user.premium.usage?.boostsUsed || 0,
      boostsLimit: 0,
      messagesSent: user.premium.usage?.messagesSent || 0,
      profileViews: user.premium.usage?.profileViews || 0,
      rewindsUsed: user.premium.usage?.rewindsUsed || 0,
    };
  }

  // Ensure features object exists
  if (!user.premium.features) {
    user.premium.features = {
      unlimitedLikes: false,
      boostProfile: false,
      seeWhoLiked: false,
      advancedFilters: false,
      aiMatching: false,
      prioritySupport: false,
      globalPassport: false,
      readReceipts: false,
      videoCalls: false,
    };
  }

  switch (user.premium.plan) {
    case 'premium':
      // Premium tier: $9.99/month - Business Model from business.md
      user.premium.usage.swipesLimit = Infinity;
      user.premium.usage.superLikesLimit = Infinity; // Unlimited (per business.md)
      user.premium.usage.boostsLimit = 1;
      // Premium features per business.md
      user.premium.features.unlimitedLikes = true;
      user.premium.features.seeWhoLiked = true;
      user.premium.features.advancedFilters = true;
      user.premium.features.readReceipts = true; // Premium feature
      user.premium.features.videoCalls = true; // Premium feature
      user.premium.features.boostProfile = true;
      user.premium.features.aiMatching = false; // Ultimate only
      user.premium.features.prioritySupport = false; // Ultimate only
      break;
    case 'ultimate':
      // Ultimate tier: $19.99/month - Business Model from business.md
      user.premium.usage.swipesLimit = Infinity;
      user.premium.usage.superLikesLimit = Infinity;
      user.premium.usage.boostsLimit = Infinity; // Daily boosts available
      // All Premium features + Ultimate exclusive features
      user.premium.features.unlimitedLikes = true;
      user.premium.features.seeWhoLiked = true;
      user.premium.features.advancedFilters = true;
      user.premium.features.readReceipts = true; // Included in Ultimate
      user.premium.features.videoCalls = true; // Included in Ultimate
      user.premium.features.boostProfile = true;
      user.premium.features.aiMatching = true; // Ultimate exclusive
      user.premium.features.prioritySupport = true; // Ultimate exclusive
      break;
    default:
      // Free/Basic plan - Business Model: 5 daily swipes for free users
      user.premium.usage.swipesLimit = 5; // Changed from 50 to 5 per business.md
      user.premium.usage.superLikesLimit = 0;
      user.premium.usage.boostsLimit = 0;
      // No premium features
      user.premium.features.unlimitedLikes = false;
      user.premium.features.seeWhoLiked = false;
      user.premium.features.advancedFilters = false;
      user.premium.features.readReceipts = false;
      user.premium.features.videoCalls = false;
      user.premium.features.boostProfile = false;
      user.premium.features.aiMatching = false;
      user.premium.features.prioritySupport = false;
  }
}

