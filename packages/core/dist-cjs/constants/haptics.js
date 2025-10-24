"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HAPTIC_DURATIONS = exports.HAPTIC_CLASSES = exports.HAPTICS = void 0;
// Cross-platform haptic feedback constants
exports.HAPTICS = {
    LIGHT_IMPACT: 'light-impact',
    MEDIUM_IMPACT: 'medium-impact',
    HEAVY_IMPACT: 'heavy-impact',
    SUCCESS: 'success-notification',
    WARNING: 'warning-notification',
    ERROR: 'error-notification'
};
exports.HAPTIC_CLASSES = {
    light: 'haptic-light',
    medium: 'haptic-medium',
    heavy: 'haptic-heavy',
    success: 'haptic-success',
    warning: 'haptic-warning',
    error: 'haptic-error',
    selection: 'haptic-selection',
};
// CSS animation durations in ms
exports.HAPTIC_DURATIONS = {
    impact: 300,
    notification: 300,
    selection: 200,
};
//# sourceMappingURL=haptics.js.map