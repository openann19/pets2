/**
 * 🎨 THEME HOOKS
 * Convenience hooks for accessing theme properties
 * Re-exports from UnifiedThemeProvider for backward compatibility
 */

import type {
  ThemeMode,
  ColorPalette,
  TypographyScale,
  SpacingScale,
  ShadowScale,
  RadiusScale,
} from "./types";

// Re-export hooks from UnifiedThemeProvider
export {
  useTheme,
  useThemeMode,
  useThemeContext,
  useColors as useColorsFromProvider,
  useSpacing as useSpacingFromProvider,
} from "./UnifiedThemeProvider";

// Legacy convenience hooks that adapt the theme
import { useThemeContext } from "./UnifiedThemeProvider";
import type { Theme } from "./types";

/**
 * Returns the current theme object
 */
export function useThemeLegacy(): Theme {
  return useThemeContext().theme;
}

/**
 * Returns theme mode controls
 */
export function useThemeModeWrapper() {
  const { mode, isDark, setMode, toggleTheme } = useThemeContext();
  return { mode, isDark, setMode, toggleTheme };
}

/**
 * Returns just the colors palette
 */
export function useColors(): ColorPalette {
  const theme = useThemeContext().theme;
  // Return a basic color palette structure
  return {
    primary: theme.colors.primary,
    secondary: theme.colors.border,
    text: theme.colors.text,
    background: theme.colors.bg,
  } as ColorPalette;
}

/**
 * Returns just the spacing scale
 */
export function useSpacing(): SpacingScale {
  const theme = useThemeContext().theme;
  return theme.spacing as unknown as SpacingScale;
}

/**
 * Returns just the shadows
 */
export function useShadows(): ShadowScale {
  const theme = useThemeContext().theme;
  return (theme.shadows as unknown as ShadowScale) || {};
}

/**
 * Returns just the radius scale
 */
export function useRadii() {
  const theme = useThemeContext().theme;
  return theme.radius as unknown as RadiusScale;
}

/**
 * Returns just the typography scale
 */
export function useTypography(): TypographyScale {
  const theme = useThemeContext().theme;
  return {} as TypographyScale; // Not implemented in new theme
}

/**
 * Returns just the opacity scale
 */
export function useOpacity() {
  return { transparent: 0, visible: 1 } as Record<string, number>;
}

/**
 * Returns just the border width scale
 */
export function useBorderWidth() {
  return { none: 0, thin: 1, medium: 2, thick: 3 } as Record<string, number>;
}

/**
 * Returns just the icon size scale
 */
export function useIconSize() {
  return { sm: 16, md: 24, lg: 32, xl: 48 } as Record<string, number>;
}

/**
 * Returns just the animation scale
 */
export function useAnimation() {
  return { fast: 150, normal: 250, slow: 400 } as Record<string, number>;
}

/**
 * Returns just the z-index scale
 */
export function useZIndex() {
  return { base: 0, elevated: 1, overlay: 1000, modal: 2000 } as Record<string, number>;
}

/**
 * Legacy hook for backward compatibility
 * Returns theme colors in the old format
 */
export function useLegacyTheme() {
  const theme = useThemeContext().theme;
  const { isDark, setMode, toggleTheme } = useThemeModeWrapper();

  return {
    isDark: isDark ?? false,
    colors: theme.colors,
    styles: {} as Record<string, unknown>,
    shadows: theme.shadows || {},
    setThemeMode: (mode: ThemeMode) => {
      setMode(mode);
    },
    toggleTheme: () => {
      toggleTheme();
    },
  };
}
