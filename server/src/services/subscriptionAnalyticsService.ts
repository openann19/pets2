/**
 * Subscription Analytics Service for PawfectMatch
 * Advanced analytics and reporting for subscription metrics
 */

import Stripe from 'stripe';
import type { IUser } from '../models/User';
import logger from '../utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Type definitions
export type Timeframe = '7d' | '30d' | '90d' | '1y';

export interface MetricsCache {
  data: any;
  timestamp: number;
}

export interface RevenueMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  revenueByMonth: Record<string, number>;
  revenueByPlan: Record<string, number>;
  churnRate: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  averageRevenuePerUser: number;
  revenueGrowth: number;
}

export interface SubscriptionMetrics {
  totalSubscriptions: number;
  activeSubscriptions: number;
  cancelledSubscriptions: number;
  subscriptionsByPlan: Record<string, number>;
  subscriptionsByStatus: Record<string, number>;
  subscriptionsByInterval: Record<string, number>;
  conversionRate: number;
  averageSubscriptionValue: number;
}

export interface ChurnMetrics {
  churnRate: number;
  totalChurned: number;
  churnReasons: Record<string, number>;
  churnByPlan: Record<string, number>;
  averageLifetimeValue: number;
  retentionRate: number;
}

export interface UsageMetrics {
  totalSwipesUsed: number;
  totalSuperLikesUsed: number;
  totalBoostsUsed: number;
  totalMessagesSent: number;
  totalProfileViews: number;
  swipesByPlan: Record<string, number>;
  superLikesByPlan: Record<string, number>;
  boostsByPlan: Record<string, number>;
  messagesByPlan: Record<string, number>;
  profileViewsByPlan: Record<string, number>;
}

export interface UserMetrics {
  newUsers: number;
  newPremiumUsers: number;
  conversionRate: number;
  totalUsers: number;
  totalPremiumUsers: number;
  userGrowth: number;
  usage: UsageMetrics;
}

export interface ComprehensiveAnalytics {
  revenue: RevenueMetrics;
  subscriptions: SubscriptionMetrics;
  churn: ChurnMetrics;
  users: UserMetrics;
  timeframe: string;
  calculatedAt: string;
}

export interface RealTimeMetrics {
  activeSubscriptions: number;
  recentRevenue: number;
  newUsers24h: number;
  timestamp: string;
}

class SubscriptionAnalyticsService {
  private metricsCache: Map<string, MetricsCache>;
  private readonly cacheExpiry: number;

  constructor() {
    this.metricsCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive subscription analytics
   */
  async getSubscriptionAnalytics(timeframe: Timeframe = '30d'): Promise<ComprehensiveAnalytics> {
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
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting subscription analytics', { error: errorMessage });
      throw error;
    }
  }

  /**
   * Calculate comprehensive analytics
   */
  private async calculateAnalytics(timeframe: Timeframe): Promise<ComprehensiveAnalytics> {
    const [revenueMetrics, subscriptionMetrics, churnMetrics, userMetrics] = await Promise.all([
      this.getRevenueMetrics(timeframe),
      this.getSubscriptionMetrics(timeframe),
      this.getChurnMetrics(timeframe),
      this.getUserMetrics(timeframe)
    ]);

    return {
      revenue: revenueMetrics,
      subscriptions: subscriptionMetrics,
      churn: churnMetrics,
      users: userMetrics,
      timeframe,
      calculatedAt: new Date().toISOString()
    };
  }

