import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode, useEffect } from "react";
import {
  Text,
  View,
  Platform,
  type TextStyle,
  type ViewStyle,
  StyleSheet,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import MaskedView from "@react-native-masked-view/masked-view";

import { Colors, Spacing, BorderRadius } from "../animation";
import { useTheme } from '../theme/Provider';
import { Theme } from '../theme/unified-theme';

// === PREMIUM GRADIENT COLORS FOR TEXT ===
const TEXT_GRADIENTS = (theme: ReturnType<typeof useTheme>) => ({
  primary: [theme.colors.primary[500], theme.colors.primary[400], theme.colors.primary[300]],
  secondary: [theme.colors.primary[500], theme.colors.status.info, theme.colors.status.info],
  premium: [theme.colors.primary[500], theme.colors.primary[400], theme.colors.primary[300]],
  sunset: [theme.colors.status.warning, theme.colors.status.warning, theme.colors.status.warning],
  ocean: [theme.colors.primary[500], theme.colors.status.info, theme.colors.status.info],
  holographic: [theme.colors.primary[500], theme.colors.primary[600], theme.colors.primary[400], theme.colors.primary[500], theme.colors.status.info],
  neon: [theme.colors.status.info, theme.colors.primary[500], theme.colors.primary[600]],
  gold: [theme.colors.status.warning, theme.colors.status.warning, theme.colors.status.warning],
  rainbow: [
    theme.colors.danger,
    theme.colors.status.warning,
    theme.colors.primary[600],
    theme.colors.status.success,
    theme.colors.primary[700],
    theme.colors.primary[500],
    theme.colors.primary[600],
  ],
});

// === PREMIUM TEXT SHADOWS ===
const TEXT_SHADOWS = (theme: ReturnType<typeof useTheme>) => ({
  primary: {
    textShadowColor: theme.colors.primary[500],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  secondary: {
    textShadowColor: theme.colors.primary[500],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  holographic: {
    textShadowColor: theme.colors.primary[500],
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  neon: {
    textShadowColor: theme.colors.status.info,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  glow: {
    textShadowColor: theme.colors.primary[500],
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

// === GRADIENT TEXT COMPONENT ===
interface GradientTextProps {
  children: ReactNode;
  gradient?: keyof ReturnType<typeof TEXT_GRADIENTS>;
  colors?: string[];
  style?: TextStyle;
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";
  weight?:
    | "light"
    | "regular"
    | "medium"
    | "semibold"
    | "bold"
    | "extrabold"
    | "black";
  animated?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  shadow?: keyof typeof TEXT_SHADOWS;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  gradient = "primary",
  colors,
  style,
  size = "base",
  weight = "regular",
  animated = false,
  shimmer = false,
  glow = false,
  shadow,
}) => {
  const theme = useTheme();
  const shimmerOffset = useSharedValue(-100);
  const glowIntensity = useSharedValue(1);
  const scale = useSharedValue(1);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { duration: 2000 }),
        withDelay(1000, withTiming(-100, { duration: 0 })),
      );
    }
  }, [shimmer]);

  // Glow animation
  useEffect(() => {
    if (glow) {
      glowIntensity.value = withSequence(
        withTiming(1.5, { duration: 1000 }),
        withTiming(1, { duration: 1000 }),
      );
    }
  }, [glow]);

  // Entrance animation
  useEffect(() => {
    if (animated) {
      scale.value = withDelay(200, withTiming(1, { duration: 500 }));
    }
  }, [animated]);

  const getSizeStyle = (): TextStyle => {
    switch (size) {
      case "xs":
        return { fontSize: 12, lineHeight: 16 };
      case "sm":
        return { fontSize: 14, lineHeight: 20 };
      case "lg":
        return { fontSize: 18, lineHeight: 28 };
      case "xl":
        return { fontSize: 20, lineHeight: 28 };
      case "2xl":
        return { fontSize: 24, lineHeight: 32 };
      case "3xl":
        return { fontSize: 30, lineHeight: 36 };
      case "4xl":
        return { fontSize: 36, lineHeight: 40 };
      case "5xl":
        return { fontSize: 48, lineHeight: 56 };
      default:
        return { fontSize: 16, lineHeight: 24 };
    }
  };

  const getWeightStyle = (): TextStyle => {
    switch (weight) {
      case "light":
        return { fontWeight: "300" as const };
      case "medium":
        return { fontWeight: "500" as const };
      case "semibold":
        return { fontWeight: "600" as const };
      case "bold":
        return { fontWeight: "700" as const };
      case "extrabold":
        return { fontWeight: "800" as const };
      case "black":
        return { fontWeight: "900" as const };
      default:
        return { fontWeight: "400" as const };
    }
  };

  const gradientColors = colors ?? TEXT_GRADIENTS(theme)[gradient];
  const shadowStyle = shadow ? TEXT_SHADOWS(theme)[shadow] : {};

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    textShadowRadius: glowIntensity.value * 10,
  }));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const textStyle: TextStyle = {
    ...getSizeStyle(),
    ...getWeightStyle(),
    ...shadowStyle,
    ...style,
  };

  // For iOS, use MaskedView for gradient text
  if (Platform.OS === "ios") {
    return (
      <Animated.View style={animated ? animatedStyle : undefined}>
        <MaskedView maskElement={<Text style={textStyle}>{children}</Text>}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            {shimmer && (
              <Animated.View
                style={StyleSheet.flatten([
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                  shimmerStyle,
                ])}
              />
            )}
            <Text style={StyleSheet.flatten([textStyle, { opacity: 0 }])}>
              {children}
            </Text>
          </LinearGradient>
        </MaskedView>
      </Animated.View>
    );
  }

  // For Android, use a workaround with overlay
  return (
    <Animated.View style={animated ? animatedStyle : undefined}>
      <View style={{ position: "relative" }}>
        <Text style={StyleSheet.flatten([textStyle, { color: "transparent" }])}>
          {children}
        </Text>
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        >
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            {shimmer && (
              <Animated.View
                style={StyleSheet.flatten([
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                  shimmerStyle,
                ])}
              />
            )}
            <Text
              style={StyleSheet.flatten([textStyle, { color: "transparent" }])}
            >
              {children}
            </Text>
          </LinearGradient>
        </View>
      </View>
    </Animated.View>
  );
};

