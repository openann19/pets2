/**
 * Subscription Analytics Service for PawfectMatch
 * Advanced analytics and reporting for subscription metrics
 */

import stripe from 'stripe';
import User from '../models/User';
import logger from '../utils/logger';

// Analytics Types
interface RevenueMetrics {
  totalRevenue: number;
  recurringRevenue: number;
  oneTimeRevenue: number;
  refunds: number;
  netRevenue: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
  monthlyRecurringRevenue: number;
}

interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  pastDueSubscriptions: number;
  newSubscriptions: number;
  averageSubscriptionValue: number;
  subscriptionGrowth: number;
}

interface ChurnMetrics {
  totalChurned: number;
  churnRate: number;
  revenueChurn: number;
  customerChurn: number;
  averageChurnRate: number;
}

interface UserMetrics {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  newUsers: number;
  premiumConversionRate: number;
  userGrowth: number;
  averageLifetimeValue: number;
}

interface SubscriptionAnalytics {
  timeframe: string;
  revenue: RevenueMetrics;
  subscriptions: SubscriptionMetrics;
  churn: ChurnMetrics;
  users: UserMetrics;
  calculatedAt: string;
}

interface SubscriptionTrends {
  daily: Array<{ date: string; value: number }>;
  weekly: Array<{ week: string; value: number }>;
  monthly: Array<{ month: string; value: number }>;
  timeframe: string;
}

