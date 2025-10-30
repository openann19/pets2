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