// === ANIMATED TEXT COMPONENT ===
interface AnimatedTextProps {
  children: ReactNode;
  animation?: "fadeIn" | "slideIn" | "scaleIn" | "typewriter" | "bounce";
  delay?: number;
  duration?: number;
  style?: TextStyle;
  onAnimationComplete?: () => void;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  animation = "fadeIn",
  delay = 0,
  duration = 500,
  style,
  onAnimationComplete,
}) => {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(50);
  const translateX = useSharedValue(-50);
  const scale = useSharedValue(0.8);
  const typewriterProgress = useSharedValue(0);

  useEffect(() => {
    const animate = () => {
      switch (animation) {
        case "fadeIn":
          opacity.value = withDelay(delay, withTiming(1, { duration }));
          break;
        case "slideIn":
          translateY.value = withDelay(delay, withTiming(0, { duration }));
          opacity.value = withDelay(delay, withTiming(1, { duration }));
          break;
        case "scaleIn":
          scale.value = withDelay(delay, withTiming(1, { duration }));
          opacity.value = withDelay(delay, withTiming(1, { duration }));
          break;
        case "typewriter":
          typewriterProgress.value = withDelay(
            delay,
            withTiming(1, { duration }),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration }));
          break;
        case "bounce":
          scale.value = withDelay(
            delay,
            withSequence(
              withTiming(1.2, { duration: duration * 0.3 }),
              withTiming(0.9, { duration: duration * 0.2 }),
              withTiming(1, { duration: duration * 0.5 }),
            ),
          );
          opacity.value = withDelay(delay, withTiming(1, { duration }));
          break;
      }
    };

    animate();
  }, [animation, delay, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [
      { translateY: translateY.value },
      { translateX: translateX.value },
      { scale: scale.value },
    ],
  }));

  return (
    <Animated.Text style={StyleSheet.flatten([style, animatedStyle])}>
      {children}
    </Animated.Text>
  );
};

