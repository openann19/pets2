import User from '../models/User';
import type { IUserDocument } from '../models/User';
import type { HydratedDocument } from 'mongoose';
const logger = require('../utils/logger');

// Interface for swipe action
export type SwipeAction = 'like' | 'pass' | 'superlike';

// Interface for usage stats
export interface UsageStats {
  swipesUsed: number;
  swipesLimit: number;
  superLikesUsed: number;
  superLikesLimit: number;
  boostsUsed: number;
  boostsLimit: number;
  profileViews: number;
  messagesSent: number;
  matchRate: number;
}

// Interface for tracking result
export interface TrackingResult {
  success: boolean;
}

// Interface for usage stats result
export interface UsageStatsResult {
  success: boolean;
  data: UsageStats;
}

class UsageTrackingService {
  /**
   * Track a swipe action for a user
   */
  async trackSwipe(userId: string, petId: string, action: SwipeAction): Promise<TrackingResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userDoc = user as unknown as HydratedDocument<IUserDocument>;
      
      // Initialize premium if it doesn't exist
      if (!userDoc.premium) {
        userDoc.premium = {
          isActive: false,
          plan: 'basic',
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
            videoCalls: false
          },
          usage: {
            swipesUsed: 0,
            swipesLimit: 5, // Business Model: 5 daily swipes for free users
            superLikesUsed: 0,
            superLikesLimit: 0,
            boostsUsed: 0,
            boostsLimit: 0,
            messagesSent: 0,
            profileViews: 0,
            rewindsUsed: 0
          }
        };
      }

      // Initialize usage if it doesn't exist
      if (!userDoc.premium.usage) {
        userDoc.premium.usage = {
          swipesUsed: 0,
          swipesLimit: 5, // Business Model: 5 daily swipes for free users
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0,
          messagesSent: 0,
          profileViews: 0,
          rewindsUsed: 0
        };
      }

      // Initialize analytics if it doesn't exist
      if (!userDoc.analytics) {
        userDoc.analytics = {
          totalSwipes: 0,
          totalLikes: 0,
          totalMatches: 0,
          profileViews: 0,
          lastActive: new Date(),
          totalPetsCreated: 0,
          totalMessagesSent: 0,
          totalSubscriptionsStarted: 0,
          totalSubscriptionsCancelled: 0,
          totalPremiumFeaturesUsed: 0,
          events: []
        };
      }

      // Increment swipe count
      if (userDoc.premium?.usage) {
        userDoc.premium.usage.swipesUsed = (userDoc.premium.usage.swipesUsed || 0) + 1;
      }
      
      // Track in analytics
      userDoc.analytics.totalSwipes = (userDoc.analytics.totalSwipes || 0) + 1;
      
      if (action === 'like') {
        userDoc.analytics.totalLikes = (userDoc.analytics.totalLikes || 0) + 1;
      }
      
      // Add swipe event to user history
      if (!userDoc.analytics.events) {
        userDoc.analytics.events = [];
      }
      userDoc.analytics.events.push({
        type: 'swipe',
        timestamp: new Date(),
        metadata: { petId, action }
      });
      
      await userDoc.save();
      
      logger.info('Swipe tracked', { 
        userId, 
        petId,
        action,
        swipesUsed: userDoc.premium?.usage?.swipesUsed || 0,
        plan: userDoc.premium?.plan || 'basic'
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error tracking swipe', { error: (error as Error).message, userId, petId, action });
      throw error;
    }
  }
  
  /**
   * Track a super like action for a user
   */
  async trackSuperLike(userId: string): Promise<TrackingResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userDoc = user as unknown as HydratedDocument<IUserDocument>;

      // Initialize premium and usage
      if (!userDoc.premium) {
        userDoc.premium = {
          isActive: false,
          plan: 'basic',
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
            videoCalls: false
          },
          usage: { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0 } // Business Model: 5 daily swipes for free users
        };
      }
      if (!userDoc.premium.usage) {
        userDoc.premium.usage = { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0 }; // Business Model: 5 daily swipes for free users
      }
      if (!userDoc.analytics) {
        userDoc.analytics = { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: new Date(), totalPetsCreated: 0, totalMessagesSent: 0, totalSubscriptionsStarted: 0, totalSubscriptionsCancelled: 0, totalPremiumFeaturesUsed: 0, events: [] };
      }
      
      // Increment super like count
      if (userDoc.premium?.usage) {
        userDoc.premium.usage.superLikesUsed = (userDoc.premium.usage.superLikesUsed || 0) + 1;
      }
      
      // Add super like event to user history
      if (!userDoc.analytics.events) {
        userDoc.analytics.events = [];
      }
      userDoc.analytics.events.push({
        type: 'superlike',
        timestamp: new Date(),
        metadata: { count: userDoc.premium.usage.superLikesUsed }
      });
      
      await userDoc.save();
      
      logger.info('Super like tracked', { 
        userId,
        superLikesUsed: userDoc.premium?.usage?.superLikesUsed || 0,
        plan: userDoc.premium?.plan || 'basic'
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error tracking super like', { error: (error as Error).message, userId });
      throw error;
    }
  }
  
  /**
   * Track a boost action for a user
   */
  async trackBoost(userId: string): Promise<TrackingResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const userDoc = user as unknown as HydratedDocument<IUserDocument>;

      // Initialize premium and usage
      if (!userDoc.premium) {
        userDoc.premium = {
          isActive: false,
          plan: 'basic',
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
            videoCalls: false
          },
          usage: { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0 } // Business Model: 5 daily swipes for free users
        };
      }
      if (!userDoc.premium.usage) {
        userDoc.premium.usage = { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0 }; // Business Model: 5 daily swipes for free users
      }
      if (!userDoc.analytics) {
        userDoc.analytics = { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: new Date(), totalPetsCreated: 0, totalMessagesSent: 0, totalSubscriptionsStarted: 0, totalSubscriptionsCancelled: 0, totalPremiumFeaturesUsed: 0, events: [] };
      }
      
      // Increment boost count
      if (userDoc.premium?.usage) {
        userDoc.premium.usage.boostsUsed = (userDoc.premium.usage.boostsUsed || 0) + 1;
        
        // Add boost event to user history
        if (!userDoc.analytics.events) {
          userDoc.analytics.events = [];
        }
        userDoc.analytics.events.push({
          type: 'boost',
          timestamp: new Date(),
          metadata: { count: userDoc.premium.usage.boostsUsed }
        });
      }
      
      await userDoc.save();
      
      logger.info('Boost tracked', { 
        userId,
        boostsUsed: userDoc.premium?.usage?.boostsUsed || 0,
        plan: userDoc.premium?.plan || 'basic'
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error tracking boost', { error: (error as Error).message, userId });
      throw error;
    }
  }
  
  /**
   * Get usage stats for a user with daily reset logic
   * Calculates remaining swipes for today based on daily limit
   */
  async getUsageStats(userId: string): Promise<UsageStatsResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const userDoc = user as IUserDocument;
      
      // Calculate today's swipes (reset daily)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const swipesToday = userDoc.swipedPets?.filter((swipe: { swipedAt: Date }) => {
        const swipeDate = new Date(swipe.swipedAt);
        return swipeDate >= today;
      }).length || 0;
      
      // Determine limit based on plan - Business Model: 5 daily swipes for free users
      let swipesLimit = 5; // Default free tier limit
      let superLikesLimit = 0;
      let boostsLimit = 0;
      
      if (userDoc.premium?.isActive && 
          (!userDoc.premium.expiresAt || userDoc.premium.expiresAt > new Date())) {
        const plan = userDoc.premium.plan?.toLowerCase() || 'free';
        
        if (plan === 'premium' || plan === 'ultimate') {
          swipesLimit = -1; // Unlimited
          superLikesLimit = plan === 'ultimate' ? -1 : 5; // Unlimited for Ultimate, 5/week for Premium
          boostsLimit = plan === 'ultimate' ? -1 : 1; // Unlimited for Ultimate, 1/month for Premium
        }
      }
      
      // Calculate remaining swipes
      const swipesRemaining = swipesLimit === -1 
        ? -1 // Unlimited
        : Math.max(0, swipesLimit - swipesToday);
      
      // Get IAP balances for free users (using optional chaining for type safety)
      const iapSuperLikes = (userDoc.premium?.usage as any)?.iapSuperLikes || 0;
      const iapBoosts = (userDoc.premium?.usage as any)?.iapBoosts || 0;
      
      const usageStats: UsageStats = {
        swipesUsed: swipesToday,
        swipesLimit,
        superLikesUsed: userDoc.premium?.usage?.superLikesUsed || 0,
        superLikesLimit: superLikesLimit === -1 ? -1 : superLikesLimit + iapSuperLikes,
        boostsUsed: userDoc.premium?.usage?.boostsUsed || 0,
        boostsLimit: boostsLimit === -1 ? -1 : boostsLimit + iapBoosts,
        profileViews: userDoc.analytics?.profileViews || 0,
        messagesSent: userDoc.analytics?.totalMessagesSent || 0,
        matchRate: userDoc.analytics?.totalMatches && userDoc.analytics?.totalSwipes
          ? Math.round(((userDoc.analytics.totalMatches / userDoc.analytics.totalSwipes) * 100) || 0) : 0
      };
      
      logger.info('Usage stats retrieved', {
        userId,
        swipesToday,
        swipesLimit,
        swipesRemaining,
        plan: userDoc.premium?.plan || 'free'
      });
      
      return { success: true, data: usageStats };
    } catch (error) {
      logger.error('Error getting usage stats', { error: (error as Error).message, userId });
      throw error;
    }
  }
  
  /**
   * Get remaining swipes for today
   * Returns object with used, limit, remaining, and warning threshold
   */
  async getDailySwipeStatus(userId: string): Promise<{
    used: number;
    limit: number;
    remaining: number;
    isUnlimited: boolean;
    warningThreshold: number; // Show warning when remaining <= this
  }> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const swipesToday = user.swipedPets?.filter((swipe: { swipedAt: Date }) => {
        const swipeDate = new Date(swipe.swipedAt);
        return swipeDate >= today;
      }).length || 0;
      
      const isPremium = user.premium?.isActive &&
        (!user.premium.expiresAt || user.premium.expiresAt > new Date());
      
      const swipesLimit = isPremium ? -1 : 5; // Business Model: 5 daily swipes for free users
      
      return {
        used: swipesToday,
        limit: swipesLimit,
        remaining: swipesLimit === -1 ? -1 : Math.max(0, swipesLimit - swipesToday),
        isUnlimited: swipesLimit === -1,
        warningThreshold: swipesLimit === -1 ? -1 : Math.max(1, Math.floor(swipesLimit * 0.2)), // Warn at 20% remaining
      };
    } catch (error) {
      logger.error('Error getting daily swipe status', { error: (error as Error).message, userId });
      throw error;
    }
  }
  
  /**
   * Reset usage stats for a user (typically at the start of a new billing period)
   */
  async resetUsageStats(userId: string): Promise<TrackingResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      if (!user.premium) {
        user.premium = {
          isActive: false,
          plan: 'free',
          expiresAt: new Date(),
          cancelAtPeriodEnd: false,
          paymentStatus: 'active',
          features: {
            unlimitedLikes: false,
            boostProfile: false,
            seeWhoLiked: false,
            advancedFilters: false,
            aiMatching: false,
            prioritySupport: false,
            globalPassport: false
          },
          usage: { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0, iapSuperLikes: 0, iapBoosts: 0 }
        };
      } else if (!user.premium.usage) {
        user.premium.usage = { swipesUsed: 0, swipesLimit: 5, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0, messagesSent: 0, profileViews: 0, rewindsUsed: 0, iapSuperLikes: 0, iapBoosts: 0 };
      }
      
      user.premium.usage.swipesUsed = 0;
      user.premium.usage.superLikesUsed = 0;
      user.premium.usage.boostsUsed = 0;
      
      await user.save();
      
      logger.info('Usage stats reset', { userId });
      
      return { success: true };
    } catch (error) {
      logger.error('Error resetting usage stats', { error: (error as Error).message, userId });
      throw error;
    }
  }
}

export default new UsageTrackingService();

