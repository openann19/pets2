/**
 * iOS Safe Area Utilities
 * Handles safe area insets for devices with notches, dynamic islands, and home indicators
 */
export interface SafeAreaInsets {
    top: number;
    right: number;
    bottom: number;
    left: number;
}
/**
 * Get current safe area insets from CSS environment variables
 */
export declare function getSafeAreaInsets(): SafeAreaInsets;
/**
 * Check if device has safe area insets (notch, dynamic island, etc.)
 */
export declare function hasSafeAreaInsets(): boolean;
/**
 * Check if device is iOS
 */
export declare function isIOS(): boolean;
/**
 * Check if device is Android
 */
export declare function isAndroid(): boolean;
/**
 * Check if device is mobile
 */
export declare function isMobile(): boolean;
/**
 * Get device type for responsive design
 */
export declare function getDeviceType(): 'mobile' | 'tablet' | 'desktop';
/**
 * CSS classes for safe area handling
 */
export declare const safeAreaClasses: {
    readonly top: "pt-[env(safe-area-inset-top)]";
    readonly bottom: "pb-[env(safe-area-inset-bottom)]";
    readonly left: "pl-[env(safe-area-inset-left)]";
    readonly right: "pr-[env(safe-area-inset-right)]";
    readonly all: "pt-[env(safe-area-inset-top)] pr-[env(safe-area-inset-right)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)]";
    readonly horizontal: "px-[env(safe-area-inset-left)] px-[env(safe-area-inset-right)]";
    readonly vertical: "py-[env(safe-area-inset-top)] py-[env(safe-area-inset-bottom)]";
};
/**
 * React hook for safe area insets
 */
export declare function useSafeAreaInsets(): SafeAreaInsets;
/**
 * React hook for device detection
 */
export declare function useDeviceDetection(): {
    isIOS: boolean;
    isAndroid: boolean;
    isMobile: boolean;
    deviceType: "mobile" | "tablet" | "desktop";
    hasSafeArea: boolean;
};
//# sourceMappingURL=safe-area.d.ts.map