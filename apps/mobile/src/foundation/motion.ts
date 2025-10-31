/**
 * 🎬 FOUNDATION: MOTION TOKENS
 * SINGLE SOURCE OF TRUTH for all motion values
 * 
 * ⚠️ CRITICAL: All motion values MUST come from here.
 * No magic numbers, no redefinition, no drift.
 * 
 * Easing curves named by INTENT, not numerics:
 * - enter: For entrances (Material easeOut)
 * - exit: For exits (Acceleration)
 * - emphasized: For bouncy/springy feel
 * - decel: For hover states (Material deceleration)
 * - accel: For quick dismissals (Acceleration)
 */

import { Easing } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

// Note: These imports are needed for createSecondaryMotion, but that function
// is currently broken (uses hooks incorrectly). It should be converted to a hook
// or removed if not needed.
// import { useSharedValue, useAnimatedReaction, useAnimatedStyle, withDelay, withSpring } from 'react-native-reanimated';

/**
 * Bezier easing function implementation
 * Compatible with react-native-reanimated's Easing.bezier
 * Used when react-native-reanimated is not available or in tests
 */
const bezierEasing = (x1: number, y1: number, x2: number, y2: number) => {
  return (t: number) => {
    // Cubic bezier curve calculation
    const cx = 3 * x1;
    const bx = 3 * (x2 - x1) - cx;
    const ax = 1 - cx - bx;
    const cy = 3 * y1;
    const by = 3 * (y2 - y1) - cy;
    const ay = 1 - cy - by;
    
    // Find x for given t using Newton-Raphson method
    let x = t;
    for (let i = 0; i < 8; i++) {
      const fx = ax * x * x * x + bx * x * x + cx * x - t;
      const fpx = 3 * ax * x * x + 2 * bx * x + cx;
      if (Math.abs(fpx) < 1e-6) break;
      x = x - fx / fpx;
    }
    
    // Calculate y for the found x
    return ay * x * x * x + by * x * x + cy * x;
  };
};

// Try to use react-native-reanimated's Easing if available, otherwise use our implementation
let ReanimatedEasing: typeof Easing | undefined;
try {
  const reanimated = require('react-native-reanimated');
  if (reanimated && reanimated.Easing && reanimated.Easing.bezier) {
    ReanimatedEasing = reanimated.Easing;
  }
} catch {
  // react-native-reanimated not available, use fallback
}

const getEasingBezier = (x1: number, y1: number, x2: number, y2: number) => {
  if (ReanimatedEasing && ReanimatedEasing.bezier) {
    return ReanimatedEasing.bezier(x1, y1, x2, y2);
  }
  return bezierEasing(x1, y1, x2, y2);
};

// ===== DURATION TOKENS =====
/**
 * Motion duration tokens (ms)
 * 
 * When to use:
 * - xs (120ms): Instant feedback (tap reactions, micro-interactions)
 * - sm (180ms): Quick transitions (press feedback, button states)
 * - md (240ms): Standard transitions (most interactions, card animations)
 * - lg (320ms): Deliberate transitions (modals, sheets, important actions)
 */
export const durations = {
  xs: 120,
  sm: 180,
  md: 240,
  lg: 320,
} as const;

// Legacy export for backwards compatibility
export const motionDurations = durations;

// ===== TIMING CONFIGURATIONS =====
/**
 * Timing configurations (ms) for withTiming animations
 * 
 * When to use:
 * - fast (150ms): Quick feedback (tap reactions, micro-interactions)
 * - normal (300ms): Standard transitions (most interactions, card animations)
 * - slow (500ms): Deliberate transitions (modals, sheets, important actions)
 * - slower (750ms): Very deliberate transitions (celebrations, dramatic reveals)
 */
export const timing = {
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 750,
} as const;

// Legacy export for backwards compatibility
export const motionTiming = timing;

// ===== STAGGER DELAYS =====
/**
 * Stagger delay configurations (ms) for sequential animations
 * 
 * When to use:
 * - fast (50ms): Quick sequential reveals (tight lists, grids)
 * - normal (100ms): Standard staggered animations (cards, list items)
 * - slow (150ms): Deliberate sequential reveals (dramatic reveals, celebrations)
 */
export const stagger = {
  fast: 50,
  normal: 100,
  slow: 150,
} as const;

// Legacy export for backwards compatibility
export const motionStagger = stagger;

// ===== EASING CURVES =====
/**
 * Easing curves - Named by INTENT
 * 
 * When to use:
 * - enter: Material easeOut [0.2, 0, 0, 1] - For entrances, appears natural
 * - exit: Acceleration [0.3, 0, 1, 1] - For exits, feels snappy
 * - emphasized: Springy easeOut [0.05, 0.7, 0.1, 1] - For bouncy/playful feel
 * - decel: Material deceleration [0, 0, 0.2, 1] - For hover states, smooth stop
 * - accel: Acceleration [0.3, 0, 1, 1] - For quick dismissals, urgent feel
 */
