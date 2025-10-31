/**
 * 🔥 ULTRA‑PREMIUM ANIMATION SUITE — V2
 * Barrel export for all animation components
 */

// Parallax Hero V2
export {
  ParallaxHeroV2,
  ParallaxHero,
  ParallaxContainer,
  useParallax,
  ParallaxHeroV2Example,
  PARALLAX_PRESETS_V2,
  PARALLAX_PRESETS,
  type ParallaxLayerV2,
  type ParallaxLayer,
  type ParallaxHeroV2Props,
  type ParallaxHeroProps,
} from './ParallaxHero';

// Tilt Card V2
export {
  TiltCardV2,
  TiltCard,
  TiltCardsV2Example,
  type TiltCardV2Props,
} from './TiltCardV2';

// Reveal System
export {
  useRevealObserver,
  RevealGridExample,
  REVEAL_CSS_V2,
  type RevealOptions,
} from './Reveal';

// P1 — Brand & Depth Components
export {
  LiquidBackground,
  MESH_GRADIENT_CSS,
  type LiquidBackgroundProps,
} from './LiquidBackground';

export {
  SharedOverlayProvider,
  useSharedOverlay,
  SharedImage,
  CardThumbnail,
  type SharedImageProps,
  type CardThumbnailProps,
} from './SharedElement';

export {
  useCursorMagnet,
  MagneticButton,
  type UseCursorMagnetOptions,
  type MagneticButtonProps,
} from './MagneticButton';

export {
  useAnimationBudgetV2,
  AnimationBudgetDisplay,
  type BudgetV2,
  type UseAnimationBudgetV2Options,
} from './AnimationBudget';

export {
  AnimationBudgetManager,
  useShouldAnimate,
  useAdaptiveAnimationProps,
} from './AnimationBudgetManager';

// P1 — Utilities
export {
  EASING,
  springPreset,
  useHaptics,
  CommandPaletteFrame,
  ConfettiBurst,
  CONFETTI_CSS,
  type CommandPaletteFrameProps,
  type ConfettiBurstProps,
} from './Utilities';

// P2 — Finish & Finesse
export {
  CommandPalette,
  useCommandPalette,
  CommandPaletteWrapper,
  type Command,
  type CommandPaletteProps,
} from './CommandPalette';

export {
  ConfettiPhysics,
  CONFETTI_PRESETS,
  type ConfettiPhysicsProps,
} from './ConfettiPhysics';

export {
  AnimatedContainer,
  AnimatedItem,
  AnimatedGrid,
  AnimatedList,
  LayoutAnimationsExample,
  fadeInVariants,
  slideUpVariants,
  slideDownVariants,
  slideLeftVariants,
  slideRightVariants,
  scaleInVariants,
  staggerContainerVariants,
  type AnimatedContainerProps,
  type AnimatedItemProps,
  type AnimatedGridProps,
  type AnimatedListProps,
} from './LayoutAnimations';

// Motion Suite (Refactored)
export {
  EASE,
  VARIANTS,
  AnimatedContainer as MotionContainer,
  AnimatedItem as MotionItem,
  AnimatedGrid as MotionGrid,
  AnimatedList as MotionList,
  LiquidBlob,
  LiquidBackdrop,
  MultiBlobBackdrop,
  useHapticFeedback,
  useSound,
  MicroInteractionButton as MotionButton,
  MicroInteractionCard as MotionCard,
  ConfettiPhysics as MotionConfetti,
  BLOB_SHAPES,
  GRADIENT_PRESETS,
  type AnimatedContainerProps as MotionContainerProps,
  type AnimatedItemProps as MotionItemProps,
  type AnimatedGridProps as MotionGridProps,
  type AnimatedListProps as MotionListProps,
  type LiquidBlobProps,
  type MicroInteractionButtonProps as MotionButtonProps,
  type MicroInteractionCardProps as MotionCardProps,
  type ConfettiPhysicsProps as MotionConfettiProps,
  type VibratePattern,
  type HapticFeedbackMap,
} from './MotionSuite';

export {
  useSoundKit,
  SoundToggle,
  SoundButton,
  type SoundKitOptions,
  type Sound,
} from './SoundKit';

// Phase 3: Enhanced Shared Element Transitions (Hero animations)
export {
  SharedElementProvider,
  useSharedElement,
  SharedElement,
  HeroSharedElement,
  SharedElementGrid,
  type SharedElementProps,
  type HeroSharedElementProps,
  type SharedElementGridProps,
} from './SharedElementHero';

// Phase 4: Advanced Liquid & Morphing Effects
export {
  LiquidMorph,
  LiquidComposition,
  LIQUID_PRESETS,
  type LiquidMorphProps,
  type LiquidCompositionProps,
} from './LiquidMorph';

// Phase 5: Ultra 3D Effects & Parallax
export {
  Parallax3D,
  Transform3D,
  PARALLAX_3D_PRESETS,
  type Parallax3DProps,
  type Parallax3DLayer,
  type Transform3DProps,
} from './Parallax3D';

// Phase 6: Kinetic Typography
export {
  KineticText,
  KineticTextSplit,
  KineticTextReveal,
  type KineticTextProps,
  type KineticTextSplitProps,
  type KineticTextRevealProps,
} from './KineticTypography';

// Phase 7: Advanced Micro-interactions
export {
  MicroInteractionButton,
  MicroInteractionCard,
  RippleEffect,
  useHapticFeedback,
  useSoundEffect,
  type MicroInteractionButtonProps,
  type MicroInteractionCardProps,
  type RippleEffectProps,
  type HapticFeedback,
  type SoundEffect,
} from './MicroInteractionsAdvanced';

// Phase 8: Ultra Page Transitions & Navigation
export {
  PageTransition,
  SharedLayout,
  getRouteTransition,
  PAGE_TRANSITIONS,
  type PageTransitionPreset,
  type PageTransitionProps,
  type SharedLayoutProps,
} from './PageTransitions';

// Phase 9: Advanced Shared Elements (New System)
export {
  SharedElementProvider as SharedElementProviderV2,
  useSharedElement as useSharedElementV2,
  SharedElement as SharedElementV2,
  HeroSharedElement as HeroSharedElementV2,
  SharedElementGrid as SharedElementGridV2,
} from './SharedElements';

// Phase 10: Scroll Reveals & Progressive Disclosure
export {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ProgressiveReveal,
  ParallaxReveal,
  useScrollReveal,
  type ScrollRevealOptions,
  type ScrollRevealProps,
  type StaggerContainerProps,
  type StaggerItemProps,
  type ProgressiveRevealProps,
  type ParallaxRevealProps,
} from './ScrollReveals';

// Phase 11: Presence Animations (Modals & Conditional UI)
export {
  Presence,
  HoverCard,
  Bounce,
  Pulse,
  Toast,
  Drawer,
  PRESENCE_PRESETS,
  type PresencePreset,
  type PresenceProps,
  type HoverCardProps,
  type BounceProps,
  type PulseProps,
  type ToastProps,
  type DrawerProps,
} from './Presence';

// Phase 12: Biometric Authentication
export {
  BiometricAuth,
  BiometricSetup,
  type BiometricAuthProps,
  type BiometricSetupProps,
} from './BiometricAuth';

// Legacy components (re-export all named exports)
export * from './LiquidBlob';
export * from './MicroInteractions';
export * from './PageTransition';
