/**
 * Feature Flags Configuration
 * Controls which features are enabled in the mobile application
 * Keep in sync with server/src/config/flags.ts
 */

export const FLAGS = {
  // Go Live feature - controls streaming functionality
  // Backend infrastructure is ready with LiveKit integration
  // Can be disabled by setting EXPO_PUBLIC_FEATURE_GO_LIVE=false
  GO_LIVE: process.env.EXPO_PUBLIC_FEATURE_GO_LIVE !== "false", // Enable by default since implementation exists
  
  // Additional feature flags can be added here
  // PREMIUM_FEATURES: true,
  // BETA_FEATURES: false,
};

export default FLAGS;

