/**
 * 🎨 UNIFIED THEME MODULE
 * Single source of truth for theme - matches mobile app structure
 * Export all theme utilities and types
 */

export { ThemeProvider, useTheme, ThemeContext } from './Provider';
export { getLightTheme, getDarkTheme, resolveTheme } from './resolve';
export { Theme as BaseLightTheme, DarkTheme as BaseDarkTheme } from './base-theme';

// Type exports
export type {
  AppTheme,
  Theme,
  ColorScheme,
  SemanticColors,
  Palette,
  SpacingScale,
  RadiiScale,
  Elevation,
  BlurScale,
  EasingScale,
  Typography,
  NeutralStep,
} from './contracts';

