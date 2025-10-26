/**
 * GlassMorphism.tsx - BACKWARD COMPATIBILITY LAYER
 *
 * This file now re-exports from the new modular structure under components/glass/
 * All components are now properly modularized into separate files.
 *
 * This file exists for backward compatibility only.
 *
 * REFACTORING COMPLETE:
 * - GlassMorphism.tsx: 528 lines → 52 lines (90% reduction)
 * - All components extracted to: components/glass/
 */

// Re-export all glass components from the modular structure
export {
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
  GLASS_CONFIGS,
} from "./glass";

// Import for default export object
import {
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
  GLASS_CONFIGS,
} from "./glass";

// Default export for backward compatibility
const GlassMorphism = {
  GLASS_CONFIGS,
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
};

export default GlassMorphism;
