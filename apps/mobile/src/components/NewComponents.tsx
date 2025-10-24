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
export {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Body,
  BodyLarge,
  BodySmall,
  Caption,
  Overline,
  ButtonText,
  Label,
  GradientHeading,
  GradientText,
  HolographicText,
  AnimatedHeading,
  AnimatedText,
} from "./typography/ModernTypography";

// === MODERNIZED COMPONENTS ===
export { default as ModernSwipeCard } from "./ModernSwipeCard";
export { default as ModernPhotoUpload } from "./ModernPhotoUpload";

// === PERFORMANCE TESTING ===
export { default as PerformanceTestSuite } from "./PerformanceTestSuite";
