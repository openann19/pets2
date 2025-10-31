/**
 * 🎛️ Remote UI Control Plane - Schema Definitions
 * Zod schemas for validating UIConfig objects
 * Used by both server (API validation) and mobile (client validation)
 */

import { z } from 'zod';

/**
 * Spacing scale tokens
 */
const spacingScaleSchema = z.object({
  xs: z.number().min(0).max(100),
  sm: z.number().min(0).max(200),
  md: z.number().min(0).max(300),
  lg: z.number().min(0).max(400),
  xl: z.number().min(0).max(500),
  '2xl': z.number().min(0).max(800),
  '3xl': z.number().min(0).max(1000),
  '4xl': z.number().min(0).max(1200),
});

/**
 * Radii scale tokens
 */
const radiiScaleSchema = z.object({
  none: z.number().min(0).max(0),
  xs: z.number().min(0).max(4),
  sm: z.number().min(0).max(8),
  md: z.number().min(0).max(12),
  lg: z.number().min(0).max(16),
  xl: z.number().min(0).max(24),
  '2xl': z.number().min(0).max(32),
  pill: z.number().min(0).max(9999),
  full: z.number().min(0).max(9999),
});

/**
 * Typography scale tokens
 */
const typographyScaleSchema = z.object({
  caption: z.object({
    size: z.number().min(10).max(20),
    lineHeight: z.number().min(12).max(28),
    weight: z.enum(['400', '500', '600', '700']),
  }),
  body: z.object({
    size: z.number().min(12).max(24),
    lineHeight: z.number().min(16).max(36),
    weight: z.enum(['400', '500', '600', '700']),
  }),
  h4: z.object({
    size: z.number().min(14).max(28),
    lineHeight: z.number().min(20).max(40),
    weight: z.enum(['400', '500', '600', '700']),
  }),
  h3: z.object({
    size: z.number().min(18).max(32),
    lineHeight: z.number().min(24).max(48),
    weight: z.enum(['400', '500', '600', '700']),
  }),
  h2: z.object({
    size: z.number().min(24).max(40),
    lineHeight: z.number().min(32).max(56),
    weight: z.enum(['400', '500', '600', '700']),
  }),
  h1: z.object({
    size: z.number().min(32).max(56),
    lineHeight: z.number().min(40).max(72),
    weight: z.enum(['400', '500', '600', '700']),
  }),
});

/**
 * Motion duration tokens
 */
const motionDurationSchema = z.object({
  xfast: z.number().min(0).max(200),
  fast: z.number().min(0).max(300),
  base: z.number().min(0).max(500),
  slow: z.number().min(0).max(800),
  xslow: z.number().min(0).max(1200),
});

/**
 * Easing curves (cubic bezier as array of 4 numbers)
 */
const cubicBezierSchema = z.tuple([z.number(), z.number(), z.number(), z.number()]);

const motionEasingSchema = z.object({
  standard: cubicBezierSchema,
  emphasized: cubicBezierSchema,
  decel: cubicBezierSchema,
  accel: cubicBezierSchema,
});

/**
 * Motion scale tokens
 */
const motionScaleSchema = z.object({
  pressed: z.number().min(0.5).max(1),
  lift: z.number().min(1).max(1.2),
});

/**
 * Motion opacity tokens
 */
const motionOpacitySchema = z.object({
  pressed: z.number().min(0).max(1),
  disabled: z.number().min(0).max(1),
  shimmer: z.number().min(0).max(1),
});

/**
 * Motion tokens
 */
const motionTokensSchema = z.object({
  duration: motionDurationSchema,
  easing: motionEasingSchema,
  scale: motionScaleSchema,
  opacity: motionOpacitySchema,
});

/**
 * Shadow tokens
 */
const shadowSchema = z.object({
  radius: z.number().min(0).max(50),
  offset: z.tuple([z.number(), z.number()]),
  opacity: z.number().min(0).max(1),
});

const shadowTokensSchema = z.object({
  '1': shadowSchema,
  '2': shadowSchema,
  '3': shadowSchema,
  '4': shadowSchema,
});

/**
 * Color tokens - semantic colors
 */
