/**
 * 🎨 MOBILE DESIGN TOKENS
 * React Native-adapted design tokens from @pawfectmatch/design-tokens
 * Converts web tokens to mobile-compatible format
 */

import { Platform } from "react-native";
import {
  COLORS as DESIGN_COLORS,
  SPACING as DESIGN_SPACING,
  RADIUS as DESIGN_RADIUS,
  TYPOGRAPHY as DESIGN_TYPOGRAPHY,
  TRANSITIONS as DESIGN_TRANSITIONS,
  Z_INDEX as DESIGN_Z_INDEX,
} from "@pawfectmatch/design-tokens";
import type {
  ColorPalette,
  TypographyScale,
  SpacingScale,
  RadiusScale,
  ShadowScale,
  OpacityScale,
  BorderWidthScale,
  IconSizeScale,
  AnimationScale,
  ZIndexScale,
} from "./types";

// ====== HELPER FUNCTIONS ======
const remToPx = (rem: string): number => {
  const num = parseFloat(rem.replace("rem", ""));
  return num * 16; // 1rem = 16px
};

const pxToNumber = (px: string): number => {
  return parseFloat(px.replace("px", ""));
};

// ====== COLOR PALETTE ======
const createColorPalette = (isDark: boolean): ColorPalette => {
  const colors = DESIGN_COLORS;

  return {
    // Brand colors
    primary: colors.primary[500],
    primaryLight: colors.primary[400],
    primaryDark: colors.primary[700],
    primaryForeground: colors.neutral[0],

    secondary: colors.secondary[500],
    secondaryLight: colors.secondary[400],
    secondaryDark: colors.secondary[700],
    secondaryForeground: colors.neutral[0],

    // Status colors
    success: colors.success[500],
    warning: colors.warning[500],
    error: colors.error[500],
    info: colors.info[500],

    // Semantic colors
    background: isDark ? colors.neutral[900] : colors.neutral[0],
    backgroundSecondary: isDark ? colors.neutral[800] : colors.neutral[50],
    backgroundTertiary: isDark ? colors.neutral[700] : colors.neutral[100],

    surface: isDark ? colors.neutral[800] : colors.neutral[0],
    surfaceMuted: isDark ? colors.neutral[700] : colors.neutral[50],
    surfaceElevated: isDark ? colors.neutral[700] : colors.neutral[100],

    border: isDark ? colors.neutral[600] : colors.neutral[300],
    borderLight: isDark ? colors.neutral[700] : colors.neutral[200],
    borderDark: isDark ? colors.neutral[500] : colors.neutral[400],

    text: isDark ? colors.neutral[0] : colors.neutral[900],
    textSecondary: isDark ? colors.neutral[300] : colors.neutral[600],
    textTertiary: isDark ? colors.neutral[500] : colors.neutral[500],
    textInverse: isDark ? colors.neutral[900] : colors.neutral[0],

    // Overlay colors
    overlay: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
    overlayDark: isDark ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.5)",

    // Special colors
    glass: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.8)",
    glassLight: isDark
      ? "rgba(255, 255, 255, 0.05)"
      : "rgba(255, 255, 255, 0.6)",
    glassDark: isDark
      ? "rgba(255, 255, 255, 0.15)"
      : "rgba(255, 255, 255, 0.9)",
  };
};

// ====== TYPOGRAPHY SCALE ======
const createTypographyScale = (): TypographyScale => {
  const typography = DESIGN_TYPOGRAPHY;

  return {
    heading1: {
      fontSize: remToPx(typography.fontSizes["4xl"]),
      lineHeight: remToPx(typography.fontSizes["4xl"]) * 1.2,
      fontWeight: typography.fontWeights.bold,
    },
    heading2: {
      fontSize: remToPx(typography.fontSizes["3xl"]),
      lineHeight: remToPx(typography.fontSizes["3xl"]) * 1.2,
      fontWeight: typography.fontWeights.bold,
    },
    heading3: {
      fontSize: remToPx(typography.fontSizes["2xl"]),
      lineHeight: remToPx(typography.fontSizes["2xl"]) * 1.3,
      fontWeight: typography.fontWeights.semibold,
    },
    heading4: {
      fontSize: remToPx(typography.fontSizes.xl),
      lineHeight: remToPx(typography.fontSizes.xl) * 1.3,
      fontWeight: typography.fontWeights.semibold,
    },
    heading5: {
      fontSize: remToPx(typography.fontSizes.lg),
      lineHeight: remToPx(typography.fontSizes.lg) * 1.4,
      fontWeight: typography.fontWeights.medium,
    },
    heading6: {
      fontSize: remToPx(typography.fontSizes.base),
      lineHeight: remToPx(typography.fontSizes.base) * 1.4,
      fontWeight: typography.fontWeights.medium,
    },
    subtitle: {
      fontSize: remToPx(typography.fontSizes.lg),
      lineHeight: remToPx(typography.fontSizes.lg) * 1.5,
      fontWeight: typography.fontWeights.medium,
      letterSpacing: pxToNumber(typography.letterSpacing.wide),
    },
    subtitleSmall: {
      fontSize: remToPx(typography.fontSizes.base),
      lineHeight: remToPx(typography.fontSizes.base) * 1.5,
      fontWeight: typography.fontWeights.medium,
      letterSpacing: pxToNumber(typography.letterSpacing.wide),
    },
    body: {
      fontSize: remToPx(typography.fontSizes.base),
      lineHeight: remToPx(typography.fontSizes.base) * 1.5,
      fontWeight: typography.fontWeights.normal,
    },
    bodySmall: {
      fontSize: remToPx(typography.fontSizes.sm),
      lineHeight: remToPx(typography.fontSizes.sm) * 1.5,
      fontWeight: typography.fontWeights.normal,
    },
    callout: {
      fontSize: remToPx(typography.fontSizes.sm),
      lineHeight: remToPx(typography.fontSizes.sm) * 1.4,
      fontWeight: typography.fontWeights.medium,
    },
    caption: {
      fontSize: remToPx(typography.fontSizes.xs),
      lineHeight: remToPx(typography.fontSizes.xs) * 1.4,
      fontWeight: typography.fontWeights.medium,
      letterSpacing: pxToNumber(typography.letterSpacing.wider),
    },
    overline: {
      fontSize: remToPx(typography.fontSizes.xs),
      lineHeight: remToPx(typography.fontSizes.xs) * 1.2,
      fontWeight: typography.fontWeights.semibold,
      letterSpacing: pxToNumber(typography.letterSpacing.widest),
    },
    button: {
      fontSize: remToPx(typography.fontSizes.base),
      lineHeight: remToPx(typography.fontSizes.base) * 1.2,
      fontWeight: typography.fontWeights.semibold,
      letterSpacing: pxToNumber(typography.letterSpacing.wide),
    },
    label: {
      fontSize: remToPx(typography.fontSizes.sm),
      lineHeight: remToPx(typography.fontSizes.sm) * 1.3,
      fontWeight: typography.fontWeights.medium,
    },
  };
};

