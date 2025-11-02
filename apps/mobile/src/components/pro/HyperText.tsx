/**
 * 🎨 HYPERTEXT - PRO-GRADE ANIMATED TEXT
 *
 * Production-ready gradient text with animations
 * - Real gradient fills via MaskedView
 * - Smooth entrance animations
 * - Neon glow effects
 * - Shimmer sweep
 * - Theme-integrated
 * - Reduce-motion aware
 */

import React, { memo, useEffect } from "react";
import {
  StyleSheet,
  Text as RNText,
  View,
  AccessibilityInfo,
  type TextStyle,
  type TextProps as RNTextProps,
} from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  interpolate,
  Easing,
  Extrapolate,
} from "react-native-reanimated";
import { Theme } from "../../theme/unified-theme";

// === TYPES ===
export type TextVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "title"
  | "subtitle"
  | "body"
  | "bodyLarge"
  | "bodySmall"
  | "caption"
  | "overline"
  | "button"
  | "label";

export type TextWeight = "300" | "400" | "500" | "600" | "700" | "800" | "900";

export type AnimationType =
  | "none"
  | "fadeInUp"
  | "scaleIn"
  | "slideInLeft"
  | "slideInRight";

export type Effect = "gradient" | "neon" | "shimmer" | "shadow" | "glow";

export interface HyperTextProps extends Omit<RNTextProps, "style"> {
  children: string | React.ReactNode;
  variant?: TextVariant;
  weight?: TextWeight;
  color?: string;
  align?: TextStyle["textAlign"];
  animated?: boolean;
  animationType?: AnimationType;
  animationDelay?: number;
  animationDuration?: number;
  effects?: Effect[];
  gradientColors?: string[];
  glowColor?: string;
  shimmerIntensity?: number;
  style?: TextStyle | TextStyle[];
}

// === VARIANT STYLES ===
const VARIANT: Record<TextVariant, TextStyle> = {
  display: {
    fontSize: 48,
    lineHeight: 56,
    letterSpacing: -1,
    fontWeight: "900",
  },
  h1: { fontSize: 32, lineHeight: 40, letterSpacing: -0.5, fontWeight: "700" },
  h2: { fontSize: 28, lineHeight: 36, letterSpacing: -0.5, fontWeight: "700" },
  h3: { fontSize: 24, lineHeight: 32, letterSpacing: -0.25, fontWeight: "700" },
  h4: { fontSize: 20, lineHeight: 28, letterSpacing: 0, fontWeight: "600" },
  h5: { fontSize: 18, lineHeight: 24, letterSpacing: 0, fontWeight: "600" },
  h6: { fontSize: 16, lineHeight: 22, letterSpacing: 0, fontWeight: "600" },
  title: {
    fontSize: 22,
    lineHeight: 30,
    letterSpacing: -0.25,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0,
    fontWeight: "500",
  },
  body: { fontSize: 16, lineHeight: 24, letterSpacing: 0, fontWeight: "400" },
  bodyLarge: {
    fontSize: 18,
    lineHeight: 28,
    letterSpacing: 0,
    fontWeight: "400",
  },
  bodySmall: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0,
    fontWeight: "400",
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.25,
    fontWeight: "400",
  },
  overline: {
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.5,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  button: { fontSize: 16, lineHeight: 20, letterSpacing: 0, fontWeight: "600" },
  label: { fontSize: 14, lineHeight: 18, letterSpacing: 0, fontWeight: "500" },
};

const AText = Animated.createAnimatedComponent(RNText);
const AView = Animated.createAnimatedComponent(View);

const has = (effects: Effect[] | undefined, e: Effect) =>
  !!effects && effects.includes(e);

