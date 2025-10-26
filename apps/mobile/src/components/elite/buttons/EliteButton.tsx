import React, { useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  type TouchableOpacityProps,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import Animated from "react-native-reanimated";

import {
  Colors,
  Spacing,
  GlobalStyles,
  BorderRadius,
  AnimationConfigs,
} from "../../../styles/GlobalStyles";
import { PREMIUM_GRADIENTS } from "../constants/gradients";
import { PREMIUM_SHADOWS } from "../constants/shadows";

/**
 * EliteButton Component
 * Premium button with multiple variants, sizes, and animation effects
 */

interface EliteButtonProps extends TouchableOpacityProps {
  title: string;
  variant?:
    | "primary"
    | "secondary"
    | "ghost"
    | "glass"
    | "holographic"
    | "neon";
  size?: "sm" | "md" | "lg" | "xl";
  icon?: string;
  loading?: boolean;
  gradient?: string[];
  ripple?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

export const EliteButton: React.FC<EliteButtonProps> = ({
  title,
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  gradient,
  ripple = true,
  glow = true,
  shimmer = false,
  style,
  onPress,
  disabled,
  ...props
}) => {
  const scale = useSharedValue(1);
  const shimmerOffset = useSharedValue(-100);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const glowIntensity = useSharedValue(1);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withSequence(
        withTiming(100, { duration: 2000 }),
        withDelay(1000, withTiming(-100, { duration: 0 })),
      );
    }
  }, [shimmer]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.4,
    shadowRadius: glowIntensity.value * 20,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, AnimationConfigs.spring);
    glowIntensity.value = withSpring(1.2, AnimationConfigs.spring);

    if (ripple) {
      rippleScale.value = 0;
      rippleOpacity.value = 0.6;
      rippleScale.value = withTiming(2, { duration: 300 });
      rippleOpacity.value = withTiming(0, { duration: 300 });
    }

    runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, AnimationConfigs.spring);
    glowIntensity.value = withSpring(1, AnimationConfigs.spring);
  };

  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: BorderRadius["2xl"],
      overflow: "hidden" as const,
      position: "relative" as const,
    };

    switch (variant) {
      case "secondary":
        return { ...baseStyle, ...GlobalStyles.buttonSecondary };
      case "ghost":
        return { ...baseStyle, ...GlobalStyles.buttonGhost };
      case "glass":
        return {
          ...baseStyle,
          backgroundColor: "rgba(255,255,255,0.1)",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.2)",
        };
      case "holographic":
        return { ...baseStyle, ...PREMIUM_SHADOWS.holographicGlow };
      case "neon":
        return { ...baseStyle, ...PREMIUM_SHADOWS.neonGlow };
      default:
        return {
          ...baseStyle,
          ...GlobalStyles.buttonPrimary,
          ...(glow ? PREMIUM_SHADOWS.primaryGlow : {}),
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case "secondary":
        return GlobalStyles.buttonTextSecondary;
      case "ghost":
      case "glass":
        return { ...GlobalStyles.buttonTextSecondary, color: Colors.white };
      case "holographic":
      case "neon":
        return {
          ...GlobalStyles.buttonTextPrimary,
          color: Colors.white,
          fontWeight: "bold" as const,
        };
      default:
        return GlobalStyles.buttonTextPrimary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: Spacing["3xl"],
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
      case "xl":
        return {
          paddingHorizontal: Spacing["4xl"],
          paddingVertical: Spacing.xl,
          minHeight: 64,
        };
      default:
        return { ...GlobalStyles.buttonContent, minHeight: 48 };
    }
  };

  const getGradientColors = () => {
    if (gradient) return gradient;

    switch (variant) {
      case "secondary":
        return PREMIUM_GRADIENTS.secondary;
      case "glass":
        return PREMIUM_GRADIENTS.glass;
      case "holographic":
        return PREMIUM_GRADIENTS.holographic;
      case "neon":
        return PREMIUM_GRADIENTS.neon;
      default:
        return PREMIUM_GRADIENTS.primary;
    }
  };

  const ButtonContent = (
    <View
      style={StyleSheet.flatten([
        getSizeStyle(),
        { opacity: (disabled ?? false) ? 0.6 : 1 },
      ])}
    >
      {loading ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ActivityIndicator
            color={
              variant === "primary" ||
              variant === "holographic" ||
              variant === "neon"
                ? Colors.white
                : Colors.primary
            }
            size="small"
          />
          <Text
            style={StyleSheet.flatten([
              GlobalStyles.buttonText,
              getTextStyle(),
              { marginLeft: Spacing.sm },
            ])}
          >
            Loading...
          </Text>
        </View>
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon as any}
              size={
                size === "sm"
                  ? 16
                  : size === "lg"
                    ? 24
                    : size === "xl"
                      ? 28
                      : 20
              }
              color={
                variant === "primary" ||
                variant === "holographic" ||
                variant === "neon"
                  ? Colors.white
                  : Colors.primary
              }
              style={{ marginRight: Spacing.xs }}
            />
          )}
          <Text
            style={StyleSheet.flatten([
              GlobalStyles.buttonText,
              getTextStyle(),
            ])}
          >
            {title}
          </Text>
        </>
      )}
    </View>
  );

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={StyleSheet.flatten([
          getButtonStyle(),
          glow ? glowStyle : {},
          style,
        ])}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled ?? loading}
        {...props}
      >
        {/* Ripple Effect */}
        {ripple && (
          <Animated.View
            style={StyleSheet.flatten([
              {
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: "rgba(255,255,255,0.3)",
                marginTop: -50,
                marginLeft: -50,
              },
              rippleStyle,
            ])}
          />
        )}

        {/* Shimmer Effect */}
        {shimmer && (
          <Animated.View
            style={StyleSheet.flatten([
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(255,255,255,0.1)",
              },
              shimmerStyle,
            ])}
          />
        )}

        {/* Gradient Background */}
        <LinearGradient
          colors={getGradientColors()}
          style={{
            borderRadius: BorderRadius["2xl"],
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {ButtonContent}
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default EliteButton;
