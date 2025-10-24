/**
 * 🎯 FOCUS MANAGEMENT UTILITIES
 * Comprehensive focus trap and management for modals, dialogs, and overlays
 * Ensures WCAG 2.1 AA compliance for keyboard navigation
 */
/**
 * Focus trap hook for modals and dialogs
 * Prevents focus from leaving the trapped element
 *
 * @param isActive - Whether the trap is currently active
 * @returns Ref to attach to the container element
 */
export declare function useFocusTrap<T extends HTMLElement>(isActive?: boolean): React.RefObject<T>;
/**
 * Hook to restore focus to a specific element when component unmounts
 * Useful for modals that should return focus to the trigger button
 */
export declare function useRestoreFocus(triggerRef?: React.RefObject<HTMLElement>): void;
/**
 * Hook to handle Escape key press
 * Common pattern for closing modals and dialogs
 */
export declare function useEscapeKey(callback: () => void, isActive?: boolean): void;
/**
 * Hook to manage focus order for custom components
 * Returns focusable elements and current focus index
 */
export declare function useFocusOrder<T extends HTMLElement>(containerRef: React.RefObject<T>): {
    getFocusableItems: () => HTMLElement[];
    focusNext: () => void;
    focusPrevious: () => void;
    focusFirst: () => void;
    focusLast: () => void;
};
/**
 * Hook to announce messages to screen readers
 * Uses ARIA live regions for dynamic content updates
 */
export declare function useScreenReaderAnnounce(): {
    announcement: string;
    announce: (message: string, _priority?: "polite" | "assertive") => void;
};
/**
 * Utility to check if element is visible and focusable
 */
export declare function isFocusable(element: HTMLElement): boolean;
/**
 * React import for useScreenReaderAnnounce hook
 */
import React from 'react';
//# sourceMappingURL=useFocusManagement.d.ts.map