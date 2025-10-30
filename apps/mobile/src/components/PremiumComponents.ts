
/**
 * 🎨 PAWFECTMATCH PREMIUM COMPONENTS INDEX (hardened)
 * - Explicit re-exports (better tree-shaking than `export *`)
 * - Variant types derived from data (no drift)
 * - DEV-gated `USAGE_EXAMPLES` to avoid prod bloat
 */

/////////////////////////
// CORE ELITE COMPONENTS
/////////////////////////
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
  getPremiumGradients,
  getPremiumShadows,
} from './EliteComponents';

/////////////////////////
// PREMIUM TYPOGRAPHY
/////////////////////////
export {
  GradientText,
  AnimatedText,
  PremiumHeading,
  PremiumBody,
  PremiumLabel,
  TEXT_GRADIENTS,
  TEXT_SHADOWS,
} from './PremiumTypography';

/////////////////////////
// GLASS MORPHISM
/////////////////////////
export {
  GLASS_CONFIGS,
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
} from './GlassMorphism';

/////////////////////////
// HOLOGRAPHIC EFFECTS
/////////////////////////
export {
  HOLOGRAPHIC_CONFIGS,
  HolographicContainer,
  HolographicCard,
  HolographicButton,
  HolographicText,
  ParticleEffect,
} from './HolographicEffects';

/////////////////////////
// GLOW & SHADOW SYSTEM
/////////////////////////
export {
  GLOW_SHADOW_CONFIGS,
  GlowContainer,
  ShadowContainer,
  NeonBorder,
  GlowingCard,
  PulsingGlow,
  MultiLayerShadow,
  FloatingShadow,
} from './GlowShadowSystem';

/////////////////////////
// PREMIUM ANIMATION HOOKS
/////////////////////////
// NOTE: Ensure ../hooks/usePremiumAnimations re-exports ALL of these,
// including `useShimmerEffect`. Otherwise import it from its concrete file.
export {
  PREMIUM_ANIMATIONS,
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  useGlowEffect,
  usePulseEffect,
  useFloatingEffect,
  useEntranceAnimation,
  useHapticFeedback,
  useStaggeredAnimation,
  usePageTransition,
  useLoadingAnimation,
  useParallaxEffect,
} from '../hooks/usePremiumAnimations';

/////////////////////////
// VARIANTS (typed)
/////////////////////////
export const COMPONENT_VARIANTS = {
  button: {
    primary: 'primary',
    secondary: 'secondary',
    ghost: 'ghost',
    glass: 'glass',
    holographic: 'holographic',
    neon: 'neon',
  },
  card: {
    default: 'default',
    glass: 'glass',
    holographic: 'holographic',
    glow: 'glow',
    '3d': '3d',
  },
  size: { sm: 'sm', md: 'md', lg: 'lg', xl: 'xl' },
  animation: { fadeIn: 'fadeIn', slideIn: 'slideIn', scaleIn: 'scaleIn', bounceIn: 'bounceIn' },
  gradient: {
    primary: 'primary',
    secondary: 'secondary',
    premium: 'premium',
    sunset: 'sunset',
    ocean: 'ocean',
    holographic: 'holographic',
    neon: 'neon',
    rainbow: 'rainbow',
    cyber: 'cyber',
    aurora: 'aurora',
  },
} as const;

// Strong, re-usable types for callers
export type ButtonVariant = keyof typeof COMPONENT_VARIANTS.button;
export type CardVariant = keyof typeof COMPONENT_VARIANTS.card;
export type SizeVariant = keyof typeof COMPONENT_VARIANTS.size;
export type AnimationVariant = keyof typeof COMPONENT_VARIANTS.animation;
export type GradientVariant = keyof typeof COMPONENT_VARIANTS.gradient;

/////////////////////////
// USAGE EXAMPLES (DEV ONLY)
/////////////////////////
export const USAGE_EXAMPLES =
  typeof __DEV__ !== 'undefined' && __DEV__
    ? ({
        premiumButton: `
<EliteButton
  title="Premium Action"
  variant="primary"
  size="lg"
  magnetic
  ripple
  glow
  shimmer
  onPress={() => console.log('Premium action!')}
/>`,
        glassCard: `
<EliteCard variant="glass" tilt magnetic shimmer entrance="fadeInUp">
  <PremiumHeading level={2} gradient="primary">Glass Card Title</PremiumHeading>
  <PremiumBody gradient="secondary">This is a premium glass card with 3D tilt effects.</PremiumBody>
</EliteCard>`,
        holographicContainer: `
<HolographicContainer variant="cyber" speed="fast" animated shimmer glow>
  <PremiumHeading level={1} gradient="holographic">Holographic Title</PremiumHeading>
</HolographicContainer>`,
        glowingCard: `
<GlowingCard glowColor="neon" shadowDepth="2xl" glowIntensity="heavy" animated>
  <GradientText gradient="neon" size="xl" glow>Glowing Content</GradientText>
</GlowingCard>`,
        staggeredContainer: `
<StaggeredContainer delay={100}>
  <FadeInUp delay={0}><EliteCard variant="glass">Card 1</EliteCard></FadeInUp>
  <FadeInUp delay={100}><EliteCard variant="glass">Card 2</EliteCard></FadeInUp>
  <FadeInUp delay={200}><EliteCard variant="glass">Card 3</EliteCard></FadeInUp>
</StaggeredContainer>`,
      } as const)
    : (undefined as unknown as {
        premiumButton: string;
        glassCard: string;
        holographicContainer: string;
        glowingCard: string;
        staggeredContainer: string;
      });

/////////////////////////
// FEATURES (data only)
/////////////////////////
export const PREMIUM_FEATURES = {
  buttonFeatures: [
    'Magnetic mouse tracking',
    'Ripple animations on press',
    'Glow effects with animated shadows',
    'Holographic variant with shimmer',
    'Glass morphism variant',
    'Loading states with animated spinners',
    'Haptic feedback integration',
    'Multiple size variants (sm, md, lg, xl)',
  ],
  cardFeatures: [
    '3D tilt effects with gyroscope support',
    'Glass morphism with backdrop blur',
    'Holographic variant with animated gradients',
    'Shimmer effects on hover',
    'Magnetic mouse tracking',
    'Entrance animations (fadeInUp, scaleIn, slideIn)',
    'Glow variants with colored shadows',
  ],
  animationFeatures: [
    'Spring physics configurations',
    'Staggered animations for lists',
    'Page transition animations',
    'Shared element transitions',
    'Loading skeleton animations',
    'Haptic feedback for interactions',
    'Sound effects integration',
    'Magnetic button effects',
    'Ripple animations on touch',
    'Tilt effects for cards',
  ],
  visualEffects: [
    'Glass morphism with backdrop blur',
    'Holographic animated gradients',
    'Colored shadows (primary, secondary, success, error)',
    'Animated glow effects with pulsing',
    'Neon border effects with glow',
    'Shadow depth system (sm, md, lg, xl, 2xl)',
    'Particle effects for premium screens',
  ],
  typographyFeatures: [
    'Gradient text effects using masks',
    'Text shadow effects for depth',
    'Animated text components with entrance animations',
    'Premium font weights (extrabold, black)',
    'Multiple gradient variants',
    'Shimmer text effects',
    'Glow text effects',
  ],
} as const;

/////////////////////////
// DEFAULT EXPORT
/////////////////////////
const PremiumIndex = {
  COMPONENT_VARIANTS,
  USAGE_EXAMPLES,
  PREMIUM_FEATURES,
};

export default PremiumIndex;
