/**
 * 🎨 UNIFIED THEME SYSTEM
 * Main export file for the mobile theme system
 */

// Provider and Context
export { UnifiedThemeProvider, useThemeContext } from "./UnifiedThemeProvider";

// Main Hooks
export {
  useTheme,
  useThemeMode,
  useColors,
  useTypography,
  useSpacing,
  useShadows,
  useRadii,
  useOpacity,
  useBorderWidth,
  useIconSize,
  useAnimation,
  useZIndex,
  useColor,
  useTypographyVariant,
  useSpacingValue,
  useShadowConfig,
  useRadius,
  useLegacyTheme,
} from "./hooks";

// Theme Creation
export { createTheme, lightTheme, darkTheme } from "./tokens";

// Types
export type {
  Theme,
  ThemeMode,
  ThemeContextValue,
  ColorPalette,
  TypographyScale,
  TypographyVariant,
  SpacingScale,
  RadiusScale,
  ShadowScale,
  ShadowToken,
  OpacityScale,
  BorderWidthScale,
  IconSizeScale,
  AnimationScale,
  ZIndexScale,
  ThemeOverrides,
  ColorToken,
  TypographyVariantName,
  SpacingToken,
  RadiusToken,
  ShadowTokenName,
  OpacityToken,
  BorderWidthToken,
  IconSizeToken,
  AnimationToken,
  ZIndexToken,
  ThemedComponentProps,
  ThemedViewProps,
  ThemedTextProps,
} from "./types";

// Default export
export { default } from "./UnifiedThemeProvider";
