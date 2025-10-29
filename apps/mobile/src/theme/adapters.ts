/**
 * 🎨 THEME ADAPTER UTILITIES
 * Bridges old theme API with new unified theme
 * Allows gradual migration without breaking existing code
 */

import type { Theme, SemanticColors } from './types';

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getExtendedColors(theme: Theme | any): ExtendedColors {
  const { colors } = theme;

  // Map semantic tokens to legacy property names for backward compatibility
  // New semantic API: bg, surface, onSurface, onMuted, onBg, primary, danger, etc.
  // Legacy API: text, textSecondary, error, background, etc.
  return {
    ...colors,
    // Core semantic mappings
    bg: colors.bg ?? colors.background,
    surface: colors.surface ?? colors.bg,
    onSurface: colors.onSurface ?? colors.text,
    onMuted: colors.onMuted ?? colors.textMuted,
    onBg: colors.onBg ?? colors.textInverse,

    // Legacy text aliases (maps to semantic)
    text: colors.onSurface ?? colors.text,
    textSecondary: colors.onMuted ?? colors.textMuted ?? colors.textSecondary,
    textMuted: colors.onMuted ?? colors.onMuted,

    // Legacy background aliases (maps to semantic)
    background: colors.bg ?? colors.background,
    surfaceElevated: colors.surface ?? colors.surfaceElevated ?? colors.bgElevated,
    card: colors.surface ?? colors.card ?? colors.bgElevated,
    bgElevated: colors.surface ?? colors.bgElevated,

    // Status color mappings
    error: colors.danger ?? colors.error,
    danger: colors.danger ?? colors.error,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,

    // Primary mappings
    primary: colors.primary,
    onPrimary: colors.onPrimary ?? colors.primaryText,
    primaryText: colors.onPrimary ?? colors.primaryText,

    // Fallback legacy fields (if still in theme)
    white: colors.onPrimary ?? '#FFFFFF',
    black: colors.black ?? '#000000',
    secondary: colors.secondary ?? colors.primary,
    interactive: colors.primary ?? colors.interactive,
    feedback: colors.success ?? colors.feedback,

    // Neutral scale access (from palette if available)
    neutral: colors.neutral ?? theme.palette?.neutral,

    // Glass effects (if still needed)
    glass: colors.glass,
    glassLight: colors.glassLight,
    glassWhite: colors.glassWhite,
    glassDark: colors.glassDark,
    glassDarkMedium: colors.glassDarkMedium,
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
  return theme.scheme === 'dark';
}
