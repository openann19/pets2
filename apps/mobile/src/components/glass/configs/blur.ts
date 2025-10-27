/**
 * Glass Blur Intensity Configurations
 */

export const BLUR_CONFIGS = {
  light: 10,
  medium: 20,
  heavy: 40,
  ultra: 80,
} as const;

export type BlurIntensity = keyof typeof BLUR_CONFIGS;