// === PREMIUM HEADING COMPONENTS ===
interface PremiumHeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: keyof ReturnType<typeof TEXT_GRADIENTS>;
  animated?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  style?: TextStyle;
  shadow?: keyof ReturnType<typeof TEXT_SHADOWS>;
}

export const PremiumHeading: React.FC<PremiumHeadingProps> = ({
  children,
  level = 1,
  gradient = "primary",
  animated = true,
  shimmer = false,
  glow = true,
  style,
}) => {
  const getLevelStyle = (): TextStyle => {
    switch (level) {
      case 1:
        return { fontSize: 32, lineHeight: 40, fontWeight: "800" as const };
      case 2:
        return { fontSize: 28, lineHeight: 36, fontWeight: "700" as const };
      case 3:
        return { fontSize: 24, lineHeight: 32, fontWeight: "600" as const };
      case 4:
        return { fontSize: 20, lineHeight: 28, fontWeight: "600" as const };
      case 5:
        return { fontSize: 18, lineHeight: 24, fontWeight: "500" as const };
      case 6:
        return { fontSize: 16, lineHeight: 22, fontWeight: "500" as const };
      default:
        return { fontSize: 32, lineHeight: 40, fontWeight: "800" as const };
    }
  };

  return (
    <GradientText
      gradient={gradient}
      animated={animated}
      shimmer={shimmer}
      glow={glow}
      shadow="glow"
      style={StyleSheet.flatten([getLevelStyle(), style])}
    >
      {children}
    </GradientText>
  );
};

// === PREMIUM BODY TEXT ===
interface PremiumBodyProps {
  children: ReactNode;
  size?: "sm" | "base" | "lg";
  weight?: "light" | "regular" | "medium" | "semibold";
  gradient?: keyof ReturnType<typeof TEXT_GRADIENTS>;
  animated?: boolean;
  style?: TextStyle;
}

export const PremiumBody: React.FC<PremiumBodyProps> = ({
  children,
  size = "base",
  weight = "regular",
  gradient,
  animated = false,
  style,
}) => {
  return (
    <GradientText
      size={size}
      weight={weight}
      gradient={gradient}
      animated={animated}
      style={style}
    >
      {children}
    </GradientText>
  );
};

// === PREMIUM LABEL ===
interface PremiumLabelProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "xs" | "sm" | "base";
  animated?: boolean;
  style?: TextStyle;
}

export const PremiumLabel: React.FC<PremiumLabelProps> = ({
  children,
  variant = "default",
  size = "sm",
  animated = false,
  style,
}) => {
  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case "success":
        return { color: Colors.success[600] };
      case "warning":
        return { color: Colors.warning[600] };
      case "error":
        return { color: Colors.error[600] };
      case "info":
        return { color: Colors.secondary[600] };
      default:
        return { color: Colors.neutral[700] };
    }
  };

  return (
    <AnimatedText
      animation={animated ? "fadeIn" : undefined}
      style={StyleSheet.flatten([
        {
          fontSize: size === "xs" ? 12 : size === "base" ? 16 : 14,
          fontWeight: "500",
          ...getVariantStyle(),
        },
        style,
      ])}
    >
      {children}
    </AnimatedText>
  );
};

export { TEXT_GRADIENTS, TEXT_SHADOWS };

export default {
  GradientText,
  AnimatedText,
  PremiumHeading,
  PremiumBody,
  PremiumLabel,
  TEXT_GRADIENTS,
  TEXT_SHADOWS,
};