  /**
   * Get revenue metrics
   */
  private async getRevenueMetrics(timeframe: Timeframe): Promise<RevenueMetrics> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      // Get Stripe revenue data
      const invoices = await stripe.invoices.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        status: 'paid',
        limit: 100
      });

      let totalRevenue = 0;
      let monthlyRecurringRevenue = 0;
      let annualRecurringRevenue = 0;
      const revenueByMonth: Record<string, number> = {};
      const revenueByPlan: Record<string, number> = {};

      for (const invoice of invoices.data) {
        const amount = invoice.amount_paid / 100; // Convert from cents
        totalRevenue += amount;

        const month = new Date(invoice.created * 1000).toISOString().substring(0, 7);
        revenueByMonth[month] = (revenueByMonth[month] || 0) + amount;

        // Calculate MRR/ARR
        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
          const interval = subscription.items.data[0].price.recurring?.interval;
          
          if (interval === 'month') {
            monthlyRecurringRevenue += amount;
          } else if (interval === 'year') {
            annualRecurringRevenue += amount / 12;
          }

          // Group by plan
          const planName = this.getPlanName(subscription.items.data[0].price.id);
          revenueByPlan[planName] = (revenueByPlan[planName] || 0) + amount;
        }
      }

      // Calculate churn rate from subscription data
      const subscriptions = await stripe.subscriptions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      const activeSubscriptions = subscriptions.data.filter(sub => sub.status === 'active').length;
      const canceledSubscriptions = subscriptions.data.filter(sub => sub.status === 'canceled').length;
      const churnRate = subscriptions.data.length > 0 ? (canceledSubscriptions / subscriptions.data.length) * 100 : 0;

      return {
        totalRevenue,
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue),
        annualRecurringRevenue: Math.round(annualRecurringRevenue * 12),
        revenueByMonth,
        revenueByPlan,
        churnRate: Math.round(churnRate * 100) / 100,
        activeSubscriptions,
        canceledSubscriptions,
        averageRevenuePerUser: await this.calculateARPU(timeframe),
        revenueGrowth: await this.calculateRevenueGrowth(timeframe)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating revenue metrics', { error: errorMessage });
      return this.getDefaultRevenueMetrics();
    }
  }

  /**
   * Get subscription metrics
   */
  private async getSubscriptionMetrics(timeframe: Timeframe): Promise<SubscriptionMetrics> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const subscriptions = await stripe.subscriptions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      let totalSubscriptions = 0;
      let activeSubscriptions = 0;
      let cancelledSubscriptions = 0;
      const subscriptionsByPlan: Record<string, number> = {};
      const subscriptionsByStatus: Record<string, number> = {};
      const subscriptionsByInterval: Record<string, number> = {};

      for (const subscription of subscriptions.data) {
        totalSubscriptions++;
        
        if (subscription.status === 'active') {
          activeSubscriptions++;
        } else if (subscription.status === 'canceled') {
          cancelledSubscriptions++;
        }

        // Group by plan
        const planName = this.getPlanName(subscription.items.data[0].price.id);
        subscriptionsByPlan[planName] = (subscriptionsByPlan[planName] || 0) + 1;

        // Group by status
        subscriptionsByStatus[subscription.status] = (subscriptionsByStatus[subscription.status] || 0) + 1;

        // Group by interval
        const interval = subscription.items.data[0].price.recurring?.interval || 'unknown';
        subscriptionsByInterval[interval] = (subscriptionsByInterval[interval] || 0) + 1;
      }

      // Calculate conversion rate from user data
      const User = require('../models/User').default;
      const users = await User.countDocuments({
        createdAt: { $gte: startDate }
      });

      const premiumUsers = await User.countDocuments({
        'premium.isActive': true,
        createdAt: { $gte: startDate }
      });

      const conversionRate = users > 0 ? (premiumUsers / users) * 100 : 0;

      return {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        subscriptionsByPlan,
        subscriptionsByStatus,
        subscriptionsByInterval,
        conversionRate: Math.round(conversionRate * 100) / 100,
        averageSubscriptionValue: await this.calculateAverageSubscriptionValue(timeframe)
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating subscription metrics', { error: errorMessage });
      return this.getDefaultSubscriptionMetrics();
    }
  }

  /**
   * Get churn metrics
   */
  private async getChurnMetrics(timeframe: Timeframe): Promise<ChurnMetrics> {
    try {
      const startDate = this.getStartDate(timeframe);
      
      const cancelledSubscriptions = await stripe.subscriptions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        status: 'canceled',
        limit: 100
      });

      const totalSubscriptions = await stripe.subscriptions.list({
        created: { gte: Math.floor(startDate.getTime() / 1000) },
        limit: 100
      });

      const churnRate = totalSubscriptions.data.length > 0 
        ? (cancelledSubscriptions.data.length / totalSubscriptions.data.length) * 100 
        : 0;

      const churnReasons: Record<string, number> = {};
      const churnByPlan: Record<string, number> = {};

      for (const subscription of cancelledSubscriptions.data) {
        // Group by cancellation reason
        const reason = subscription.cancellation_details?.reason || 'unknown';
        churnReasons[reason] = (churnReasons[reason] || 0) + 1;

        // Group by plan
        const planName = this.getPlanName(subscription.items.data[0].price.id);
        churnByPlan[planName] = (churnByPlan[planName] || 0) + 1;
      }

      return {
        churnRate: Math.round(churnRate * 100) / 100,
        totalChurned: cancelledSubscriptions.data.length,
        churnReasons,
        churnByPlan,
        averageLifetimeValue: await this.calculateAverageLifetimeValue(timeframe),
        retentionRate: Math.round((100 - churnRate) * 100) / 100
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating churn metrics', { error: errorMessage });
      return this.getDefaultChurnMetrics();
    }
  }

  /**
   * Get user metrics
   */
  private async getUserMetrics(timeframe: Timeframe): Promise<UserMetrics> {
    try {
      const startDate = this.getStartDate(timeframe);
      const User = require('../models/User').default;
      
      const users = await User.find({
        createdAt: { $gte: startDate }
      });

      const premiumUsers = await User.find({
        'premium.isActive': true,
        createdAt: { $gte: startDate }
      });

      const newUsers = users.length;
      const newPremiumUsers = premiumUsers.length;
      const conversionRate = newUsers > 0 ? (newPremiumUsers / newUsers) * 100 : 0;

      // Get usage metrics for premium users
      const usageMetrics = await this.getUsageMetrics(premiumUsers);

      return {
        newUsers,
        newPremiumUsers,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalUsers: await User.countDocuments(),
        totalPremiumUsers: await User.countDocuments({ 'premium.isActive': true }),
        userGrowth: await this.calculateUserGrowth(timeframe),
        usage: usageMetrics
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating user metrics', { error: errorMessage });
      return this.getDefaultUserMetrics();
    }
  }

  /**
   * Calculate Average Revenue Per User (ARPU)
   */
  private async calculateARPU(timeframe: Timeframe): Promise<number> {
    try {
      const revenueMetrics = await this.getRevenueMetrics(timeframe);
      const userMetrics = await this.getUserMetrics(timeframe);
      
      return userMetrics.totalPremiumUsers > 0 
        ? Math.round((revenueMetrics.totalRevenue / userMetrics.totalPremiumUsers) * 100) / 100
        : 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating ARPU', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Calculate revenue growth
   */
  private async calculateRevenueGrowth(timeframe: Timeframe): Promise<number> {
    try {
      const currentRevenue = await this.getRevenueMetrics(timeframe);
      const previousRevenue = await this.getRevenueMetrics(this.getPreviousTimeframe(timeframe));
      
      if (previousRevenue.totalRevenue === 0) {
        return 0;
      }

      const growth = ((currentRevenue.totalRevenue - previousRevenue.totalRevenue) / previousRevenue.totalRevenue) * 100;
      return Math.round(growth * 100) / 100;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating revenue growth', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Calculate conversion rate
   */
  async calculateConversionRate(timeframe: Timeframe): Promise<number> {
    try {
      const userMetrics = await this.getUserMetrics(timeframe);
      return userMetrics.conversionRate;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating conversion rate', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Calculate average subscription value
   */
  private async calculateAverageSubscriptionValue(timeframe: Timeframe): Promise<number> {
    try {
      const revenueMetrics = await this.getRevenueMetrics(timeframe);
      const subscriptionMetrics = await this.getSubscriptionMetrics(timeframe);
      
      return subscriptionMetrics.totalSubscriptions > 0 
        ? Math.round((revenueMetrics.totalRevenue / subscriptionMetrics.totalSubscriptions) * 100) / 100
        : 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating average subscription value', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Calculate average lifetime value
   */
  private async calculateAverageLifetimeValue(timeframe: Timeframe): Promise<number> {
    try {
      // This would require more complex calculation involving user lifetime
      // For now, return a simplified calculation
      const revenueMetrics = await this.getRevenueMetrics(timeframe);
      const churnMetrics = await this.getChurnMetrics(timeframe);
      
      if (churnMetrics.churnRate === 0) {
        return 0;
      }

      const averageLifetime = 100 / churnMetrics.churnRate; // months
      const averageMonthlyValue = revenueMetrics.monthlyRecurringRevenue / 100; // Simplified
      
      return Math.round(averageLifetime * averageMonthlyValue * 100) / 100;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating average lifetime value', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Calculate user growth
   */
  private async calculateUserGrowth(timeframe: Timeframe): Promise<number> {
    try {
      const currentUsers = await this.getUserMetrics(timeframe);
      const previousUsers = await this.getUserMetrics(this.getPreviousTimeframe(timeframe));
      
      if (previousUsers.newUsers === 0) {
        return 0;
      }

      const growth = ((currentUsers.newUsers - previousUsers.newUsers) / previousUsers.newUsers) * 100;
      return Math.round(growth * 100) / 100;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating user growth', { error: errorMessage });
      return 0;
    }
  }

  /**
   * Get plan name from price ID
   */
  private getPlanName(priceId: string): string {
    // Map Stripe price IDs to plan names
    const planMap: Record<string, string> = {
      [process.env.STRIPE_BASIC_MONTHLY_PRICE_ID!]: 'Basic',
      [process.env.STRIPE_BASIC_YEARLY_PRICE_ID!]: 'Basic',
      [process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID!]: 'Premium',
      [process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID!]: 'Premium',
      [process.env.STRIPE_ULTIMATE_MONTHLY_PRICE_ID!]: 'Ultimate',
      [process.env.STRIPE_ULTIMATE_YEARLY_PRICE_ID!]: 'Ultimate'
    };

    return planMap[priceId] || 'Unknown';
  }

  /**
   * Get start date for timeframe
   */
  private getStartDate(timeframe: Timeframe): Date {
    const now = new Date();
    const days = parseInt(timeframe.replace('d', ''));
    return new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  }

  /**
   * Get previous timeframe for comparison
   */
  private getPreviousTimeframe(timeframe: Timeframe): Timeframe {
    const days = parseInt(timeframe.replace('d', ''));
    return `${days}d` as Timeframe;
  }

  /**
   * Get usage metrics for premium users
   */
  private async getUsageMetrics(premiumUsers: IUser[]): Promise<UsageMetrics> {
    try {
      const usageStats: UsageMetrics = {
        totalSwipesUsed: 0,
        totalSuperLikesUsed: 0,
        totalBoostsUsed: 0,
        totalMessagesSent: 0,
        totalProfileViews: 0,
        swipesByPlan: {},
        superLikesByPlan: {},
        boostsByPlan: {},
        messagesByPlan: {},
        profileViewsByPlan: {}
      };

      for (const user of premiumUsers) {
        const plan = user.premium?.plan || 'basic';
        
        // Aggregate usage metrics
        usageStats.totalSwipesUsed += user.premium?.usage?.swipesUsed || 0;
        usageStats.totalSuperLikesUsed += user.premium?.usage?.superLikesUsed || 0;
        usageStats.totalBoostsUsed += user.premium?.usage?.boostsUsed || 0;
        usageStats.totalMessagesSent += user.analytics?.totalMessagesSent || 0;
        usageStats.totalProfileViews += user.analytics?.profileViews || 0;

        // Group by plan
        if (!usageStats.swipesByPlan[plan]) {
          usageStats.swipesByPlan[plan] = 0;
          usageStats.superLikesByPlan[plan] = 0;
          usageStats.boostsByPlan[plan] = 0;
          usageStats.messagesByPlan[plan] = 0;
          usageStats.profileViewsByPlan[plan] = 0;
        }

        usageStats.swipesByPlan[plan] += user.premium?.usage?.swipesUsed || 0;
        usageStats.superLikesByPlan[plan] += user.premium?.usage?.superLikesUsed || 0;
        usageStats.boostsByPlan[plan] += user.premium?.usage?.boostsUsed || 0;
        usageStats.messagesByPlan[plan] += user.analytics?.totalMessagesSent || 0;
        usageStats.profileViewsByPlan[plan] += user.analytics?.profileViews || 0;
      }

      return usageStats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error calculating usage metrics', { error: errorMessage });
      return this.getDefaultUsageMetrics();
    }
  }

  /**
   * Default metrics when calculation fails
   */
  private getDefaultRevenueMetrics(): RevenueMetrics {
    return {
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      annualRecurringRevenue: 0,
      revenueByMonth: {},
      revenueByPlan: {},
      churnRate: 0,
      activeSubscriptions: 0,
      canceledSubscriptions: 0,
      averageRevenuePerUser: 0,
      revenueGrowth: 0
    };
  }

  private getDefaultSubscriptionMetrics(): SubscriptionMetrics {
    return {
      totalSubscriptions: 0,
      activeSubscriptions: 0,
      cancelledSubscriptions: 0,
      subscriptionsByPlan: {},
      subscriptionsByStatus: {},
      subscriptionsByInterval: {},
      conversionRate: 0,
      averageSubscriptionValue: 0
    };
  }

  private getDefaultChurnMetrics(): ChurnMetrics {
    return {
      churnRate: 0,
      totalChurned: 0,
      churnReasons: {},
      churnByPlan: {},
      averageLifetimeValue: 0,
      retentionRate: 100
    };
  }

  private getDefaultUserMetrics(): UserMetrics {
    return {
      newUsers: 0,
      newPremiumUsers: 0,
      conversionRate: 0,
      totalUsers: 0,
      totalPremiumUsers: 0,
      userGrowth: 0,
      usage: this.getDefaultUsageMetrics()
    };
  }

  private getDefaultUsageMetrics(): UsageMetrics {
    return {
      totalSwipesUsed: 0,
      totalSuperLikesUsed: 0,
      totalBoostsUsed: 0,
      totalMessagesSent: 0,
      totalProfileViews: 0,
      swipesByPlan: {},
      superLikesByPlan: {},
      boostsByPlan: {},
      messagesByPlan: {},
      profileViewsByPlan: {}
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.metricsCache.clear();
    logger.info('Analytics cache cleared');
  }

  /**
   * Get real-time metrics
   */
  async getRealTimeMetrics(): Promise<RealTimeMetrics | null> {
    try {
      const User = require('../models/User').default;
      const [activeSubscriptions, recentRevenue, newUsers] = await Promise.all([
        stripe.subscriptions.list({ status: 'active', limit: 1 }),
        stripe.invoices.list({ status: 'paid', limit: 10 }),
        User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
      ]);

      return {
        activeSubscriptions: activeSubscriptions.data.length,
        recentRevenue: recentRevenue.data.reduce((sum, invoice) => sum + invoice.amount_paid, 0) / 100,
        newUsers24h: newUsers,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error getting real-time metrics', { error: errorMessage });
      return null;
    }
  }
}

export default new SubscriptionAnalyticsService();
