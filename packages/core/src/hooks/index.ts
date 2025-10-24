/**
 * Shared React Hooks
 * Platform-agnostic hooks for web and mobile
 */

// Export hooks that are available
export * from './useFocusTrap';
export * from './useGesture';
export * from './useKeyboardShortcut';
// export * from './useSwipeLogic'; // Removed due to missing dependencies

// Analytics and tracking hooks
export * from './useUserAnalytics';
export * from './useMatchAnalytics';
export * from './useEventTracking';

// Real-time communication hooks
export * from './useRealtimeSocket';
