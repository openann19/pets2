/**
 * 🎨 THEME HELPER UTILITIES
 * Type-safe helper functions for accessing theme properties
 * Centralizes theme access patterns to prevent TS2339 errors
 */

// Import the actual Theme object, not the types
import { Theme } from './unified-theme';

// ====== COLOR HELPERS ======

/**
 * Get border color with variant support
 */
export function getBorderColor(variant: 'light' | 'medium' | 'dark' = 'light'): string {
  switch (variant) {
    case 'light':
      return Theme.colors.border.light;
    case 'medium':
      return Theme.colors.border.medium;
    case 'dark':
      return Theme.colors.border.dark;
    default:
      return Theme.colors.borderColor; // Fallback to flat alias
  }
}

/**
 * Get text color object with primary and inverse properties
 */
export function getTextColor(): { primary: string; inverse: string } {
  return {
    primary: Theme.colors.text.primary,
    inverse: Theme.colors.text.inverse,
  };
}

/**
 * Get text color string with variant support (legacy support)
 */
export function getTextColorString(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return Theme.colors.text.primary;
    case 'secondary':
      return Theme.colors.text.secondary;
    case 'tertiary':
      return Theme.colors.text.tertiary;
    case 'inverse':
      return Theme.colors.text.inverse;
    default:
      return Theme.colors.textColor; // Fallback to flat alias
  }
}

/**
 * Get background color object with primary and inverse properties
 */
export function getBackgroundColor(): { primary: string; inverse: string } {
  return {
    primary: Theme.colors.background.primary,
    inverse: Theme.colors.background.inverse,
  };
}

/**
 * Get background color string with variant support (legacy support)
 */
export function getBackgroundColorString(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return Theme.colors.background.primary;
    case 'secondary':
      return Theme.colors.background.secondary;
    case 'tertiary':
      return Theme.colors.background.tertiary;
    case 'inverse':
      return Theme.colors.background.inverse;
    default:
      return Theme.colors.backgroundColor; // Fallback to flat alias
  }
}

/**
 * Get primary color with shade support
 */
export function getPrimaryColor(shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return Theme.colors.primary[shade];
}

/**
 * Get secondary color with shade support
 */
export function getSecondaryColor(shade: 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return Theme.colors.secondary[shade];
}

/**
 * Get neutral color with shade support
 */
export function getNeutralColor(shade: 0 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 = 500): string {
  return Theme.colors.neutral[shade];
}

/**
 * Get status color
 */
export function getStatusColor(status: 'success' | 'warning' | 'error' | 'info'): string {
  return Theme.colors.status[status];
}

/**
 * Get border color object with variants
 */
export function getBorderColorObject(): { light: string; medium: string; dark: string } {
  return {
    light: Theme.colors.border.light,
    medium: Theme.colors.border.medium,
    dark: Theme.colors.border.dark,
  };
}

// ====== STYLE HELPERS ======

/**
 * Create a border style object
 */
export function createBorderStyle(variant: 'light' | 'medium' | 'dark' = 'light', width: number = 1) {
  return {
    borderColor: getBorderColor(variant),
    borderWidth: width,
  };
}

/**
 * Create a text style object
 */
export function createTextStyle(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') {
  return {
    color: getTextColorString(variant),
  };
}

/**
 * Create a background style object
 */
export function createBackgroundStyle(variant: 'primary' | 'secondary' | 'tertiary' | 'inverse' = 'primary') {
  return {
    backgroundColor: getBackgroundColorString(variant),
  };
}

/**
 * Create a shadow style object
 */
export function createShadowStyle(shadow: 'sm' | 'md' | 'lg' | 'xl' = 'sm') {
  return Theme.shadows.depth[shadow];
}

// ====== LEGACY COMPATIBILITY ======

/**
 * Legacy theme access helper for backward compatibility
 * Maps old nested access patterns to new flat structure
 */
export function legacyThemeAccess(path: string): string {
  const pathMap: Record<string, string> = {
    'colors.primary.500': Theme.colors.primary[500],
    'colors.primary.600': Theme.colors.primary[600],
    'colors.secondary.500': Theme.colors.secondary[500],
    'colors.text.primary': Theme.colors.text.primary,
    'colors.text.secondary': Theme.colors.text.secondary,
    'colors.background.primary': Theme.colors.background.primary,
    'colors.border.light': Theme.colors.border.light,
    'colors.border.medium': Theme.colors.border.medium,
    'colors.border.dark': Theme.colors.border.dark,
  };

  return pathMap[path] || Theme.colors.textColor; // Fallback
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
export function safeGetColor(getter: () => string, fallback: string = '#000000'): string {
  try {
    const color = getter();
    return isValidColor(color) ? color : fallback;
  } catch {
    return fallback;
  }
}