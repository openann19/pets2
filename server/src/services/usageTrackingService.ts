/**
 * Usage Tracking Service for PawfectMatch
 * Tracks user behavior and feature usage for analytics
 */

import User from '../models/User';
import logger from '../utils/logger';

class UsageTrackingService {
  /**
   * Track feature usage
   */
  async trackFeatureUsage(userId: string, feature: string, metadata: any = {}): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found for usage tracking', { userId, feature });
        return;
      }

      // Initialize analytics if not exists
      if (!user.analytics) {
        user.analytics = {
          events: []
        };
      }

      // Add usage event
      user.analytics.events.push({
        type: `feature_${feature}`,
        timestamp: new Date(),
        metadata: {
          feature,
          ...metadata
        }
      });

      // Update feature-specific counters
      this.updateFeatureCounters(user, feature);

      await user.save();
      
      logger.debug('Feature usage tracked', { userId, feature, metadata });
    } catch (error) {
      logger.error('Error tracking feature usage', { error, userId, feature });
    }
  }

  /**
   * Track user action
   */
  async trackUserAction(userId: string, action: string, metadata: any = {}): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        logger.warn('User not found for action tracking', { userId, action });
        return;
      }

      // Initialize analytics if not exists
      if (!user.analytics) {
        user.analytics = {
          events: []
        };
      }

      // Add action event
      user.analytics.events.push({
        type: `action_${action}`,
        timestamp: new Date(),
        metadata: {
          action,
          ...metadata
        }
      });

      // Update action-specific counters
      this.updateActionCounters(user, action);

      await user.save();
      
      logger.debug('User action tracked', { userId, action, metadata });
    } catch (error) {
      logger.error('Error tracking user action', { error, userId, action });
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(userId: string, timeframe: string = '30d'): Promise<any> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.analytics) {
        return {
          totalEvents: 0,
          featureUsage: {},
          actionCounts: {},
          timeframe
        };
      }

      const startDate = this.getStartDate(timeframe);
      const recentEvents = user.analytics.events.filter(
        event => event.timestamp >= startDate
      );

      const stats = {
        totalEvents: recentEvents.length,
        featureUsage: this.calculateFeatureUsage(recentEvents),
        actionCounts: this.calculateActionCounts(recentEvents),
        timeframe,
        lastActive: user.analytics.lastActive
      };

      return stats;
    } catch (error) {
      logger.error('Error getting usage stats', { error, userId, timeframe });
      return {
        totalEvents: 0,
        featureUsage: {},
        actionCounts: {},
        timeframe
      };
    }
  }

  /**
   * Update feature counters
   */
  private updateFeatureCounters(user: any, feature: string): void {
    if (!user.analytics) {
      user.analytics = {};
    }

    switch (feature) {
      case 'like':
        user.analytics.totalLikes = (user.analytics.totalLikes || 0) + 1;
        break;
      case 'match':
        user.analytics.totalMatches = (user.analytics.totalMatches || 0) + 1;
        break;
      case 'message':
        user.analytics.totalMessagesSent = (user.analytics.totalMessagesSent || 0) + 1;
        break;
      case 'pet_create':
        user.analytics.totalPetsCreated = (user.analytics.totalPetsCreated || 0) + 1;
        break;
      case 'subscription_start':
        user.analytics.totalSubscriptionsStarted = (user.analytics.totalSubscriptionsStarted || 0) + 1;
        break;
      case 'subscription_cancel':
        user.analytics.totalSubscriptionsCancelled = (user.analytics.totalSubscriptionsCancelled || 0) + 1;
        break;
      case 'premium_feature':
        user.analytics.totalPremiumFeaturesUsed = (user.analytics.totalPremiumFeaturesUsed || 0) + 1;
        break;
    }

    user.analytics.lastActive = new Date();
  }

  /**
   * Update action counters
   */
  private updateActionCounters(user: any, action: string): void {
    if (!user.analytics) {
      user.analytics = {};
    }

    // Update last active timestamp
    user.analytics.lastActive = new Date();
  }

  /**
   * Calculate feature usage
   */
  private calculateFeatureUsage(events: any[]): any {
    const featureUsage: any = {};
    
    events.forEach(event => {
      if (event.type.startsWith('feature_')) {
        const feature = event.type.replace('feature_', '');
        featureUsage[feature] = (featureUsage[feature] || 0) + 1;
      }
    });

    return featureUsage;
  }

  /**
   * Calculate action counts
   */
  private calculateActionCounts(events: any[]): any {
    const actionCounts: any = {};
    
    events.forEach(event => {
      if (event.type.startsWith('action_')) {
        const action = event.type.replace('action_', '');
        actionCounts[action] = (actionCounts[action] || 0) + 1;
      }
    });

    return actionCounts;
  }

  /**
   * Get start date based on timeframe
   */
  private getStartDate(timeframe: string): Date {
    const now = new Date();
    const days = parseInt(timeframe.replace('d', ''));
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - days);
    return startDate;
  }

  /**
   * Clean old events
   */
  async cleanOldEvents(userId: string, daysToKeep: number = 90): Promise<void> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.analytics || !user.analytics.events) {
        return;
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const originalCount = user.analytics.events.length;
      user.analytics.events = user.analytics.events.filter(
        event => event.timestamp >= cutoffDate
      );

      if (user.analytics.events.length < originalCount) {
        await user.save();
        logger.info('Old events cleaned', { 
          userId, 
          originalCount, 
          remainingCount: user.analytics.events.length 
        });
      }
    } catch (error) {
      logger.error('Error cleaning old events', { error, userId, daysToKeep });
    }
  }
}

export default new UsageTrackingService();
