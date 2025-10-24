/**
 * PROJECT HYPERION: NEW COMPONENTS EXPORT
 *
 * Simplified export file for the new architecture components.
 * This provides a clean API for importing the new components.
 */

// === THEME SYSTEM ===
export { default as Theme } from "../theme/unified-theme";
export type { ThemeType } from "../theme/unified-theme";

// === ANIMATION HOOKS ===
export {
  useSpringAnimation,
  useEntranceAnimation,
  usePressAnimation,
  useGlowAnimation,
  useMagneticEffect,
  useSwipeGesture,
} from "../hooks/useUnifiedAnimations";

// === BUTTON SYSTEM ===
export { default as BaseButton } from "./buttons/BaseButton";
export {
  default as EliteButton,
  EliteButtonPresets,
} from "./buttons/EliteButton";
export {
  WithGlowFX,
  WithMagneticFX,
  WithRippleFX,
  WithPressFX,
  WithGradientFX,
} from "./buttons/EffectWrappers";

// === CONTAINER SYSTEM ===
export {
  default as FXContainer,
  FXContainerPresets,
} from "./containers/FXContainer";

// === TYPOGRAPHY SYSTEM ===
export {
  GradientText,
  AnimatedText,
  PremiumHeading,
  PremiumBody,
} from "./PremiumTypography";

// === MODERNIZED COMPONENTS ===
export { default as ModernSwipeCard } from "./ModernSwipeCard";
export { default as ModernPhotoUpload } from "./ModernPhotoUpload";

// === PERFORMANCE TESTING ===
export { default as PerformanceTestSuite } from "./PerformanceTestSuite";
