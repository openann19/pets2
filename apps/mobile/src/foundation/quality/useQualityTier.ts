/**
 * 🎯 FOUNDATION: QUALITY TIER SYSTEM (Mobile)
 * 
 * Detects device performance tier and provides quality scaling multipliers
 * Used to reduce visual effects intensity on low-end devices
 */

import { Platform } from 'react-native';
import { useMemo } from 'react';

export type QualityTier = 'low' | 'mid' | 'high';

export type QualityProfile = {
  tier: QualityTier;
  blurScale: number; // Multiplier for blur intensity (0.6 for low, 0.8 for mid, 1.0 for high)
  dprCap: number; // Cap device pixel ratio
};

/**
 * Detects device performance tier based on available metrics
 * Works on both iOS and Android
 * 
 * @returns QualityProfile with tier and scaling factors
 * 
 * @example
 * ```tsx
 * const q = useQualityTier();
 * const blurAmount = baseAmount * q.blurScale;
 * ```
 */
export function useQualityTier(): QualityProfile {
  // Guard native environments - these APIs may not be available
  const hasNavigator = typeof global !== 'undefined' && (global as any).navigator !== undefined;
  
  // Try to get device memory (available on some Android devices)
  const deviceMemory = hasNavigator
    ? ((global as any).navigator as any)?.deviceMemory ?? 2
    : 2;
  
  // Try to get CPU cores
  const cores = hasNavigator
    ? ((global as any).navigator as any)?.hardwareConcurrency ?? 4
    : 4;

  return useMemo<QualityProfile>(() => {
    // Calculate performance score
    // Simple heuristic: memory * cores (capped at 8 cores for stability)
    const score = deviceMemory * Math.min(cores, 8);

    // Tier thresholds
    if (score >= 24) {
      return {
        tier: 'high',
        blurScale: 1.0,
        dprCap: 2,
      };
    } else if (score >= 12) {
      return {
        tier: 'mid',
        blurScale: 0.8,
        dprCap: 2,
      };
    } else {
      return {
        tier: 'low',
        blurScale: 0.6,
        dprCap: 1.5,
      };
    }
  }, [deviceMemory, cores]);
}

