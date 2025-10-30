/**
 * PawfectMatch Core - Shared Business Logic
 * Rule II.1: Pure, platform-agnostic TypeScript logic
 * Shared between web (React) and mobile (React Native)
 */

// Export all types
export * from './schemas';
export * from './types';
export * from './types/haptics';

// Export constants
export { HAPTICS, HAPTIC_SETTINGS, SETTINGS } from './constants';

// Export animation configuration
export { animationConfig, useAnimationConfig } from './services/animationConfig';
export * from './types/animations';

// Export utility functions
export * from './utils';
export * from './utils/env';

// Export logger specifically for web app
export {
  logger,
  apiLogger,
  authLogger,
  uiLogger,
  navigationLogger,
  storageLogger,
  analyticsLogger,
  notificationLogger,
  mediaLogger,
} from './utils/logger';

// Export global state stores
export * from './stores';

// Export services (logger from utils only to avoid conflicts)
export { AccountService } from './services/AccountService';
export { errorHandler } from './services/ErrorHandler';

// Export feature flags via root to support public consumption
export * from './featureFlags';

// Export API client and hooks
export * from './api';
// Note: useMatchAnalytics and useUserAnalytics exported from ./api, not ./hooks to avoid duplication
export {
  useFocusTrap,
  useGesture,
  useKeyboardShortcut,
  useEventTracking,
  useRealtimeSocket,
} from './hooks';

// Export mappers
export * from './mappers';

// Version
export const _VERSION = '1.0.0';
