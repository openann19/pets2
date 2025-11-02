/**
 * Theme Helper Functions
 * Centralized theme utilities for consistent styling across the app
 */

import { Theme } from "../theme/unified-theme";

// === COLOR HELPERS ===

/**
 * Get primary color with optional shade
 */
export function getPrimaryColorString(
  shade: keyof typeof Theme.colors.primary = 600,
): string {
  return Theme.colors.primary[shade];
}

/**
 * Get secondary color with optional shade
 */
export function getSecondaryColorString(
  shade: keyof typeof Theme.colors.secondary = 600,
): string {
  return Theme.colors.secondary[shade];
}

/**
 * Get text color based on context
 */
export function getTextColorString(
  context: "primary" | "secondary" | "tertiary" | "inverse" = "primary",
): string {
  switch (context) {
    case "primary":
      return Theme.colors.textColor;
    case "secondary":
      return Theme.colors.text.secondary;
    case "tertiary":
      return Theme.colors.text.tertiary;
    case "inverse":
      return Theme.colors.text.inverse;
    default:
      return Theme.colors.textColor;
  }
}

/**
 * Get status color based on type
 */
export function getStatusColorString(
  type: "success" | "warning" | "error" | "info",
): string {
  switch (type) {
    case "success":
      return Theme.colors.status.success;
    case "warning":
      return Theme.colors.status.warning;
    case "error":
      return Theme.colors.status.error;
    case "info":
      return Theme.colors.status.info;
    default:
      return Theme.colors.status.info;
  }
}

/**
 * Get background color based on context
 */
export function getBackgroundColorString(
  context: "primary" | "secondary" | "tertiary" | "surface" = "primary",
): string {
  switch (context) {
    case "primary":
      return Theme.colors.backgroundColor.primary;
    case "secondary":
      return Theme.colors.backgroundColor.secondary;
    case "tertiary":
      return Theme.colors.backgroundColor.tertiary;
    case "surface":
      return Theme.colors.backgroundColor.surface;
    default:
      return Theme.colors.backgroundColor.primary;
  }
}

/**
 * Get border color based on context
 */
export function getBorderColorString(
  context: "light" | "medium" | "strong" = "light",
): string {
  switch (context) {
    case "light":
      return Theme.colors.borderColor.light;
    case "medium":
      return Theme.colors.borderColor.medium;
    case "strong":
      return Theme.colors.borderColor.strong;
    default:
      return Theme.colors.borderColor.light;
  }
}

// === SPACING HELPERS ===

/**
 * Get spacing value
 */
export function getSpacingString(size: keyof typeof Theme.spacing): string {
  return Theme.spacing[size];
}

/**
 * Get border radius value
 */
export function getBorderRadiusString(
  size: keyof typeof Theme.borderRadius,
): string {
  return Theme.borderRadius[size];
}

// === TYPOGRAPHY HELPERS ===

/**
 * Get font size value
 */
export function getFontSizeString(
  size: keyof typeof Theme.typography.fontSize,
): string {
  return Theme.typography.fontSize[size];
}

/**
 * Get font weight value
 */
export function getFontWeightString(
  weight: keyof typeof Theme.typography.fontWeight,
): string {
  return Theme.typography.fontWeight[weight];
}

/**
 * Get line height value
 */
export function getLineHeightString(
  height: keyof typeof Theme.typography.lineHeight,
): string {
  return Theme.typography.lineHeight[height];
}

// === SHADOW HELPERS ===

/**
 * Get shadow configuration
 */
export function getShadowString(depth: keyof typeof Theme.shadows.depth) {
  return Theme.shadows.depth[depth];
}

// === GRADIENT HELPERS ===

/**
 * Get gradient colors
 */
export function getGradientColorsString(
  gradient: keyof typeof Theme.gradients,
): string[] {
  return Theme.gradients[gradient].colors;
}

// === UTILITY HELPERS ===

/**
 * Get opacity value
 */
export function getOpacityString(opacity: keyof typeof Theme.opacity): string {
  return Theme.opacity[opacity];
}

/**
 * Get z-index value
 */
export function getZIndexString(index: keyof typeof Theme.zIndex): string {
  return Theme.zIndex[index];
}

// === RESPONSIVE HELPERS ===

/**
 * Get responsive breakpoint
 */
export function getBreakpointString(
  breakpoint: keyof typeof Theme.breakpoints,
): string {
  return Theme.breakpoints[breakpoint];
}

// === ANIMATION HELPERS ===

/**
 * Get animation duration
 */
export function getAnimationDurationString(
  duration: keyof typeof Theme.animation.duration,
): string {
  return Theme.animation.duration[duration];
}

/**
 * Get animation easing
 */
export function getAnimationEasingString(
  easing: keyof typeof Theme.animation.easing,
): string {
  return Theme.animation.easing[easing];
}

// === COMPOSITE HELPERS ===

/**
 * Get button style based on variant
 */
export function getButtonStyleString(
  variant: "primary" | "secondary" | "ghost" | "outline",
) {
  const baseStyle = {
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
  };

  switch (variant) {
    case "primary":
      return {
        ...baseStyle,
        backgroundColor: Theme.colors.primary[600],
        ...Theme.shadows.depth.sm,
      };
    case "secondary":
      return {
        ...baseStyle,
        backgroundColor: Theme.colors.secondary[600],
        ...Theme.shadows.depth.sm,
      };
    case "ghost":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
      };
    case "outline":
      return {
        ...baseStyle,
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: Theme.colors.primary[600],
      };
    default:
      return baseStyle;
  }
}

/**
 * Get card style
 */
export function getCardStyleString() {
  return {
    backgroundColor: Theme.colors.backgroundColor.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.lg,
    ...Theme.shadows.depth.md,
  };
}

/**
 * Get input style
 */
export function getInputStyleString() {
  return {
    backgroundColor: Theme.colors.backgroundColor.surface,
    borderColor: Theme.colors.borderColor.light,
    borderWidth: 1,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    fontSize: Theme.typography.fontSize.base,
    color: Theme.colors.textColor,
  };
}
