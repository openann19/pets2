/**
 * 🎯 FOUNDATION: INDEX
 * 
 * Central exports for foundation utilities
 */

export { useReducedMotion, rm } from './reduceMotion';
export { useVsyncRate, classifyRefreshRate } from './useVsyncRate';
export { useQualityTier } from './quality/useQualityTier';
export type { QualityTier, QualityProfile } from './quality/useQualityTier';
export { useFlags, FeatureFlagsProvider } from './flags/FeatureFlagsProvider';
export type { FeatureFlagsProviderProps } from './flags/FeatureFlagsProvider';
export { useFlag } from './flags/useFlag';
export type { Flags } from './flags/flags';

