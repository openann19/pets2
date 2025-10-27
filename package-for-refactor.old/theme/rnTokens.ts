/**
 * 🎨 RN-SAFE TOKENS WRAPPER
 * Wraps @pawfectmatch/design-tokens for React Native compatibility
 */

import { COLORS, SPACING, RADIUS } from "@pawfectmatch/design-tokens";
import type { ColorScheme, Theme } from "./types";
import { Easing } from "react-native";

const toPx = (v: number | string): number =>
  typeof v === "string" ? Number.parseFloat(v.replace("rem", "")) * 16 : v;

export const createTheme = (scheme: ColorScheme): Theme => {
  const c = COLORS;
  const s = SPACING;
  const r = RADIUS;

  const isDark = scheme === "dark";

  return {
    scheme,
    colors: {
      bg: isDark ? c.neutral[950] : c.neutral[0],
      bgElevated: isDark ? c.neutral[900] : c.neutral[50],
      text: isDark ? c.neutral[50] : c.neutral[950],
      textMuted: isDark ? c.neutral[400] : c.neutral[600],
      primary: c.primary[600],
      primaryText: c.neutral[0],
      border: isDark ? c.neutral[800] : c.neutral[200],
      success: "#10b981",
      warning: "#f59e0b",
      danger: "#ef4444",
    },
    spacing: {
      xs: toPx(s[1]),
      sm: toPx(s[2]),
      md: toPx(s[4]),
      lg: toPx(s[6]),
      xl: toPx(s[8]),
    },
    radius: {
      sm: toPx(r.sm),
      md: toPx(r.md),
      lg: toPx(r.lg),
      xl: toPx(r.xl),
      pill: 999,
    },
    motion: {
      duration: { fast: 150, normal: 250, slow: 400 },
      easing: { standard: Easing.bezier(0.4, 0, 0.2, 1) },
      spring: { stiff: { stiffness: 300, damping: 30, mass: 0.9 } },
    },
    // Backward compatibility
    isDark,
    styles: {},
    shadows: {},
  };
};