/**
 * Easing curves - Named by INTENT
 * 
 * When to use:
 * - enter: Material easeOut [0.2, 0, 0, 1] - For entrances, appears natural
 * - exit: Acceleration [0.3, 0, 1, 1] - For exits, feels snappy
 * - emphasized: Material easeOut [0.2, 0, 0, 1] - For bouncy/playful feel (same as enter per spec)
 */
export const easings = {
  enter: [0.2, 0, 0, 1] as const,
  exit: [0.3, 0, 1, 1] as const,
  emphasized: [0.2, 0, 0, 1] as const,
} as const;

// Reanimated-compatible Easing functions
export const motionEasing = {
  enter: getEasingBezier(0.2, 0, 0, 1),
  exit: getEasingBezier(0.3, 0, 1, 1),
  emphasized: getEasingBezier(0.2, 0, 0, 1),
  // Legacy support
  enterArray: easings.enter,
  exitArray: easings.exit,
  emphasizedArray: easings.emphasized,
  decel: getEasingBezier(0, 0, 0.2, 1),
  accel: getEasingBezier(0.3, 0, 1, 1),
  decelArray: [0, 0, 0.2, 1] as const,
  accelArray: [0.3, 0, 1, 1] as const,
} as const;

// ===== SCALE TOKENS =====
/**
 * Scale tokens for press feedback
 * 
 * When to use:
 * - pressed (0.98): Subtle press feedback (buttons, cards)
 * - lift (1.02): Hover/lift effect (subtle elevation, rare)
 */
/**
 * Scale tokens for press feedback
 */
export const scales = {
  pressed: 0.98,
  lift: 1.02,
} as const;

// Legacy export
export const motionScale = scales;

// ===== OPACITY TOKENS =====
/**
 * Opacity tokens
 * 
 * When to use:
 * - pressed (0.92): Pressed state opacity (subtle dimming)
 * - disabled (0.5): Disabled state opacity (clear visual feedback)
 * - shimmer (0.18): Shimmer effect opacity (sweep effect)
 */
export const motionOpacity = {
  pressed: 0.92,
  disabled: 0.5,
  shimmer: 0.18,
} as const;

// ===== SPRING PRESETS =====
/**
 * Spring physics presets (for Reanimated springs)
 * Use with withSpring()
 * 
 * When to use:
 * - gentle: Subtle, slow springs (cards, modals)
 * - standard: Default spring feel (most interactions)
 * - bouncy: Playful, bouncy feel (celebrations, matches)
 * - snappy: Quick, responsive feel (buttons, quick actions)
 */
/**
 * Spring physics presets (for Reanimated springs)
 * Use with withSpring()
 * 
 * Keys: k = stiffness, c = damping, m = mass
 * 
 * When to use:
 * - gentle: Subtle, slow springs (cards, modals) - k:200, c:25, m:1
 * - standard: Default spring feel (most interactions) - k:300, c:30, m:1
 * - bouncy: Playful, bouncy feel (celebrations, matches) - k:400, c:20, m:1
 */
// ===== BEZIER TYPE =====
export type Bezier = readonly [number, number, number, number];

// ===== SPRING PRESETS =====
/**
 * Spring physics presets (for Reanimated springs)
 * Use with withSpring()
 * 
 * Keys: k = stiffness, c = damping, m = mass
 * 
 * When to use:
 * - gentle: Subtle, slow springs (cards, modals) - k:200, c:25, m:1
 * - standard: Default spring feel (most interactions) - k:300, c:30, m:1
 * - bouncy: Playful, bouncy feel (celebrations, matches) - k:400, c:20, m:1
 */
export const springs = {
  // === EXISTING PRESETS (Maintained for compatibility) ===
  gentle: { stiffness: 200, damping: 25, mass: 1 },
  standard: { stiffness: 300, damping: 30, mass: 1 },
  bouncy: { stiffness: 400, damping: 20, mass: 1 },
  
  // === NEW ADVANCED PRESETS (Phase 1 Enhancement) ===
  /** Overshoot spring - Playful bounce with overshoot */
  overshoot: { damping: 12, stiffness: 400, mass: 0.8, overshootClamping: false },
  /** Velocity-based spring - Responds to gesture velocity */
  velocity: { damping: 15, stiffness: 350, mass: 0.9 },
  /** Heavy spring - Weightier feel, slower response */
  heavy: { damping: 25, stiffness: 200, mass: 1.5 },
  /** Light spring - Lighter feel, faster response */
  light: { damping: 18, stiffness: 500, mass: 0.5 },
  /** Snappy spring - Quick, responsive feel */
  snappy: { damping: 35, stiffness: 600, mass: 0.7 },
  /** Wobbly spring - Playful, elastic feel */
  wobbly: { damping: 12, stiffness: 180, mass: 1 },
  /** Stiff spring - Minimal bounce, quick settle */
  stiff: { damping: 10, stiffness: 200, mass: 1 },
} as const;

