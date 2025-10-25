/**
 * 🎨 THEME HELPER UTILITIES
 * Type-safe helper functions for accessing theme properties
 * Centralizes theme access patterns to prevent TS2339 errors
 */

import type { Theme } from './types';

// ====== COLOR HELPERS ======

/**
 * Get border color with variant support
 */
export function getBorderColor(theme: Theme, variant: 'light' | 'medium' | 'dark' = 'light'): string {
  switch (variant) {
    case 'light':
      return theme.colors.border.light;
    case 'medium':
      return theme.colors.border.medium;
    case 'dark':
      return theme.colors.border.dark;
    default:
      return theme.colors.borderColor; // Fallback to flat alias
  }
}

/**
 * Get text color with variant support
 */
export function getTextColor(theme: Theme, variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return theme.colors.text.primary;
    case 'secondary':
      return theme.colors.text.secondary;
    case 'tertiary':
      return theme.colors.text.tertiary;
    case 'inverse':
      return theme.colors.text.inverse;
    default:
      return theme.colors.textColor; // Fallback to flat alias
  }
}

/**
 * Get background color with variant support
 */
export function getBackgroundColor(theme: Theme, variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return theme.colors.background.primary;
    case 'secondary':
      return theme.colors.background.secondary;
    case 'tertiary':
      return theme.colors.background.tertiary;
    case 'inverse':
      return theme.colors.background.inverse;
    default:
      return theme.colors.backgroundColor; // Fallback to flat alias
  }
}

/**
 * Get primary color with shade support
 */
export function getPrimaryColor(theme: Theme, shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return theme.colors.primary[shade];
}

/**
 * Get secondary color with shade support
 */
export function getSecondaryColor(theme: Theme, shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return theme.colors.secondary[shade];
}

/**
 * Get neutral color with shade support
 */
export function getNeutralColor(theme: Theme, shade: 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return theme.colors.neutral[shade];
}

/**
 * Get status color
 */
export function getStatusColor(theme: Theme, status: 'success' | 'warning' | 'error' | 'info'): string {
  return theme.colors.status[status];
}

// ====== STYLE HELPERS ======

/**
 * Create a border style object
 */
export function createBorderStyle(theme: Theme, variant: 'light' | 'medium' | 'dark' = 'light', width: number = 1) {
  return {
    borderColor: getBorderColor(theme, variant),
    borderWidth: width,
  };
}

/**
 * Create a text style object
 */
export function createTextStyle(theme: Theme, variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') {
  return {
    color: getTextColor(theme, variant),
  };
}

/**
 * Create a background style object
 */
export function createBackgroundStyle(theme: Theme, variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') {
  return {
    backgroundColor: getBackgroundColor(theme, variant),
  };
}

/**
 * Create a shadow style object
 */
export function createShadowStyle(theme: Theme, shadow: 'sm' | 'md' | 'lg' | 'xl' = 'sm') {
  return theme.shadows[shadow];
}

// ====== LEGACY COMPATIBILITY ======

/**
 * Legacy theme access helper for backward compatibility
 * Maps old nested access patterns to new flat structure
 */
export function legacyThemeAccess(theme: Theme, path: string): string {
  const pathMap: Record<string, string> = {
    'colors.primary.500': theme.colors.primary[500],
    'colors.primary.600': theme.colors.primary[600],
    'colors.secondary.500': theme.colors.secondary[500],
    'colors.text.primary': theme.colors.text.primary,
    'colors.text.secondary': theme.colors.text.secondary,
    'colors.background.primary': theme.colors.background.primary,
    'colors.border.light': theme.colors.border.light,
    'colors.border.medium': theme.colors.border.medium,
    'colors.border.dark': theme.colors.border.dark,
  };

  return pathMap[path] || theme.colors.textColor; // Fallback
}

// ====== TYPE GUARDS ======

/**
 * Check if a color value is valid
 */
export function isValidColor(color: unknown): color is string {
  return typeof color === 'string' && color.length > 0;
}

/**
 * Safely get a color with fallback
 */
export function safeGetColor(theme: Theme, getter: (theme: Theme) => string, fallback: string = '#000000'): string {
  try {
    const color = getter(theme);
    return isValidColor(color) ? color : fallback;
  } catch {
    return fallback;
  }
}
