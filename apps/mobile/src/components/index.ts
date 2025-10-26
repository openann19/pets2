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
  usePressAnimation,
  useGlowAnimation,
  useSwipeGesture,
} from "../hooks/useUnifiedAnimations";
export { useMagneticEffect } from "../hooks/animations";
export { useShake } from "../hooks/useShake";
export { useLikeWithUndo } from "../hooks/useLikeWithUndo";
export { useBubbleRetryShake } from "../hooks/useBubbleRetryShake";

// Export premium animation hooks from usePremiumAnimations
export {
  useRippleEffect,
  useShimmerEffect,
  useStaggeredAnimation,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useParallaxEffect,
} from "../hooks/usePremiumAnimations";

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
export { default as ModernText } from "./typography/ModernTypography";
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
export { ModernPhotoUploadWithEditor } from "./ModernPhotoUploadWithEditor";

// === PHOTO EDITING COMPONENTS ===
export { AdvancedPhotoEditor, PhotoAdjustmentSlider, BeforeAfterSlider } from "./photo";
export type { PhotoAdjustments } from "./photo/AdvancedPhotoEditor";

// === COMMON COMPONENTS ===
export { SmartImage } from "./common";

// === MICRO-UX COMPONENTS ===
export { default as MicroPressable } from "./micro/MicroPressable";
export { default as HapticSwitch } from "./micro/HapticSwitch";
export { default as Shimmer } from "./micro/Shimmer";
export { default as ParallaxCard } from "./micro/ParallaxCard";

// === PERFORMANCE TESTING ===
export { default as PerformanceTestSuite } from "./PerformanceTestSuite";

// === FEEDBACK COMPONENTS ===
export { default as UndoPill } from "./feedback/UndoPill";
export { default as SendSparkle, type SendSparkleHandle } from "./feedback/SendSparkle";

// === GESTURE COMPONENTS ===
export { default as LikeArbitrator, type LikeArbitratorProps } from "./Gestures/LikeArbitrator";

// === CHAT ENHANCEMENTS ===
export { useSwipeToReply } from "../hooks/useSwipeToReply";
export { default as MorphingContextMenu, type ContextAction } from "./menus/MorphingContextMenu";
export { default as ReplySwipeHint } from "./chat/ReplySwipeHint";

// === LEGACY COMPONENTS (TO BE DEPRECATED) ===
// These are kept for backward compatibility during migration
export {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  FadeInUp,
  StaggeredContainer,
} from "./EliteComponents";
export { default as InteractiveButton } from "./InteractiveButton";
export { default as SwipeCard } from "./ModernSwipeCard"; // Alias to ModernSwipeCard
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
