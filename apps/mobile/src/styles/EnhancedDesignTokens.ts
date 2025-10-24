/**
 * Mobile Enhanced Design Tokens
 * Imports from unified design tokens package and adds mobile-specific overrides
 */

import { Dimensions, Platform } from "react-native";
import {
  COLORS,
  GRADIENTS,
  SHADOWS,
  BLUR,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  TRANSITIONS,
  Z_INDEX,
  VARIANTS,
  utils,
  type ColorScale,
  type ColorShade,
  type GradientName,
  type ShadowSize,
  type RadiusSize,
  type SpacingSize,
  type FontSize,
  type FontWeight,
  type LineHeight,
  type TransitionType,
  type ZIndexLevel,
  type ButtonVariant,
  type CardVariant,
  type InputVariant,
} from "@pawfectmatch/design-tokens";

const { width: screenWidth } = Dimensions.get("window");

// Mobile-specific overrides and extensions
export const MOBILE_TOKENS = {
  // Screen breakpoints for responsive design
  breakpoints: {
    sm: 375,
    md: 414,
    lg: 768,
    xl: 1024,
  },

  // Device-specific spacing adjustments
  spacing: {
    ...SPACING,
    // Mobile-optimized spacing
    safeAreaTop: Platform.OS === "ios" ? SPACING[12] : SPACING[4],
    safeAreaBottom: Platform.OS === "ios" ? SPACING[8] : SPACING[4],
    tabBar: SPACING[16],
    statusBar: Platform.OS === "ios" ? SPACING[11] : SPACING[6],
  },

  // Mobile typography adjustments
  typography: {
    ...TYPOGRAPHY,
    // Adjust line heights for mobile readability
    lineHeights: {
      ...TYPOGRAPHY.lineHeights,
      mobileTight: "1.2",
      mobileNormal: "1.4",
      mobileRelaxed: "1.6",
    },
  },

  // Mobile-specific shadows (scaled for smaller screens)
  shadows: {
    ...SHADOWS,
    mobile: {
      xs: "0 1px 2px 0 rgba(0, 0, 0, 0.08)",
      sm: "0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px 0 rgba(0, 0, 0, 0.08)",
      md: "0 4px 6px -1px rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.08)",
      lg: "0 10px 15px -3px rgba(0, 0, 0, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.06)",
    },
  },

  // Mobile-optimized transitions
  transitions: {
    ...TRANSITIONS,
    mobile: {
      tap: {
        duration: 100,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      slide: {
        duration: 250,
        easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      },
    },
  },
} as const;

// Re-export all design tokens for convenience
export {
  COLORS,
  GRADIENTS,
  SHADOWS,
  BLUR,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  TRANSITIONS,
  Z_INDEX,
  VARIANTS,
  utils,
};

// Re-export types
export type {
  ColorScale,
  ColorShade,
  GradientName,
  ShadowSize,
  RadiusSize,
  SpacingSize,
  FontSize,
  FontWeight,
  LineHeight,
  TransitionType,
  ZIndexLevel,
  ButtonVariant,
  CardVariant,
  InputVariant,
};

// Legacy support - map old token names to new ones
export const tokens = {
  colors: COLORS,
  gradients: GRADIENTS,
  shadows: SHADOWS,
  blur: BLUR,
  radius: RADIUS,
  spacing: SPACING,
  typography: TYPOGRAPHY,
  transitions: TRANSITIONS,
  zIndex: Z_INDEX,
  variants: VARIANTS,
  mobile: MOBILE_TOKENS,
  utils,
} as const;

// Export mobile-specific utilities
export const getResponsiveSpacing = (size: keyof typeof SPACING): string => {
  // Adjust spacing based on screen size
  if (screenWidth < 375) {
    // Small phones - reduce spacing
    const scale = 0.9;
    const baseValue = SPACING[size];
    if (typeof baseValue === "string" && baseValue.endsWith("rem")) {
      const numValue = parseFloat(baseValue.replace("rem", ""));
      const scaled = numValue * scale;
      return `${scaled.toString()}rem`;
    }
  }
  return SPACING[size];
};

export const getMobileTypography = (
  size: keyof typeof TYPOGRAPHY.fontSizes,
): string => {
  // Adjust font sizes for mobile readability
  const baseSize = TYPOGRAPHY.fontSizes[size];
  if (Platform.OS === "ios") {
    // iOS font scaling
    if (size === "xs" || size === "sm") {
      return baseSize; // Keep small text readable
    }
  }
  return baseSize;
};
