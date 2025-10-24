/**
 * Mobile Accessibility Utilities
 * Enhanced accessibility features for mobile devices including screen readers and keyboard navigation
 */
export interface AccessibilityConfig {
    enableScreenReader: boolean;
    enableKeyboardNavigation: boolean;
    enableVoiceControl: boolean;
    enableHighContrast: boolean;
    enableReducedMotion: boolean;
    enableLargeText: boolean;
}
export interface AccessibilityState {
    isScreenReaderActive: boolean;
    isKeyboardNavigationActive: boolean;
    isVoiceControlActive: boolean;
    isHighContrastMode: boolean;
    isReducedMotionMode: boolean;
    isLargeTextMode: boolean;
    currentFocusIndex: number;
    focusableElements: HTMLElement[];
}
/**
 * Hook for managing mobile accessibility features
 */
export declare function useMobileAccessibility(config?: Partial<AccessibilityConfig>): {
    state: AccessibilityState;
    updateFocusableElements: () => void;
};
/**
 * Hook for keyboard navigation management
 */
export declare function useKeyboardNavigation(): {
    currentIndex: number;
    focusElement: (index: number) => void;
    updateFocusableElements: () => void;
};
/**
 * Hook for screen reader announcements
 */
export declare function useScreenReaderAnnouncements(): {
    announce: (message: string, priority?: "polite" | "assertive") => void;
    announcePageChange: (pageTitle: string) => void;
    announceError: (errorMessage: string) => void;
    announceSuccess: (successMessage: string) => void;
    announceLoading: (loadingMessage: string) => void;
};
/**
 * Hook for voice control integration
 */
export declare function useVoiceControl(): {
    isListening: boolean;
    transcript: string;
    startListening: () => void;
    stopListening: () => void;
    clearTranscript: () => void;
};
/**
 * Utility functions for accessibility enhancements
 */
export declare const accessibilityUtils: {
    addSkipLinks: () => void;
    enhanceFocusIndicators: () => void;
    addHighContrastSupport: () => void;
    addReducedMotionSupport: () => void;
    addLargeTextSupport: () => void;
};
//# sourceMappingURL=mobile-accessibility.d.ts.map