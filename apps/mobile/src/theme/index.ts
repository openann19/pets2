/**
 * 🎨 UNIFIED THEME EXPORTS
 * Single export point for all theme-related functionality
 */

export { ThemeProvider, useTheme, ThemeContext } from "./Provider";
export { getLightTheme as defaultTheme, getDarkTheme, getLightTheme } from "./resolve";

// Create a createTheme helper - TODO: This needs to be implemented properly with full AppTheme from contracts
// For now, we'll use a type assertion (temporary workaround)
export function createTheme(scheme: "light" | "dark"): import("./contracts").AppTheme {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { getLightTheme, getDarkTheme } = require("./resolve");
  const theme = scheme === "dark" ? getDarkTheme() : getLightTheme();
  // Type assertion needed until resolve.ts is updated to return full AppTheme
  return theme as import("./contracts").AppTheme;
}

export type { AppTheme, Theme, ColorScheme, SemanticColors } from "./contracts";

// Back-compat exports
export { getExtendedColors, getThemeColors, getIsDark } from "./adapters";
export type { ExtendedColors } from "./adapters";
export type { ThemeColors } from "./Provider";

// Re-export the extended theme hook for convenience (kept for backward compatibility)
export { useExtendedTheme, useExtendedColors } from "../hooks/useExtendedTheme";
