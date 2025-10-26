/**
 * 🎨 THEME HOOKS
 * Convenience hooks for accessing theme properties
 */

import { useThemeContext } from "./UnifiedThemeProvider";
import type {
  Theme,
  ThemeMode,
  ColorPalette,
  TypographyScale,
  SpacingScale,
  ShadowScale,
  RadiusScale,
} from "./types";

// ====== MAIN HOOKS ======

/**
 * Returns the current theme object
 */
export function useTheme(): Theme {
  return useThemeContext().theme;
}

/**
 * Returns theme mode controls
 */
export function useThemeMode() {
  const { mode, isDark, setMode, toggleTheme } = useThemeContext();
  return { mode, isDark, setMode, toggleTheme };
}

/**
 * Returns just the colors palette
 */
export function useColors(): ColorPalette {
  return useThemeContext().theme.colors;
}

/**
 * Returns just the typography scale
 */
export function useTypography(): TypographyScale {
  return useThemeContext().theme.typography;
}

/**
 * Returns just the spacing scale
 */
export function useSpacing(): SpacingScale {
  return useThemeContext().theme.spacing;
}

/**
 * Returns just the shadows scale
 */
export function useShadows(): ShadowScale {
  return useThemeContext().theme.shadows;
}

/**
 * Returns just the radii scale
 */
export function useRadii() {
  return useThemeContext().theme.radii;
}

/**
 * Returns just the opacity scale
 */
export function useOpacity() {
  return useThemeContext().theme.opacity;
}

/**
 * Returns just the border width scale
 */
export function useBorderWidth() {
  return useThemeContext().theme.borderWidth;
}

/**
 * Returns just the icon size scale
 */
export function useIconSize() {
  return useThemeContext().theme.iconSize;
}

/**
 * Returns just the animation scale
 */
export function useAnimation() {
  return useThemeContext().theme.animation;
}

/**
 * Returns just the z-index scale
 */
export function useZIndex() {
  return useThemeContext().theme.zIndex;
}

/**
 * Returns a specific color from the palette
 */
export function useColor(colorName: keyof ColorPalette): string {
  const colors = useColors();
  return colors[colorName];
}

/**
 * Returns a specific typography variant
 */
export function useTypographyVariant(variantName: keyof TypographyScale) {
  const typography = useTypography();
  return typography[variantName];
}

/**
 * Returns a specific spacing value
 */
export function useSpacingValue(size: keyof SpacingScale): number {
  const spacing = useSpacing();
  return spacing[size];
}

/**
 * Returns a specific shadow configuration
 */
export function useShadowConfig(shadowName: keyof ShadowScale) {
  const shadows = useShadows();
  return shadows[shadowName];
}

/**
 * Returns a specific radius value
 */
export function useRadius(size: keyof RadiusScale): number {
  const radii = useRadii();
  return radii[size];
}

// ====== LEGACY COMPATIBILITY ======
/**
 * Legacy hook for backward compatibility
 * Returns theme colors in the old format
 */
export function useLegacyTheme() {
  const theme = useTheme();
  const { isDark } = useThemeMode();

  return {
    isDark,
    colors: theme.colors,
    styles: {}, // Empty for now, can be populated if needed
    shadows: theme.shadows,
    setThemeMode: (mode: ThemeMode) => {
      const { setMode } = useThemeMode();
      setMode(mode);
    },
    toggleTheme: () => {
      const { toggleTheme } = useThemeMode();
      toggleTheme();
    },
  };
}
