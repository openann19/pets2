import { logger } from "@pawfectmatch/core";

/**
 * PROJECT HYPERION: UNIFIED COMPONENT EXPORTS
 *
 * Central export file for all modernized components.
 * This provides a clean API for importing the new architecture.
 */

// === THEME SYSTEM ===
export { default as Theme } from "../theme/unified-theme";
export type { ThemeType } from "../theme/unified-theme";

// === ANIMATION HOOKS ===
export { default as UnifiedAnimations } from "../hooks/useUnifiedAnimations";
export {
  useSpringAnimation,
  useEntranceAnimation,
  useStaggeredAnimation,
  usePressAnimation,
  useGlowAnimation,
  useMagneticEffect,
  useSwipeGesture,
  useRippleEffect,
  useShimmerEffect,
  useScrollAnimation,
} from "../hooks/useUnifiedAnimations";

// === BUTTON SYSTEM ===
export { default as BaseButton } from "./buttons/BaseButton";
export {
  default as EliteButton,
  EliteButtonPresets,
} from "./buttons/EliteButton";
export { default as EffectWrappers } from "./buttons/EffectWrappers";
export {
  WithGlowFX,
  WithMagneticFX,
  WithRippleFX,
  WithShimmerFX,
  WithPressFX,
  WithGradientFX,
} from "./buttons/EffectWrappers";

// === CONTAINER SYSTEM ===
export {
  default as FXContainer,
  FXContainerPresets,
} from "./containers/FXContainer";

// === TYPOGRAPHY SYSTEM ===
export { default as ModernText } from "./typography/HyperTextSkia";
export { default as HyperTextSkia } from "./typography/HyperTextSkia";
export {
  default as ProText,
  ProTextHero,
  ProTextPremium,
  ProTextNeon,
  ProTextHolographic,
  ProTextSubtle,
  ProTextGlitch,
  ProTextGold,
} from "./typography/ProText";
export {
  ProTextAurora,
  ProTextPlasma,
  ProTextCrystal,
  ProTextFire,
  ProTextOcean,
  ProTextMidnight,
  ProTextEmerald,
  ProTextRuby,
  ProTextCosmic,
  ProTextPastel,
  ProTextHeroMax,
  ProTextThemeAware,
  ProTextMinimal,
} from "./typography/AdvancedProTextPresets";

// === MODERNIZED COMPONENTS ===
export { default as ModernSwipeCard } from "./ModernSwipeCard";
export { default as ModernPhotoUpload } from "./ModernPhotoUpload";

// === PERFORMANCE TESTING ===
export { default as PerformanceTestSuite } from "./PerformanceTestSuite";

// === LEGACY COMPONENTS (TO BE DEPRECATED) ===
// These are kept for backward compatibility during migration
export {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
} from "./EliteComponents";
export { default as InteractiveButton } from "./InteractiveButton";
export { default as SwipeCard } from "./SwipeCard";
export { default as MotionPrimitives } from "./MotionPrimitives";

// === MIGRATION HELPERS ===
export const MigrationHelpers = {
  // Helper to deprecate old components
  deprecateComponent: (ComponentName: string, NewComponentName: string) => {
    logger.warn(
      `[DEPRECATION] ${ComponentName} is deprecated. Use ${NewComponentName} instead.`,
    );
  },
};
