/**
 * PROJECT HYPERION: UNIFIED FX CONTAINER
 *
 * Single, powerful container component that replaces:
 * - GlassContainer
 * - HolographicContainer
 * - GlowContainer
 * - And other scattered effect containers
 *
 * Features:
 * - Configurable visual effects via props
 * - Performance optimized with proper memoization
 * - Accessibility aware
 * - Consistent with unified design system
 */

import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import React, { useMemo } from "react";
import { View, StyleSheet, type ViewStyle } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import {
  useGlowAnimation,
  useShimmerEffect,
  useEntranceAnimation,
} from "../../hooks/useUnifiedAnimations";
import { Theme } from "../../theme/unified-theme";

// === TYPES ===
export type FXContainerType =
  | "glass"
  | "glow"
  | "holographic"
  | "neon"
  | "gradient"
  | "default";
export type FXContainerVariant = "subtle" | "medium" | "strong" | "intense";

export interface FXContainerProps {
  children: ReactNode;
  type?: FXContainerType;
  variant?: FXContainerVariant;
  isAnimated?: boolean;
  hasShimmer?: boolean;
  hasGlow?: boolean;
  hasEntrance?: boolean;
  entranceType?: "fadeInUp" | "scaleIn" | "slideInLeft" | "slideInRight";
  glowColor?: string;
  glowIntensity?: number;
  shimmerDuration?: number;
  gradientName?: keyof typeof Theme.gradients;
  gradientColors?: string[];
  style?: ViewStyle;
  disabled?: boolean;
}

// === MAIN COMPONENT ===
const FXContainer: React.FC<FXContainerProps> = ({
  children,
  type = "default",
  variant = "medium",
  isAnimated = true,
  hasShimmer = false,
  hasGlow = false,
  hasEntrance = false,
  entranceType = "fadeInUp",
  glowColor,
  glowIntensity = 1,
  shimmerDuration = 2000,
  gradientName,
  gradientColors,
  style,
  disabled = false,
}) => {
  // Get base styles based on type and variant
  const baseStyles = useMemo(() => {
    const styles: ViewStyle = {
      borderRadius: Theme.borderRadius.xl,
      overflow: "hidden",
    };

    switch (type) {
      case "glass":
        return {
          ...styles,
          backgroundColor: Theme.colors.glass.light[variant],
          borderWidth: 1,
          borderColor: `rgba(255, 255, 255, ${variant === "subtle" ? 0.2 : variant === "strong" ? 0.4 : 0.3})`,
          ...Theme.shadows.depth.md,
        };

      case "glow":
        return {
          ...styles,
          backgroundColor: Theme.colors.neutral[0],
          ...Theme.shadows.glow.primary,
        };

      case "holographic":
        return {
          ...styles,
          backgroundColor: "transparent",
          ...Theme.shadows.depth.lg,
        };

      case "neon":
        return {
          ...styles,
          backgroundColor: Theme.colors.neutral[0],
          borderWidth: 2,
          borderColor: "#00f5ff",
        };

      case "gradient":
        return {
          ...styles,
          backgroundColor: "transparent",
          ...Theme.shadows.depth.md,
        };

      default:
        return {
          ...styles,
          backgroundColor: Theme.colors.neutral[0],
          ...Theme.shadows.depth.sm,
        };
    }
  }, [type, variant]);

  // Glow animation
  const { animatedStyle: glowStyle } = useGlowAnimation(
    disabled ? "transparent" : glowColor || Theme.colors.primary[500],
    disabled ? 0 : glowIntensity,
    2000,
  );

  // Shimmer animation
  const { animatedStyle: shimmerStyle } = useShimmerEffect(
    disabled ? 0 : shimmerDuration,
  );

  // Entrance animation
  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation(entranceType, 0, "gentle");

  // Start entrance animation if enabled
  React.useEffect(() => {
    if (hasEntrance && isAnimated && !disabled) {
      startEntrance();
    }
  }, [hasEntrance, isAnimated, disabled, startEntrance]);

  // Combined animated styles
  const combinedAnimatedStyle = useAnimatedStyle(() => {
    const styles: ViewStyle = {};

    if (hasGlow && !disabled) {
      Object.assign(styles, glowStyle.value);
    }

    if (hasEntrance && !disabled) {
      Object.assign(styles, entranceStyle.value);
    }

    return styles;
  });

  // Render content with appropriate wrapper
  const renderContent = () => {
    let content = children;

    // Apply shimmer overlay
    if (hasShimmer && isAnimated && !disabled) {
      content = (
        <View style={StyleSheet.absoluteFill}>
          {content}
          <Animated.View
            style={[
              StyleSheet.absoluteFill,
              {
                backgroundColor: "rgba(255, 255, 255, 0.1)",
              },
              shimmerStyle,
            ]}
            pointerEvents="none"
          />
        </View>
      );
    }

    // Apply gradient background
    if (type === "gradient" || type === "holographic") {
      const gradient = gradientName ? Theme.gradients[gradientName] : null;
      const colors = gradientColors ||
        gradient?.colors || [
          Theme.colors.primary[500],
          Theme.colors.primary[400],
        ];

      content = (
        <LinearGradient
          colors={colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        >
          {content}
        </LinearGradient>
      );
    }

    return content;
  };

  // Main container
  const Container = isAnimated ? Animated.View : View;

  return (
    <Container style={[baseStyles, isAnimated && combinedAnimatedStyle, style]}>
      {renderContent()}
    </Container>
  );
};

// === PRESET CONFIGURATIONS ===
export const FXContainerPresets = {
  // Glass morphism container
  glass: (props: Omit<FXContainerProps, "type">) => (
    <FXContainer {...props} type="glass" />
  ),

  // Holographic container with shimmer
  holographic: (props: Omit<FXContainerProps, "type">) => (
    <FXContainer
      {...props}
      type="holographic"
      gradientName="holographic"
      hasShimmer={true}
      hasGlow={true}
      hasEntrance={true}
    />
  ),

  // Glowing container
  glow: (props: Omit<FXContainerProps, "type">) => (
    <FXContainer {...props} type="glow" hasGlow={true} glowIntensity={1.5} />
  ),

  // Neon container
  neon: (props: Omit<FXContainerProps, "type">) => (
    <FXContainer
      {...props}
      type="neon"
      hasGlow={true}
      glowColor="#00f5ff"
      glowIntensity={2}
      hasShimmer={true}
      shimmerDuration={1000}
    />
  ),

  // Premium gradient container
  premium: (props: Omit<FXContainerProps, "type">) => (
    <FXContainer
      {...props}
      type="gradient"
      gradientName="primary"
      hasGlow={true}
      hasEntrance={true}
      entranceType="fadeInUp"
    />
  ),
};

export default FXContainer;
