/**
 * Enhanced Design Tokens - RN-Safe Facade Wrappers
 * Provides React Native compatible design tokens and utilities
 */

import type {
  ViewStyle,
  TextStyle,
  ColorValue,
} from "react-native";
import { StyleSheet, Text } from "react-native";
import { Easing } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

// Import base tokens from design-tokens package (React Native optimized)
import {
  COLORS,
  TYPOGRAPHY,
  SHADOWS,
  SPACING,
  RADIUS,
  TRANSITIONS,
  Z_INDEX,
  VARIANTS,
  utils,
} from "@pawfectmatch/design-tokens";

// ===== RN-SAFE FACADE WRAPPERS =====

/** DynamicColors — gradients + glass presets (RN-safe) */
export const DynamicColors = {
  gradients: {
    primary: {
      colors: ["#ec4899", "#db2777"] as ColorValue[],
      locations: [0, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    secondary: {
      colors: ["#a855f7", "#9333ea"] as ColorValue[],
      locations: [0, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
    premium: {
      colors: ["#ec4899", "#a855f7", "#3b82f6"] as ColorValue[],
      locations: [0, 0.5, 1],
      start: { x: 0, y: 0 },
      end: { x: 1, y: 1 },
    },
  },
  /** Glass configs: pair a BlurView intensity with an overlay style */
  glass: {
    light: {
      blurIntensity: 10,
      overlayStyle: {
        backgroundColor: "rgba(255,255,255,0.7)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.3)",
      } as ViewStyle,
    },
    medium: {
      blurIntensity: 20,
      overlayStyle: {
        backgroundColor: "rgba(255,255,255,0.5)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.2)",
      } as ViewStyle,
    },
    strong: {
      blurIntensity: 30,
      overlayStyle: {
        backgroundColor: "rgba(255,255,255,0.3)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.1)",
      } as ViewStyle,
    },
  },
} as const;

/** EnhancedShadows — depth + glow (iOS + Android) */
export const EnhancedShadows = {
  depth: {
    sm: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    } as ViewStyle,
    md: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    } as ViewStyle,
    lg: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    } as ViewStyle,
    xl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 16,
      elevation: 12,
    } as ViewStyle,
    xxl: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.22,
      shadowRadius: 24,
      elevation: 20,
    } as ViewStyle,
  },
  glow: {
    primary: {
      shadowColor: COLORS.primary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } as ViewStyle,
    secondary: {
      shadowColor: COLORS.secondary[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } as ViewStyle,
    success: {
      shadowColor: COLORS.success[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } as ViewStyle,
    warning: {
      shadowColor: COLORS.warning[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } as ViewStyle,
    error: {
      shadowColor: COLORS.error[500],
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    } as ViewStyle,
  },
} as const;

/** SemanticColors — semantic mapping to token colors */
export const SemanticColors = {
  background: {
    primary: COLORS.neutral[0],
    secondary: COLORS.neutral[50],
    tertiary: COLORS.neutral[100],
    elevated: COLORS.neutral[0],
  },
  text: {
    primary: COLORS.neutral[900],
    secondary: COLORS.neutral[600],
    tertiary: COLORS.neutral[400],
    inverse: COLORS.neutral[0],
    disabled: COLORS.neutral[300],
  },
  interactive: {
    primary: COLORS.primary[500],
    primaryHover: COLORS.primary[600],
    secondary: COLORS.secondary[500],
    secondaryHover: COLORS.secondary[600],
    success: COLORS.success[500],
    warning: COLORS.warning[500],
    error: COLORS.error[500],
  },
  border: {
    default: COLORS.neutral[300],
    subtle: COLORS.neutral[200],
    strong: COLORS.neutral[400],
    interactive: COLORS.primary[500],
  },
  surface: {
    default: COLORS.neutral[0],
    elevated: COLORS.neutral[50],
    overlay: "rgba(0,0,0,0.5)",
  },
} as const;

/** EnhancedTypography — RN-safe (no CSS background). Gradient via helper component below. */
export const EnhancedTypography = {
  effects: {
    shadow: {
      glow: {
        textShadowColor: COLORS.primary[500],
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
      } as TextStyle,
      subtle: {
        textShadowColor: "rgba(0,0,0,0.1)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
      } as TextStyle,
      strong: {
        textShadowColor: "rgba(0,0,0,0.3)",
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 8,
      } as TextStyle,
    },
  },
  scales: { ...TYPOGRAPHY.fontSizes },
  weights: { ...TYPOGRAPHY.fontWeights },
  lineHeights: { ...TYPOGRAPHY.lineHeights },
} as const;

/** GradientText — helper for gradient-filled text (MaskedView + LinearGradient) */
export function GradientText(props: {
  children: string;
  variant?: keyof (typeof DynamicColors)["gradients"];
  textStyle?: TextStyle;
}) {
  const v = props.variant ?? "primary";
  const g = DynamicColors.gradients[v];
  return (
    <MaskedView
      maskElement={
        <Text
          style={StyleSheet.flatten([
            { backgroundColor: "transparent" },
            props.textStyle,
          ])}
        >
          {props.children}
        </Text>
      }
    >
      <LinearGradient colors={g.colors as string[]} start={g.start} end={g.end}>
        {/* Match text bounding box with some filler view */}
        <Text style={StyleSheet.flatten([{ opacity: 0 }, props.textStyle])}>
          {props.children}
        </Text>
      </LinearGradient>
    </MaskedView>
  );
}

/** MotionSystem — timings, easings (as Easing functions), and spring presets */
export const MotionSystem = {
  springs: {
    // Legacy spring (Animated.spring w/ tension/friction)
    legacy: {
      gentle: { tension: 100, friction: 8 },
      standard: { tension: 200, friction: 10 },
      bouncy: { tension: 300, friction: 10 },
      snappy: { tension: 400, friction: 15 },
    },
    // Stiffness/damping presets (good for Reanimated)
    stiff: { stiffness: 320, damping: 24 },
    soft: { stiffness: 200, damping: 26 },
  },
  timings: {
    fast: 150,
    standard: 300,
    slow: 500,
    verySlow: 800,
  },
  easings: {
    standard: Easing.bezier(0.4, 0, 0.2, 1),
    easeIn: Easing.bezier(0.4, 0, 1, 1),
    easeOut: Easing.bezier(0, 0, 0.2, 1),
    easeInOut: Easing.bezier(0.4, 0, 0.2, 1),
    bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
  },
  delays: {
    instant: 0,
    fast: 100,
    standard: 200,
    slow: 500,
  },
} as const;

/** Accessibility presets */
export const Accessibility = {
  motion: {
    prefersReducedMotion: false,
    reducedMotionConfigs: {
      timings: { standard: 200, fast: 100, slow: 300 },
      springs: {
        gentle: { tension: 50, friction: 5 },
        standard: { tension: 100, friction: 8 },
      },
    },
  },
  colors: { highContrast: false },
  screenReader: { enabled: true },
} as const;

// Types
export type DynamicColorsType = typeof DynamicColors;
export type EnhancedShadowsType = typeof EnhancedShadows;
export type SemanticColorsType = typeof SemanticColors;
export type EnhancedTypographyType = typeof EnhancedTypography;
export type MotionSystemType = typeof MotionSystem;
export type AccessibilityType = typeof Accessibility;
