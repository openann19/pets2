import React, { type ReactNode } from "react";
import { View, type ViewProps, type ViewStyle, StyleSheet } from "react-native";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Animated from "react-native-reanimated";

import { Spacing } from "../../styles/GlobalStyles";
import { GlassContainer } from "./GlassContainer";
import {
  BLUR_CONFIGS,
  TRANSPARENCY_CONFIGS,
  BORDER_CONFIGS,
  SHADOW_CONFIGS,
} from "./configs";

/**
 * GlassButton Component
 * Glass morphism button with variants and sizes
 */

interface GlassButtonProps extends ViewProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  onPress,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getVariantConfig = () => {
    switch (variant) {
      case "primary":
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
      case "secondary":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      case "ghost":
        return {
          intensity: "light" as const,
          transparency: "light" as const,
          border: "light" as const,
          shadow: "light" as const,
        };
      default:
        return {
          intensity: "medium" as const,
          transparency: "medium" as const,
          border: "medium" as const,
          shadow: "medium" as const,
        };
    }
  };

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: Spacing.sm,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: Spacing["2xl"],
          paddingVertical: Spacing.lg,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: Spacing.xl,
          paddingVertical: Spacing.md,
          minHeight: 48,
        };
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
    opacity.value = withSpring(0.8);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    opacity.value = withSpring(1);
  };

  const config = getVariantConfig();
  const sizeConfig = getSizeConfig();

  return (
    <Animated.View
      style={StyleSheet.flatten([animatedStyle, style])}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <GlassContainer
        intensity={config.intensity}
        transparency={config.transparency}
        border={config.border}
        shadow={config.shadow}
        borderRadius="xl"
        style={StyleSheet.flatten([
          { ...sizeConfig },
          {
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          },
        ])}
        {...props}
      >
        {children}
      </GlassContainer>
    </Animated.View>
  );
};

export default GlassButton;
