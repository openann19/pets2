/**
 * @deprecated - Use @/theme instead
 * This file now just re-exports the canonical theme for backward compatibility
 *
 * PHASE 2: This file is reduced to re-exports only. All imports should migrate to @/theme
 */

// Re-export from canonical source
export { ThemeProvider, useTheme } from './Provider';
export { getLightTheme as defaultTheme, getDarkTheme, getLightTheme } from './resolve';
export { createTheme } from './index';
export type { AppTheme, ColorScheme, SemanticColors } from './contracts';
export { getExtendedColors, getThemeColors, getIsDark } from './adapters';
export type { ExtendedColors } from './adapters';
export { useExtendedTheme, useExtendedColors } from '../hooks/useExtendedTheme';

// Legacy base theme exports (needed by resolve.ts, but should not be imported directly elsewhere)
export { Theme as BaseTheme, DarkTheme } from './base-theme';

// Legacy type exports for backward compatibility
export type { Theme, ThemeMode, ThemeContextValue } from './types';
export type {
  ColorPalette,
  TypographyScale,
  SpacingScale,
  ShadowScale,
  RadiusScale,
} from './types';
