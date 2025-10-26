/**
 * 🎨 UNIFIED THEME PROVIDER
 * Single source of truth for theme management in the mobile app
 */

import React, { createContext, useContext, useMemo } from "react";
import { Appearance, type ColorSchemeName } from "react-native";
import type { Theme, ColorScheme } from "./types";
import { createTheme } from "./rnTokens";

const ThemeCtx = createContext<Theme | null>(null);

export const ThemeProvider: React.FC<{
  scheme?: ColorScheme;
  children: React.ReactNode;
}> = ({ scheme, children }) => {
  const auto: ColorScheme = ((Appearance.getColorScheme() as ColorSchemeName) ??
    "light") as ColorScheme;
  const value = useMemo(() => createTheme(scheme ?? auto), [scheme, auto]);
  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
};

export const useTheme = (): Theme => {
  const ctx = React.useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
};

// Re-export adapter utilities for backward compatibility
export { getExtendedColors, getThemeColors, getIsDark } from "./adapters";

// Additional type exports for components expecting these types
export type { 
  SemanticColors, 
  Theme,
  ColorScheme,
  ThemeMode,
  ThemeContextValue,
} from "./types";

export type { ExtendedColors } from "./adapters";

export type DynamicColors = import("./types").SemanticColors;
export type ThemeColors = import("./adapters").ExtendedColors;

// Shadow and Typography types for backward compatibility
export type EnhancedShadows = Record<string, unknown>;
export type EnhancedTypography = Record<string, unknown>;

