/**
 * useFeatureGating Hook
 * Provides feature gating functionality based on subscription status
 */
import { useCallback, useMemo } from "react";
import { logger } from "@pawfectmatch/core";
import {
  premiumService,
  type PremiumLimits,
} from "../../../services/PremiumService";
import { usePremiumStatus } from "./usePremiumStatus";

interface FeatureGatingResult {
  canUse: boolean;
  limit?: number;
  remaining?: number;
  upgradeRequired: boolean;
  reason?: string;
}

interface UseFeatureGatingReturn {
  checkFeatureAccess: (
    feature: keyof PremiumLimits,
  ) => Promise<FeatureGatingResult>;
  getFeatureLimit: (feature: keyof PremiumLimits) => number;
  isFeatureUnlimited: (feature: keyof PremiumLimits) => boolean;
  trackFeatureUsage: (feature: string) => Promise<void>;
  getUpgradeMessage: (feature: keyof PremiumLimits) => string;
}

const FEATURE_DISPLAY_NAMES: Record<keyof PremiumLimits, string> = {
  swipesPerDay: "daily swipes",
  likesPerDay: "daily likes",
  superLikesPerDay: "Super Likes",
  canUndoSwipes: "undo swipes",
  canSeeWhoLiked: "see who liked you",
  canBoostProfile: "profile boost",
  advancedFilters: "advanced filters",
  priorityMatching: "priority matching",
  unlimitedRewind: "unlimited rewind",
};

export const useFeatureGating = (): UseFeatureGatingReturn => {
  const { subscriptionStatus, isPremium, hasFeature } = usePremiumStatus();

  const checkFeatureAccess = useCallback(
    async (feature: keyof PremiumLimits): Promise<FeatureGatingResult> => {
      try {
        const limits = await premiumService.getPremiumLimits();

        if (
          feature === "swipesPerDay" ||
          feature === "likesPerDay" ||
          feature === "superLikesPerDay"
        ) {
          // Handle numeric limits
          const limit = limits[feature];
          const isUnlimited = limit === -1;

          return {
            canUse: isUnlimited || limit > 0,
            limit: isUnlimited ? undefined : limit,
            remaining: isUnlimited ? undefined : Math.max(0, limit),
            upgradeRequired: !isPremium && limit === 0,
            reason:
              limit === 0
                ? `No ${FEATURE_DISPLAY_NAMES[feature]} remaining`
                : undefined,
          };
        } else {
          // Handle boolean features
          const canUse = limits[feature];

          return {
            canUse,
            upgradeRequired: !canUse,
            reason: canUse
              ? undefined
              : `Premium required for ${FEATURE_DISPLAY_NAMES[feature]}`,
          };
        }
      } catch (error) {
        logger.error("Failed to check feature access", { error, feature });
        // Default to free tier limitations
        return {
          canUse: false,
          upgradeRequired: true,
          reason: "Unable to verify premium status",
        };
      }
    },
    [isPremium],
  );

  const getFeatureLimit = useCallback(
    (feature: keyof PremiumLimits): number => {
      // This would typically come from the premium service
      // For now, return default values
      const defaultLimits: Record<keyof PremiumLimits, number> = {
        swipesPerDay: 50,
        likesPerDay: 100,
        superLikesPerDay: 3,
        canUndoSwipes: 0,
        canSeeWhoLiked: 0,
        canBoostProfile: 0,
        advancedFilters: 0,
        priorityMatching: 0,
        unlimitedRewind: 0,
      };

      return defaultLimits[feature];
    },
    [],
  );

  const isFeatureUnlimited = useCallback(
    (feature: keyof PremiumLimits): boolean => {
      const limit = getFeatureLimit(feature);
      return limit === -1;
    },
    [getFeatureLimit],
  );

  const trackFeatureUsage = useCallback(
    async (feature: string): Promise<void> => {
      try {
        await premiumService.trackUsage(feature);
      } catch (error) {
        logger.error("Failed to track feature usage", { error, feature });
        // Don't throw - tracking failures shouldn't break the user experience
      }
    },
    [],
  );

  const getUpgradeMessage = useCallback(
    (feature: keyof PremiumLimits): string => {
      const featureName = FEATURE_DISPLAY_NAMES[feature];
      return `Upgrade to Premium to unlock ${featureName} and many more features!`;
    },
    [],
  );

  return {
    checkFeatureAccess,
    getFeatureLimit,
    isFeatureUnlimited,
    trackFeatureUsage,
    getUpgradeMessage,
  };
};
