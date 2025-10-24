'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { _COLORS, BLUR, GRADIENTS, RADIUS, SHADOWS, SPACING } from '../constants/design-tokens';
const ThemeContext = createContext(undefined);
export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [theme, setThemeState] = useState('default');
    const [reducedMotion, setReducedMotion] = useState(false);
    const [colorScheme, setColorSchemeState] = useState('system'); // NEW
    // Initialize theme preferences
    useEffect(() => {
        // Dark mode detection
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const savedColorScheme = localStorage.getItem('color-scheme');
        const savedDarkMode = localStorage.getItem('theme-dark');
        // NEW: Initialize color scheme
        const initialColorScheme = savedColorScheme || 'system';
        setColorSchemeState(initialColorScheme);
        // Calculate isDark based on color scheme
        const calculateIsDark = (scheme) => {
            if (scheme === 'system') {
                return darkModeQuery.matches;
            }
            return scheme === 'dark';
        };
        const initialDark = savedDarkMode !== null ? savedDarkMode === 'true' : calculateIsDark(initialColorScheme);
        setIsDark(initialDark);
        // Theme preference
        const savedTheme = localStorage.getItem('theme-name');
        if (savedTheme && ['default', 'premium', 'minimal'].includes(savedTheme)) {
            setThemeState(savedTheme);
        }
        // Reduced motion
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const savedReducedMotion = localStorage.getItem('reduced-motion');
        const initialReducedMotion = savedReducedMotion !== null ? savedReducedMotion === 'true' : motionQuery.matches;
        setReducedMotion(initialReducedMotion);
        // Listen for changes
        const handleDarkModeChange = (e) => {
            // NEW: Only respond to system changes if color scheme is 'system'
            const currentScheme = localStorage.getItem('color-scheme');
            if (currentScheme === 'system' || currentScheme === null) {
                setIsDark(e.matches);
            }
        };
        const handleMotionChange = (e) => {
            if (localStorage.getItem('reduced-motion') === null) {
                setReducedMotion(e.matches);
            }
        };
        darkModeQuery.addEventListener('change', handleDarkModeChange);
        motionQuery.addEventListener('change', handleMotionChange);
        return () => {
            darkModeQuery.removeEventListener('change', handleDarkModeChange);
            motionQuery.removeEventListener('change', handleMotionChange);
        };
    }, []);
    // NEW: Update isDark when colorScheme changes
    useEffect(() => {
        if (colorScheme === 'system') {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDark(darkModeQuery.matches);
        }
        else {
            setIsDark(colorScheme === 'dark');
        }
    }, [colorScheme]);
    // Apply theme to document
    useEffect(() => {
        const root = document.documentElement;
        // Dark mode class
        if (isDark) {
            root.classList.add('dark');
        }
        else {
            root.classList.remove('dark');
        }
        // Theme class
        root.setAttribute('data-theme', theme);
        // Reduced motion
        if (reducedMotion) {
            root.classList.add('motion-reduce');
        }
        else {
            root.classList.remove('motion-reduce');
        }
        // Save preferences
        localStorage.setItem('theme-dark', isDark.toString());
        localStorage.setItem('theme-name', theme);
        localStorage.setItem('reduced-motion', reducedMotion.toString());
        localStorage.setItem('color-scheme', colorScheme); // NEW: Save color scheme
        // Update meta theme-color for mobile browsers
        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', isDark ? '#1a1a1a' : '#ffffff');
        }
    }, [isDark, theme, reducedMotion, colorScheme]);
    const toggleTheme = () => {
        // NEW: Toggle between light and dark (not system)
        if (colorScheme === 'system') {
            // If currently system, switch to opposite of current resolved theme
            setColorSchemeState(isDark ? 'light' : 'dark');
        }
        else {
            // Otherwise toggle between light and dark
            setColorSchemeState(colorScheme === 'dark' ? 'light' : 'dark');
        }
    };
    const setTheme = (newTheme) => {
        setThemeState(newTheme);
    };
    // NEW: Set color scheme (light/dark/system)
    const setColorScheme = (scheme) => {
        setColorSchemeState(scheme);
    };
    // Utility functions for accessing design tokens
    const getColor = (path, fallback = '#000000') => {
        const keys = path.split('.');
        let current = _COLORS;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return fallback;
            }
        }
        return typeof current === 'string' ? current : fallback;
    };
    const getGradient = (path, fallback = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)') => {
        const keys = path.split('.');
        let current = GRADIENTS;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return fallback;
            }
        }
        return typeof current === 'string' ? current : fallback;
    };
    const getShadow = (path, fallback = '0 1px 2px 0 rgba(0, 0, 0, 0.05)') => {
        const keys = path.split('.');
        let current = SHADOWS;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return fallback;
            }
        }
        return typeof current === 'string' ? current : fallback;
    };
    const value = {
        isDark,
        theme,
        reducedMotion,
        colorScheme, // NEW
        toggleTheme,
        setTheme,
        setColorScheme, // NEW
        colors: _COLORS,
        gradients: GRADIENTS,
        shadows: SHADOWS,
        blur: BLUR,
        radius: RADIUS,
        spacing: SPACING,
        getColor,
        getGradient,
        getShadow,
    };
    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
/**
 * Script to prevent flash of unstyled content (FOUC)
 * Add this to the <head> of your document via layout.tsx
 */
export const ThemeScript = () => {
    const themeScript = `
    (function() {
      try {
        var colorScheme = localStorage.getItem('color-scheme') || 'system';
        var isDark = false;
        
        if (colorScheme === 'system') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = colorScheme === 'dark';
        }
        
        if (isDark) {
          document.documentElement.classList.add('dark');
        }
        
        // Set meta theme-color
        var meta = document.querySelector('meta[name="theme-color"]');
        if (!meta) {
          meta = document.createElement('meta');
          meta.name = 'theme-color';
          document.head.appendChild(meta);
        }
        meta.content = isDark ? '#1a1a1a' : '#ffffff';
      } catch (e) {}
    })();
  `;
    return (<script dangerouslySetInnerHTML={{ __html: themeScript }} suppressHydrationWarning/>);
};
//# sourceMappingURL=ThemeContext.jsx.map