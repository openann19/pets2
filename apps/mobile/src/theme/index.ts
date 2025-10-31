/**
 * 🎨 UNIFIED THEME EXPORTS
 * Single export point for all theme-related functionality
 */

export { ThemeProvider, useTheme, ThemeContext } from './Provider';
export { getLightTheme as defaultTheme, getDarkTheme, getLightTheme } from './resolve';
import { getLightTheme, getDarkTheme } from './resolve';
import type { AppTheme, ColorScheme } from './contracts';

/**
 * Create a theme based on the specified color scheme
 * Returns a complete AppTheme contract-compliant object
 */
export function createTheme(scheme: ColorScheme): AppTheme {
  return scheme === 'dark' ? getDarkTheme() : getLightTheme();
}

export type { AppTheme, Theme, ColorScheme, SemanticColors } from './contracts';

// Motion tokens export
export {
  motion,
  motionDurations,
  motionEasing,
  motionScale,
  motionOpacity,
  motionSpring,
  getEasingArray,
  getSpringConfig,
} from './motion';
export type {
  MotionDuration,
  MotionEasing,
  MotionScale,
  MotionOpacity,
  MotionSpring,
} from './motion';

// Back-compat exports
export { getExtendedColors, getThemeColors, getIsDark } from './adapters';
export type { ExtendedColors } from './adapters';
export type { ThemeColors } from './Provider';

// Note: useExtendedTheme and useExtendedColors are available from '../hooks/useExtendedTheme'
// Not exported here to avoid circular dependency
