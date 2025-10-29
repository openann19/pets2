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
// NOTE: This file is a compatibility layer. New code should import directly from hooks/animations/ or animation/index
export {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGestures as useSwipeGesture,
  usePressAnimation,
  useGlowAnimation,
} from './animations/index';

// Import for default export object
import {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGestures,
  usePressAnimation,
  useGlowAnimation,
} from './animations';

// Export UnifiedAnimations object for backward compatibility
const UnifiedAnimations = {
  useSpringAnimation,
  useEntranceAnimation,
  useSwipeGesture: useSwipeGestures,
  usePressAnimation,
  useGlowAnimation,
};

export { UnifiedAnimations as default };
