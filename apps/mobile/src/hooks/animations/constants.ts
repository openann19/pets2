/**
 * Premium Animation Constants
 * DEPRECATED: Re-exports from foundation/motion.ts
 * 
 * @deprecated Use `springs`, `timing`, `stagger` from '@/foundation/motion' directly
 * This file is kept for backwards compatibility during migration
 */

import {
  springs,
  timing,
  stagger,
} from '@/foundation/motion';

// === PREMIUM ANIMATION CONSTANTS ===
// Re-export as PREMIUM_ANIMATIONS for backwards compatibility
export const PREMIUM_ANIMATIONS = {
  // Spring configurations - mapped from foundation springs
  spring: {
    gentle: springs.gentle,
    bouncy: springs.bouncy,
    wobbly: springs.wobbly,
    stiff: springs.stiff,
  },

  // Timing configurations - mapped from foundation timing
  timing: {
    fast: timing.fast,
    normal: timing.normal,
    slow: timing.slow,
    slower: timing.slower,
  },

  // Easing curves - mapped from foundation easings
  easing: {
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },

  // Stagger delays - mapped from foundation stagger
  stagger: {
    fast: stagger.fast,
    normal: stagger.normal,
    slow: stagger.slow,
  },
} as const;

// Re-export foundation exports for convenience
export { springs, timing, stagger, easings, motionEasing } from '@/foundation/motion';
