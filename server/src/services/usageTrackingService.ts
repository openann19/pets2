import User from '../models/User';
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
      
      // Initialize premium if it doesn't exist
      if (!user.premium) {
        user.premium = {
          isActive: false,
          plan: 'free',
          usage: {
            swipesUsed: 0,
            swipesLimit: 50,
            superLikesUsed: 0,
            superLikesLimit: 0,
            boostsUsed: 0,
            boostsLimit: 0
          }
        };
      }

      // Initialize usage if it doesn't exist
      if (!user.premium.usage) {
        user.premium.usage = {
          swipesUsed: 0,
          swipesLimit: 50,
          superLikesUsed: 0,
          superLikesLimit: 0,
          boostsUsed: 0,
          boostsLimit: 0
        };
      }

      // Initialize analytics if it doesn't exist
      if (!user.analytics) {
        user.analytics = {
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
      user.premium.usage.swipesUsed = (user.premium.usage.swipesUsed || 0) + 1;
      
      // Track in analytics
      user.analytics.totalSwipes = (user.analytics.totalSwipes || 0) + 1;
      
      if (action === 'like') {
        (user.analytics as any).totalLikes = (user.analytics.totalLikes || 0) + 1;
      }
      
      // Add swipe event to user history
      if (!user.analytics.events) {
        user.analytics.events = [];
      }
      (user.analytics as any).events.push({
        type: 'swipe',
        timestamp: new Date(),
        metadata: { petId, action }
      });
      
      await user.save();
      
      logger.info('Swipe tracked', { 
        userId, 
        petId,
        action,
        swipesUsed: user.premium.usage.swipesUsed,
        plan: user.premium.plan
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

      // Initialize premium and usage
      if (!user.premium) {
        user.premium = {
          isActive: false,
          plan: 'free',
          usage: { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 }
        };
      }
      if (!user.premium.usage) {
        user.premium.usage = { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 };
      }
      if (!user.analytics) {
        user.analytics = { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: new Date(), totalPetsCreated: 0, totalMessagesSent: 0, totalSubscriptionsStarted: 0, totalSubscriptionsCancelled: 0, totalPremiumFeaturesUsed: 0, events: [] };
      }
      
      // Increment super like count
      user.premium.usage.superLikesUsed = (user.premium.usage.superLikesUsed || 0) + 1;
      
      // Add super like event to user history
      if (!user.analytics.events) {
        user.analytics.events = [];
      }
      (user.analytics as any).events.push({
        type: 'superlike',
        timestamp: new Date(),
        metadata: { count: user.premium.usage.superLikesUsed }
      });
      
      await user.save();
      
      logger.info('Super like tracked', { 
        userId,
        superLikesUsed: user.premium.usage.superLikesUsed,
        plan: user.premium.plan
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

      // Initialize premium and usage
      if (!user.premium) {
        user.premium = {
          isActive: false,
          plan: 'free',
          usage: { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 }
        };
      }
      if (!user.premium.usage) {
        user.premium.usage = { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 };
      }
      if (!user.analytics) {
        user.analytics = { totalSwipes: 0, totalLikes: 0, totalMatches: 0, profileViews: 0, lastActive: new Date(), totalPetsCreated: 0, totalMessagesSent: 0, totalSubscriptionsStarted: 0, totalSubscriptionsCancelled: 0, totalPremiumFeaturesUsed: 0, events: [] };
      }
      
      // Increment boost count
      user.premium.usage.boostsUsed = (user.premium.usage.boostsUsed || 0) + 1;
      
      // Add boost event to user history
      if (!user.analytics.events) {
        user.analytics.events = [];
      }
      (user.analytics as any).events.push({
        type: 'boost',
        timestamp: new Date(),
        metadata: { count: user.premium.usage.boostsUsed }
      });
      
      await user.save();
      
      logger.info('Boost tracked', { 
        userId,
        boostsUsed: user.premium.usage.boostsUsed,
        plan: user.premium.plan
      });
      
      return { success: true };
    } catch (error) {
      logger.error('Error tracking boost', { error: (error as Error).message, userId });
      throw error;
    }
  }
  
  /**
   * Get usage stats for a user
   */
  async getUsageStats(userId: string): Promise<UsageStatsResult> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const usageStats: UsageStats = {
        swipesUsed: (user.premium as any)?.usage?.swipesUsed || 0,
        swipesLimit: (user.premium as any)?.usage?.swipesLimit || 50,
        superLikesUsed: (user.premium as any)?.usage?.superLikesUsed || 0,
        superLikesLimit: (user.premium as any)?.usage?.superLikesLimit || 0,
        boostsUsed: (user.premium as any)?.usage?.boostsUsed || 0,
        boostsLimit: (user.premium as any)?.usage?.boostsLimit || 0,
        profileViews: (user.analytics as any)?.profileViews || 0,
        messagesSent: (user.analytics as any)?.totalMessagesSent || 0,
        matchRate: (user.analytics as any)?.totalMatches && (user.analytics as any)?.totalSwipes
          ? Math.round(((user.analytics as any).totalMatches / (user.analytics as any).totalSwipes) * 100) || 0 : 0
      };
      
      return { success: true, data: usageStats };
    } catch (error) {
      logger.error('Error getting usage stats', { error: (error as Error).message, userId });
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
          usage: { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 }
        };
      } else if (!user.premium.usage) {
        user.premium.usage = { swipesUsed: 0, swipesLimit: 50, superLikesUsed: 0, superLikesLimit: 0, boostsUsed: 0, boostsLimit: 0 };
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

