import { z } from 'zod';

/**
 * Animation spring physics configuration.
 * Matches premium design specs: stiffness 300, damping 30.
 */
export const animationSpringConfigSchema = z.object({
  stiffness: z.number().int().min(1).default(300),
  damping: z.number().int().min(1).default(30),
  mass: z.number().int().min(1).default(1),
  overshootClamping: z.boolean().default(false),
  restDelta: z.number().min(0).default(0.01),
  restSpeed: z.number().min(0).default(0.01),
});

export type AnimationSpringConfig = z.infer<typeof animationSpringConfigSchema>;

/**
 * Supported animation types for PawfectMatch.
 */
export const animationTypeSchema = z.enum([
  'fade',
  'scale',
  'slide',
  'flip',
  'bounce',
  'stagger',
  'presence',
]);

export type AnimationType = z.infer<typeof animationTypeSchema>;

/**
 * Animation definition for UI components.
 */
export const animationDefinitionSchema = z.object({
  type: animationTypeSchema,
  spring: animationSpringConfigSchema,
  delay: z.number().min(0).default(0),
  duration: z.number().min(0).default(0.3), // Only used for non-spring fallback
  initial: z.record(z.any()).optional(),
  animate: z.record(z.any()).optional(),
  exit: z.record(z.any()).optional(),
  accessibilityLabel: z.string().min(1),
});

export type AnimationDefinition = z.infer<typeof animationDefinitionSchema>;

/**
 * Animation configuration interface with feature flags and component settings
 */
export interface AnimationConfig {
  enabled: boolean;
  spring: {
    default: AnimationSpringConfig;
    gentle: AnimationSpringConfig;
    bouncy: AnimationSpringConfig;
    stiff: AnimationSpringConfig;
  };
  timing: {
    fast: { duration: number };
    normal: { duration: number };
    slow: { duration: number };
  };
  buttons: {
    enabled: boolean;
    preset: 'default' | 'gentle' | 'bouncy' | 'stiff';
    hapticFeedback: boolean;
  };
  cards: {
    enabled: boolean;
    preset: 'default' | 'gentle' | 'bouncy' | 'stiff';
    parallax: boolean;
  };
  lists: {
    enabled: boolean;
    stagger: boolean;
    staggerDelay: number;
  };
  celebrations: {
    enabled: boolean;
    confetti: boolean;
    haptics: boolean;
  };
  mobile: {
    reducedMotion: boolean;
    performance: 'low' | 'medium' | 'high';
  };
  web: {
    reducedMotion: boolean;
    respectSystemPreferences: boolean;
  };
}

/**
 * Default animation configuration
 */
export const defaultAnimationConfig: AnimationConfig = {
  enabled: true,
  spring: {
    default: {
      stiffness: 300,
      damping: 30,
      mass: 1,
      overshootClamping: false,
      restDelta: 0.01,
      restSpeed: 0.01,
    },
    gentle: {
      stiffness: 200,
      damping: 25,
      mass: 1,
      overshootClamping: false,
      restDelta: 0.01,
      restSpeed: 0.01,
    },
    bouncy: {
      stiffness: 400,
      damping: 20,
      mass: 1,
      overshootClamping: false,
      restDelta: 0.01,
      restSpeed: 0.01,
    },
    stiff: {
      stiffness: 500,
      damping: 35,
      mass: 1,
      overshootClamping: true,
      restDelta: 0.01,
      restSpeed: 0.01,
    },
  },
  timing: {
    fast: { duration: 0.15 },
    normal: { duration: 0.3 },
    slow: { duration: 0.6 },
  },
  buttons: {
    enabled: true,
    preset: 'default',
    hapticFeedback: true,
  },
  cards: {
    enabled: true,
    preset: 'gentle',
    parallax: true,
  },
  lists: {
    enabled: true,
    stagger: true,
    staggerDelay: 0.05,
  },
  celebrations: {
    enabled: true,
    confetti: true,
    haptics: true,
  },
  mobile: {
    reducedMotion: false,
    performance: 'high',
  },
  web: {
    reducedMotion: false,
    respectSystemPreferences: true,
  },
};
