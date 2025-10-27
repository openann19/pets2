/**
 * 🎨 THEME ADAPTER UTILITIES
 * Bridges old theme API with new unified theme
 * Allows gradual migration without breaking existing code
 */

import type { Theme, SemanticColors } from "./types";

/**
 * Extended color palette for backward compatibility
 * Adds properties that components expect from the old theme
 */
export interface ExtendedColors extends SemanticColors {
  // Background variants
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  
  // Text variants
  textSecondary: string;
  
  // Color variants
  white: string;
  black: string;
  gray50: string;
  gray100: string;
  gray200: string;
  gray300: string;
  gray400: string;
  gray500: string;
  gray600: string;
  gray700: string;
  gray800: string;
  gray900: string;
  gray950: string;
  
  // Primary variants
  primaryLight: string;
  primaryDark: string;
  
  // Secondary variants
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent variants
  accent: string;
  accentLight: string;
  accentDark: string;
  
  // Glass effects
  glass: string;
  glassLight: string;
  glassWhite: string;
  glassWhiteLight: string;
  glassWhiteDark: string;
  glassDark: string;
  glassDarkMedium: string;
  glassDarkStrong: string;
  
  // Status colors
  info: string;
  error: string;
  
  // Additional properties
  tertiary: string;
  inverse: string;
  shadow: string;
}

/**
 * Adapter function to convert unified theme to extended colors
 * Provides backward compatibility for old component API
 * 
 * Note: Extended colors are now included directly in the core theme,
 * but this function maintains type compatibility and ensures all
 * properties are available even if the core theme changes.
 */
export function getExtendedColors(theme: Theme | any): ExtendedColors {
  const { colors } = theme;
  
  // Since extended colors are now in the core theme, we just return them
  // with type assertion to satisfy ExtendedColors interface
  return {
    ...colors,
    // Ensure all aliases are available
    background: colors.background ?? colors.bg,
    surface: colors.surface ?? colors.bg,
    surfaceElevated: colors.surfaceElevated ?? colors.bgElevated,
    card: colors.card ?? colors.bgElevated,
    textSecondary: colors.textSecondary ?? colors.textMuted,
    interactive: colors.interactive ?? colors.primary,
    feedback: colors.feedback ?? colors.success,
  } as ExtendedColors;
}

/**
 * Helper to get theme colors with extensions
 * Usage: const extendedColors = getThemeColors(theme);
 */
export function getThemeColors(theme: Theme): ExtendedColors {
  return getExtendedColors(theme);
}

/**
 * Check if theme is dark
 * Usage: const isDark = getIsDark(theme);
 */
export function getIsDark(theme: Theme): boolean {
  return theme.scheme === "dark";
}
