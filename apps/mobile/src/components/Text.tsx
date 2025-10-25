/**
 * 🚀 UNIFIED TEXT COMPONENT - MOBILE
 *
 * Consolidates all typography implementations into a single, powerful component:
 * - ModernTypography: Gradient text via MaskedView, animations, variants
 * - PremiumTypography: Advanced effects, shadows, shimmer
 * - ui/Text: Theme integration, color tokens
 *
 * Features:
 * - 12+ text variants (h1-h6, body, caption, etc.)
 * - Gradient text with MaskedView
 * - Advanced effects (shimmer, glow, shadows)
 * - Animation support (fadeInUp, scaleIn, slideIn)
 * - Theme integration with color tokens
 * - Full TypeScript support
 * - Performance optimized with memo
 */

import React, { forwardRef, memo, useMemo, useEffect } from "react";
import {
  Text as RNText,
  StyleSheet,
  type TextStyle,
  type TextProps as RNTextProps,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

import { useTheme } from "../theme/useTheme";
import type { ColorPalette, TypographyScale } from "../theme/theme";

// === TYPES ===
export type TextVariant =
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "caption"
  | "overline"
  | "button"
  | "label"
  | "display"
  | "title"
  | "subtitle";

export type TextWeight =
  | "light"
  | "regular"
  | "medium"
  | "semibold"
  | "bold"
  | "extrabold"
  | "black";

export type TextColor =
  | "primary"
  | "secondary"
  | "tertiary"
  | "inverse"
  | "muted"
  | "accent";

export type AnimationType =
  | "fadeInUp"
  | "scaleIn"
  | "slideInLeft"
  | "slideInRight"
  | "fadeIn"
  | "none";

export type GradientType =
  | "primary"
  | "secondary"
  | "premium"
  | "sunset"
  | "ocean"
  | "holographic"
  | "neon"
  | "gold"
  | "rainbow"
  | "cyber"
  | "aurora";

export type ShadowType =
  | "primary"
  | "secondary"
  | "holographic"
  | "neon"
  | "glow"
  | "none";

export interface TextProps extends RNTextProps {
  // Content
  children: React.ReactNode;

  // Typography
  variant?: TextVariant;
  weight?: TextWeight;
  color?: TextColor;

  // Effects
  gradient?: GradientType;
  gradientColors?: string[];
  shadow?: ShadowType;
  glow?: boolean;
  shimmer?: boolean;

  // Animation
  animated?: boolean;
  animationType?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;

  // Layout
  align?: "auto" | "left" | "right" | "center" | "justify";

  // Theme
  tone?: keyof ColorPalette;
}

// === GRADIENT CONFIGURATIONS ===
const TEXT_GRADIENTS: Record<GradientType, string[]> = {
  primary: ["#ec4899", "#f472b6", "#f9a8d4"],
  secondary: ["#0ea5e9", "#38bdf8", "#7dd3fc"],
  premium: ["#a855f7", "#c084fc", "#d8b4fe"],
  sunset: ["#f59e0b", "#f97316", "#fb923c"],
  ocean: ["#0ea5e9", "#06b6d4", "#22d3ee"],
  holographic: ["#667eea", "#764ba2", "#f093fb", "#f5576c", "#4facfe"],
  neon: ["#00f5ff", "#ff00ff", "#ffff00"],
  gold: ["#ffd700", "#ffed4e", "#f39c12"],
  rainbow: [
    "#ff0000",
    "#ff7f00",
    "#ffff00",
    "#00ff00",
    "#0000ff",
    "#4b0082",
    "#9400d3",
  ],
  cyber: ["#00f5ff", "#ff0080", "#8000ff"],
  aurora: ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"],
};

// === SHADOW CONFIGURATIONS ===
const TEXT_SHADOWS: Record<ShadowType, TextStyle> = {
  primary: {
    textShadowColor: "#ec4899",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  secondary: {
    textShadowColor: "#0ea5e9",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  holographic: {
    textShadowColor: "#667eea",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  neon: {
    textShadowColor: "#00f5ff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  glow: {
    textShadowColor: "#ffffff",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  none: {},
};

// === VARIANT CONFIGURATIONS ===
const VARIANT_CONFIGS: Record<TextVariant, TextStyle> = {
  h1: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 28,
    fontWeight: "bold",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  h3: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 32,
    letterSpacing: -0.25,
  },
  h4: {
    fontSize: 20,
    fontWeight: "semibold",
    lineHeight: 28,
    letterSpacing: 0,
  },
  h5: {
    fontSize: 18,
    fontWeight: "semibold",
    lineHeight: 24,
    letterSpacing: 0,
  },
  h6: {
    fontSize: 16,
    fontWeight: "semibold",
    lineHeight: 22,
    letterSpacing: 0,
  },
  display: {
    fontSize: 48,
    fontWeight: "black",
    lineHeight: 56,
    letterSpacing: -1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    lineHeight: 30,
    letterSpacing: -0.25,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "medium",
    lineHeight: 24,
    letterSpacing: 0,
  },
  body: {
    fontSize: 16,
    fontWeight: "regular",
    lineHeight: 24,
    letterSpacing: 0,
  },
  bodyLarge: {
    fontSize: 18,
    fontWeight: "regular",
    lineHeight: 28,
    letterSpacing: 0,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "regular",
    lineHeight: 20,
    letterSpacing: 0,
  },
  caption: {
    fontSize: 12,
    fontWeight: "regular",
    lineHeight: 16,
    letterSpacing: 0.25,
  },
  overline: {
    fontSize: 10,
    fontWeight: "medium",
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  button: {
    fontSize: 16,
    fontWeight: "semibold",
    lineHeight: 20,
    letterSpacing: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: "medium",
    lineHeight: 18,
    letterSpacing: 0,
  },
};

// === WEIGHT CONFIGURATIONS ===
const WEIGHT_CONFIGS: Record<TextWeight, TextStyle> = {
  light: { fontWeight: "300" },
  regular: { fontWeight: "400" },
  medium: { fontWeight: "500" },
  semibold: { fontWeight: "600" },
  bold: { fontWeight: "700" },
  extrabold: { fontWeight: "800" },
  black: { fontWeight: "900" },
};

// === COLOR CONFIGURATIONS ===
const COLOR_CONFIGS: Record<TextColor, string> = {
  primary: "#111827",
  secondary: "#6b7280",
  tertiary: "#9ca3af",
  inverse: "#ffffff",
  muted: "#6b7280",
  accent: "#ec4899",
};

// === MAIN COMPONENT ===
const Text = forwardRef<RNText, TextProps>(
  (
    {
      children,
      variant = "body",
      weight,
      color,
      gradient,
      gradientColors,
      shadow = "none",
      glow = false,
      shimmer = false,
      animated = false,
      animationType = "fadeInUp",
      animationDelay = 0,
      animationDuration = 500,
      align = "auto",
      tone,
      style,
      ...props
    },
    ref,
  ) => {
    const { typography, colors } = useTheme();

    // Animation values
    const opacity = useSharedValue(animated ? 0 : 1);
    const translateY = useSharedValue(animated ? 20 : 0);
    const scale = useSharedValue(animated ? 0.9 : 1);
    const shimmerOffset = useSharedValue(-100);

    // Get variant styles
    const variantStyle = VARIANT_CONFIGS[variant];

    // Get weight styles
    const weightStyle = weight ? WEIGHT_CONFIGS[weight] : {};

    // Get color
    const textColor = useMemo(() => {
      if (tone) return colors[tone];
      if (color) return COLOR_CONFIGS[color];
      return variantStyle.color || "#111827";
    }, [tone, color, colors, variantStyle.color]);

    // Get shadow styles
    const shadowStyle = shadow !== "none" ? TEXT_SHADOWS[shadow] : {};

    // Get glow styles
    const glowStyle = glow ? TEXT_SHADOWS.glow : {};

    // Base text style
    const baseStyle: TextStyle = {
      ...variantStyle,
      ...weightStyle,
      color: textColor,
      textAlign: align,
      ...shadowStyle,
      ...glowStyle,
    };

    // Animation setup
    useEffect(() => {
      if (animated) {
        const animations = [];

        switch (animationType) {
          case "fadeInUp":
            animations.push(
              withDelay(
                animationDelay,
                withTiming(1, { duration: animationDuration }),
              ),
              withDelay(
                animationDelay,
                withTiming(0, { duration: animationDuration }),
              ),
            );
            break;
          case "scaleIn":
            animations.push(
              withDelay(
                animationDelay,
                withTiming(1, { duration: animationDuration }),
              ),
            );
            break;
          case "slideInLeft":
            animations.push(
              withDelay(
                animationDelay,
                withTiming(0, { duration: animationDuration }),
              ),
            );
            break;
          case "slideInRight":
            animations.push(
              withDelay(
                animationDelay,
                withTiming(0, { duration: animationDuration }),
              ),
            );
            break;
          case "fadeIn":
            animations.push(
              withDelay(
                animationDelay,
                withTiming(1, { duration: animationDuration }),
              ),
            );
            break;
        }

        if (animations.length > 0) {
          opacity.value = animations[0];
          if (animations.length > 1) {
            translateY.value = animations[1];
          }
          if (animations.length > 2) {
            scale.value = animations[2];
          }
        }
      }
    }, [
      animated,
      animationType,
      animationDelay,
      animationDuration,
      opacity,
      translateY,
      scale,
    ]);

    // Shimmer animation
    useEffect(() => {
      if (shimmer) {
        const shimmerAnimation = () => {
          shimmerOffset.value = withSequence(
            withTiming(100, { duration: 2000 }),
            withTiming(-100, { duration: 0 }),
          );
        };

        shimmerAnimation();
        const interval = setInterval(shimmerAnimation, 2000);
        return () => clearInterval(interval);
      }
    }, [shimmer, shimmerOffset]);

    // Animated styles
    const animatedStyle = useAnimatedStyle(() => ({
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }, { scale: scale.value }],
    }));

    // Shimmer animated style
    const shimmerAnimatedStyle = useAnimatedStyle(() => ({
      transform: [
        {
          translateX: interpolate(
            shimmerOffset.value,
            [-100, 100],
            [-200, 200],
            Extrapolate.CLAMP,
          ),
        },
      ],
    }));

    // Render gradient text
    if (gradient || gradientColors) {
      const gradientColorsArray = gradientColors || TEXT_GRADIENTS[gradient!];

      const gradientText = (
        <MaskedView
          style={[styles.maskedView, style]}
          maskElement={
            <RNText
              ref={ref}
              style={[baseStyle, animated ? animatedStyle : {}]}
              {...props}
            >
              {children}
            </RNText>
          }
        >
          <LinearGradient
            colors={gradientColorsArray}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          />
          {shimmer && (
            <Animated.View
              style={[styles.shimmerOverlay, shimmerAnimatedStyle]}
            />
          )}
        </MaskedView>
      );

      return gradientText;
    }

    // Render regular text
    const textElement = (
      <RNText
        ref={ref}
        style={[baseStyle, style, animated ? animatedStyle : {}]}
        {...props}
      >
        {children}
      </RNText>
    );

    // Add shimmer overlay for regular text
    if (shimmer) {
      return (
        <Animated.View style={[styles.shimmerContainer, style]}>
          {textElement}
          <Animated.View
            style={[styles.shimmerOverlay, shimmerAnimatedStyle]}
          />
        </Animated.View>
      );
    }

    return textElement;
  },
);

// Display name for debugging
Text.displayName = "Text";

// === PRESET COMPONENTS ===
export const Heading1 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h1" />
));
Heading1.displayName = "Heading1";

export const Heading2 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h2" />
));
Heading2.displayName = "Heading2";

