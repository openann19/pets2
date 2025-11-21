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

// === UNIFIED BUTTON SYSTEM ===
export { default as Button, ButtonPresets } from "./Button";
export type {
  ButtonProps,
  ButtonVariant,
  ButtonSize,
  InteractionType,
  HapticType,
} from "./Button";

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

// === UNIFIED TEXT SYSTEM ===
export {
  default as Text,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Display,
  Title,
  Subtitle,
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
} from "./Text";
export type {
  TextProps,
  TextVariant,
  TextWeight,
  TextColor,
  AnimationType,
  GradientType,
  ShadowType,
} from "./Text";

// === UNIFIED CARD SYSTEM ===
export { default as Card, CardPresets, SwipeCard, MatchCard } from "./Card";
export type {
  CardProps,
  CardVariant,
  CardSize,
  InteractionType,
  HapticType,
  AnimationType,
  GradientType,
} from "./Card";

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
