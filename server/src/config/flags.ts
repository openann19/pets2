/**
 * Feature Flags Configuration
 * Controls which features are enabled in the application
 */

export const FLAGS = {
  // Go Live feature - controls streaming functionality
  GO_LIVE: process.env.FEATURE_GO_LIVE !== 'false',
  
  // AI features
  aiEnabled: process.env.FLAG_AI_ENABLED === 'true',
  
  // Live streaming
  liveEnabled: process.env.FLAG_LIVE_ENABLED !== 'false',
  
  // Payments
  paymentsEnabled: process.env.FLAG_PAYMENTS_ENABLED !== 'false',
} as const;

export default FLAGS;