// ====== SPACING SCALE ======
const createSpacingScale = (): SpacingScale => {
  return {
    none: 0,
    xs: remToPx(DESIGN_SPACING[1]),
    sm: remToPx(DESIGN_SPACING[2]),
    md: remToPx(DESIGN_SPACING[4]),
    lg: remToPx(DESIGN_SPACING[6]),
    xl: remToPx(DESIGN_SPACING[8]),
    "2xl": remToPx(DESIGN_SPACING[12]),
    "3xl": remToPx(DESIGN_SPACING[16]),
    "4xl": remToPx(DESIGN_SPACING[24]),
  };
};

// ====== RADIUS SCALE ======
const createRadiusScale = (): RadiusScale => {
  return {
    none: 0,
    xs: pxToNumber(DESIGN_RADIUS.sm),
    sm: pxToNumber(DESIGN_RADIUS.md),
    md: pxToNumber(DESIGN_RADIUS.lg),
    lg: pxToNumber(DESIGN_RADIUS.xl),
    xl: pxToNumber(DESIGN_RADIUS["2xl"]),
    "2xl": pxToNumber(DESIGN_RADIUS["3xl"]),
    full: pxToNumber(DESIGN_RADIUS.full),
    pill: 9999,
  };
};

// ====== SHADOW SCALE ======
const createShadowScale = (isDark: boolean): ShadowScale => {
  const baseColor = isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.1)";

  return {
    none: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    xs: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    "2xl": {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.3,
      shadowRadius: 32,
      elevation: 16,
    },
  };
};

// ====== OPACITY SCALE ======
const createOpacityScale = (): OpacityScale => {
  return {
    transparent: 0,
    invisible: 0.01,
    disabled: 0.5,
    hover: 0.8,
    focus: 0.9,
    pressed: 0.7,
    selected: 1,
  };
};

// ====== BORDER WIDTH SCALE ======
const createBorderWidthScale = (): BorderWidthScale => {
  return {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 3,
  };
};

// ====== ICON SIZE SCALE ======
const createIconSizeScale = (): IconSizeScale => {
  return {
    xs: 12,
    sm: 16,
    md: 24,
    lg: 32,
    xl: 40,
    "2xl": 48,
  };
};

// ====== ANIMATION SCALE ======
const createAnimationScale = (): AnimationScale => {
  const transitions = DESIGN_TRANSITIONS;

  return {
    instant: {
      duration: 50,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    fast: {
      duration: transitions.micro.duration,
      easing: transitions.micro.easing,
    },
    normal: {
      duration: transitions.smooth.duration,
      easing: transitions.smooth.easing,
    },
    slow: {
      duration: transitions.bouncy.duration,
      easing: transitions.bouncy.easing,
    },
    slower: {
      duration: transitions.gentle.duration,
      easing: transitions.gentle.easing,
    },
  };
};

// ====== Z-INDEX SCALE ======
const createZIndexScale = (): ZIndexScale => {
  return {
    hide: DESIGN_Z_INDEX.hide,
    base: DESIGN_Z_INDEX.base,
    docked: DESIGN_Z_INDEX.docked,
    dropdown: DESIGN_Z_INDEX.dropdown,
    sticky: DESIGN_Z_INDEX.sticky,
    overlay: DESIGN_Z_INDEX.overlay,
    modal: DESIGN_Z_INDEX.modal,
    popover: DESIGN_Z_INDEX.popover,
    tooltip: DESIGN_Z_INDEX.tooltip,
    toast: DESIGN_Z_INDEX.toast,
  };
};

// ====== EXPORT THEME CREATION FUNCTIONS ======
export const createTheme = (isDark: boolean = false) => ({
  colors: createColorPalette(isDark),
  typography: createTypographyScale(),
  spacing: createSpacingScale(),
  radii: createRadiusScale(),
  shadows: createShadowScale(isDark),
  opacity: createOpacityScale(),
  borderWidth: createBorderWidthScale(),
  iconSize: createIconSizeScale(),
  animation: createAnimationScale(),
  zIndex: createZIndexScale(),
});

export const lightTheme = createTheme(false);
export const darkTheme = createTheme(true);
