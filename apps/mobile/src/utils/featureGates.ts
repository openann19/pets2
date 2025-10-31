/**
 * Feature Gates Utility
 * Centralized feature access control for premium features
 * Business Model: Aligned with apps/mobile/src/screens/business.md
 */

import { usePremiumStatus } from '../hooks/domains/premium/usePremiumStatus';
import { useIAPBalance } from '../hooks/domains/premium/useIAPBalance';

export interface FeatureGateResult {
  canUse: boolean;
  reason?: string;
  upgradeRequired: boolean;
  balance?: number;
}

/**
 * Check if user can use Super Likes
 * Business Model: Premium users get unlimited, free users need IAP balance
 */
export function useSuperLikeGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  const { balance } = useIAPBalance();
  
  const hasUnlimitedSuperLikes = isPremium && (plan === 'premium' || plan === 'ultimate');
  const hasSuperLikes = hasUnlimitedSuperLikes || (balance?.superLikes || 0) > 0;
  
  const result: FeatureGateResult = {
    canUse: hasSuperLikes,
    upgradeRequired: !isPremium && (balance?.superLikes || 0) === 0,
    balance: balance?.superLikes || 0,
  };
  
  if (!hasSuperLikes) {
    result.reason = 'No Super Likes remaining. Purchase from Premium screen.';
  }
  
  return result;
}

/**
 * Check if user can use Profile Boost
 * Business Model: Premium/Ultimate users get boosts, free users need IAP
 */
export function useProfileBoostGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  const { balance } = useIAPBalance();
  
  const hasUnlimitedBoosts = isPremium && (plan === 'ultimate');
  const hasBoostFeature = isPremium && (plan === 'premium' || plan === 'ultimate');
  const hasBoosts = hasBoostFeature || hasUnlimitedBoosts || (balance?.boosts || 0) > 0;
  
  const result: FeatureGateResult = {
    canUse: hasBoosts,
    upgradeRequired: !hasBoostFeature && (balance?.boosts || 0) === 0,
    balance: balance?.boosts || 0,
  };
  
  if (!hasBoosts) {
    result.reason = 'No Profile Boosts remaining. Purchase from Premium screen.';
  }
  
  return result;
}

/**
 * Check if user can use Advanced Filters
 * Business Model: Premium+ feature
 */
export function useAdvancedFiltersGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  
  const canUse = isPremium && (plan === 'premium' || plan === 'ultimate');
  
  const result: FeatureGateResult = {
    canUse,
    upgradeRequired: !canUse,
  };
  
  if (!canUse) {
    result.reason = 'Advanced Filters are a Premium feature ($9.99/month).';
  }
  
  return result;
}

/**
 * Check if user can see Read Receipts
 * Business Model: Premium+ feature
 */
export function useReadReceiptsGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  
  const canUse = isPremium && (plan === 'premium' || plan === 'ultimate');
  
  const result: FeatureGateResult = {
    canUse,
    upgradeRequired: !canUse,
  };
  
  if (!canUse) {
    result.reason = 'Read Receipts are a Premium feature ($9.99/month).';
  }
  
  return result;
}

/**
 * Check if user can use Video Calls
 * Business Model: Premium+ feature
 */
export function useVideoCallsGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  
  const canUse = isPremium && (plan === 'premium' || plan === 'ultimate');
  
  const result: FeatureGateResult = {
    canUse,
    upgradeRequired: !canUse,
  };
  
  if (!canUse) {
    result.reason = 'Video Calls are a Premium feature ($9.99/month).';
  }
  
  return result;
}

/**
 * Check if user can see Who Liked Them
 * Business Model: Premium+ feature
 */
export function useSeeWhoLikedGate(): FeatureGateResult {
  const { isPremium, plan } = usePremiumStatus();
  
  const canUse = isPremium && (plan === 'premium' || plan === 'ultimate');
  
  const result: FeatureGateResult = {
    canUse,
    upgradeRequired: !canUse,
  };
  
  if (!canUse) {
    result.reason = 'See Who Liked You is a Premium feature ($9.99/month).';
  }
  
  return result;
}

/**
 * Check daily swipe limit
 * Business Model: Free users get 5 swipes/day, Premium users get unlimited
 */
export function useSwipeLimitGate(): {
  canSwipe: boolean;
  remaining: number;
  limit: number;
  isUnlimited: boolean;
  upgradeRequired: boolean;
} {
  const { isPremium } = usePremiumStatus();
  
  // This would typically come from a hook that fetches daily usage
  // For now, return default values
  const limit = isPremium ? -1 : 5; // -1 means unlimited
  const remaining = isPremium ? -1 : 5; // Would be fetched from API
  const canSwipe = isPremium || remaining > 0;
  
  return {
    canSwipe,
    remaining,
    limit,
    isUnlimited: isPremium,
    upgradeRequired: !isPremium && remaining <= 0,
  };
}

