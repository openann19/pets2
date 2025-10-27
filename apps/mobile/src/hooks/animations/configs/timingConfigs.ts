/**
 * Timing Animation Configurations
 */

export const TIMING_CONFIGS = {
  fast: 150,
  standard: 300,
  slow: 500,
} as const;

export type TimingConfigKey = keyof typeof TIMING_CONFIGS;
