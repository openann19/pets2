/**
 * 🎯 FOUNDATION: QUALITY TIER SYSTEM
 * 
 * Heuristics that work on web + RN WebView; clamp aggressive effects on low-end devices.
 */

import { useMemo } from 'react';
import { isBrowser, getSafeWindow, getSafeNavigator } from '@pawfectmatch/core/utils/env';

export type QualityTier = 'low' | 'mid' | 'high';

export type QualityProfile = {
  tier: QualityTier;
  particleMultiplier: number;  // multiply counts
  animationScale: number;      // scale speeds/intensity
  dprCap: number;              // cap devicePixelRatio
};

/**
 * Determines quality tier based on device capabilities
 * 
 * @returns QualityProfile with tier, multipliers, and DPR cap
 * 
 * @example
 * ```tsx
 * const q = useQualityTier();
 * const particleCount = baseCount * q.particleMultiplier;
 * ```
 */
export function useQualityTier(): QualityProfile {
  // Guard SSR / native environments
  const win = getSafeWindow();
  const nav = getSafeNavigator();
  const deviceMemory = nav?.deviceMemory ?? 2;
  const cores = nav?.hardwareConcurrency ?? 4;

  // Optional: allow forcing via query (?quality=low|mid|high) for testing
  const forced = win 
    ? new URLSearchParams(win.location.search).get('quality') as QualityTier | null 
    : null;

  return useMemo<QualityProfile>(() => {
    if (forced) {
      return forced === 'high'
        ? { tier: 'high', particleMultiplier: 1.0, animationScale: 1.0, dprCap: 2 }
        : forced === 'mid'
        ? { tier: 'mid',  particleMultiplier: 0.75, animationScale: 0.85, dprCap: 2 }
        : { tier: 'low',  particleMultiplier: 0.5,  animationScale: 0.7,  dprCap: 1.5 };
    }

    const score = (deviceMemory || 2) * Math.min(cores || 4, 8); // simple, stable
    if (score >= 24) return { tier: 'high', particleMultiplier: 1.0,  animationScale: 1.0, dprCap: 2 };
    if (score >= 12) return { tier: 'mid',  particleMultiplier: 0.75, animationScale: 0.85, dprCap: 2 };
    return               { tier: 'low',  particleMultiplier: 0.5,  animationScale: 0.7,  dprCap: 1.5 };
  }, [forced, deviceMemory, cores]);
}

