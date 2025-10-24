'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
const AccessibilityContext = createContext(null);
export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (!context) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
export function AccessibilityProvider({ children }) {
    const [state, setState] = useState({
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium',
        screenReader: false,
        keyboardNavigation: false,
        focusVisible: false,
    });
    // Initialize accessibility preferences from system and localStorage
    useEffect(() => {
        // Check system preferences
        const mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        const mediaQueryHighContrast = window.matchMedia('(prefers-contrast: high)');
        // Check localStorage for user preferences
        const savedReducedMotion = localStorage.getItem('accessibility-reduced-motion') === 'true';
        const savedHighContrast = localStorage.getItem('accessibility-high-contrast') === 'true';
        const savedFontSize = localStorage.getItem('accessibility-font-size') || 'medium';
        const savedScreenReader = localStorage.getItem('accessibility-screen-reader') === 'true';
        const savedKeyboardNavigation = localStorage.getItem('accessibility-keyboard-navigation') === 'true';
        setState({
            reducedMotion: savedReducedMotion || mediaQueryReducedMotion.matches,
            highContrast: savedHighContrast || mediaQueryHighContrast.matches,
            fontSize: savedFontSize,
            screenReader: savedScreenReader,
            keyboardNavigation: savedKeyboardNavigation,
            focusVisible: false,
        });
        // Listen for system preference changes
        const handleReducedMotionChange = (e) => {
            if (!localStorage.getItem('accessibility-reduced-motion')) {
                setState(prev => ({ ...prev, reducedMotion: e.matches }));
            }
        };
        const handleHighContrastChange = (e) => {
            if (!localStorage.getItem('accessibility-high-contrast')) {
                setState(prev => ({ ...prev, highContrast: e.matches }));
            }
        };
        mediaQueryReducedMotion.addEventListener('change', handleReducedMotionChange);
        mediaQueryHighContrast.addEventListener('change', handleHighContrastChange);
        return () => {
            mediaQueryReducedMotion.removeEventListener('change', handleReducedMotionChange);
            mediaQueryHighContrast.removeEventListener('change', handleHighContrastChange);
        };
    }, []);
    // Detect keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Tab') {
                setState(prev => ({ ...prev, keyboardNavigation: true, focusVisible: true }));
            }
        };
        const handleMouseDown = () => {
            setState(prev => ({ ...prev, keyboardNavigation: false }));
        };
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleMouseDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleMouseDown);
        };
    }, []);
    // Apply CSS custom properties based on accessibility state
    useEffect(() => {
        const root = document.documentElement;
        // Font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px',
            xlarge: '20px',
        };
        root.style.setProperty('--accessibility-font-size', fontSizeMap[state.fontSize]);
        // High contrast
        if (state.highContrast) {
            root.classList.add('high-contrast');
        }
        else {
            root.classList.remove('high-contrast');
        }
        // Reduced motion
        if (state.reducedMotion) {
            root.classList.add('reduced-motion');
        }
        else {
            root.classList.remove('reduced-motion');
        }
        // Focus visible
        if (state.focusVisible) {
            root.classList.add('focus-visible');
        }
        else {
            root.classList.remove('focus-visible');
        }
    }, [state]);
    const setReducedMotion = useCallback((reduced) => {
        setState(prev => ({ ...prev, reducedMotion: reduced }));
        localStorage.setItem('accessibility-reduced-motion', reduced.toString());
    }, []);
    const setHighContrast = useCallback((high) => {
        setState(prev => ({ ...prev, highContrast: high }));
        localStorage.setItem('accessibility-high-contrast', high.toString());
    }, []);
    const setFontSize = useCallback((size) => {
        setState(prev => ({ ...prev, fontSize: size }));
        localStorage.setItem('accessibility-font-size', size);
    }, []);
    const setScreenReader = useCallback((enabled) => {
        setState(prev => ({ ...prev, screenReader: enabled }));
        localStorage.setItem('accessibility-screen-reader', enabled.toString());
    }, []);
    const setKeyboardNavigation = useCallback((enabled) => {
        setState(prev => ({ ...prev, keyboardNavigation: enabled }));
        localStorage.setItem('accessibility-keyboard-navigation', enabled.toString());
    }, []);
    const announceToScreenReader = useCallback((message, priority = 'polite') => {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        document.body.appendChild(announcement);
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }, []);
    const skipToContent = useCallback(() => {
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.focus();
            mainContent.scrollIntoView({ behavior: 'smooth' });
        }
    }, []);
    const contextValue = {
        ...state,
        setReducedMotion,
        setHighContrast,
        setFontSize,
        setScreenReader,
        setKeyboardNavigation,
        announceToScreenReader,
        skipToContent,
    };
    return (<AccessibilityContext.Provider value={contextValue}>
      {children}
      <ScreenReaderAnnouncements />
      <SkipToContentButton />
    </AccessibilityContext.Provider>);
}
// Screen reader announcements component
function ScreenReaderAnnouncements() {
    const { screenReader } = useAccessibility();
    if (!screenReader)
        return null;
    return (<div id="screen-reader-announcements" aria-live="polite" aria-atomic="true" className="sr-only"/>);
}
// Skip to content button
function SkipToContentButton() {
    const { skipToContent } = useAccessibility();
    return (<AnimatePresence>
      <motion.button initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} onClick={skipToContent} className="skip-to-content" aria-label="Skip to main content">
        Skip to main content
      </motion.button>
    </AnimatePresence>);
}
// Accessibility settings panel
export function AccessibilitySettings() {
    const { reducedMotion, highContrast, fontSize, screenReader, keyboardNavigation, setReducedMotion, setHighContrast, setFontSize, setScreenReader, setKeyboardNavigation, } = useAccessibility();
    return (<div className="accessibility-settings bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-bold mb-4">Accessibility Settings</h2>
      
      <div className="space-y-4">
        {/* Reduced Motion */}
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
          <span>Reduce motion and animations</span>
        </label>

        {/* High Contrast */}
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
          <span>High contrast mode</span>
        </label>

        {/* Font Size */}
        <div>
          <label className="block text-sm font-medium mb-2">Font Size</label>
          <select value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full rounded border-gray-300 focus:ring-blue-500 focus:border-blue-500">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
        </div>

        {/* Screen Reader */}
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={screenReader} onChange={(e) => setScreenReader(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
          <span>Screen reader announcements</span>
        </label>

        {/* Keyboard Navigation */}
        <label className="flex items-center space-x-3">
          <input type="checkbox" checked={keyboardNavigation} onChange={(e) => setKeyboardNavigation(e.target.checked)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"/>
          <span>Enhanced keyboard navigation</span>
        </label>
      </div>
    </div>);
}
export default AccessibilityProvider;
//# sourceMappingURL=AccessibilityProvider.jsx.map