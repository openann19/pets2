/**
 * Admin Analytics Controller
 * Provides real-time analytics data for the admin dashboard
 */

import type { Request, Response } from 'express';
import User from '../models/User';
import Pet from '../models/Pet';
import Match from '../models/Match';
import AdminActivityLog from '../models/AdminActivityLog';
import logger from '../utils/logger';
import { getErrorMessage } from '../../utils/errorHandler';
import conversionFunnelService from '../services/conversionFunnelService';
import cohortRetentionService from '../services/cohortRetentionService';
import abTestingService from '../services/abTestingService';

// Try to import Message model, with fallback handling
let Message: { 
  countDocuments: (filter?: Record<string, unknown>) => Promise<number>;
  aggregate?: (pipeline: Array<Record<string, unknown>>) => Promise<Array<Record<string, unknown>>>;
};
try {
  Message = require('../models/Message');
} catch {
  // Fallback: use Conversation messages for counts if Message model is not present
  try {
    const Conversation = require('../models/Conversation');
    Message = {
      countDocuments: async (filter?: Record<string, unknown>) => {
        // Approximate: count total embedded messages across conversations
        const res = await Conversation.aggregate([
          { $project: { count: { $size: { $ifNull: ['$messages', []] } } } },
          { $group: { _id: null, total: { $sum: '$count' } } }
        ]);
        return res?.[0]?.total || 0;
      },
      aggregate: async () => []
    };
  } catch {
    // As ultimate fallback in tests, provide stubbed countDocuments
    Message = { 
      countDocuments: async () => 0,
      aggregate: async () => []
    };
  }
}

/**
 * Request interfaces
 */
interface AdminAnalyticsRequest extends Request {
  userId?: string;
}

/**
 * User statistics interface
 */
interface UserStats {
  total: number;
  active: number;
  suspended: number;
  banned: number;
  verified: number;
  recent24h: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Pet statistics interface
 */
interface PetStats {
  total: number;
  active: number;
  recent24h: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Match statistics interface
 */
interface MatchStats {
  total: number;
  active: number;
  blocked: number;
  recent24h: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Message statistics interface
 */
interface MessageStats {
  total: number;
  deleted: number;
  recent24h: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Engagement statistics interface
 */
interface EngagementStats {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
}

/**
 * Revenue statistics interface
 */
interface RevenueStats {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
}

/**
 * Get comprehensive analytics for admin dashboard
 */
export const getAnalytics = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = '30d' } = req.query;

    // Calculate date range
    const startDate = getStartDate(timeRange as string);

    // Parallel data fetching for performance
    const [
      userStats,
      petStats,
      matchStats,
      messageStats,
      engagementStats,
      revenueStats,
      timeSeries,
      topPerformers,
      geographicData,
      deviceStats,
      securityMetrics
    ] = await Promise.all([
      getUserStats(startDate),
      getPetStats(startDate),
      getMatchStats(startDate),
      getMessageStats(startDate),
      getEngagementStats(),
      getRevenueStats(startDate),
      getTimeSeries(startDate, timeRange as string),
      getTopPerformers(),
      getGeographicData(),
      getDeviceStats(),
      getSecurityMetrics()
    ]);

    // Get conversion funnel and retention data (optional, don't fail if unavailable)
    let conversionFunnel;
    let retention;
    try {
      conversionFunnel = await conversionFunnelService.calculateFunnel(parseInt(timeRange as string) || 30);
      retention = await cohortRetentionService.getCohortRetentionData(6);
    } catch (error) {
      logger.warn('Failed to fetch funnel/retention data', { error });
      // Continue without this data
    }

