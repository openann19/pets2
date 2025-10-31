/**
 * Feature Flags Configuration
 * Controls which features are enabled in the mobile application
 * Keep in sync with server/src/config/flags.ts
 */

export type UIFlags = {
  'ui.backdropBlur': boolean;
  'ui.backdropBlur.amount': number; // 0..100 (we'll map to each platform)
  'ui.backdropBlur.tint': 'light' | 'dark' | 'regular' | 'prominent';
};

export const DEFAULT_UI_FLAGS: UIFlags = {
  'ui.backdropBlur': process.env.EXPO_PUBLIC_UI_BACKDROP_BLUR !== 'false',
  'ui.backdropBlur.amount': Number.parseInt(process.env.EXPO_PUBLIC_UI_BACKDROP_BLUR_AMOUNT || '24', 10),
  'ui.backdropBlur.tint': (process.env.EXPO_PUBLIC_UI_BACKDROP_BLUR_TINT || 'dark') as UIFlags['ui.backdropBlur.tint'],
};

export const FLAGS = {
  // Go Live feature - controls streaming functionality
  // Backend infrastructure is ready with LiveKit integration
  // Can be disabled by setting EXPO_PUBLIC_FEATURE_GO_LIVE=false
  GO_LIVE: process.env.EXPO_PUBLIC_FEATURE_GO_LIVE !== 'false', // Enable by default since implementation exists

  // Additional feature flags can be added here
  // PREMIUM_FEATURES: true,
  // BETA_FEATURES: false,
};

export default FLAGS;
