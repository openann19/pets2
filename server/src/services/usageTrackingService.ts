const User = require('../models/User');
const logger = require('../utils/logger');

class UsageTrackingService {
  /**
   * Track a swipe action for a user
   */
  async trackSwipe(userId, petId, action) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Increment swipe count
      user.premium.usage.swipesUsed = (user.premium.usage.swipesUsed || 0) + 1;
      
      // Track in analytics
      user.analytics.totalSwipes = (user.analytics.totalSwipes || 0) + 1;
      
      if (action === 'like') {
        user.analytics.totalLikes = (user.analytics.totalLikes || 0) + 1;
      }
      
      // Add swipe event to user history
      user.analytics.events.push({
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
      logger.error('Error tracking swipe', { error: error.message, userId, petId, action });
      throw error;
    }
  }
  
  /**
   * Track a super like action for a user
   */
  async trackSuperLike(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Increment super like count
      user.premium.usage.superLikesUsed = (user.premium.usage.superLikesUsed || 0) + 1;
      
      // Add super like event to user history
      user.analytics.events.push({
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
      logger.error('Error tracking super like', { error: error.message, userId });
      throw error;
    }
  }
  
  /**
   * Track a boost action for a user
   */
  async trackBoost(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      // Increment boost count
      user.premium.usage.boostsUsed = (user.premium.usage.boostsUsed || 0) + 1;
      
      // Add boost event to user history
      user.analytics.events.push({
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
      logger.error('Error tracking boost', { error: error.message, userId });
      throw error;
    }
  }
  
  /**
   * Get usage stats for a user
   */
  async getUsageStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      const usageStats = {
        swipesUsed: user.premium.usage?.swipesUsed || 0,
        swipesLimit: user.premium.usage?.swipesLimit || 50,
        superLikesUsed: user.premium.usage?.superLikesUsed || 0,
        superLikesLimit: user.premium.usage?.superLikesLimit || 0,
        boostsUsed: user.premium.usage?.boostsUsed || 0,
        boostsLimit: user.premium.usage?.boostsLimit || 0,
        profileViews: user.analytics?.profileViews || 0,
        messagesSent: user.analytics?.totalMessagesSent || 0,
        matchRate: user.analytics?.totalMatches ? 
          Math.round((user.analytics.totalMatches / user.analytics.totalSwipes) * 100) || 0 : 0
      };
      
      return { success: true, data: usageStats };
    } catch (error) {
      logger.error('Error getting usage stats', { error: error.message, userId });
      throw error;
    }
  }
  
  /**
   * Reset usage stats for a user (typically at the start of a new billing period)
   */
  async resetUsageStats(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }
      
      user.premium.usage.swipesUsed = 0;
      user.premium.usage.superLikesUsed = 0;
      user.premium.usage.boostsUsed = 0;
      
      await user.save();
      
      logger.info('Usage stats reset', { userId });
      
      return { success: true };
    } catch (error) {
      logger.error('Error resetting usage stats', { error: error.message, userId });
      throw error;
    }
  }
}

module.exports = new UsageTrackingService();
