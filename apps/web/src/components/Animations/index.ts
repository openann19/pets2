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

export {
  useSoundKit,
  SoundToggle,
  SoundButton,
  type SoundKitOptions,
  type Sound,
} from './SoundKit';

// Legacy components (re-export all named exports)
export * from './LiquidBlob';
export * from './MicroInteractions';
export * from './PageTransition';
