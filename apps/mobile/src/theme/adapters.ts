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
 */
export function getExtendedColors(theme: Theme): ExtendedColors {
  const { colors } = theme;
  const isDark = theme.scheme === "dark";
  
  return {
    // Core semantic colors
    ...colors,
    
    // Background aliases
    background: colors.bg,
    surface: colors.bg,
    surfaceElevated: colors.bgElevated,
    card: colors.bgElevated,
    
    // Text aliases
    textSecondary: colors.textMuted,
    interactive: colors.primary,
    feedback: colors.success,
    
    // Monochrome palette
    white: "#ffffff",
    black: "#000000",
    gray50: "#fafafa",
    gray100: "#f5f5f5",
    gray200: "#e5e5e5",
    gray300: "#d4d4d4",
    gray400: "#a3a3a3",
    gray500: "#737373",
    gray600: "#525252",
    gray700: "#404040",
    gray800: "#262626",
    gray900: "#171717",
    gray950: "#0a0a0a",
    
    // Primary variants (can be customized based on brand)
    primaryLight: isDark ? "#fce7f3" : "#ec4899",
    primaryDark: isDark ? "#831843" : "#be185d",
    
    // Secondary variants
    secondary: "#a855f7",
    secondaryLight: isDark ? "#f3e8ff" : "#9333ea",
    secondaryDark: isDark ? "#581c87" : "#7e22ce",
    
    // Accent variants
    accent: "#10b981",
    accentLight: isDark ? "#dcfce7" : "#059669",
    accentDark: isDark ? "#064e3b" : "#047857",
    
    // Glass effects
    glass: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
    glassLight: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.6)",
    glassWhite: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.9)",
    glassWhiteLight: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.95)",
    glassWhiteDark: isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(255, 255, 255, 0.98)",
    glassDark: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.9)",
    glassDarkMedium: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.7)",
    glassDarkStrong: isDark ? "rgba(0, 0, 0, 0.4)" : "rgba(0, 0, 0, 0.5)",
    
    // Status colors
    info: "#3b82f6",
    error: colors.danger,
    
    // Additional properties
    tertiary: colors.warning,
    inverse: isDark ? "#ffffff" : "#000000",
    shadow: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)",
  };
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
