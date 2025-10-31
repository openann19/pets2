/**
 * useFeatureGate Hook
 * Standardized hook for feature gating that combines useFeatureGating with premium gate UI
 * This is the single source of truth for feature access checks
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { useFeatureGating } from './useFeatureGating';
import { useIAPBalance } from './useIAPBalance';
import { usePremiumStatus } from './usePremiumStatus';
import type { PremiumLimits } from '../../../services/PremiumService';
import { usePremiumGate } from '../../../components/Premium/PremiumGate';
import type { RootStackParamList } from '../../../navigation/types';

type PremiumNavigationProp = NavigationProp<RootStackParamList>;

interface UseFeatureGateOptions {
  feature: keyof PremiumLimits;
  showGateOnDeny?: boolean;
  navigation?: PremiumNavigationProp;
  autoCheck?: boolean;
}

interface UseFeatureGateReturn {
  canUse: boolean;
  limit?: number;
  remaining?: number;
  upgradeRequired: boolean;
  reason?: string;
  isLoading: boolean;
  checkAccess: () => Promise<boolean>;
  requestAccess: () => Promise<void>;
}

/**
 * Standardized feature gate hook
 * Combines feature gating logic with IAP balance checks and premium gate UI
 */
export const useFeatureGate = (
  options: UseFeatureGateOptions,
): UseFeatureGateReturn => {
  const { feature, showGateOnDeny = true, navigation, autoCheck = true } = options;
  const { checkFeatureAccess, getUpgradeMessage } = useFeatureGating();
  const { isPremium, plan } = usePremiumStatus();
  const { balance } = useIAPBalance();
  const { showPremiumGate } = usePremiumGate();
  const nav = useNavigation<PremiumNavigationProp>();

  const [accessResult, setAccessResult] = useState<{
    canUse: boolean;
    limit?: number;
    remaining?: number;
    upgradeRequired: boolean;
    reason?: string;
  }>({
    canUse: false,
    upgradeRequired: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Check feature access (handles both premium limits and IAP balance)
  const checkAccess = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);

      // For Super Likes, also check IAP balance
      if (feature === 'superLikesPerDay') {
        const hasUnlimitedSuperLikes = isPremium && (plan === 'premium' || plan === 'ultimate');
        const hasIAPBalance = (balance?.superLikes || 0) > 0;

        if (hasUnlimitedSuperLikes || hasIAPBalance) {
          const result = await checkFeatureAccess(feature);
          setAccessResult({
            ...result,
            canUse: result.canUse || hasIAPBalance,
          });
          return result.canUse || hasIAPBalance;
        } else {
          const result = await checkFeatureAccess(feature);
          setAccessResult(result);
          return result.canUse;
        }
      }

      // For other features, use standard check
      const result = await checkFeatureAccess(feature);
      setAccessResult(result);
      return result.canUse;
    } catch (error) {
      // Default to deny on error
      setAccessResult({
        canUse: false,
        upgradeRequired: true,
        reason: 'Unable to verify feature access',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [feature, checkFeatureAccess, isPremium, plan, balance]);

  // Request access (shows premium gate if needed)
  const requestAccess = useCallback(async (): Promise<void> => {
    const hasAccess = await checkAccess();

    if (!hasAccess && showGateOnDeny) {
      const upgradeMessage = getUpgradeMessage(feature);
      const featureDisplayName =
        feature === 'superLikesPerDay'
          ? 'Super Likes'
          : feature === 'canBoostProfile'
            ? 'Profile Boost'
            : feature === 'advancedFilters'
              ? 'Advanced Filters'
              : feature === 'canSeeWhoLiked'
                ? 'See Who Liked You'
                : feature === 'canUndoSwipes'
                  ? 'Undo Swipes'
                  : 'Premium Feature';

      showPremiumGate({
        feature: featureDisplayName,
        description: upgradeMessage,
        icon: feature === 'superLikesPerDay' ? 'star' : feature === 'canBoostProfile' ? 'rocket' : 'lock-closed',
      });

      // Navigate to Premium screen if navigation provided
      const navToUse = navigation || nav;
      if (navToUse) {
        setTimeout(() => {
          navToUse.navigate('Premium');
        }, 500);
      }
    }
  }, [checkAccess, showGateOnDeny, getUpgradeMessage, feature, showPremiumGate, navigation, nav]);

  // Auto-check access on mount if enabled
  useEffect(() => {
    if (autoCheck) {
      void checkAccess();
    }
  }, [autoCheck, checkAccess]);

  return {
    canUse: accessResult.canUse,
    ...(accessResult.limit !== undefined && { limit: accessResult.limit }),
    ...(accessResult.remaining !== undefined && { remaining: accessResult.remaining }),
    upgradeRequired: accessResult.upgradeRequired,
    ...(accessResult.reason !== undefined && { reason: accessResult.reason }),
    isLoading,
    checkAccess,
    requestAccess,
  };
};

