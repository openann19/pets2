export type HapticIntensity = 'light-impact' | 'medium-impact' | 'heavy-impact';
export type NotificationType = 'success-notification' | 'warning-notification' | 'error-notification';
export type HapticType = HapticIntensity | NotificationType;

// Cross-platform haptic feedback constants
export const HAPTICS = {
    LIGHT_IMPACT: 'light-impact',
    MEDIUM_IMPACT: 'medium-impact',
    HEAVY_IMPACT: 'heavy-impact',
    SUCCESS: 'success-notification',
    WARNING: 'warning-notification',
    ERROR: 'error-notification'
} as const;

export const HAPTIC_CLASSES = {
    light: 'haptic-light',
    medium: 'haptic-medium',
    heavy: 'haptic-heavy',
    success: 'haptic-success',
    warning: 'haptic-warning',
    error: 'haptic-error',
    selection: 'haptic-selection',
} as const;

// CSS animation durations in ms
export const HAPTIC_DURATIONS = {
    impact: 300,
    notification: 300,
    selection: 200,
} as const;