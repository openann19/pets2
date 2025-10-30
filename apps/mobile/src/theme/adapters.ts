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
  surfaceElevated: string;
  card: string;

  // Text variants
  textSecondary: string;

  // Monochrome palette
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

  // Status colors (additional aliases)
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
  const { colors, palette } = theme;

  // Get neutral colors from palette or provide fallbacks
  const neutralColors = palette?.neutral || {};

  return {
    // Core semantic colors (required by interface)
    bg: colors.bg ?? colors.background ?? '#FFFFFF',
    bgElevated: colors.bgElevated ?? colors.surface ?? '#F8FAFC',
    text: colors.text ?? colors.onSurface ?? '#0F172A',
    textMuted: colors.textMuted ?? colors.onMuted ?? '#64748B',
    primary: colors.primary ?? '#2563EB',
    primaryText: colors.primaryText ?? colors.onPrimary ?? '#FFFFFF',
    border: colors.border ?? '#E2E8F0',
    success: colors.success ?? '#10B981',
    warning: colors.warning ?? '#F59E0B',
    danger: colors.danger ?? '#EF4444',
    
    // Required SemanticColors properties
    surface: colors.surface ?? colors.bgElevated ?? '#F8FAFC',
    overlay: colors.overlay ?? colors.bg ?? '#FFFFFF80',
    onBg: colors.onBg ?? colors.textInverse ?? '#FFFFFF',
    onSurface: colors.onSurface ?? colors.text ?? '#0F172A',
    onMuted: colors.onMuted ?? colors.textMuted ?? '#64748B',
    onPrimary: colors.onPrimary ?? colors.primaryText ?? '#FFFFFF',
    info: colors.info ?? '#3B82F6',

    // Extended properties from interface
    background: colors.background ?? colors.bg ?? '#FFFFFF',
    surfaceElevated: colors.surfaceElevated ?? colors.surface ?? '#FFFFFF',
    card: colors.card ?? colors.surface ?? '#FFFFFF',
    textSecondary: colors.textSecondary ?? colors.onMuted ?? '#64748B',

    // Monochrome palette with fallbacks
    white: '#FFFFFF',
    black: '#000000',
    gray50: neutralColors[50] ?? '#FAFAFA',
    gray100: neutralColors[100] ?? '#F5F5F5',
    gray200: neutralColors[200] ?? '#E5E5E5',
    gray300: neutralColors[300] ?? '#D4D4D4',
    gray400: neutralColors[400] ?? '#A3A3A3',
    gray500: neutralColors[500] ?? '#737373',
    gray600: neutralColors[600] ?? '#525252',
    gray700: neutralColors[700] ?? '#404040',
    gray800: neutralColors[800] ?? '#262626',
    gray900: neutralColors[900] ?? '#171717',
    gray950: neutralColors[950] ?? '#0A0A0A',

    // Primary variants with fallbacks
    primaryLight: palette?.brand?.[300] ?? colors.primary ?? '#60A5FA',
    primaryDark: palette?.brand?.[700] ?? colors.primary ?? '#1D4ED8',

    // Secondary variants
    secondary: palette?.brand?.[500] ?? colors.secondary ?? colors.primary ?? '#64748B',
    secondaryLight: palette?.brand?.[300] ?? colors.secondaryLight ?? '#94A3B8',
    secondaryDark: palette?.brand?.[700] ?? colors.secondaryDark ?? '#475569',

    // Accent variants (using primary as fallback)
    accent: colors.accent ?? colors.primary ?? '#8B5CF6',
    accentLight: colors.accentLight ?? palette?.brand?.[300] ?? '#A78BFA',
    accentDark: colors.accentDark ?? palette?.brand?.[700] ?? '#7C3AED',

    // Glass effects with fallbacks
    glass: colors.glass ?? 'rgba(255, 255, 255, 0.1)',
    glassLight: colors.glassLight ?? 'rgba(255, 255, 255, 0.05)',
    glassWhite: colors.glassWhite ?? 'rgba(255, 255, 255, 0.8)',
    glassWhiteLight: colors.glassWhiteLight ?? 'rgba(255, 255, 255, 0.6)',
    glassWhiteDark: colors.glassWhiteDark ?? 'rgba(255, 255, 255, 0.9)',
    glassDark: colors.glassDark ?? 'rgba(0, 0, 0, 0.1)',
    glassDarkMedium: colors.glassDarkMedium ?? 'rgba(0, 0, 0, 0.3)',
    glassDarkStrong: colors.glassDarkStrong ?? 'rgba(0, 0, 0, 0.5)',

    // Status colors
    error: colors.error ?? colors.danger ?? '#EF4444',

    // Additional properties
    tertiary: colors.tertiary ?? colors.secondary ?? '#94A3B8',
    inverse: colors.inverse ?? colors.onBg ?? '#FFFFFF',
    shadow: colors.shadow ?? 'rgba(0, 0, 0, 0.1)',
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
