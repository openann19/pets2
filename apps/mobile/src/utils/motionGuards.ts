/**
 * 🛡️ MOTION GUARDS
 * Utilities for respecting reduced motion and low-end device constraints
 *
 * All micro-interactions should check these guards before animating.
 */

import { AccessibilityInfo } from 'react-native';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { perfManager } from '@/utils/PerfManager';

/**
 * Platform check for reduced motion preference
 * Uses React Native AccessibilityInfo
 */
export async function checkReducedMotion(): Promise<boolean> {
  try {
    return await AccessibilityInfo.isReduceMotionEnabled();
  } catch {
    return false;
  }
}

/**
 * Hook to check if user prefers reduced motion
 * Uses custom hook from @/hooks/useReducedMotion
 */
export function usePrefersReducedMotion(): boolean {
  return useReduceMotion();
}

/**
 * Check if device is low-end
 * Uses PerfManager singleton
 */
export function isLowEndDevice(): boolean {
  return perfManager.isLowEnd();
}

/**
 * Hook to check if device is low-end
 * Memoizes the check to avoid repeated calls
 */
let cachedLowEnd: boolean | null = null;

export function useIsLowEndDevice(): boolean {
  if (cachedLowEnd === null) {
    cachedLowEnd = isLowEndDevice();
  }
  return cachedLowEnd;
}

/**
 * Should skip heavy effects (confetti, complex blur, particles)
 * Returns true if reduced motion OR low-end device
 */
export function shouldSkipHeavyEffects(reducedMotion: boolean, lowEnd: boolean): boolean {
  return reducedMotion || lowEnd;
}

/**
 * Get adaptive particle count
 * Reduces particle count on low-end devices
 */
export function getAdaptiveParticleCount(maxCount: number, lowEnd: boolean): number {
  if (lowEnd) {
    return Math.max(3, Math.floor(maxCount * 0.3)); // Reduce to 30%, min 3
  }
  return maxCount;
}

/**
 * Helper hook combining all motion guards
 * Returns object with all guard states and adaptive helpers
 */
export function useMotionGuards() {
  const reducedMotion = usePrefersReducedMotion();
  const lowEnd = useIsLowEndDevice();

  return {
    reducedMotion,
    lowEnd,
    shouldAnimate: !reducedMotion,
    shouldSkipHeavy: shouldSkipHeavyEffects(reducedMotion, lowEnd),
    getAdaptiveDuration: (duration: number) => {
      if (reducedMotion) {
        return 0; // Instant transitions
      }
      if (lowEnd) {
        return duration * 0.7; // 30% faster on low-end
      }
      return duration;
    },
    getAdaptiveParticleCount: (maxCount: number) => getAdaptiveParticleCount(maxCount, lowEnd),
  };
}