const colorTokensSchema = z.record(z.string(), z.string().regex(/^#[0-9A-Fa-f]{6}$/));

/**
 * Palette gradients
 */
const paletteGradientsSchema = z.record(
  z.string(),
  z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).min(2).max(4)
);

/**
 * Typography tokens
 */
const typographyTokensSchema = z.object({
  scale: typographyScaleSchema,
});

/**
 * Main tokens schema
 */
const tokensSchema = z.object({
  colors: colorTokensSchema,
  palette: z.object({
    gradients: paletteGradientsSchema,
  }),
  spacing: spacingScaleSchema,
  radii: radiiScaleSchema,
  typography: typographyTokensSchema,
  motion: motionTokensSchema,
  shadow: shadowTokensSchema,
});

/**
 * Micro-interactions schema
 */
const microInteractionsSchema = z.object({
  pressFeedback: z.object({
    enabled: z.boolean(),
    scale: z.number().min(0.5).max(1).optional(),
    durationMs: z.number().min(0).max(500).optional(),
    easing: cubicBezierSchema.optional(),
    haptic: z.enum(['none', 'light', 'medium', 'success']).optional(),
  }),
  successMorph: z.object({
    enabled: z.boolean(),
    durationMs: z.number().min(0).max(1000).optional(),
    haptic: z.enum(['success', 'none']).optional(),
  }),
  elasticPullToRefresh: z.object({
    enabled: z.boolean(),
    maxStretch: z.number().min(1).max(3).optional(),
  }),
  sharedElement: z.object({
    enabled: z.boolean(),
    durationMs: z.number().min(0).max(1000).optional(),
  }),
  confettiLite: z.object({
    enabled: z.boolean(),
    maxParticles: z.number().min(0).max(200).optional(),
    cooldownSec: z.number().min(0).max(60).optional(),
  }),
  shimmer: z.object({
    enabled: z.boolean(),
    sweepMs: z.number().min(500).max(3000).optional(),
    opacity: z.number().min(0).max(1).optional(),
  }),
  guards: z.object({
    respectReducedMotion: z.literal(true),
    lowEndDevicePolicy: z.enum(['skip', 'simplify', 'full']),
  }),
});

/**
 * Component variants schema
 */
const componentsSchema = z.object({
  button: z.object({
    variant: z.enum(['primary', 'secondary', 'ghost']),
    radius: z.enum(['sm', 'md', 'lg', 'xl']),
    elevation: z.enum(['1', '2', '3']),
  }),
  card: z.object({
    radius: z.enum(['lg', 'xl']),
    elevation: z.enum(['1', '2', '3']),
    imageFade: z.enum(['dominant-color', 'none']),
  }),
  chip: z.object({
    filled: z.boolean(),
  }),
  toast: z.object({
    position: z.enum(['top', 'bottom']),
    durationMs: z.number().min(1000).max(10000),
  }),
});

/**
 * Animation preset configuration (2025 enhancements)
 */
const animationPresetSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  spring: z.object({
    stiffness: z.number().min(1).max(1000),
    damping: z.number().min(1).max(100),
    mass: z.number().min(0.1).max(5),
    overshootClamping: z.boolean().optional(),
  }),
  timing: z.object({
    duration: z.number().min(0).max(2000),
    easing: cubicBezierSchema,
  }).optional(),
});

