'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const AccessibilityContext = createContext(undefined);
export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
export function AccessibilityProvider({ children }) {
    const [reducedMotion, setReducedMotion] = useState(false);
    const [highContrast, setHighContrast] = useState(false);
    const [focusVisible, setFocusVisible] = useState(false);
    useEffect(() => {
        // Reduced motion
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(motionQuery.matches);
        const handleMotionChange = (e) => { setReducedMotion(e.matches); };
        motionQuery.addEventListener('change', handleMotionChange);
        // High contrast
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        setHighContrast(contrastQuery.matches);
        const handleContrastChange = (e) => { setHighContrast(e.matches); };
        contrastQuery.addEventListener('change', handleContrastChange);
        // Focus visible
        const handleFocusIn = () => { setFocusVisible(true); };
        const handleMouseDown = () => { setFocusVisible(false); };
        document.addEventListener('keydown', handleFocusIn);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            motionQuery.removeEventListener('change', handleMotionChange);
            contrastQuery.removeEventListener('change', handleContrastChange);
            document.removeEventListener('keydown', handleFocusIn);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);
    const announceToScreenReader = (message, priority = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    };
    const classes = [
        reducedMotion ? 'motion-reduce' : '',
        highContrast ? 'contrast-high' : '',
        focusVisible ? 'focus-visible' : '',
    ].filter(Boolean).join(' ');
    const value = {
        reducedMotion,
        highContrast,
        focusVisible,
        announceToScreenReader,
    };
    return (<AccessibilityContext.Provider value={value}>
      <div className={classes}>
        {/* Skip to content link */}
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded z-50 focus:ring-2 focus:ring-blue-300 focus:outline-none" aria-label="Skip to main content">
          Skip to main content
        </a>

        {/* Screen reader announcements */}
        <div aria-live="polite" aria-atomic="true" className="sr-only" id="sr-announcements" role="status"/>

        {children}
      </div>
    </AccessibilityContext.Provider>);
}
//# sourceMappingURL=AccessibilityContext.jsx.map