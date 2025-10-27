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
      // Required numeric string properties
      "0": "0px",
      "1": "4px",
      "2": "8px",
      "3": "12px",
      "4": "16px",
      "5": "20px",
      "6": "24px",
      "7": "28px",
      "8": "32px",
      "9": "36px",
      "10": "40px",
      "11": "44px",
      "12": "48px",
      "14": "56px",
      "16": "64px",
      "20": "80px",
      "24": "96px",
      "28": "112px",
      "32": "128px",
      "36": "144px",
      "40": "160px",
      "44": "176px",
      "48": "192px",
      "52": "208px",
      "56": "224px",
      "60": "240px",
      "64": "256px",
      "72": "288px",
      "80": "320px",
      "96": "384px",
      // Named spacing helpers
      xs: toPx(s[1]),
      sm: toPx(s[2]),
      md: toPx(s[4]),
      lg: toPx(s[6]),
      xl: toPx(s[8]),
      "2xl": toPx(s[10]),
      "3xl": toPx(s[12]),
      "4xl": toPx(s[16]),
    },
    radius: {
      none: 0,
      xs: toPx(r.sm) * 0.5,
      sm: toPx(r.sm),
      md: toPx(r.md),
      lg: toPx(r.lg),
      xl: toPx(r.xl),
      "2xl": toPx(r.xl) * 1.5,
      full: 9999,
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

