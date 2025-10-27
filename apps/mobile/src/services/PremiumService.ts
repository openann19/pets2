/**
 * Premium Service for PawfectMatch Mobile App
 * Handles Stripe subscription management and premium feature gating
 */
import { logger } from "@pawfectmatch/core";
import { api } from "./api";

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
  interval: "month" | "year";
  features: string[];
  stripePriceId: string;
  popular?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: "card";
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
}

class PremiumService {
  private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  // Available subscription plans
  private static readonly PLANS: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 4.99,
      interval: "month",
      features: ["5 Super Likes/day", "See who liked you", "Advanced filters"],
      stripePriceId:
        process.env["EXPO_PUBLIC_STRIPE_BASIC_PRICE_ID"] ??
        "price_1P1234567890abcdefghijklmn",
    },
    {
      id: "premium",
      name: "Premium",
      price: 9.99,
      interval: "month",
      features: [
        "Unlimited Super Likes",
        "Priority matching",
        "Profile boost",
        "Undo swipes",
      ],
      stripePriceId:
        process.env["EXPO_PUBLIC_STRIPE_PREMIUM_PRICE_ID"] ??
        "price_1P2345678901bcdefghijklmnop",
      popular: true,
    },
    {
      id: "ultimate",
      name: "Ultimate",
      price: 19.99,
      interval: "month",
      features: [
        "Everything in Premium",
        "Video calls",
        "Advanced analytics",
        "VIP support",
      ],
      stripePriceId:
        process.env["EXPO_PUBLIC_STRIPE_ULTIMATE_PRICE_ID"] ??
        "price_1P3456789012cdefghijklmnopqr",
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
      logger.error("Failed to check premium status", { error });
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
      }>("/premium/status");

      const status: SubscriptionStatus = {
        isActive: response.isActive,
        plan: response.plan,
        features: response.features,
        autoRenew: response.autoRenew,
        ...(response.expiresAt !== undefined
          ? { expiresAt: response.expiresAt }
          : {}),
        ...(response.stripeCustomerId !== undefined
          ? { stripeCustomerId: response.stripeCustomerId }
          : {}),
        ...(response.currentPeriodEnd !== undefined
          ? { currentPeriodEnd: response.currentPeriodEnd }
          : {}),
      };

      // Cache the result
      await this.setCachedStatus(status);

      logger.info("Fetched subscription status", {
        isActive: status.isActive,
        plan: status.plan,
        featuresCount: status.features.length,
      });

      return status;
    } catch (error) {
      logger.error("Failed to get subscription status", { error });
      // Return default free tier status
      return {
        isActive: false,
        plan: "free",
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
        "/premium/subscribe",
        {
          method: "POST",
          body: JSON.stringify({
            plan: planId,
            interval: plan.interval,
          }),
        },
      );

      logger.info("Created checkout session", {
        planId,
        sessionId: response.data.sessionId,
      });

      return {
        sessionId: response.data.sessionId,
        url: response.data.url
      };
    } catch (error) {
      logger.error("Failed to create checkout session", { error, planId });
      throw error;
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>(
        "/premium/cancel",
        { method: "POST" },
      );

      // Clear cache to force refresh
      await this.clearCache();

      logger.info("Subscription cancelled", response);

      return response;
    } catch (error) {
      logger.error("Failed to cancel subscription", { error });
      throw error;
    }
  }

  /**
   * Get premium feature limits based on subscription
   */
  async getPremiumLimits(): Promise<PremiumLimits> {
    try {
      const status = await this.getSubscriptionStatus();

      // Default free tier limits
      const limits: PremiumLimits = {
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: 3, // Free users get 3 per day
        canUndoSwipes: false,
        canSeeWhoLiked: false,
        canBoostProfile: false,
        advancedFilters: false,
        priorityMatching: false,
        unlimitedRewind: false,
      };

      // Upgrade limits based on plan
      if (status.isActive) {
        switch (status.plan.toLowerCase()) {
          case "basic":
            limits.superLikesPerDay = 5;
            limits.canSeeWhoLiked = true;
            limits.advancedFilters = true;
            break;

          case "premium":
            limits.superLikesPerDay = -1; // Unlimited
            limits.canUndoSwipes = true;
            limits.canSeeWhoLiked = true;
            limits.canBoostProfile = true;
            limits.advancedFilters = true;
            limits.priorityMatching = true;
            break;

          case "ultimate":
            limits.superLikesPerDay = -1; // Unlimited
            limits.canUndoSwipes = true;
            limits.canSeeWhoLiked = true;
            limits.canBoostProfile = true;
            limits.advancedFilters = true;
            limits.priorityMatching = true;
            limits.unlimitedRewind = true;
            break;
        }
      }

      return limits;
    } catch (error) {
      logger.error("Failed to get premium limits", { error });
      // Return free tier limits on error
      return {
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: 3,
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
      logger.error("Failed to check feature access", { error, feature });
      return false;
    }
  }

  /**
   * Track premium feature usage
   */
  async trackUsage(feature: string): Promise<void> {
    try {
      await api.request("/premium/track-usage", {
        method: "POST",
        body: JSON.stringify({ feature, timestamp: Date.now() }),
      });

      logger.info("Premium feature usage tracked", { feature });
    } catch (error) {
      logger.error("Failed to track premium usage", { error, feature });
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
