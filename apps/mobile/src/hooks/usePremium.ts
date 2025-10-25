/**
 * Premium Feature Hook
 * Provides real-time premium status and feature gating
 */
import { useState, useEffect, useCallback } from "react";
import { premiumService, type SubscriptionStatus, type PremiumLimits } from "../services/PremiumService";
import { logger } from "@pawfectmatch/core";

export interface PremiumState {
  isLoading: boolean;
  isActive: boolean;
  plan: string;
  limits: PremiumLimits;
  status: SubscriptionStatus | null;
  error: string | null;
}

export interface PremiumActions {
  refreshStatus: () => Promise<void>;
  checkFeatureAccess: (feature: keyof PremiumLimits) => Promise<boolean>;
  trackUsage: (feature: string) => Promise<void>;
  canUseFeature: (feature: keyof PremiumLimits) => boolean;
  getRemainingUsage: (feature: keyof PremiumLimits) => number;
}

export const usePremium = (): PremiumState & PremiumActions => {
  const [state, setState] = useState<PremiumState>({
    isLoading: true,
    isActive: false,
    plan: "free",
    limits: {
      swipesPerDay: 50,
      likesPerDay: 100,
      superLikesPerDay: 3,
      canUndoSwipes: false,
      canSeeWhoLiked: false,
      canBoostProfile: false,
      advancedFilters: false,
      priorityMatching: false,
      unlimitedRewind: false,
    },
    status: null,
    error: null,
  });

  const refreshStatus = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const [status, limits] = await Promise.all([
        premiumService.getSubscriptionStatus(),
        premiumService.getPremiumLimits(),
      ]);

      setState(prev => ({
        ...prev,
        isLoading: false,
        isActive: status.isActive,
        plan: status.plan,
        limits,
        status,
        error: null,
      }));

      logger.info("Premium status refreshed", {
        isActive: status.isActive,
        plan: status.plan,
        featuresCount: limits ? Object.keys(limits).length : 0,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      logger.error("Failed to refresh premium status", { error });
    }
  }, []);

  const checkFeatureAccess = useCallback(async (feature: keyof PremiumLimits): Promise<boolean> => {
    try {
      return await premiumService.canUseFeature(feature);
    } catch (error) {
      logger.error("Failed to check feature access", { error, feature });
      return false;
    }
  }, []);

  const trackUsage = useCallback(async (feature: string): Promise<void> => {
    try {
      await premiumService.trackUsage(feature);
    } catch (error) {
      logger.error("Failed to track usage", { error, feature });
      // Don't throw - tracking failures shouldn't break UX
    }
  }, []);

  const canUseFeature = useCallback((feature: keyof PremiumLimits): boolean => {
    return state.limits[feature] as boolean;
  }, [state.limits]);

  const getRemainingUsage = useCallback((feature: keyof PremiumLimits): number => {
    const limit = state.limits[feature];
    if (typeof limit === "number") {
      // For numeric limits, we'd need to track current usage
      // This is a simplified version - in production, you'd track actual usage
      return limit === -1 ? Infinity : limit;
    }
    return limit ? 1 : 0;
  }, [state.limits]);

  // Load initial status
  useEffect(() => {
    void refreshStatus();
  }, [refreshStatus]);

  return {
    ...state,
    refreshStatus,
    checkFeatureAccess,
    trackUsage,
    canUseFeature,
    getRemainingUsage,
  };
};

/**
 * Hook for specific premium features with usage tracking
 */
export const usePremiumFeature = (feature: keyof PremiumLimits) => {
  const premium = usePremium();
  const [usageCount, setUsageCount] = useState(0);

  const canUse = premium.canUseFeature(feature);
  const remaining = premium.getRemainingUsage(feature);

  const useFeature = useCallback(async (): Promise<boolean> => {
    if (!canUse) {
      return false;
    }

    try {
      await premium.trackUsage(feature);
      setUsageCount(prev => prev + 1);
      return true;
    } catch (error) {
      logger.error("Failed to use premium feature", { error, feature });
      return false;
    }
  }, [canUse, feature, premium]);

  return {
    canUse,
    remaining,
    usageCount,
    useFeature,
    isLoading: premium.isLoading,
    error: premium.error,
  };
};

/**
 * Hook for swipe limits and tracking
 */
export const useSwipeLimits = () => {
  const premium = usePremium();
  const [swipeCount, setSwipeCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [superLikeCount, setSuperLikeCount] = useState(0);

  const canSwipe = swipeCount < premium.limits.swipesPerDay || premium.limits.swipesPerDay === -1;
  const canLike = likeCount < premium.limits.likesPerDay || premium.limits.likesPerDay === -1;
  const canSuperLike = superLikeCount < premium.limits.superLikesPerDay || premium.limits.superLikesPerDay === -1;

  const trackSwipe = useCallback(async (action: "like" | "pass" | "superlike") => {
    try {
      await premium.trackUsage(`swipe_${action}`);
      
      switch (action) {
        case "like":
          setLikeCount(prev => prev + 1);
          break;
        case "superlike":
          setSuperLikeCount(prev => prev + 1);
          break;
        case "pass":
          setSwipeCount(prev => prev + 1);
          break;
      }
    } catch (error) {
      logger.error("Failed to track swipe", { error, action });
    }
  }, [premium]);

  const resetCounts = useCallback(() => {
    setSwipeCount(0);
    setLikeCount(0);
    setSuperLikeCount(0);
  }, []);

  return {
    limits: premium.limits,
    counts: {
      swipes: swipeCount,
      likes: likeCount,
      superLikes: superLikeCount,
    },
    canSwipe,
    canLike,
    canSuperLike,
    trackSwipe,
    resetCounts,
    isLoading: premium.isLoading,
  };
};
