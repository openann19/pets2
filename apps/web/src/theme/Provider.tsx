/**
 * 🎨 UNIFIED THEME PROVIDER
 * Single source of truth for theme management in the web app
 * Uses resolved theme layer for ergonomic API matching mobile app
 */

'use client';

import React, { createContext, useContext, useMemo, useEffect, useState } from 'react';
import { getLightTheme, getDarkTheme, type AppTheme } from './resolve';
import type { ColorScheme } from './contracts';

export const ThemeContext = createContext<AppTheme>(getLightTheme());
const ThemeCtx = ThemeContext;

interface ThemeProviderProps {
  scheme?: ColorScheme;
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ scheme, children }) => {
  const [systemScheme, setSystemScheme] = useState<ColorScheme | null>(null);
  const [mounted, setMounted] = useState(false);

  // Detect system color scheme preference
  useEffect(() => {
    setMounted(true);
    
    // Check system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const updateScheme = () => {
      setSystemScheme(mediaQuery.matches ? 'dark' : 'light');
    };
    
    updateScheme();
    mediaQuery.addEventListener('change', updateScheme);
    
    return () => {
      mediaQuery.removeEventListener('change', updateScheme);
    };
  }, []);

  const value = useMemo(() => {
    const effective = scheme ?? systemScheme ?? 'light';
    return effective === 'dark' ? getDarkTheme() : getLightTheme();
  }, [scheme, systemScheme]);

  // Inject CSS variables for Tailwind compatibility
  useEffect(() => {
    if (!mounted || typeof document === 'undefined') return;
    
    const root = document.documentElement;
    const theme = value;
    
    // Set color scheme
    root.classList.remove('light', 'dark');
    root.classList.add(theme.scheme);
    
    // Inject CSS variables
    root.style.setProperty('--color-bg', theme.colors.bg);
    root.style.setProperty('--color-surface', theme.colors.surface);
    root.style.setProperty('--color-overlay', theme.colors.overlay);
    root.style.setProperty('--color-border', theme.colors.border);
    root.style.setProperty('--color-on-bg', theme.colors.onBg);
    root.style.setProperty('--color-on-surface', theme.colors.onSurface);
    root.style.setProperty('--color-on-muted', theme.colors.onMuted);
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-on-primary', theme.colors.onPrimary);
    root.style.setProperty('--color-success', theme.colors.success);
    root.style.setProperty('--color-danger', theme.colors.danger);
    root.style.setProperty('--color-warning', theme.colors.warning);
    root.style.setProperty('--color-info', theme.colors.info);
    
    // Spacing variables
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, `${value}px`);
    });
    
    // Radius variables
    Object.entries(theme.radii).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, `${value}px`);
    });
    
    // Shadow variables (convert to string if object)
    const shadowToString = (shadow: string | object): string => {
      if (typeof shadow === 'string') return shadow;
      // Convert React Native shadow object to CSS
      const obj = shadow as { shadowColor?: string; shadowOffset?: { width: number; height: number }; shadowOpacity?: number; shadowRadius?: number };
      const color = obj.shadowColor || 'rgba(0, 0, 0, 0.1)';
      const opacity = obj.shadowOpacity || 0.1;
      const offset = obj.shadowOffset || { width: 0, height: 0 };
      const radius = obj.shadowRadius || 0;
      const rgba = color.startsWith('#') 
        ? (() => {
            const hex = color.slice(1);
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            return `rgba(${r}, ${g}, ${b}, ${opacity})`;
          })()
        : color.replace(')', `, ${opacity})`);
      return `${offset.width}px ${offset.height}px ${radius}px ${rgba}`;
    };
    
    root.style.setProperty('--shadow-elevation1', shadowToString(theme.shadows.elevation1));
    root.style.setProperty('--shadow-elevation2', shadowToString(theme.shadows.elevation2));
    root.style.setProperty('--shadow-glass', shadowToString(theme.shadows.glass));
    
    // Blur variables
    root.style.setProperty('--blur-sm', `${theme.blur.sm}px`);
    root.style.setProperty('--blur-md', `${theme.blur.md}px`);
    root.style.setProperty('--blur-lg', `${theme.blur.lg}px`);
    
    // Typography variables
    root.style.setProperty('--font-size-body', `${theme.typography.body.size}px`);
    root.style.setProperty('--line-height-body', `${theme.typography.body.lineHeight}px`);
    root.style.setProperty('--font-weight-body', theme.typography.body.weight);
    root.style.setProperty('--font-size-h1', `${theme.typography.h1.size}px`);
    root.style.setProperty('--line-height-h1', `${theme.typography.h1.lineHeight}px`);
    root.style.setProperty('--font-size-h2', `${theme.typography.h2.size}px`);
    root.style.setProperty('--line-height-h2', `${theme.typography.h2.lineHeight}px`);
  }, [mounted, value]);

  // Prevent hydration mismatch by not rendering theme-dependent content until mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): AppTheme => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) {
    throw new Error('useTheme must be used within <ThemeProvider>');
  }
  return ctx;
};

// Re-export types for backward compatibility
export type { AppTheme, ColorScheme } from './contracts';

