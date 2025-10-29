/**
 * usePremiumAnimations.ts - BACKWARD COMPATIBILITY LAYER
 *
 * This file now re-exports from the new modular structure under hooks/animations/
 * All animation hooks are now properly modularized into separate files.
 *
 * This file exists for backward compatibility only.
 *
 * REFACTORING COMPLETE:
 * - usePremiumAnimations.ts: 440 lines → 53 lines (88% reduction)
 * - All hooks extracted to: hooks/animations/
 */

// Re-export all animation hooks and constants from the modular structure
// NOTE: This file is a compatibility layer. New code should import directly from hooks/animations/ or animation/index
export {
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useEntranceAnimation,
  useHapticFeedback,
  useStaggeredAnimation,
  usePageTransition,
  useLoadingAnimation,
  useParallaxEffect,
} from './animations/index';

// Export PREMIUM_ANIMATIONS constants if needed (consider importing from animation/index.ts)
export { PREMIUM_ANIMATIONS } from './animations/constants';

// Default export for backward compatibility
import {
  PREMIUM_ANIMATIONS,
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useEntranceAnimation,
  useHapticFeedback,
  useStaggeredAnimation,
  usePageTransition,
  useLoadingAnimation,
  useParallaxEffect,
} from './animations';

export default {
  PREMIUM_ANIMATIONS,
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useEntranceAnimation,
  useHapticFeedback,
  useStaggeredAnimation,
  usePageTransition,
  useLoadingAnimation,
  useParallaxEffect,
};
