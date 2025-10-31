/**
 * Conversion Funnel Service
 * Calculates conversion metrics from Free → Premium → Ultimate
 */

import User from '../models/User';
import AnalyticsEvent from '../models/AnalyticsEvent';
import logger from '../utils/logger';

export interface ConversionFunnelData {
  totalFreeUsers: number;
  paywallViews: number;
  premiumSubscribers: number;
  ultimateSubscribers: number;
  freeToPaywallConversion: number; // percentage
  paywallToPremiumConversion: number; // percentage
  premiumToUltimateConversion: number; // percentage
  overallConversionRate: number; // Free → Premium
}

class ConversionFunnelService {
  /**
   * Calculate conversion funnel metrics
   * @param timeRange - Time range for calculations (default: 30 days)
   */
  async calculateFunnel(timeRange: number = 30): Promise<ConversionFunnelData> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - timeRange);

      // Get total free users (users who have never had premium or premium expired)
      const totalFreeUsers = await User.countDocuments({
        $or: [
          { 'premium.isActive': false },
          { 'premium': { $exists: false } },
          { 'premium.expiresAt': { $lt: new Date() } }
        ]
      });

      // Get paywall views from analytics events
      const paywallEvents = await AnalyticsEvent.countDocuments({
        eventType: { $in: ['premium.paywall.viewed', 'PREMIUM_SHOWN', 'premium_cta_click'] },
        createdAt: { $gte: startDate }
      });

      // Get premium subscribers (active premium users)
      const premiumSubscribers = await User.countDocuments({
        'premium.isActive': true,
        'premium.plan': { $in: ['premium', 'Premium'] },
        $or: [
          { 'premium.expiresAt': { $exists: false } },
          { 'premium.expiresAt': null },
          { 'premium.expiresAt': { $gt: new Date() } }
        ]
      });

      // Get ultimate subscribers (active ultimate users)
      const ultimateSubscribers = await User.countDocuments({
        'premium.isActive': true,
        'premium.plan': { $in: ['ultimate', 'Ultimate', 'VIP'] },
        $or: [
          { 'premium.expiresAt': { $exists: false } },
          { 'premium.expiresAt': null },
          { 'premium.expiresAt': { $gt: new Date() } }
        ]
      });

      // Calculate conversion rates
      const freeToPaywallConversion = totalFreeUsers > 0
        ? (paywallEvents / totalFreeUsers) * 100
        : 0;

      const paywallToPremiumConversion = paywallEvents > 0
        ? (premiumSubscribers / paywallEvents) * 100
        : 0;

      const premiumToUltimateConversion = premiumSubscribers > 0
        ? (ultimateSubscribers / premiumSubscribers) * 100
        : 0;

      const overallConversionRate = totalFreeUsers > 0
        ? (premiumSubscribers / totalFreeUsers) * 100
        : 0;

      return {
        totalFreeUsers,
        paywallViews: paywallEvents,
        premiumSubscribers,
        ultimateSubscribers,
        freeToPaywallConversion: Number(freeToPaywallConversion.toFixed(2)),
        paywallToPremiumConversion: Number(paywallToPremiumConversion.toFixed(2)),
        premiumToUltimateConversion: Number(premiumToUltimateConversion.toFixed(2)),
        overallConversionRate: Number(overallConversionRate.toFixed(2))
      };
    } catch (error) {
      logger.error('Error calculating conversion funnel', { error });
      throw error;
    }
  }

  /**
   * Track paywall view
   * @param userId - User ID
   * @param source - Source of paywall view (e.g., 'swipe_limit', 'feature_gate', 'premium_screen')
   */
  async trackPaywallView(userId: string, source: string): Promise<void> {
    try {
      await AnalyticsEvent.create({
        userId,
        eventType: 'premium.paywall.viewed',
        entityType: 'paywall',
        metadata: { source },
        createdAt: new Date()
      });

      // Also update user analytics
      await User.findByIdAndUpdate(userId, {
        $inc: { 'analytics.totalPremiumFeaturesUsed': 0 }, // Track event
        $push: {
          'analytics.events': {
            type: 'paywall_viewed',
            timestamp: new Date(),
            metadata: { source }
          }
        }
      });

      logger.info('Paywall view tracked', { userId, source });
    } catch (error) {
      logger.error('Error tracking paywall view', { error, userId, source });
    }
  }

  /**
   * Get conversion funnel with time series data
   * @param timeRange - Time range in days
   */
  async getFunnelWithTimeSeries(timeRange: number = 30): Promise<{
    funnel: ConversionFunnelData;
    timeSeries: Array<{
      date: string;
      freeUsers: number;
      paywallViews: number;
      premiumSubscribers: number;
      ultimateSubscribers: number;
    }>;
  }> {
    const funnel = await this.calculateFunnel(timeRange);
    
    // Generate time series data
    const timeSeries = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - timeRange);

    for (let i = timeRange - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const [freeUsers, paywallViews, premiumSubscribers, ultimateSubscribers] = await Promise.all([
        User.countDocuments({
          createdAt: { $lt: nextDate },
          $or: [
            { 'premium.isActive': false },
            { 'premium': { $exists: false } }
          ]
        }),
        AnalyticsEvent.countDocuments({
          eventType: { $in: ['premium.paywall.viewed', 'PREMIUM_SHOWN'] },
          createdAt: { $gte: date, $lt: nextDate }
        }),
        User.countDocuments({
          'premium.isActive': true,
          'premium.plan': { $in: ['premium', 'Premium'] },
          $or: [
            { 'premium.expiresAt': { $exists: false } },
            { 'premium.expiresAt': null },
            { 'premium.expiresAt': { $gt: date } }
          ],
          createdAt: { $lt: nextDate }
        }),
        User.countDocuments({
          'premium.isActive': true,
          'premium.plan': { $in: ['ultimate', 'Ultimate', 'VIP'] },
          $or: [
            { 'premium.expiresAt': { $exists: false } },
            { 'premium.expiresAt': null },
            { 'premium.expiresAt': { $gt: date } }
          ],
          createdAt: { $lt: nextDate }
        })
      ]);

      timeSeries.push({
        date: date.toISOString().split('T')[0],
        freeUsers,
        paywallViews,
        premiumSubscribers,
        ultimateSubscribers
      });
    }

    return { funnel, timeSeries };
  }
}

export default new ConversionFunnelService();
