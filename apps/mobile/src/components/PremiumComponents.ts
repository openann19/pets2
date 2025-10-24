import { logger } from "@pawfectmatch/core";

/**
 * 🎨 PAWFECTMATCH PREMIUM COMPONENTS INDEX
 *
 * This file exports all premium components and systems for the mobile app.
 * Import from this file to get access to all premium UI components.
 */

// === CORE ELITE COMPONENTS ===
export {
  EliteContainer,
  EliteScrollContainer,
  EliteHeader,
  ElitePageHeader,
  EliteCard,
  EliteButton,
  EliteLoading,
  EliteEmptyState,
  EliteAvatar,
  // Advanced Animation Components
  FadeInUp,
  ScaleIn,
  StaggeredContainer,
  GestureWrapper,
  // Premium Gradients and Shadows
  PREMIUM_GRADIENTS,
  PREMIUM_SHADOWS,
} from "./EliteComponents";

// === PREMIUM TYPOGRAPHY SYSTEM ===
export {
  GradientText,
  AnimatedText,
  PremiumHeading,
  PremiumBody,
  PremiumLabel,
  TEXT_GRADIENTS,
  TEXT_SHADOWS,
} from "./PremiumTypography";

// === GLASS MORPHISM SYSTEM ===
export {
  GLASS_CONFIGS,
  GlassContainer,
  GlassCard,
  GlassButton,
  GlassHeader,
  GlassModal,
  GlassNavigation,
} from "./GlassMorphism";

// === HOLOGRAPHIC EFFECTS SYSTEM ===
export {
  HOLOGRAPHIC_CONFIGS,
  HolographicContainer,
  HolographicCard,
  HolographicButton,
  HolographicText,
  ParticleEffect,
} from "./HolographicEffects";

// === GLOW & SHADOW SYSTEM ===
export {
  GLOW_SHADOW_CONFIGS,
  GlowContainer,
  ShadowContainer,
  NeonBorder,
  GlowingCard,
  PulsingGlow,
  MultiLayerShadow,
  FloatingShadow,
} from "./GlowShadowSystem";

// === PREMIUM ANIMATION HOOKS ===
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
} from "../hooks/usePremiumAnimations";

// === COMPONENT VARIANTS ===
export const COMPONENT_VARIANTS = {
  // Button variants
  button: {
    primary: "primary",
    secondary: "secondary",
    ghost: "ghost",
    glass: "glass",
    holographic: "holographic",
    neon: "neon",
  },

  // Card variants
  card: {
    default: "default",
    glass: "glass",
    holographic: "holographic",
    glow: "glow",
    "3d": "3d",
  },

  // Size variants
  size: {
    sm: "sm",
    md: "md",
    lg: "lg",
    xl: "xl",
  },

  // Animation variants
  animation: {
    fadeIn: "fadeIn",
    slideIn: "slideIn",
    scaleIn: "scaleIn",
    bounceIn: "bounceIn",
  },

  // Gradient variants
  gradient: {
    primary: "primary",
    secondary: "secondary",
    premium: "premium",
    sunset: "sunset",
    ocean: "ocean",
    holographic: "holographic",
    neon: "neon",
    rainbow: "rainbow",
    cyber: "cyber",
    aurora: "aurora",
  },
} as const;

// === USAGE EXAMPLES ===
export const USAGE_EXAMPLES = {
  // Premium Button with all effects
  premiumButton: `
    <EliteButton
      title="Premium Action"
      variant="holographic"
      size="lg"
      magnetic={true}
      ripple={true}
      glow={true}
      shimmer={true}
      onPress={() => logger.info('Premium action!')}
    />
  `,

  // Glass Card with 3D tilt
  glassCard: `
    <EliteCard
      variant="glass"
      tilt={true}
      magnetic={true}
      shimmer={true}
      entrance="fadeInUp"
    >
      <PremiumHeading level={2} gradient="primary">
        Glass Card Title
      </PremiumHeading>
      <PremiumBody gradient="secondary">
        This is a premium glass card with 3D tilt effects.
      </PremiumBody>
    </EliteCard>
  `,

  // Holographic Container
  holographicContainer: `
    <HolographicContainer
      variant="cyber"
      speed="fast"
      animated={true}
      shimmer={true}
      glow={true}
    >
      <PremiumHeading level={1} gradient="holographic">
        Holographic Title
      </PremiumHeading>
    </HolographicContainer>
  `,

  // Glowing Card with Animation
  glowingCard: `
    <GlowingCard
      glowColor="neon"
      shadowDepth="2xl"
      glowIntensity="heavy"
      animated={true}
    >
      <GradientText gradient="neon" size="xl" glow={true}>
        Glowing Content
      </GradientText>
    </GlowingCard>
  `,

  // Staggered Animation Container
  staggeredContainer: `
    <StaggeredContainer delay={100}>
      <FadeInUp delay={0}>
        <EliteCard variant="glass">Card 1</EliteCard>
      </FadeInUp>
      <FadeInUp delay={100}>
        <EliteCard variant="glass">Card 2</EliteCard>
      </FadeInUp>
      <FadeInUp delay={200}>
        <EliteCard variant="glass">Card 3</EliteCard>
      </FadeInUp>
    </StaggeredContainer>
  `,
} as const;

// === PREMIUM FEATURES SUMMARY ===
export const PREMIUM_FEATURES = {
  // Enhanced Button Features
  buttonFeatures: [
    "Magnetic mouse tracking",
    "Ripple animations on press",
    "Glow effects with animated shadows",
    "Holographic variant with shimmer",
    "Glass morphism variant",
    "Loading states with animated spinners",
    "Haptic feedback integration",
    "Multiple size variants (sm, md, lg, xl)",
  ],

  // Enhanced Card Features
  cardFeatures: [
    "3D tilt effects with gyroscope support",
    "Glass morphism with backdrop blur",
    "Holographic variant with animated gradients",
    "Shimmer effects on hover",
    "Magnetic mouse tracking",
    "Entrance animations (fadeInUp, scaleIn, slideIn)",
    "Glow variants with colored shadows",
  ],

  // Animation System Features
  animationFeatures: [
    "Spring physics configurations",
    "Staggered animations for lists",
    "Page transition animations",
    "Shared element transitions",
    "Loading skeleton animations",
    "Haptic feedback for interactions",
    "Sound effects integration",
    "Magnetic button effects",
    "Ripple animations on touch",
    "Tilt effects for cards",
  ],

  // Visual Effects Features
  visualEffects: [
    "Glass morphism with backdrop blur",
    "Holographic animated gradients",
    "Colored shadows (primary, secondary, success, error)",
    "Animated glow effects with pulsing",
    "Neon border effects with glow",
    "Shadow depth system (sm, md, lg, xl, 2xl)",
    "Particle effects for premium screens",
  ],

  // Typography Features
  typographyFeatures: [
    "Gradient text effects using masks",
    "Text shadow effects for depth",
    "Animated text components with entrance animations",
    "Premium font weights (extrabold, black)",
    "Multiple gradient variants",
    "Shimmer text effects",
    "Glow text effects",
  ],
} as const;

export default {
  COMPONENT_VARIANTS,
  USAGE_EXAMPLES,
  PREMIUM_FEATURES,
};
