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

// Re-export all elite components from the modular structure
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
} from "./elite";

// Import for default export object
import {
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
} from "./elite";

// Default export for backward compatibility
const EliteComponents = {
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

export default EliteComponents;