const visualEffectsSchema = z.object({
  // 3D Card Effects
  threeDCards: z.object({
    enabled: z.boolean(),
    tiltDegrees: z.number().min(0).max(30).optional(),
    depthShadow: z.boolean().optional(),
    gyroscopeTilt: z.boolean().optional(), // Gated by capabilities
    maxCards: z.number().min(1).max(10).optional(),
  }),
  // Particle Systems
  particles: z.object({
    enabled: z.boolean(),
    maxCount: z.number().min(0).max(200),
    confetti: z.object({
      enabled: z.boolean(),
      particleCount: z.number().min(10).max(200),
      colors: z.array(z.string()).min(2).max(10),
      duration: z.number().min(500).max(5000),
    }),
    hearts: z.object({
      enabled: z.boolean(),
      particleCount: z.number().min(5).max(50),
      spread: z.object({ min: z.number(), max: z.number() }),
    }),
    stars: z.object({
      enabled: z.boolean(),
      particleCount: z.number().min(5).max(50),
    }),
  }),
  // Glass Morphism
  glassMorphism: z.object({
    enabled: z.boolean(),
    blurIntensity: z.number().min(0).max(50),
    opacity: z.number().min(0).max(1),
    reflection: z.boolean().optional(),
    animated: z.boolean().optional(),
  }),
  // Isometric 2.5D
  isometric: z.object({
    enabled: z.boolean(),
    angle: z.number().min(0).max(90).optional(),
    depth: z.number().min(0).max(100).optional(),
  }),
  // Textured Realism
  texturedRealism: z.object({
    enabled: z.boolean(),
    softShadows: z.boolean().optional(),
    claymorphicShapes: z.boolean().optional(),
    gradientMeshes: z.boolean().optional(),
  }),
  // Three.js WebGL Effects
  threeJsEffects: z.object({
    enabled: z.boolean(),
    // Liquid Morphing Geometry
    liquidMorph: z.object({
      enabled: z.boolean(),
      intensity: z.number().min(0).max(3).optional(),
      speed: z.number().min(0).max(5).optional(),
      color1: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      color2: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }),
    // Galaxy Particle System
    galaxyParticles: z.object({
      enabled: z.boolean(),
      baseCount: z.number().min(0).max(100000).optional(),
      maxCount: z.number().min(0).max(100000).optional(),
      autoScale: z.boolean().optional(),
      qualityMultiplier: z.number().min(0).max(1).optional(),
    }),
    // Volumetric Portal
    volumetricPortal: z.object({
      enabled: z.boolean(),
      active: z.boolean().optional(),
      intensity: z.number().min(0).max(3).optional(),
      color1: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
      color2: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    }),
    // Global Settings
    global: z.object({
      safeMode: z.boolean().optional(),
      qualityTier: z.enum(['auto', 'low', 'mid', 'high']).optional(),
      dprCap: z.number().min(1).max(3).optional(),
      respectReducedMotion: z.boolean().optional(),
    }).optional(),
  }).optional(),
});

const typographyAnimationsSchema = z.object({
  // Animated Gradient Text
  gradientText: z.object({
    enabled: z.boolean(),
    animationSpeed: z.number().min(0.5).max(5),
    variants: z.array(z.enum(['primary', 'secondary', 'premium', 'neon', 'rainbow', 'holographic'])),
  }),
  // Kinetic Typography
  kinetic: z.object({
    enabled: z.boolean(),
    variants: z.array(z.enum(['bounce', 'wave', 'pulse', 'slide'])),
    intensity: z.enum(['subtle', 'medium', 'bold']).optional(),
  }),
  // Scroll Reveal Text
  scrollReveal: z.object({
    enabled: z.boolean(),
    offset: z.number().min(0).max(500).optional(),
    direction: z.enum(['up', 'down', 'left', 'right']).optional(),
  }),
  // Text Morphing
  morphing: z.object({
    enabled: z.boolean(),
    duration: z.number().min(200).max(2000).optional(),
  }),
});

