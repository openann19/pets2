/**
 * Premium Service for PawfectMatch Mobile App
 * Handles Stripe subscription management and premium feature gating
 */
import { logger } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

  // Available subscription plans - Standardized with Web App
  private static readonly PLANS: SubscriptionPlan[] = [
    {
      id: "basic",
      name: "Basic",
      price: 0,
      interval: "month",
      features: [
        "5 daily swipes",
        "Basic matching",
        "Standard chat",
        "Weather updates",
        "Community support",
      ],
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
        "Unlimited swipes",
        "AI-powered matching",
        "Priority chat features",
        "Advanced photo analysis",
        "AI bio generation",
        "Compatibility scoring",
        "See who liked you",
        "Boost your profile",
        "5 Super Likes per day",
        "Unlimited rewinds",
        "Advanced analytics",
        "Premium badge",
        "Priority support",
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
        "VIP status",
        "Unlimited Super Likes",
        "Global passport",
        "Priority AI matching",
        "Early feature access",
        "Custom AI training",
        "Video chat features",
        "Exclusive events",
        "Monthly surprises",
        "Identity verification",
        "Concierge support",
        "Profile verification",
        "Custom themes",
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

      const response = await api.request<{ sessionId: string; url: string }>(
        "/premium/create-checkout-session",
        {
          method: "POST",
          body: JSON.stringify({
            priceId: plan.stripePriceId,
            successUrl:
              successUrl !== undefined
                ? successUrl
                : "pawfectmatch://premium/success",
            cancelUrl:
              cancelUrl !== undefined
                ? cancelUrl
                : "pawfectmatch://premium/cancel",
          }),
        },
      );

      logger.info("Created checkout session", {
        planId,
        sessionId: response.sessionId,
      });

      return response;
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

  /**
   * Get current usage statistics
   */
  async getUsageStats(): Promise<{
    swipesToday: number;
    likesToday: number;
    superLikesToday: number;
    lastResetDate: string;
  }> {
    try {
      const response = await api.request<{
        swipesToday: number;
        likesToday: number;
        superLikesToday: number;
        lastResetDate: string;
      }>("/premium/usage-stats");

      return response;
    } catch (error) {
      logger.error("Failed to get usage stats", { error });
      return {
        swipesToday: 0,
        likesToday: 0,
        superLikesToday: 0,
        lastResetDate: new Date().toISOString(),
      };
    }
  }

  /**
   * Check if user has reached daily limits
   */
  async hasReachedLimit(feature: keyof PremiumLimits): Promise<boolean> {
    try {
      const limits = await this.getPremiumLimits();
      const usage = await this.getUsageStats();

      switch (feature) {
        case "swipesPerDay":
          return usage.swipesToday >= limits.swipesPerDay && limits.swipesPerDay !== -1;
        case "likesPerDay":
          return usage.likesToday >= limits.likesPerDay && limits.likesPerDay !== -1;
        case "superLikesPerDay":
          return usage.superLikesToday >= limits.superLikesPerDay && limits.superLikesPerDay !== -1;
        default:
          return !limits[feature] as boolean;
      }
    } catch (error) {
      logger.error("Failed to check limit", { error, feature });
      return true; // Default to blocked on error
    }
  }

  /**
   * Restore purchases (for iOS/Android)
   */
  async restorePurchases(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.request<{ success: boolean; message: string }>(
        "/premium/restore-purchases",
        { method: "POST" },
      );

      // Clear cache to force refresh
      await this.clearCache();

      logger.info("Purchases restored", response);
      return response;
    } catch (error) {
      logger.error("Failed to restore purchases", { error });
      throw error;
    }
  }

  // Private helper methods

  private async getCachedStatus(): Promise<{
    status: SubscriptionStatus;
    timestamp: number;
  } | null> {
    try {
      const cached = await AsyncStorage.getItem("premium_status_cache");
      if (cached) {
        const parsed = JSON.parse(cached);
        const now = Date.now();
        const cacheAge = now - parsed.timestamp;

        // Cache is valid for 5 minutes
        if (cacheAge < 5 * 60 * 1000) {
          logger.debug("Premium status cache hit", { cacheAge });
          return parsed;
        } else {
          logger.debug("Premium status cache expired", { cacheAge });
          await AsyncStorage.removeItem("premium_status_cache");
        }
      }
      return null;
    } catch (error) {
      logger.error("Failed to read premium status cache", { error });
      return null;
    }
  }

  private async setCachedStatus(status: SubscriptionStatus): Promise<void> {
    try {
      const cacheData = {
        status,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(
        "premium_status_cache",
        JSON.stringify(cacheData),
      );
      logger.debug("Premium status cached", { status });
    } catch (error) {
      logger.error("Failed to cache premium status", { error });
    }
  }

  private isCacheValid(timestamp: number): boolean {
    return Date.now() - timestamp < PremiumService.CACHE_DURATION;
  }

  private async clearCache(): Promise<void> {
    try {
      await AsyncStorage.removeItem("premium_status_cache");
      logger.debug("Premium status cache cleared");
    } catch (error) {
      logger.error("Failed to clear premium cache", { error });
    }
  }
}

// Export singleton instance
export const premiumService = new PremiumService();
export default premiumService;
