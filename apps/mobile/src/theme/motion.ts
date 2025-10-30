/**
 * 🎬 MOTION TOKENS
 * Token-driven motion system for PawfectMatch Mobile
 * 
 * All durations, easings, scales, and opacity values come from here.
 * No magic numbers in components.
 */

import { Easing } from 'react-native';
import type { AppTheme } from './contracts';

/**
 * Motion duration tokens (ms)
 * xfast: 120ms - Instant feedback (tap reactions)
 * fast: 180ms - Quick transitions (press feedback)
 * base: 220ms - Standard transitions (most interactions)
 * slow: 300ms - Deliberate transitions (modals, sheets)
 * xslow: 420ms - Expressive transitions (page transitions)
 */
export const motionDurations = {
  xfast: 120,
  fast: 180,
  base: 220,
  slow: 300,
  xslow: 420,
} as const;

/**
 * Easing curves (cubic bezier arrays compatible with Reanimated)
 * standard: [0.2, 0, 0, 1] - Material easeOut
 * emphasized: [0.05, 0.7, 0.1, 1] - Springy easeOut (bouncy feel)
 * decel: [0, 0, 0.2, 1] - Material deceleration
 * accel: [0.3, 0, 1, 1] - Acceleration (for exit animations)
 */
export const motionEasing = {
  standard: Easing.bezier(0.2, 0, 0, 1),
  emphasized: Easing.bezier(0.05, 0.7, 0.1, 1),
  decel: Easing.bezier(0, 0, 0.2, 1),
  accel: Easing.bezier(0.3, 0, 1, 1),
  
  // Reanimated-compatible arrays (for withTiming)
  standardArray: [0.2, 0, 0, 1] as const,
  emphasizedArray: [0.05, 0.7, 0.1, 1] as const,
  decelArray: [0, 0, 0.2, 1] as const,
  accelArray: [0.3, 0, 1, 1] as const,
} as const;

/**
 * Scale tokens for press feedback
 * pressed: 0.98 - Subtle press feedback
 * lift: 1.02 - Hover/lift effect (subtle elevation)
 */
export const motionScale = {
  pressed: 0.98,
  lift: 1.02,
} as const;

/**
 * Opacity tokens
 * pressed: 0.92 - Pressed state opacity
 * disabled: 0.5 - Disabled state opacity
 * shimmer: 0.18 - Shimmer effect opacity (sweep)
 */
export const motionOpacity = {
  pressed: 0.92,
  disabled: 0.5,
  shimmer: 0.18,
} as const;

/**
 * Spring physics presets (for Reanimated springs)
 * Use with withSpring()
 */
export const motionSpring = {
  gentle: {
    stiffness: 200,
    damping: 25,
    mass: 1,
  },
  standard: {
    stiffness: 300,
    damping: 30,
    mass: 1,
  },
  bouncy: {
    stiffness: 400,
    damping: 20,
    mass: 1,
  },
  snappy: {
    stiffness: 500,
    damping: 35,
    mass: 0.9,
  },
} as const;

/**
 * Complete motion token object
 * Matches AppTheme contract extension
 */
export const motion = {
  duration: motionDurations,
  easing: motionEasing,
  scale: motionScale,
  opacity: motionOpacity,
  spring: motionSpring,
} as const;

/**
 * Type exports
 */
export type MotionDuration = typeof motionDurations[keyof typeof motionDurations];
export type MotionEasing = keyof typeof motionEasing;
export type MotionScale = typeof motionScale[keyof typeof motionScale];
export type MotionOpacity = typeof motionOpacity[keyof typeof motionOpacity];
export type MotionSpring = keyof typeof motionSpring;

/**
 * Helper: Get easing array for Reanimated withTiming
 */
export function getEasingArray(easing: MotionEasing): readonly [number, number, number, number] {
  switch (easing) {
    case 'standard':
      return motionEasing.standardArray;
    case 'emphasized':
      return motionEasing.emphasizedArray;
    case 'decel':
      return motionEasing.decelArray;
    case 'accel':
      return motionEasing.accelArray;
    default:
      return motionEasing.standardArray;
  }
}

/**
 * Helper: Get spring config for Reanimated withSpring
 */
export function getSpringConfig(preset: MotionSpring) {
  return motionSpring[preset];
}

