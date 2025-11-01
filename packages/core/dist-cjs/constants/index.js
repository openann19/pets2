"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTINGS = exports.HAPTIC_SETTINGS = exports.HAPTICS = void 0;
exports.HAPTICS = {
    LIGHT_IMPACT: 'light-impact',
    MEDIUM_IMPACT: 'medium-impact',
    HEAVY_IMPACT: 'heavy-impact',
    SUCCESS: 'success-notification',
    WARNING: 'warning-notification',
    ERROR: 'error-notification',
};
exports.HAPTIC_SETTINGS = {
    ENABLED: 'haptic.enabled',
    INTENSITY: 'haptic.intensity',
    DURATION: 'haptic.duration',
    CUSTOM_ELEMENT: 'haptic.customElement',
};
exports.SETTINGS = {
    HAPTICS: exports.HAPTIC_SETTINGS,
    // Add other settings categories here
};