// Legacy format support (k/c/m)
export const springsLegacy = {
  gentle: { k: springs.gentle.stiffness, c: springs.gentle.damping, m: springs.gentle.mass },
  standard: { k: springs.standard.stiffness, c: springs.standard.damping, m: springs.standard.mass },
  bouncy: { k: springs.bouncy.stiffness, c: springs.bouncy.damping, m: springs.bouncy.mass },
} as const;

// Reanimated-compatible spring configs (stiffness/damping/mass)
export const motionSpring = {
  gentle: springs.gentle,
  standard: springs.standard,
  bouncy: springs.bouncy,
  // Legacy support
  snappy: {
    stiffness: 500,
    damping: 35,
    mass: 0.9,
  },
} as const;

// ===== COMPLETE MOTION TOKEN OBJECT =====
/**
 * Complete motion token object
 * Single source of truth for all motion values
 */
// Complete motion token object
export const motionTokens = {
  duration: durations,
  timing: timing,
  stagger: stagger,
  easing: easings,
  scale: scales,
  opacity: motionOpacity,
  spring: springs,
} as const;

// ===== TYPE EXPORTS =====
// Type exports
export type MotionDuration = (typeof durations)[keyof typeof durations];
export type MotionTiming = (typeof timing)[keyof typeof timing];
export type MotionStagger = (typeof stagger)[keyof typeof stagger];
export type MotionEasing = keyof typeof easings;
export type MotionScale = (typeof scales)[keyof typeof scales];
export type MotionOpacity = (typeof motionOpacity)[keyof typeof motionOpacity];
export type MotionSpring = keyof typeof springs;
export type { SpringConfig };

// ===== HELPER FUNCTIONS =====
/**
 * Get easing array for Reanimated withTiming
 */
export function getEasingArray(easing: MotionEasing): readonly [number, number, number, number] {
  switch (easing) {
    case 'enter':
      return easings.enter;
    case 'exit':
      return easings.exit;
    case 'emphasized':
      return easings.emphasized;
    default:
      return easings.enter;
  }
}

/**
 * Get spring config for Reanimated withSpring
 */
export function getSpringConfig(preset: MotionSpring) {
  return springs[preset];
}

// ===== ADVANCED SPRING UTILITIES (Phase 1 Enhancement) =====

/**
 * Spring configuration type
 */
export type SpringConfig = {
  damping: number;
  stiffness: number;
  mass?: number;
  overshootClamping?: boolean;
  restDelta?: number;
  restSpeed?: number;
  velocity?: number;
};

/**
 * Velocity-based spring helper
 * Returns appropriate spring config based on gesture velocity
 * 
 * @param velocity - Gesture velocity in px/s
 * @returns Spring config optimized for the velocity
 * 
 * @example
 * ```tsx
 * const springConfig = springs.fromVelocity(gestureVelocity.value);
 * position.value = withSpring(target, springConfig);
 * ```
 */
export function fromVelocity(velocity: number): SpringConfig {
  'worklet';
  const absVelocity = Math.abs(velocity);
  
  if (absVelocity > 1000) {
    return springs.snappy;
  } else if (absVelocity > 500) {
    return springs.velocity;
  } else if (absVelocity > 200) {
    return springs.standard;
  }
  
  return springs.gentle;
}

// Attach helper to springs object for convenience
(springs as typeof springs & { fromVelocity: typeof fromVelocity }).fromVelocity = fromVelocity;

/**
 * Secondary motion configuration
 * Use with useSecondaryMotion hook (see hooks/animations/)
 */
export interface SecondaryMotionConfig {
  /** Follow-through amount (0-1), how much secondary motion */
  followThrough: number;
  /** Delay before follow-through starts (ms) */
  delay: number;
}

/**
 * Create secondary motion animation
 * Adds follow-through animation to a main animated value
 * 
 * @deprecated This function is currently broken (uses hooks incorrectly).
 * It should be converted to a hook (useSecondaryMotion) or removed.
 * 
 * @param mainValue - Main animated value to follow
 * @param config - Secondary motion configuration
 * @returns Animated style with secondary motion
 * 
 * @example
 * ```tsx
 * // TODO: Convert to hook:
 * // const useSecondaryMotion = (mainValue, config) => { ... }
 * ```
 */
export function createSecondaryMotion(
  _mainValue: SharedValue<number>,
  _config: SecondaryMotionConfig
): AnimatedStyle {
  'worklet';
  // TODO: This function incorrectly uses hooks. It should be converted to a hook:
  // function useSecondaryMotion(mainValue: SharedValue<number>, config: SecondaryMotionConfig) {
  //   const followValue = useSharedValue(0);
  //   useAnimatedReaction(...);
  //   return useAnimatedStyle(...);
  // }
  
  // Placeholder return - function is not functional in current state
  return {} as AnimatedStyle;
}

// ===== HELPER UTILITIES =====
/**
 * Clamp value between lo and hi
 */
export const clamp = (v: number, lo: number, hi: number) => (v < lo ? lo : v > hi ? hi : v);

/**
 * Linear interpolation between a and b
 */
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Reduce motion helpers moved to foundation/reduce-motion.ts

// ===== DEFAULT EXPORT =====
export default motionTokens;