export const Heading3 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h3" />
));
Heading3.displayName = "Heading3";

export const Heading4 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h4" />
));
Heading4.displayName = "Heading4";

export const Heading5 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h5" />
));
Heading5.displayName = "Heading5";

export const Heading6 = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="h6" />
));
Heading6.displayName = "Heading6";

export const Display = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="display" />
));
Display.displayName = "Display";

export const Title = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="title" />
));
Title.displayName = "Title";

export const Subtitle = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="subtitle" />
));
Subtitle.displayName = "Subtitle";

export const Body = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="body" />
));
Body.displayName = "Body";

export const BodyLarge = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="bodyLarge" />
));
BodyLarge.displayName = "BodyLarge";

export const BodySmall = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="bodySmall" />
));
BodySmall.displayName = "BodySmall";

export const Caption = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="caption" />
));
Caption.displayName = "Caption";

export const Overline = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="overline" />
));
Overline.displayName = "Overline";

export const ButtonText = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="button" />
));
ButtonText.displayName = "ButtonText";

export const Label = memo((props: Omit<TextProps, "variant">) => (
  <Text {...props} variant="label" />
));
Label.displayName = "Label";

// === GRADIENT TEXT COMPONENTS ===
export const GradientHeading = memo(
  (props: Omit<TextProps, "gradient"> & { gradient?: GradientType }) => (
    <Text {...props} gradient={props.gradient || "primary"} variant="h1" />
  ),
);
GradientHeading.displayName = "GradientHeading";

export const GradientText = memo(
  (props: Omit<TextProps, "gradient"> & { gradient?: GradientType }) => (
    <Text {...props} gradient={props.gradient || "primary"} />
  ),
);
GradientText.displayName = "GradientText";

export const HolographicText = memo((props: Omit<TextProps, "gradient">) => (
  <Text {...props} gradient="holographic" shimmer />
));
HolographicText.displayName = "HolographicText";

// === ANIMATED TEXT COMPONENTS ===
export const AnimatedHeading = memo(
  (props: Omit<TextProps, "animated"> & { animationType?: AnimationType }) => (
    <Text
      {...props}
      animated
      animationType={props.animationType || "fadeInUp"}
      variant="h1"
    />
  ),
);
AnimatedHeading.displayName = "AnimatedHeading";

export const AnimatedText = memo(
  (props: Omit<TextProps, "animated"> & { animationType?: AnimationType }) => (
    <Text
      {...props}
      animated
      animationType={props.animationType || "fadeInUp"}
    />
  ),
);
AnimatedText.displayName = "AnimatedText";

// === STYLES ===
const styles = StyleSheet.create({
  maskedView: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    height: "100%",
  },
  shimmerContainer: {
    position: "relative",
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    width: 50,
  },
});

export default Text;
