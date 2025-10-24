/**
 * ♿ Comprehensive Accessibility Hook
 * Provides accessibility utilities and user preference detection
 */
interface AccessibilityState {
    isReducedMotion: boolean;
    isHighContrast: boolean;
    isScreenReader: boolean;
    isKeyboardUser: boolean;
    fontSize: 'small' | 'medium' | 'large' | 'xlarge';
    colorScheme: 'light' | 'dark' | 'auto';
}
interface AccessibilityActions {
    announce: (message: string, priority?: 'polite' | 'assertive') => void;
    focusElement: (element: HTMLElement | null) => void;
    trapFocus: (container: HTMLElement) => () => void;
    restoreFocus: () => void;
    saveFocus: () => void;
}
export declare const useAccessibility: () => AccessibilityState & AccessibilityActions;
export declare const useHaptics: () => {
    triggerHaptic: (intensity?: "light" | "medium" | "heavy") => void;
};
export declare const useSoundFeedback: () => {
    triggerSound: (type?: "hover" | "press" | "success" | "error") => void;
};
export declare const useColorContrast: () => {
    getContrastRatio: (color1: string, color2: string) => number;
    meetsWCAG: (ratio: number, level?: "AA" | "AAA") => boolean;
};
export {};
//# sourceMappingURL=useAccessibility.d.ts.map