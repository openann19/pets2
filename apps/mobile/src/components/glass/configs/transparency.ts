/**
 * Glass Transparency Levels
 */

export const TRANSPARENCY_CONFIGS = {
  light: 0.1,
  medium: 0.2,
  heavy: 0.3,
  ultra: 0.5,
} as const;

export type TransparencyLevel = keyof typeof TRANSPARENCY_CONFIGS;