export const HyperText = memo(function HyperText({
  children,
  variant = "body",
  weight,
  color = Theme.colors.textColor,
  align = "auto",
  animated = false,
  animationType = "fadeInUp",
  animationDelay = 0,
  animationDuration = 520,
  effects = [],
  gradientColors = ["#ec4899", "#f472b6", "#f9a8d4"],
  glowColor = "#ec4899",
  shimmerIntensity = 0.28,
  style,
  ...rest
}: HyperTextProps): React.JSX.Element {
  // Reduce-motion gate
  const reduceMotion = useSharedValue(0);
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((v) => {
      if (mounted) reduceMotion.value = v ? 1 : 0;
    });
    return () => {
      mounted = false;
    };
  }, [reduceMotion]);

  // Base text style
  const variantStyle = VARIANT[variant];
  const baseStyle: TextStyle = {
    ...variantStyle,
    ...(weight ? ({ fontWeight: weight } as TextStyle) : {}),
    color,
    textAlign: align,
    includeFontPadding: false,
    textAlignVertical: "center",
  };

  // Entrance animations
  const opacity = useSharedValue(animated && animationType !== "none" ? 0 : 1);
  const tx = useSharedValue(
    animated &&
      (animationType === "slideInLeft" || animationType === "slideInRight")
      ? animationType === "slideInLeft"
        ? -24
        : 24
      : 0,
  );
  const ty = useSharedValue(animated && animationType === "fadeInUp" ? 16 : 0);
  const scale = useSharedValue(
    animated && animationType === "scaleIn" ? 0.95 : 1,
  );

  useEffect(() => {
    if (!animated || animationType === "none") return;
    const delay = animationDelay;
    const dur = animationDuration;

    opacity.value = withDelay(
      delay,
      withTiming(1, { duration: dur, easing: Easing.out(Easing.cubic) }),
    );
    if (animationType === "fadeInUp") {
      ty.value = withDelay(
        delay,
        withTiming(0, { duration: dur, easing: Easing.out(Easing.cubic) }),
      );
    } else if (animationType === "scaleIn") {
      scale.value = withDelay(
        delay,
        withTiming(1, { duration: dur, easing: Easing.out(Easing.back(1.1)) }),
      );
    } else if (
      animationType === "slideInLeft" ||
      animationType === "slideInRight"
    ) {
      tx.value = withDelay(
        delay,
        withTiming(0, { duration: dur, easing: Easing.out(Easing.cubic) }),
      );
    }
  }, [
    animated,
    animationType,
    animationDelay,
    animationDuration,
    opacity,
    tx,
    ty,
    scale,
  ]);

  const containerAnim = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: scale.value },
    ],
  }));

  // Shimmer sweep
  const shimmer = useSharedValue(-150);
  useEffect(() => {
    if (!has(effects, "shimmer")) return;
    shimmer.value = -150;
    shimmer.value = withRepeat(
      withTiming(150, { duration: 1600, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false,
    );
  }, [effects, shimmer]);

  const shimmerAnim = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmer.value,
          [-150, 150],
          [-220, 220],
          Extrapolate.CLAMP,
        ),
      },
    ],
    opacity: interpolate(
      shimmer.value,
      [-150, 0, 150],
      [0, shimmerIntensity, 0],
    ),
  }));

  // Glow/Shadow styles
  const glowStyle: TextStyle | undefined =
    has(effects, "neon") || has(effects, "glow")
      ? {
          textShadowColor: has(effects, "neon")
            ? glowColor
            : "rgba(0,0,0,0.35)",
          textShadowOffset: {
            width: 0,
            height: has(effects, "shadow") ? 2 : 0,
          },
          textShadowRadius: has(effects, "neon") ? 16 : 6,
        }
      : undefined;

  // Regular render
  const TextNode = (
    <AText {...rest} style={[baseStyle, glowStyle, style]}>
      {children}
    </AText>
  );

  const contentMasked = has(effects, "gradient") ? (
    <MaskedView style={styles.mask} maskElement={TextNode}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fill}
      />
      {has(effects, "shimmer") && (
        <AView pointerEvents="none" style={[styles.shimmer, shimmerAnim]} />
      )}
    </MaskedView>
  ) : (
    TextNode
  );

  return (
    <AView style={[containerAnim, { alignSelf: "flex-start" }]}>
      {contentMasked}
      {has(effects, "shimmer") && !has(effects, "gradient") && (
        <AView pointerEvents="none" style={[styles.shimmer, shimmerAnim]} />
      )}
    </AView>
  );
});

HyperText.displayName = "HyperText";

const styles = StyleSheet.create({
  mask: { alignSelf: "flex-start" },
  fill: { width: "100%", height: "100%" },
  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 56,
    backgroundColor: "rgba(255,255,255,0.35)",
    borderRadius: 8,
  },
});

export default HyperText;