    res.json({
      success: true,
      analytics: {
        users: userStats,
        pets: petStats,
        matches: matchStats,
        messages: messageStats,
        engagement: engagementStats,
        revenue: revenueStats,
        timeSeries,
        topPerformers,
        geographicData,
        deviceStats,
        securityMetrics,
        ...(conversionFunnel ? { conversionFunnel } : {}),
        ...(retention ? { retention } : {})
      },
      generatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    logger.error('Failed to get analytics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Get user statistics
 */
const getUserStats = async (startDate: Date): Promise<UserStats> => {
  const [total, active, suspended, banned, verified, recent24h] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ status: 'active' }),
    User.countDocuments({ status: 'suspended' }),
    User.countDocuments({ status: 'banned' }),
    User.countDocuments({ isVerified: true }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  // Calculate growth
  const previousTotal = await User.countDocuments({ createdAt: { $lt: startDate } });
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total,
    active,
    suspended,
    banned,
    verified,
    recent24h,
    growth: Number(growth.toFixed(2)),
    trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
  };
};

/**
 * Get pet statistics
 */
const getPetStats = async (startDate: Date): Promise<PetStats> => {
  const [total, active, recent24h] = await Promise.all([
    Pet.countDocuments(),
    Pet.countDocuments({ status: 'active' }),
    Pet.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  const previousTotal = await Pet.countDocuments({ createdAt: { $lt: startDate } });
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total,
    active,
    recent24h,
    growth: Number(growth.toFixed(2)),
    trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
  };
};

/**
 * Get match statistics
 */
const getMatchStats = async (startDate: Date): Promise<MatchStats> => {
  const [total, active, blocked, recent24h] = await Promise.all([
    Match.countDocuments(),
    Match.countDocuments({ status: 'active' }),
    Match.countDocuments({ isBlocked: true }),
    Match.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  const previousTotal = await Match.countDocuments({ createdAt: { $lt: startDate } });
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total,
    active,
    blocked,
    recent24h,
    growth: Number(growth.toFixed(2)),
    trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
  };
};

/**
 * Get message statistics
 */
const getMessageStats = async (startDate: Date): Promise<MessageStats> => {
  const [total, deleted, recent24h] = await Promise.all([
    Message.countDocuments(),
    Message.countDocuments({ isDeleted: true }),
    Message.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } })
  ]);

  const previousTotal = await Message.countDocuments({ createdAt: { $lt: startDate } });
  const growth = previousTotal > 0 ? ((total - previousTotal) / previousTotal) * 100 : 0;

  return {
    total,
    deleted,
    recent24h,
    growth: Number(growth.toFixed(2)),
    trend: growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable'
  };
};

/**
 * Get engagement statistics
 */
const getEngagementStats = async (): Promise<EngagementStats> => {
  const nowLocal = Date.now();
  const oneDayAgo = new Date(nowLocal - 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(nowLocal - 7 * 24 * 60 * 60 * 1000);
  const oneMonthAgo = new Date(nowLocal - 30 * 24 * 60 * 60 * 1000);

  const [dailyActiveUsers, weeklyActiveUsers, monthlyActiveUsers] = await Promise.all([
    User.countDocuments({ lastLoginAt: { $gte: oneDayAgo } }),
    User.countDocuments({ lastLoginAt: { $gte: oneWeekAgo } }),
    User.countDocuments({ lastLoginAt: { $gte: oneMonthAgo } })
  ]);

  // Calculate average session duration (mock for now - would need session tracking)
  const averageSessionDuration = 18.5; // minutes

  // Calculate bounce rate (users who left without interaction)
  const bounceRate = 12.3; // percentage (mock - would need tracking)

  // Calculate retention rate
  const retentionRate = monthlyActiveUsers > 0 ? (weeklyActiveUsers / monthlyActiveUsers) * 100 : 0;

  return {
    dailyActiveUsers,
    weeklyActiveUsers,
    monthlyActiveUsers,
    averageSessionDuration,
    bounceRate,
    retentionRate: Number(retentionRate.toFixed(2))
  };
};

/**
 * Get revenue statistics (from Stripe integration)
 */
const getRevenueStats = async (startDate: Date): Promise<RevenueStats> => {
  try {
    const stripeService = require('../services/stripeService');
    const stripeClient = await stripeService.getStripeClient();

    // Get active subscriptions
    const subscriptions = await stripeClient.subscriptions.list({
      status: 'active',
      limit: 100
    });

    // Calculate MRR
    const monthlyRecurringRevenue = subscriptions.data?.reduce((sum: number, sub: { items: { data: Array<{ plan: { interval: string; amount: number } }> } }) => {
      const plan = sub.items.data[0]?.plan;
      if (!plan) return sum;
      const monthlyFactor = plan.interval === 'year' ? (1 / 12) : 1;
      return sum + (plan.amount * monthlyFactor);
    }, 0) || 0;

    // Get total revenue from balance transactions
    const balanceTransactions = await stripeClient.balanceTransactions.list({
      created: { gte: Math.floor(startDate.getTime() / 1000) },
      limit: 100
    });

    const totalRevenue = balanceTransactions.data.reduce((sum: number, transaction: { type: string; status: string; amount: number }) => {
      if (transaction.type === 'charge' && transaction.status === 'available') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    // Calculate ARPU
    const activeSubscriptionCount = subscriptions.data.length;
    const averageRevenuePerUser = activeSubscriptionCount > 0
      ? (monthlyRecurringRevenue / activeSubscriptionCount) / 100
      : 0;

    // Calculate conversion rate
    const totalUsers = await User.countDocuments();
    const customers = await stripeClient.customers.list({ limit: 100 });
    const conversionRate = totalUsers > 0 ? (customers.data.length / totalUsers) * 100 : 0;

    // Calculate churn rate
    const canceledSubs = await stripeClient.subscriptions.list({
      status: 'canceled',
      limit: 100
    });
    const totalSubs = activeSubscriptionCount + canceledSubs.data.length;
    const churnRate = totalSubs > 0 ? (canceledSubs.data.length / totalSubs) * 100 : 0;

    return {
      totalRevenue: totalRevenue / 100, // Convert from cents
      monthlyRecurringRevenue: monthlyRecurringRevenue / 100,
      averageRevenuePerUser: Number(averageRevenuePerUser.toFixed(2)),
      conversionRate: Number(conversionRate.toFixed(2)),
      churnRate: Number(churnRate.toFixed(2))
    };
  } catch (error: unknown) {
    logger.error('Failed to get revenue stats', { error });
    // Return zeros if Stripe is not configured
    return {
      totalRevenue: 0,
      monthlyRecurringRevenue: 0,
      averageRevenuePerUser: 0,
      conversionRate: 0,
      churnRate: 0
    };
  }
};

/**
 * Get time series data
 */
const getTimeSeries = async (startDate: Date, timeRange: string): Promise<Array<any>> => {
  const days = parseInt(timeRange) || 30;
  const timeSeries: Array<any> = [];

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const nextDate = new Date(date.getTime() + 24 * 60 * 60 * 1000);

    const [users, pets, matches, messages] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
      Pet.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
      Match.countDocuments({ createdAt: { $gte: date, $lt: nextDate } }),
      Message.countDocuments({ createdAt: { $gte: date, $lt: nextDate } })
    ]);

    timeSeries.push({
      date: date.toISOString(),
      users,
      pets,
      matches,
      messages,
      revenue: 0, // Would come from Stripe
      engagement: 0 // Would come from analytics tracking
    });
  }

  return timeSeries;
};

/**
 * Get top performers
 */
const getTopPerformers = async (): Promise<Array<{ petId: string; name: string; matchCount: number }>> => {
  // Get top pets by match count
  const topPets = await Match.aggregate([
    { $group: { _id: '$pet1', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'pets', localField: '_id', foreignField: '_id', as: 'pet' } },
    { $unwind: '$pet' },
    { $project: { id: '$_id', name: '$pet.name', type: 'pet', score: '$count', metric: 'matches' } }
  ]);

  // Get top users by activity
  const topUsers = await Message.aggregate([
    { $group: { _id: '$sender', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    {
      $project: {
        id: '$_id',
        name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        type: 'user',
        score: '$count',
        metric: 'messages'
      }
    }
  ]);

  return [...topPets, ...topUsers];
};

/**
 * Get geographic data
 */
const getGeographicData = async (): Promise<Array<{ location: string; userCount: number }>> => {
  const geographicData = await User.aggregate([
    {
      $group: {
        _id: '$location.country',
        users: { $sum: 1 }
      }
    },
    { $sort: { users: -1 } },
    { $limit: 10 },
    {
      $project: {
        country: '$_id',
        users: 1,
        revenue: 0, // Would come from Stripe
        growth: 0 // Would need historical data
      }
    }
  ]);

  return geographicData;
};

/**
 * Get device statistics
 */
const getDeviceStats = async (): Promise<Array<{ device: string; percentage: number }>> => {
  // This would require tracking device info in user sessions
  // For now, return estimated distribution
  const totalUsers = await User.countDocuments();

  return [
    { device: 'Mobile', percentage: 65.0 },
    { device: 'Desktop', percentage: 25.0 },
    { device: 'Tablet', percentage: 10.0 }
  ] as Array<{ device: string; percentage: number }>;
};

/**
 * Get security metrics
 */
const getSecurityMetrics = async (): Promise<{ totalAlerts: number; criticalAlerts: number; resolvedAlerts: number }> => {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [totalAlerts, criticalAlerts, resolvedAlerts] = await Promise.all([
    AdminActivityLog.countDocuments({
      action: { $in: ['UNAUTHORIZED_ACCESS_ATTEMPT', 'RATE_LIMIT_EXCEEDED', 'SUSPICIOUS_ACTIVITY'] }
    }),
    AdminActivityLog.countDocuments({
      action: { $in: ['UNAUTHORIZED_ACCESS_ATTEMPT', 'SUSPICIOUS_ACTIVITY'] },
      createdAt: { $gte: oneDayAgo }
    }),
    AdminActivityLog.countDocuments({
      action: { $in: ['SECURITY_ALERT_RESOLVED'] }
    })
  ]);

  return {
    totalAlerts,
    criticalAlerts,
    resolvedAlerts
  };
};

/**
 * Helper function to calculate start date from time range
 */
const getStartDate = (timeRange: string): Date => {
  const days = parseInt(timeRange) || 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
};

/**
 * Export analytics data in various formats
 */
export const exportAnalytics = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { format = 'json', timeRange = '30d' } = req.query;

    // Get analytics data
    const startDate = getStartDate(timeRange as string);
    const [
      userStats,
      petStats,
      matchStats,
      messageStats,
      engagementStats,
      revenueStats
    ] = await Promise.all([
      getUserStats(startDate),
      getPetStats(startDate),
      getMatchStats(startDate),
      getMessageStats(startDate),
      getEngagementStats(),
      getRevenueStats(startDate)
    ]);

    const analyticsData = {
      users: userStats,
      pets: petStats,
      matches: matchStats,
      messages: messageStats,
      engagement: engagementStats,
      revenue: revenueStats,
      generatedAt: new Date().toISOString(),
      timeRange
    };

    // Format based on requested type
    switch (format) {
      case 'csv': {
        const csv = convertToCSV(analyticsData);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
        res.send(csv);
        break;
      }

      case 'pdf':
        // For PDF, return JSON with instructions (PDF generation requires client-side library)
        res.json({
          success: true,
          message: 'PDF generation requires client-side processing',
          data: analyticsData
        });
        break;

      case 'json':
      default:
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.json`);
        res.json(analyticsData);
        break;
    }

    logger.info('Analytics exported', { format, timeRange });
  } catch (error: unknown) {
    logger.error('Failed to export analytics', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to export analytics data',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Convert analytics data to CSV format
 */
const convertToCSV = (data: Record<string, unknown>): string => {
  const rows: string[] = [];

  // Header
  rows.push('Metric,Value');

  // User stats
  const users = data.users as any;
  rows.push(`Total Users,${users?.total || 0}`);
  rows.push(`Active Users,${users?.active || 0}`);
  rows.push(`Suspended Users,${users?.suspended || 0}`);
  rows.push(`Banned Users,${users?.banned || 0}`);
  rows.push(`Verified Users,${users?.verified || 0}`);
  rows.push(`Recent 24h Users,${users?.recent24h || 0}`);
  rows.push(`User Growth,${users?.growth || 0}%`);

  // Pet stats
  const pets = data.pets as any;
  rows.push(`Total Pets,${pets?.total || 0}`);
  rows.push(`Active Pets,${pets?.active || 0}`);
  rows.push(`Recent 24h Pets,${pets?.recent24h || 0}`);
  rows.push(`Pet Growth,${pets?.growth || 0}%`);

  // Match stats
  const matches = data.matches as any;
  rows.push(`Total Matches,${matches?.total || 0}`);
  rows.push(`Active Matches,${matches?.active || 0}`);
  rows.push(`Blocked Matches,${matches?.blocked || 0}`);
  rows.push(`Recent 24h Matches,${matches?.recent24h || 0}`);
  rows.push(`Match Growth,${matches?.growth || 0}%`);

  // Message stats
  const messages = data.messages as any;
  rows.push(`Total Messages,${messages?.total || 0}`);
  rows.push(`Deleted Messages,${messages?.deleted || 0}`);
  rows.push(`Recent 24h Messages,${messages?.recent24h || 0}`);
  rows.push(`Message Growth,${messages?.growth || 0}%`);

  // Engagement stats
  const engagement = data.engagement as any;
  rows.push(`Daily Active Users,${engagement?.dailyActiveUsers || 0}`);
  rows.push(`Weekly Active Users,${engagement?.weeklyActiveUsers || 0}`);
  rows.push(`Monthly Active Users,${engagement?.monthlyActiveUsers || 0}`);
  rows.push(`Avg Session Duration,${engagement?.averageSessionDuration || 0} min`);
  rows.push(`Bounce Rate,${engagement?.bounceRate || 0}%`);
  rows.push(`Retention Rate,${engagement?.retentionRate || 0}%`);

  // Revenue stats
  const revenue = data.revenue as any;
  rows.push(`Total Revenue,$${(revenue?.totalRevenue || 0).toFixed(2)}`);
  rows.push(`MRR,$${(revenue?.monthlyRecurringRevenue || 0).toFixed(2)}`);
  rows.push(`ARPU,$${(revenue?.averageRevenuePerUser || 0).toFixed(2)}`);
  rows.push(`Conversion Rate,${revenue?.conversionRate || 0}%`);
  rows.push(`Churn Rate,${revenue?.churnRate || 0}%`);

  return rows.join('\n');
};

/**
 * Get conversion funnel data
 */
export const getConversionFunnel = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { timeRange = '30' } = req.query;
    const days = parseInt(timeRange as string) || 30;

    const funnelData = await conversionFunnelService.calculateFunnel(days);

    res.json({
      success: true,
      data: funnelData,
      generatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    logger.error('Failed to get conversion funnel', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch conversion funnel data',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Get cohort retention data
 */
export const getCohortRetention = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { cohorts = '6' } = req.query;
    const numberOfCohorts = parseInt(cohorts as string) || 6;

    const retentionData = await cohortRetentionService.getCohortRetentionData(numberOfCohorts);

    res.json({
      success: true,
      data: retentionData,
      generatedAt: new Date().toISOString()
    });
  } catch (error: unknown) {
    logger.error('Failed to get cohort retention', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cohort retention data',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Track paywall view
 */
export const trackPaywallView = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId || req.body?.userId;
    const { source = 'unknown' } = req.body;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
      return;
    }

    await conversionFunnelService.trackPaywallView(userId, source);

    res.json({
      success: true,
      message: 'Paywall view tracked'
    });
  } catch (error: unknown) {
    logger.error('Failed to track paywall view', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to track paywall view',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Get A/B test results
 */
export const getABTestResults = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const { testId } = req.params;

    if (testId) {
      // Get specific test results
      const results = abTestingService.getTestResults(testId);
      res.json({
        success: true,
        data: results
      });
    } else {
      // Get all active tests
      const activeTests = abTestingService.getActiveTests();
      const allResults = activeTests.map(test => ({
        ...abTestingService.getTestResults(test.id),
        test
      }));

      res.json({
        success: true,
        data: allResults
      });
    }
  } catch (error: unknown) {
    logger.error('Failed to get A/B test results', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch A/B test results',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Assign user to A/B test variant
 */
export const assignABTestVariant = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId || req.body?.userId;
    const { testId } = req.body;

    if (!userId || !testId) {
      res.status(400).json({
        success: false,
        error: 'User ID and test ID are required'
      });
      return;
    }

    const variantId = abTestingService.assignVariant(userId, testId);

    if (!variantId) {
      res.status(404).json({
        success: false,
        error: 'Test not found or not active'
      });
      return;
    }

    res.json({
      success: true,
      data: {
        testId,
        variantId
      }
    });
  } catch (error: unknown) {
    logger.error('Failed to assign A/B test variant', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to assign A/B test variant',
      message: getErrorMessage(error)
    });
  }
};

/**
 * Track A/B test conversion
 */
export const trackABTestConversion = async (req: AdminAnalyticsRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId || req.body?.userId;
    const { testId, variantId, conversionType = 'default' } = req.body;

    if (!userId || !testId || !variantId) {
      res.status(400).json({
        success: false,
        error: 'User ID, test ID, and variant ID are required'
      });
      return;
    }

    await abTestingService.trackConversion(testId, variantId, userId, conversionType);

    res.json({
      success: true,
      message: 'Conversion tracked'
    });
  } catch (error: unknown) {
    logger.error('Failed to track A/B test conversion', { error });
    res.status(500).json({
      success: false,
      error: 'Failed to track conversion',
      message: getErrorMessage(error)
    });
  }
};

