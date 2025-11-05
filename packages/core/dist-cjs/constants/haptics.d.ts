export type HapticIntensity = 'light-impact' | 'medium-impact' | 'heavy-impact';
export type NotificationType = 'success-notification' | 'warning-notification' | 'error-notification';
export type HapticType = HapticIntensity | NotificationType;
export declare const HAPTICS: {
    readonly LIGHT_IMPACT: "light-impact";
    readonly MEDIUM_IMPACT: "medium-impact";
    readonly HEAVY_IMPACT: "heavy-impact";
    readonly SUCCESS: "success-notification";
    readonly WARNING: "warning-notification";
    readonly ERROR: "error-notification";
};
export declare const HAPTIC_CLASSES: {
    readonly light: "haptic-light";
    readonly medium: "haptic-medium";
    readonly heavy: "haptic-heavy";
    readonly success: "haptic-success";
    readonly warning: "haptic-warning";
    readonly error: "haptic-error";
    readonly selection: "haptic-selection";
};
export declare const HAPTIC_DURATIONS: {
    readonly impact: 300;
    readonly notification: 300;
    readonly selection: 200;
};
