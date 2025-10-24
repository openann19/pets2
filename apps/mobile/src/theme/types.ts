/**
 * 🎨 UNIFIED THEME TYPES
 * Complete TypeScript definitions for the mobile theme system
 * Extends @pawfectmatch/design-tokens with React Native-specific types
 */

import type { TextStyle, ViewStyle } from "react-native";

// ====== COLOR SYSTEM ======
export interface ColorPalette {
  // Brand colors
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryForeground: string;

  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  secondaryForeground: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Semantic colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;

  surface: string;
  surfaceMuted: string;
  surfaceElevated: string;

  border: string;
  borderLight: string;
  borderDark: string;

  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Overlay colors
  overlay: string;
  overlayDark: string;

  // Special colors
  glass: string;
  glassLight: string;
  glassDark: string;
}

// ====== TYPOGRAPHY SYSTEM ======
export interface TypographyVariant
  extends Pick<TextStyle, "fontFamily" | "fontWeight"> {
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
}

export interface TypographyScale {
  heading1: TypographyVariant;
  heading2: TypographyVariant;
  heading3: TypographyVariant;
  heading4: TypographyVariant;
  heading5: TypographyVariant;
  heading6: TypographyVariant;
  subtitle: TypographyVariant;
  subtitleSmall: TypographyVariant;
  body: TypographyVariant;
  bodySmall: TypographyVariant;
  callout: TypographyVariant;
  caption: TypographyVariant;
  overline: TypographyVariant;
  button: TypographyVariant;
  label: TypographyVariant;
}

// ====== SPACING SYSTEM ======
export interface SpacingScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  "3xl": number;
  "4xl": number;
}

// ====== BORDER RADIUS SYSTEM ======
export interface RadiusScale {
  none: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
  full: number;
}

// ====== SHADOW SYSTEM ======
export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface ShadowScale {
  none: ShadowToken;
  xs: ShadowToken;
  sm: ShadowToken;
  md: ShadowToken;
  lg: ShadowToken;
  xl: ShadowToken;
  "2xl": ShadowToken;
}

// ====== OPACITY SYSTEM ======
export interface OpacityScale {
  transparent: number;
  invisible: number;
  disabled: number;
  hover: number;
  focus: number;
  pressed: number;
  selected: number;
}

// ====== BORDER WIDTH SYSTEM ======
export interface BorderWidthScale {
  none: number;
  thin: number;
  medium: number;
  thick: number;
}

// ====== ICON SIZES ======
export interface IconSizeScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  "2xl": number;
}

// ====== ANIMATION SYSTEM ======
export interface AnimationConfig {
  duration: number;
  easing: string;
}

export interface AnimationScale {
  instant: AnimationConfig;
  fast: AnimationConfig;
  normal: AnimationConfig;
  slow: AnimationConfig;
  slower: AnimationConfig;
}

// ====== Z-INDEX SYSTEM ======
export interface ZIndexScale {
  hide: number;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  overlay: number;
  modal: number;
  popover: number;
  tooltip: number;
  toast: number;
}

// ====== COMPLETE THEME INTERFACE ======
export interface Theme {
  colors: ColorPalette;
  typography: TypographyScale;
  spacing: SpacingScale;
  radii: RadiusScale;
  shadows: ShadowScale;
  opacity: OpacityScale;
  borderWidth: BorderWidthScale;
  iconSize: IconSizeScale;
  animation: AnimationScale;
  zIndex: ZIndexScale;
}

// ====== THEME MODE ======
export type ThemeMode = "light" | "dark" | "system";

export interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// ====== THEME OVERRIDES ======
export interface ThemeOverrides {
  colors?: Partial<ColorPalette>;
  typography?: Partial<TypographyScale>;
  spacing?: Partial<SpacingScale>;
  radii?: Partial<RadiusScale>;
  shadows?: Partial<ShadowScale>;
  opacity?: Partial<OpacityScale>;
  borderWidth?: Partial<BorderWidthScale>;
  iconSize?: Partial<IconSizeScale>;
  animation?: Partial<AnimationScale>;
  zIndex?: Partial<ZIndexScale>;
}

// ====== UTILITY TYPES ======
export type ColorToken = keyof ColorPalette;
export type TypographyVariantName = keyof TypographyScale;
export type SpacingToken = keyof SpacingScale;
export type RadiusToken = keyof RadiusScale;
export type ShadowTokenName = keyof ShadowScale;
export type OpacityToken = keyof OpacityScale;
export type BorderWidthToken = keyof BorderWidthScale;
export type IconSizeToken = keyof IconSizeScale;
export type AnimationToken = keyof AnimationScale;
export type ZIndexToken = keyof ZIndexScale;

// ====== COMPONENT PROP TYPES ======
export interface ThemedComponentProps {
  variant?: string;
  tone?: ColorToken;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export interface ThemedViewProps extends ThemedComponentProps {
  padding?: SpacingToken;
  margin?: SpacingToken;
  radius?: RadiusToken;
  shadow?: ShadowTokenName;
  borderWidth?: BorderWidthToken;
}

export interface ThemedTextProps extends ThemedComponentProps {
  variant?: TypographyVariantName;
  color?: ColorToken;
  align?: "auto" | "left" | "right" | "center" | "justify";
}
