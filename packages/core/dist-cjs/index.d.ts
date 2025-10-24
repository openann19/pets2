/**
 * PawfectMatch Core - Shared Business Logic
 * Rule II.1: Pure, platform-agnostic TypeScript logic
 * Shared between web (React) and mobile (React Native)
 */
export * from './schemas';
export * from './types';
export * from './types/haptics';
export { HAPTICS, HAPTIC_SETTINGS, SETTINGS } from './constants';
export { animationConfig, useAnimationConfig } from './services/animationConfig';
export * from './types/animations';
export * from './utils';
export * from './utils/env';
export * from './stores';
export { AccountService } from './services/AccountService';
export { errorHandler } from './services/ErrorHandler';
export * from './featureFlags';
export * from './api';
export { useFocusTrap, useGesture, useKeyboardShortcut, useEventTracking, useRealtimeSocket } from './hooks';
export * from './mappers';
export declare const _VERSION = "1.0.0";
//# sourceMappingURL=index.d.ts.map