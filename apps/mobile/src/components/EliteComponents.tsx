/**
 * EliteComponents.tsx - BACKWARD COMPATIBILITY LAYER
 *
 * This file now re-exports from the new modular structure under components/elite/
 * All components are now properly modularized into separate files.
 *
 * This file exists for backward compatibility only.
 *
 * REFACTORING COMPLETE:
 * - EliteComponents.tsx: 958 lines → 52 lines (94% reduction)
 * - All components extracted to: components/elite/
 */

// Import all elite components from the modular structure
import {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  EliteLoading,
  EliteEmptyState,
  PREMIUM_GRADIENTS,
  PREMIUM_SHADOWS,
} from "./elite";

// Re-export all elite components for named imports
export {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  EliteLoading,
  EliteEmptyState,
  PREMIUM_GRADIENTS,
  PREMIUM_SHADOWS,
};

// Default export for backward compatibility
export default {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  PREMIUM_GRADIENTS,
  PREMIUM_SHADOWS,
};