interface CohortAnalysis {
  monthly: Array<{ cohort: string; retention: number[] }>;
  quarterly: Array<{ cohort: string; retention: number[] }>;
  yearly: Array<{ cohort: string; retention: number[] }>;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SubscriptionAnalyticsService {
  private metricsCache: Map<string, CacheEntry<SubscriptionAnalytics>>;
  private cacheExpiry: number;

  constructor() {
    this.metricsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive subscription analytics
   */
  async getSubscriptionAnalytics(timeframe: string = '30d'): Promise<SubscriptionAnalytics> {
    try {
      const cacheKey = `analytics_${timeframe}`;
      const cached = this.metricsCache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }

      const analytics = await this.calculateAnalytics(timeframe);
      
      this.metricsCache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      });

      return analytics;
    } catch (error) {
      logger.error('Error getting subscription analytics', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }

  /**
   * Calculate comprehensive analytics
   */
  private async calculateAnalytics(timeframe: string): Promise<SubscriptionAnalytics> {
    const [revenueMetrics, subscriptionMetrics, churnMetrics, userMetrics] = await Promise.all([
      this.getRevenueMetrics(timeframe),
      this.getSubscriptionMetrics(timeframe),
      this.getChurnMetrics(timeframe),
      this.getUserMetrics(timeframe)
    ]);

    return {
      timeframe,
      revenue: revenueMetrics,
      subscriptions: subscriptionMetrics,
      churn: churnMetrics,
      users: userMetrics,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(timeframe: string): Promise<RevenueMetrics> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      const startDate = this.getStartDate(timeframe);
      
      // Get balance transactions
      const balanceTransactions = await stripeClient.balanceTransactions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      const revenue = {
        totalRevenue: 0,
        recurringRevenue: 0,
        oneTimeRevenue: 0,
        refunds: 0,
        netRevenue: 0,
        averageRevenuePerUser: 0,
        revenueGrowth: 0,
        monthlyRecurringRevenue: 0
      };

      // Calculate revenue metrics
      balanceTransactions.data.forEach(transaction => {
        if (transaction.type === 'charge') {
          revenue.totalRevenue += transaction.amount;
          revenue.recurringRevenue += transaction.amount; // Simplified
        } else if (transaction.type === 'refund') {
          revenue.refunds += transaction.amount;
        }
      });

      revenue.netRevenue = revenue.totalRevenue - revenue.refunds;
      revenue.monthlyRecurringRevenue = revenue.recurringRevenue;

      return revenue;
    } catch (error) {
      logger.error('Error getting revenue metrics', { error, timeframe });
      return {
        totalRevenue: 0,
        recurringRevenue: 0,
        oneTimeRevenue: 0,
        refunds: 0,
        netRevenue: 0,
        averageRevenuePerUser: 0,
        revenueGrowth: 0,
        monthlyRecurringRevenue: 0
      };
    }
  }

  /**
   * Get subscription metrics
   */
  private async getSubscriptionMetrics(timeframe: string): Promise<SubscriptionMetrics> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      const startDate = this.getStartDate(timeframe);
      
      // Get subscriptions
      const subscriptions = await stripeClient.subscriptions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      const metrics = {
        totalSubscriptions: subscriptions.data.length,
        activeSubscriptions: subscriptions.data.filter(sub => sub.status === 'active').length,
        cancelledSubscriptions: subscriptions.data.filter(sub => sub.status === 'canceled').length,
        pastDueSubscriptions: subscriptions.data.filter(sub => sub.status === 'past_due').length,
        newSubscriptions: subscriptions.data.filter(sub => 
          new Date(sub.created * 1000) >= startDate
        ).length,
        averageSubscriptionValue: 0,
        subscriptionGrowth: 0
      };

      // Calculate average subscription value
      const activeSubs = subscriptions.data.filter(sub => sub.status === 'active');
      if (activeSubs.length > 0) {
        const totalValue = activeSubs.reduce((sum, sub) => sum + (sub.items.data[0]?.price?.unit_amount || 0), 0);
        metrics.averageSubscriptionValue = totalValue / activeSubs.length;
      }

      return metrics;
    } catch (error) {
      logger.error('Error getting subscription metrics', { error, timeframe });
      return {
        totalSubscriptions: 0,
        activeSubscriptions: 0,
        cancelledSubscriptions: 0,
        pastDueSubscriptions: 0,
        newSubscriptions: 0,
        averageSubscriptionValue: 0,
        subscriptionGrowth: 0
      };
    }
  }

  /**
   * Get churn metrics
   */
  private async getChurnMetrics(timeframe: string): Promise<ChurnMetrics> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      const startDate = this.getStartDate(timeframe);
      
      // Get cancelled subscriptions
      const cancelledSubscriptions = await stripeClient.subscriptions.list({
        status: 'canceled',
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      // Get total active subscriptions at start of period
      const totalActiveAtStart = await this.getActiveSubscriptionsAtDate(startDate);
      
      const churn = {
        totalChurned: cancelledSubscriptions.data.length,
        churnRate: 0,
        revenueChurn: 0,
        customerChurn: 0,
        averageChurnRate: 0
      };

      if (totalActiveAtStart > 0) {
        churn.churnRate = (cancelledSubscriptions.data.length / totalActiveAtStart) * 100;
      }

      return churn;
    } catch (error) {
      logger.error('Error getting churn metrics', { error, timeframe });
      return {
        totalChurned: 0,
        churnRate: 0,
        revenueChurn: 0,
        customerChurn: 0,
        averageChurnRate: 0
      };
    }
  }

  /**
   * Get user metrics
   */
  private async getUserMetrics(timeframe: string): Promise<UserMetrics> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      // Get user statistics from database
      const totalUsers = await User.countDocuments();
      const premiumUsers = await User.countDocuments({ 'premium.isActive': true });
      const newUsers = await User.countDocuments({ createdAt: { $gte: startDate } });
      
      const metrics = {
        totalUsers,
        premiumUsers,
        freeUsers: totalUsers - premiumUsers,
        newUsers,
        premiumConversionRate: totalUsers > 0 ? (premiumUsers / totalUsers) * 100 : 0,
        userGrowth: 0,
        averageLifetimeValue: 0
      };

      return metrics;
    } catch (error) {
      logger.error('Error getting user metrics', { error, timeframe });
      return {
        totalUsers: 0,
        premiumUsers: 0,
        freeUsers: 0,
        newUsers: 0,
        premiumConversionRate: 0,
        userGrowth: 0,
        averageLifetimeValue: 0
      };
    }
  }

  /**
   * Get active subscriptions at a specific date
   */
  private async getActiveSubscriptionsAtDate(date: Date): Promise<number> {
    try {
      const stripeClient = new stripe(process.env['STRIPE_SECRET_KEY'] || '');
      
      const subscriptions = await stripeClient.subscriptions.list({
        status: 'active',
        limit: 100
      });

      return subscriptions.data.filter(sub => 
        new Date(sub.created * 1000) <= date
      ).length;
    } catch (error) {
      logger.error('Error getting active subscriptions at date', { error, date });
      return 0;
    }
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
   * Get subscription trends
   */
  async getSubscriptionTrends(timeframe: string = '30d'): Promise<SubscriptionTrends> {
    try {
      const trends = {
        daily: [],
        weekly: [],
        monthly: [],
        timeframe
      };

      // In a real implementation, this would calculate trends from historical data
      // For now, return empty trends
      
      logger.info('Subscription trends retrieved', { trends, timeframe });
      return trends;
    } catch (error) {
      logger.error('Error getting subscription trends', { error, timeframe });
      throw error;
    }
  }

  /**
   * Get cohort analysis
   */
  async getCohortAnalysis(): Promise<CohortAnalysis> {
    try {
      const cohorts = {
        monthly: [],
        quarterly: [],
        yearly: []
      };

      // In a real implementation, this would calculate cohort retention
      // For now, return empty cohorts
      
      logger.info('Cohort analysis retrieved', { cohorts });
      return cohorts;
    } catch (error) {
      logger.error('Error getting cohort analysis', { error });
      throw error;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.metricsCache.clear();
    logger.info('Analytics cache cleared');
  }

  /**
   * Update cache expiry
   */
  updateCacheExpiry(expiryMs: number): void {
    this.cacheExpiry = expiryMs;
    logger.info('Cache expiry updated', { expiryMs });
  }
}

// Export singleton instance
const subscriptionAnalyticsService = new SubscriptionAnalyticsService();
export default subscriptionAnalyticsService;
