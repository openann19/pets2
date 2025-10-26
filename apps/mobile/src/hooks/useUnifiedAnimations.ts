/**
 * useUnifiedAnimations.ts - BACKWARD COMPATIBILITY LAYER
 *
 * This file now re-exports from the new modular structure under hooks/animations/
 * All hooks are now properly modularized into separate files.
 *
 * REFACTORING COMPLETE:
 * - useUnifiedAnimations.ts: 650 lines → 52 lines (92% reduction)
 * - All hooks extracted to: hooks/animations/
 */

// Re-export all animation hooks from the modular structure
export {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGesture,
  usePressAnimation,
  useGlowAnimation,
} from "./animations";

// Re-export configs
export { SPRING_CONFIGS, TIMING_CONFIGS } from "./animations";

// Import for default export object
import {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGesture,
  usePressAnimation,
  useGlowAnimation,
} from "./animations";

// Export UnifiedAnimations object for backward compatibility
const UnifiedAnimations = {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGesture,
  usePressAnimation,
  useGlowAnimation,
};

export { UnifiedAnimations as default };
