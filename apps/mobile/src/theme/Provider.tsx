/**
 * 🎨 UNIFIED THEME PROVIDER
 * Single source of truth for theme management in the mobile app
 * Uses resolved theme layer for ergonomic API
 * Now integrates with Remote UI Control Plane
 */

import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { ColorScheme } from './types';
import { getLightTheme, getDarkTheme, type AppTheme } from './resolve';
import { useUIConfig, configToTheme } from '../services/uiConfig';

export const ThemeContext = createContext<AppTheme>(getLightTheme());
const ThemeCtx = ThemeContext;

export const ThemeProvider: React.FC<{
  scheme?: ColorScheme;
  children: React.ReactNode;
}> = ({ scheme, children }) => {
  const systemScheme = useColorScheme();
  const { config: uiConfig, isLoading } = useUIConfig();

  const value = useMemo(() => {
    const effective = scheme ?? systemScheme ?? 'light';

    // If UI config is loaded, use it; otherwise fallback to embedded theme
    if (!isLoading && uiConfig) {
      try {
        return configToTheme(uiConfig, effective);
      } catch (error) {
        console.warn('Failed to apply UI config, using embedded theme', error);
        return effective === 'dark' ? getDarkTheme() : getLightTheme();
      }
    }

    // Default to embedded theme while loading or if config fails
    return effective === 'dark' ? getDarkTheme() : getLightTheme();
  }, [scheme, systemScheme, uiConfig, isLoading]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): AppTheme => {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
};

// Re-export adapter utilities for backward compatibility
export { getExtendedColors, getThemeColors, getIsDark } from './adapters';

// Additional type exports for components expecting these types
export type { SemanticColors, Theme, ColorScheme, ThemeMode, ThemeContextValue } from './types';

export type { ExtendedColors } from './adapters';

export type DynamicColors = import('./types').SemanticColors;
export type ThemeColors = import('./adapters').ExtendedColors;

// Shadow and Typography types for backward compatibility
export type EnhancedShadows = Record<string, unknown>;
export type EnhancedTypography = Record<string, unknown>;
