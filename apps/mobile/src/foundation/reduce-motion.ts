/**
 * 🎯 FOUNDATION: REDUCE MOTION HELPERS
 * 
 * Every effect respects Reduce Motion + accessibility
 * 
 * Definition of Done (DoD) requires a reduced demo clip for each feature
 */

import { useReduceMotion } from '../hooks/useReducedMotion';

/**
 * Worklet-safe reduce motion helper
 * Use in Reanimated worklets
 * 
 * @example
 * ```tsx
 * const opacity = withReducedMotion(
 *   withTiming(1, { duration: 240 }),
 *   withTiming(1, { duration: 120 })
 * );
 * ```
 */
export function withReducedMotion<T>(value: T, reduced: T): T {
  'worklet';
  // @ts-expect-error - globalThis.reduceMotion is set by hook
  return globalThis.__reduceMotion ? reduced : value;
}

/**
 * Hook to get reduce motion-aware values
 * 
 * @example
 * ```tsx
 * const caps = useCapabilities();
 * const duration = useReducedMotionValue(240, 120);
 * const blurRadius = useReducedMotionValue(20, 0);
 * ```
 */
export function useReducedMotionValue<T>(value: T, reduced: T): T {
  const reduceMotion = useReduceMotion();
  return reduceMotion ? reduced : value;
}

/**
 * Apply reduce motion to duration
 * Cuts duration in half for reduced motion
 */
export function applyReduceMotion(duration: number, reduced: boolean): number {
  return reduced ? duration / 2 : duration;
}

/**
 * Apply reduce motion to spring config
 * Simplified spring physics for reduced motion
 */
export function applyReduceMotionSpring(
  config: { stiffness: number; damping: number; mass: number },
  reduced: boolean,
): { stiffness: number; damping: number; mass: number } {
  if (!reduced) return config;
  
  return {
    stiffness: config.stiffness * 0.5, // Less bouncy
    damping: config.damping * 1.5, // More damped
    mass: config.mass,
  };
}

/**
 * Remove parallax effects for reduced motion
 */
export function removeParallax(dy: number, reduced: boolean): number {
  return reduced ? 0 : dy;
}

/**
 * Remove overshoot for reduced motion
 */
export function removeOvershoot(config: { overshootClamping?: boolean }, reduced: boolean) {
  return reduced ? { ...config, overshootClamping: true } : config;
}

/**
 * Disable loops for reduced motion
 */
export function disableLoops(repeat: number, reduced: boolean): number {
  return reduced ? 0 : repeat;
}

/**
 * Replace blur with opacity for reduced motion
 * Blur > 10px becomes opacity change
 */
export function replaceBlurWithOpacity(blurRadius: number, reduced: boolean): {
  blurRadius: number;
  opacity: number;
} {
  if (!reduced || blurRadius <= 10) {
    return { blurRadius, opacity: 1 };
  }
  
  // Replace blur > 10 with opacity
  return {
    blurRadius: 0,
    opacity: 1 - Math.min(blurRadius / 100, 0.3), // Fade instead of blur
  };
}

export default {
  withReducedMotion,
  useReducedMotionValue,
  applyReduceMotion,
  applyReduceMotionSpring,
  removeParallax,
  removeOvershoot,
  disableLoops,
  replaceBlurWithOpacity,
};