const colorEnhancementsSchema = z.object({
  // Dynamic Color Adaptation
  dynamicColors: z.object({
    enabled: z.boolean(),
    timeOfDayShift: z.boolean().optional(),
    ambientLightAdaptation: z.boolean().optional(), // Future: camera-based
  }),
  // HDR/P3 Support
  hdr: z.object({
    enabled: z.boolean(),
    fallbackToSRGB: z.boolean().optional(),
    detectCapability: z.boolean().optional(),
  }),
  // Neon Accents
  neonAccents: z.object({
    enabled: z.boolean(),
    intensity: z.number().min(0).max(1),
    colors: z.array(z.string().regex(/^#[0-9A-Fa-f]{6}$/)).optional(),
  }),
  // Gradient Meshes
  gradientMeshes: z.object({
    enabled: z.boolean(),
    animated: z.boolean().optional(),
    rotationSpeed: z.number().min(0).max(10).optional(),
  }),
});

const scrollInteractionsSchema = z.object({
  // Multi-layer Parallax
  parallax: z.object({
    enabled: z.boolean(),
    layers: z.number().min(1).max(5).optional(),
    intensity: z.number().min(0).max(2).optional(),
  }),
  // Scroll-triggered Animations
  scrollTriggers: z.object({
    enabled: z.boolean(),
    offset: z.number().min(0).max(500).optional(),
    threshold: z.number().min(0).max(1).optional(),
  }),
  // Momentum-based Effects
  momentum: z.object({
    enabled: z.boolean(),
    bounce: z.boolean().optional(),
    friction: z.number().min(0).max(1).optional(),
  }),
  // Sticky Elements
  sticky: z.object({
    enabled: z.boolean(),
    transformOnStick: z.boolean().optional(),
  }),
});

const visualEnhancements2025Schema = z.object({
  preset: z.enum(['minimal', 'standard', 'premium', 'ultra', 'custom']),
  animations: z.object({
    enabled: z.boolean(),
    presets: z.array(animationPresetSchema).optional(),
    customPreset: animationPresetSchema.optional(),
  }),
  effects: visualEffectsSchema,
  typography: typographyAnimationsSchema,
  colors: colorEnhancementsSchema,
  scroll: scrollInteractionsSchema,
  performance: z.object({
    capabilityGating: z.boolean(),
    lowEndDevicePolicy: z.enum(['skip', 'simplify', 'full']),
    maxParticles: z.number().min(0).max(200),
    maxBlurRadius: z.number().min(0).max(50),
  }),
});

/**
 * Screen-specific configs
 */
const screenConfigSchema = z.object({
  Home: z
    .object({
      header: z.enum(['large-collapsible', 'compact']).optional(),
      sections: z.array(z.string()).optional(),
      enableParallax: z.boolean().optional(),
    })
    .optional(),
  Matches: z
    .object({
      sharedElement: z.boolean().optional(),
    })
    .optional(),
  Map: z
    .object({
      fabStyle: z.enum(['pill', 'circle']).optional(),
      showAR: z.boolean().optional(),
    })
    .optional(),
  Premium: z
    .object({
      shimmer: z.boolean().optional(),
      gleam: z.boolean().optional(),
    })
    .optional(),
});

/**
 * Audience targeting schema
 */
const audienceSchema = z
  .object({
    env: z.enum(['dev', 'stage', 'prod']).optional(),
    pct: z.number().min(0).max(100).optional(),
    countryAllow: z.array(z.string()).optional(),
  })
  .optional();

/**
 * Main UIConfig schema
 */
export const uiConfigSchema = z.object({
  version: z.string().regex(/^\d{4}\.\d{2}\.\d{2}(-[a-z]+\.\d+)?$/), // e.g., "2025.01.27-rc.2"
  status: z.enum(['draft', 'preview', 'staged', 'prod']),
  audience: audienceSchema,
  tokens: tokensSchema,
  microInteractions: microInteractionsSchema,
  components: componentsSchema,
  screens: screenConfigSchema,
  featureFlags: z.record(z.string(), z.boolean()),
  i18nOverrides: z.record(z.string(), z.string()).optional(),
  visualEnhancements2025: visualEnhancements2025Schema.optional(), // New 2025 enhancements
  meta: z.object({
    changelog: z.string(),
    createdBy: z.string(),
    createdAt: z.string(),
  }),
});

export type UIConfig = z.infer<typeof uiConfigSchema>;
export type Tokens = z.infer<typeof tokensSchema>;
export type MicroInteractions = z.infer<typeof microInteractionsSchema>;
export type Components = z.infer<typeof componentsSchema>;
export type Screens = z.infer<typeof screenConfigSchema>;
export type Audience = z.infer<typeof audienceSchema>;
export type VisualEnhancements2025 = z.infer<typeof visualEnhancements2025Schema>;
export type AnimationPreset = z.infer<typeof animationPresetSchema>;
export type VisualEffects = z.infer<typeof visualEffectsSchema>;
export type TypographyAnimations = z.infer<typeof typographyAnimationsSchema>;
export type ColorEnhancements = z.infer<typeof colorEnhancementsSchema>;
export type ScrollInteractions = z.infer<typeof scrollInteractionsSchema>;

