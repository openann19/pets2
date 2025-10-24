/**
 * 🎯 FOCUS MANAGEMENT UTILITIES
 * Comprehensive focus trap and management for modals, dialogs, and overlays
 * Ensures WCAG 2.1 AA compliance for keyboard navigation
 */
import { useCallback, useEffect, useRef } from 'react';
/**
 * Focus trap hook for modals and dialogs
 * Prevents focus from leaving the trapped element
 *
 * @param isActive - Whether the trap is currently active
 * @returns Ref to attach to the container element
 */
export function useFocusTrap(isActive = true) {
    const ref = useRef(null);
    useEffect(() => {
        if (!isActive || !ref.current)
            return;
        const element = ref.current;
        const focusableElements = getFocusableElements(element);
        if (focusableElements.length === 0)
            return;
        // Store the previously focused element to restore later
        const previouslyFocused = document.activeElement;
        // Focus the first element
        focusableElements[0]?.focus();
        /**
         * Handle Tab key to trap focus within the element
         */
        const handleKeyDown = (event) => {
            if (event.key !== 'Tab')
                return;
            const focusableElements = getFocusableElements(element);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];
            if (event.shiftKey) {
                // Shift + Tab: Move backwards
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement?.focus();
                }
            }
            else {
                // Tab: Move forwards
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement?.focus();
                }
            }
        };
        element.addEventListener('keydown', handleKeyDown);
        // Cleanup: Remove listener and restore focus
        return () => {
            element.removeEventListener('keydown', handleKeyDown);
            previouslyFocused?.focus();
        };
    }, [isActive]);
    return ref;
}
/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container) {
    const selector = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
    ].join(', ');
    return Array.from(container.querySelectorAll(selector)).filter((el) => {
        // Filter out hidden elements
        return el.offsetParent !== null;
    });
}
/**
 * Hook to restore focus to a specific element when component unmounts
 * Useful for modals that should return focus to the trigger button
 */
export function useRestoreFocus(triggerRef) {
    useEffect(() => {
        const previouslyFocused = document.activeElement;
        return () => {
            // Restore focus to trigger or previously focused element
            if (triggerRef?.current) {
                triggerRef.current.focus();
            }
            else {
                previouslyFocused?.focus();
            }
        };
    }, [triggerRef]);
}
/**
 * Hook to handle Escape key press
 * Common pattern for closing modals and dialogs
 */
export function useEscapeKey(callback, isActive = true) {
    useEffect(() => {
        if (!isActive)
            return;
        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                callback();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [callback, isActive]);
}
/**
 * Hook to manage focus order for custom components
 * Returns focusable elements and current focus index
 */
export function useFocusOrder(containerRef) {
    const getFocusableItems = useCallback(() => {
        if (!containerRef.current)
            return [];
        return getFocusableElements(containerRef.current);
    }, [containerRef]);
    const focusNext = useCallback(() => {
        const elements = getFocusableItems();
        const currentIndex = elements.findIndex((el) => el === document.activeElement);
        const nextIndex = (currentIndex + 1) % elements.length;
        elements[nextIndex]?.focus();
    }, [getFocusableItems]);
    const focusPrevious = useCallback(() => {
        const elements = getFocusableItems();
        const currentIndex = elements.findIndex((el) => el === document.activeElement);
        const previousIndex = (currentIndex - 1 + elements.length) % elements.length;
        elements[previousIndex]?.focus();
    }, [getFocusableItems]);
    const focusFirst = useCallback(() => {
        const elements = getFocusableItems();
        elements[0]?.focus();
    }, [getFocusableItems]);
    const focusLast = useCallback(() => {
        const elements = getFocusableItems();
        elements[elements.length - 1]?.focus();
    }, [getFocusableItems]);
    return {
        getFocusableItems,
        focusNext,
        focusPrevious,
        focusFirst,
        focusLast,
    };
}
/**
 * Hook to announce messages to screen readers
 * Uses ARIA live regions for dynamic content updates
 */
export function useScreenReaderAnnounce() {
    const [announcement, setAnnouncement] = React.useState('');
    const timeoutRef = useRef(undefined);
    const announce = useCallback((message, _priority = 'polite') => {
        // Clear previous announcement
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setAnnouncement(message);
        // Clear announcement after it's been read
        timeoutRef.current = setTimeout(() => {
            setAnnouncement('');
        }, 1000);
    }, []);
    return {
        announcement,
        announce,
    };
}
/**
 * Utility to check if element is visible and focusable
 */
export function isFocusable(element) {
    if (element.offsetParent === null)
        return false;
    if (element.hasAttribute('disabled'))
        return false;
    if (element.getAttribute('aria-hidden') === 'true')
        return false;
    const tabIndex = element.getAttribute('tabindex');
    if (tabIndex === '-1')
        return false;
    return true;
}
/**
 * React import for useScreenReaderAnnounce hook
 */
import React from 'react';
//# sourceMappingURL=useFocusManagement.js.map