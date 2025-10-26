import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode, useEffect } from "react";
import {
  Text,
  View,
  Platform,
  type TextStyle,
  type ViewStyle,
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

import { Colors, Spacing, BorderRadius } from "../styles/GlobalStyles";
import MaskedViewIOS from "@react-native-masked-view/masked-view";

// === PREMIUM GRADIENT COLORS FOR TEXT ===
const TEXT_GRADIENTS = {
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
};

// === PREMIUM TEXT SHADOWS ===
const TEXT_SHADOWS = {
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
};

// === GRADIENT TEXT COMPONENT ===
interface GradientTextProps {
  children: ReactNode;
  gradient?: keyof typeof TEXT_GRADIENTS;
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

  const gradientColors = colors ?? TEXT_GRADIENTS[gradient];
  const shadowStyle = shadow ? TEXT_SHADOWS[shadow] : {};

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

  // For iOS, use MaskedViewIOS for gradient text
  if (Platform.OS === "ios") {
    return (
      <Animated.View style={animated ? animatedStyle : undefined}>
        <MaskedViewIOS maskElement={<Text style={textStyle}>{children}</Text>}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1 }}
          >
            {shimmer && (
              <Animated.View
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                  shimmerStyle,
                ]}
              />
            )}
            <Text style={[textStyle, { opacity: 0 }]}>{children}</Text>
          </LinearGradient>
        </MaskedViewIOS>
      </Animated.View>
    );
  }

  // For Android, use a workaround with overlay
  return (
    <Animated.View style={animated ? animatedStyle : undefined}>
      <View style={{ position: "relative" }}>
        <Text style={[textStyle, { color: "transparent" }]}>{children}</Text>
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
                style={[
                  {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: "rgba(255,255,255,0.3)",
                  },
                  shimmerStyle,
                ]}
              />
            )}
            <Text style={[textStyle, { color: "transparent" }]}>
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
    <Animated.Text style={[style, animatedStyle]}>{children}</Animated.Text>
  );
};

// === PREMIUM HEADING COMPONENTS ===
interface PremiumHeadingProps {
  children: ReactNode;
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  gradient?: keyof typeof TEXT_GRADIENTS;
  animated?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  style?: TextStyle;
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
      style={[getLevelStyle(), style]}
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
  gradient?: keyof typeof TEXT_GRADIENTS;
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
        return { color: Colors.success };
      case "warning":
        return { color: Colors.warning };
      case "error":
        return { color: Colors.error };
      case "info":
        return { color: Colors.secondary };
      default:
        return { color: Colors.gray700 };
    }
  };

  return (
    <AnimatedText
      animation={animated ? "fadeIn" : undefined}
      style={[
        {
          fontSize: size === "xs" ? 12 : size === "base" ? 16 : 14,
          fontWeight: "500",
          ...getVariantStyle(),
        },
        style,
      ]}
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
