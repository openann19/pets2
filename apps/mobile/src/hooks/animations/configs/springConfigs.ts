/**
 * Spring Animation Configurations
 */

export const SPRING_CONFIGS = {
  standard: {
    damping: 20,
    stiffness: 400,
    mass: 0.8,
  },
  gentle: {
    damping: 25,
    stiffness: 300,
    mass: 1,
  },
  snappy: {
    damping: 15,
    stiffness: 500,
    mass: 0.6,
  },
  bouncy: {
    damping: 10,
    stiffness: 600,
    mass: 0.5,
  },
} as const;

export type SpringConfigKey = keyof typeof SPRING_CONFIGS;
