/**
 * 🎨 UNIFIED THEME EXPORTS
 * Single export point for all theme-related functionality
 */

export * from "./types";
export * from "./Provider";
export { createTheme } from "./rnTokens";
export * from "./adapters";

// Re-export the extended theme hook for convenience
export { useExtendedTheme, useExtendedColors } from "../hooks/useExtendedTheme";

// Re-export unified theme for backward compatibility
export { Theme, DarkTheme } from "./unified-theme";
export type { ThemeType, ColorPalette, SpacingSize, BorderRadiusSize, FontSize, FontWeight } from "./unified-theme";
