/**
 * Premium Service for PawfectMatch Mobile App
 * Handles Stripe subscription management and premium feature gating
 */
import { logger } from '@pawfectmatch/core';
import { api } from './api';

export interface SubscriptionStatus {
  isActive: boolean;
  plan: string;
  features: string[];
  expiresAt?: string;
  autoRenew: boolean;
  stripeCustomerId?: string;
  currentPeriodEnd?: string;
}

export interface PremiumLimits {
  swipesPerDay: number;
  likesPerDay: number;
  superLikesPerDay: number;
  canUndoSwipes: boolean;
  canSeeWhoLiked: boolean;
  canBoostProfile: boolean;
  advancedFilters: boolean;
  priorityMatching: boolean;
  unlimitedRewind: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card';
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

class PremiumService {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Available subscription plans - Business Model from business.md
  private static readonly PLANS: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      interval: 'month',
      features: ['5 daily swipes', 'Basic matching', 'Standard chat', 'Weather updates', 'Community support'],
      stripePriceId: '',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 9.99,
      interval: 'month',
      features: [
        'Unlimited swipes',
        'See who liked you',
        'Advanced filters',
        'Ad-free experience',
        'Advanced matching algorithm',
        'Priority in search results',
        'Read receipts',
        'Video calls',
      ],
      stripePriceId:
        process.env['EXPO_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID'] ??
        process.env['EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID'] ??
        'price_premium_monthly',
      popular: true,
    },
    {
      id: 'ultimate',
      name: 'Ultimate',
      price: 19.99,
      interval: 'month',
      features: [
        'All Premium features',
        'AI-powered recommendations',
        'Exclusive events access',
        'Priority support',
        'Profile boost',
        'Unlimited Super Likes',
        'Advanced analytics',
        'VIP status',
      ],
      stripePriceId:
        process.env['EXPO_PUBLIC_STRIPE_ULTIMATE_MONTHLY_PRICE_ID'] ??
        process.env['EXPO_PUBLIC_STRIPE_ULTIMATE_PRICE_ID'] ??
        'price_ultimate_monthly',
    },
  ];

  /**
   * Check if user has active premium subscription
   */
  async hasActiveSubscription(): Promise<boolean> {
    try {
      const status = await this.getSubscriptionStatus();
      return status.isActive;
    } catch (error) {
      logger.error('Failed to check premium status', { error });
      return false; // Default to free tier on error
    }
  }

  /**
   * Get detailed subscription status
   */
  async getSubscriptionStatus(): Promise<SubscriptionStatus> {
    try {
      // Check cache first
      const cached = await this.getCachedStatus();
      if (cached !== null && this.isCacheValid(cached.timestamp)) {
        return cached.status;
      }

      // Fetch from API
      const response = await api.request<{
        isActive: boolean;
        plan: string;
        features: string[];
        expiresAt?: string;
        autoRenew: boolean;
        stripeCustomerId?: string;
        currentPeriodEnd?: string;
      }>('/premium/status');

      const status: SubscriptionStatus = {
        isActive: response.isActive,
        plan: response.plan,
        features: response.features,
        autoRenew: response.autoRenew,
        ...(response.expiresAt !== undefined ? { expiresAt: response.expiresAt } : {}),
        ...(response.stripeCustomerId !== undefined
          ? { stripeCustomerId: response.stripeCustomerId }
          : {}),
        ...(response.currentPeriodEnd !== undefined
          ? { currentPeriodEnd: response.currentPeriodEnd }
          : {}),
      };

      // Cache the result
      await this.setCachedStatus(status);

      logger.info('Fetched subscription status', {
        isActive: status.isActive,
        plan: status.plan,
        featuresCount: status.features.length,
      });

      return status;
    } catch (error) {
      logger.error('Failed to get subscription status', { error });
      // Return default free tier status
      return {
        isActive: false,
        plan: 'free',
        features: [],
        autoRenew: false,
      };
    }
  }

  /**
   * Get available subscription plans
   */
  getAvailablePlans(): SubscriptionPlan[] {
    return PremiumService.PLANS;
  }

  /**
   * Create Stripe checkout session
   */
  async createCheckoutSession(
    planId: string,
    successUrl?: string,
    cancelUrl?: string,
  ): Promise<{ sessionId: string; url: string }> {
    try {
      const plan = PremiumService.PLANS.find((p) => p.id === planId);
      if (plan === undefined) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      const response = await api.request<{ data: { sessionId: string; url: string } }>(
        '/premium/subscribe',
        {
          method: 'POST',
          body: JSON.stringify({
            plan: planId,
            interval: plan.interval,
          }),
        },
      );

      logger.info('Created checkout session', {
        planId,
        sessionId: response.data.sessionId,
      });

      return {
        sessionId: response.data.sessionId,
        url: response.data.url,
      };
    } catch (error) {
      logger.error('Failed to create checkout session', { error, planId });
      throw error;
    }
  }

  /**
   * Create Stripe PaymentSheet for mobile native payment
   * Returns PaymentSheet configuration for Stripe React Native SDK
   */
  async createPaymentSheet(
    planId: string,
  ): Promise<{
    paymentIntentClientSecret: string;
    ephemeralKeySecret: string;
    customerId: string;
    setupIntentId: string;
  }> {
    try {
      const plan = PremiumService.PLANS.find((p) => p.id === planId);
      if (plan === undefined) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      const response = await api.request<{
        success: boolean;
        data: {
          paymentIntentClientSecret: string;
          ephemeralKeySecret: string;
          customerId: string;
          setupIntentId: string;
        };
      }>('/premium/create-payment-sheet', {
        method: 'POST',
        body: JSON.stringify({
          plan: planId,
          interval: plan.interval,
        }),
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to create payment sheet');
      }

      logger.info('Created payment sheet', {
        planId,
        customerId: response.data.customerId,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to create payment sheet', { error, planId });
      throw error;
    }
  }

  /**
   * Confirm PaymentSheet payment and create subscription
   */
  async confirmPaymentSheet(
    setupIntentId: string,
    planId: string,
  ): Promise<{ subscriptionId: string; clientSecret?: string }> {
    try {
      const plan = PremiumService.PLANS.find((p) => p.id === planId);
      if (plan === undefined) {
        throw new Error(`Invalid plan ID: ${planId}`);
      }

      const response = await api.request<{
        success: boolean;
        data: {
          subscriptionId: string;
          clientSecret?: string;
        };
      }>('/premium/confirm-payment-sheet', {
        method: 'POST',
        body: JSON.stringify({
          setupIntentId,
          plan: planId,
          interval: plan.interval,
        }),
      });

      if (!response.success || !response.data) {
        throw new Error('Failed to confirm payment sheet');
      }

      // Clear cache to force refresh of subscription status
      await this.clearCache();

      logger.info('Payment sheet confirmed and subscription created', {
        planId,
        subscriptionId: response.data.subscriptionId,
      });

      return response.data;
    } catch (error) {
      logger.error('Failed to confirm payment sheet', { error, planId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>('/premium/cancel', {
        method: 'POST',
      });

      // Clear cache to force refresh
      await this.clearCache();

      logger.info('Subscription cancelled', response);

      return response;
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw error;
    }
  }

  /**
   * Get premium feature limits based on subscription
   */
  async getPremiumLimits(): Promise<PremiumLimits> {
    try {
      const status = await this.getSubscriptionStatus();

      // Default free tier limits - Business Model: 5 daily swipes for free users
      const limits: PremiumLimits = {
        swipesPerDay: 5, // Free users get 5 daily swipes (per business.md)
        likesPerDay: 5, // Free users limited to 5 likes per day
        superLikesPerDay: 0, // Free users get 0 Super Likes (must purchase)
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };

      // Upgrade limits based on plan - Business Model from business.md
      if (status.isActive) {
        switch (status.plan.toLowerCase()) {
          case 'free':
            // Free tier - keep defaults (5 swipes/day)
            break;

          case 'premium':
            // Premium: $9.99/month - Unlimited swipes, all premium features
            limits.swipesPerDay = -1; // Unlimited
            limits.likesPerDay = -1; // Unlimited
            limits.superLikesPerDay = -1; // Unlimited (but can purchase more via IAP)
            limits.canUndoSwipes = true;
            limits.canSeeWhoLiked = true;
            limits.canBoostProfile = true;
            limits.advancedFilters = true;
            limits.priorityMatching = true;
            break;

          case 'ultimate':
            // Ultimate: $19.99/month - All Premium features + AI, VIP, analytics
            limits.swipesPerDay = -1; // Unlimited
            limits.likesPerDay = -1; // Unlimited
            limits.superLikesPerDay = -1; // Unlimited
            limits.canUndoSwipes = true;
            limits.canSeeWhoLiked = true;
            limits.canBoostProfile = true; // Plus daily boosts
            limits.advancedFilters = true;
            limits.priorityMatching = true;
            limits.unlimitedRewind = true;
            break;
        }
      }

      return limits;
    } catch (error) {
      logger.error('Failed to get premium limits', { error });
      // Return free tier limits on error - Business Model: 5 daily swipes
      return {
        swipesPerDay: 5,
        likesPerDay: 5,
        superLikesPerDay: 0,
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };
    }
  }

  /**
   * Check if user can use a specific premium feature
   */
  async canUseFeature(feature: keyof PremiumLimits): Promise<boolean> {
    try {
      const limits = await this.getPremiumLimits();
      return limits[feature] as boolean;
    } catch (error) {
      logger.error('Failed to check feature access', { error, feature });
      return false;
    }
  }

  /**
   * Track premium feature usage
   */
  async trackUsage(feature: string): Promise<void> {
    try {
      await api.request('/premium/track-usage', {
        method: 'POST',
        body: JSON.stringify({ feature, timestamp: Date.now() }),
      });

      logger.info('Premium feature usage tracked', { feature });
    } catch (error) {
      logger.error('Failed to track premium usage', { error, feature });
      // Don't throw - tracking failures shouldn't break the user experience
    }
  }

  // Private helper methods

  private getCachedStatus(): Promise<{
    status: SubscriptionStatus;
    timestamp: number;
  } | null> {
    // This would typically use AsyncStorage or similar
    // For now, return null to always fetch fresh data
    return Promise.resolve(null);
  }

  private async setCachedStatus(_status: SubscriptionStatus): Promise<void> {
    // Cache implementation would go here
    // For now, do nothing
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < PremiumService.CACHE_DURATION;
  }

  private async clearCache(): Promise<void> {
    // Clear cache implementation would go here
  }
}

// Export singleton instance
export const premiumService = new PremiumService();
export default premiumService;
