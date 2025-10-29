import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode, useEffect, useMemo } from "react";
import { View, type ViewStyle, type ViewProps, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { MOBILE_SPACING, MOBILE_RADIUS } from '../constants/design-tokens';
import { useTheme } from "@/theme";

// === HOLOGRAPHIC CONSTANTS ===
export const HOLOGRAPHIC_CONFIGS = (theme: ReturnType<typeof useTheme>) => ({
  // Gradient sets for different holographic effects
  gradients: {
    rainbow: [
      theme.colors.primary[600],
      theme.colors.primary[400],
      theme.colors.status.warning,
      theme.colors.status.success,
      theme.colors.status.info,
      theme.colors.primary[500],
    ],
    cyber: [
      theme.colors.status.info,
      theme.colors.primary[500],
      theme.colors.primary[600],
      theme.colors.status.success,
      theme.colors.primary[400],
      theme.colors.primary[700],
    ],
    sunset: [
      theme.colors.danger,
      theme.colors.status.warning,
      theme.colors.status.success,
      theme.colors.status.info,
      theme.colors.primary[500],
      theme.colors.danger,
      theme.colors.status.warning,
    ],
    ocean: [
      theme.colors.primary[400],
      theme.colors.primary[600],
      theme.colors.primary[300],
      theme.colors.primary[500],
      theme.colors.status.info,
      theme.colors.status.info,
      theme.colors.status.success,
    ],
    neon: [
      theme.colors.status.info,
      theme.colors.primary[500],
      theme.colors.primary[600],
      theme.colors.status.success,
      theme.colors.primary[400],
      theme.colors.primary[700],
      theme.colors.status.info,
      theme.colors.status.warning,
    ],
    aurora: [
      theme.colors.primary[600],
      theme.colors.primary[500],
      theme.colors.status.info,
      theme.colors.status.success,
      theme.colors.status.warning,
      theme.colors.danger,
      theme.colors.primary[600],
    ],
  },

  // Animation speeds
  speeds: {
    slow: 3000,
    normal: 2000,
    fast: 1000,
    ultra: 500,
  },

  // Shimmer configurations
  shimmer: {
    width: 100,
    opacity: 0.3,
    angle: 45,
  },
} as const;

// === HOLOGRAPHIC CONTAINER COMPONENT ===
interface HolographicContainerProps extends ViewProps {
  children: ReactNode;
  variant?: keyof ReturnType<typeof HOLOGRAPHIC_CONFIGS>['gradients'];
  speed?: keyof ReturnType<typeof HOLOGRAPHIC_CONFIGS>['speeds'];
  animated?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

export const HolographicContainer: React.FC<HolographicContainerProps> = ({
  children,
  variant = "rainbow",
  speed = "normal",
  animated = true,
  shimmer = true,
  glow = true,
  style,
  ...props
}) => {
  const theme = useTheme();
  const gradientRotation = useSharedValue(0);
  const shimmerOffset = useSharedValue(-100);
  const glowIntensity = useSharedValue(1);

  const configs = HOLOGRAPHIC_CONFIGS(theme);

  // Gradient rotation animation
  useEffect(() => {
    if (animated) {
      gradientRotation.value = withRepeat(
        withTiming(360, { duration: configs.speeds[speed] }),
        -1,
        false,
      );
    }
  }, [animated, speed]);

  // Shimmer animation
  useEffect(() => {
    if (shimmer) {
      shimmerOffset.value = withRepeat(
        withSequence(
          withTiming(100, { duration: configs.speeds[speed] }),
          withDelay(500, withTiming(-100, { duration: 0 })),
        ),
        -1,
        false,
      );
    }
  }, [shimmer, speed]);

  // Glow animation
  useEffect(() => {
    if (glow) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: configs.speeds[speed] / 2 }),
          withTiming(1, { duration: configs.speeds[speed] / 2 }),
        ),
        -1,
        false,
      );
    }
  }, [glow, speed]);

  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientRotation.value}deg` }],
  }));

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.6,
    shadowRadius: glowIntensity.value * 25,
  }));

  const gradientColors = [...configs.gradients[variant]];

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          borderRadius: MOBILE_RADIUS["2xl"],
          overflow: "hidden",
          position: "relative",
        },
        glow ? glowStyle : {},
        style,
      ])}
      {...props}
    >
      {/* Animated Gradient Background */}
      <Animated.View
        style={StyleSheet.flatten([
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          gradientStyle,
        ])}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: MOBILE_RADIUS["2xl"],
          }}
        />
      </Animated.View>

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
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            shimmerStyle,
          ])}
        />
      )}

      {/* Content */}
      <View
        style={{
          position: "relative",
          zIndex: 1,
          padding: MOBILE_SPACING[24],
        }}
      >
        {children}
      </View>
    </Animated.View>
  );
};

// === HOLOGRAPHIC CARD COMPONENT ===
interface HolographicCardProps extends ViewProps {
  children: ReactNode;
  variant?: keyof typeof HOLOGRAPHIC_CONFIGS.gradients;
  size?: "sm" | "md" | "lg" | "xl";
  animated?: boolean;
  shimmer?: boolean;
  glow?: boolean;
  style?: ViewStyle;
}

export const HolographicCard: React.FC<HolographicCardProps> = ({
  children,
  variant = "rainbow",
  size = "md",
  animated = true,
  shimmer = true,
  glow = true,
  style,
  ...props
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { padding: MOBILE_SPACING[16] || 16 };
      case "lg":
        return { padding: MOBILE_SPACING[32] || 32 };
      case "xl":
        return { padding: MOBILE_SPACING[48] || 48 };
      default:
        return { padding: MOBILE_SPACING[24] || 24 };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <HolographicContainer
      variant={variant}
      animated={animated}
      shimmer={shimmer}
      glow={glow}
      style={StyleSheet.flatten([sizeConfig, style])}
      {...props}
    >
      {children}
    </HolographicContainer>
  );
};

// === HOLOGRAPHIC BUTTON COMPONENT ===
interface HolographicButtonProps extends ViewProps {
  children: ReactNode;
  variant?: keyof typeof HOLOGRAPHIC_CONFIGS.gradients;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export const HolographicButton: React.FC<HolographicButtonProps> = ({
  children,
  variant = "cyber",
  size = "md",
  disabled = false,
  onPress,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: MOBILE_SPACING[24] || 24,
          paddingVertical: MOBILE_SPACING[8] || 8,
          minHeight: 36,
        };
      case "lg":
        return {
          paddingHorizontal: MOBILE_SPACING[48] || 48,
          paddingVertical: MOBILE_SPACING[24] || 24,
          minHeight: 56,
        };
      default:
        return {
          paddingHorizontal: MOBILE_SPACING[32] || 32,
          paddingVertical: MOBILE_SPACING[16] || 16,
          minHeight: 48,
        };
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 });
    opacity.value = withTiming(0.8, { duration: 150 });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 150 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  const sizeConfig = getSizeConfig();

  return (
    <Animated.View
      style={StyleSheet.flatten([animatedStyle, style])}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}
    >
      <HolographicContainer
        variant={variant}
        speed="fast"
        animated={true}
        shimmer={true}
        glow={true}
        style={StyleSheet.flatten([
          sizeConfig,
          {
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          },
        ])}
        {...props}
      >
        {children}
      </HolographicContainer>
    </Animated.View>
  );
};

// === HOLOGRAPHIC TEXT COMPONENT ===
interface HolographicTextProps {
  children: ReactNode;
  variant?: keyof typeof HOLOGRAPHIC_CONFIGS.gradients;
  size?: number;
  weight?: "normal" | "bold";
  animated?: boolean;
  style?: ViewStyle;
}

export const HolographicText: React.FC<HolographicTextProps> = ({
  children,
  variant = "rainbow",
  size = 16,
  weight = "normal",
  animated = true,
  style,
}) => {
  const gradientRotation = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      gradientRotation.value = withRepeat(
        withTiming(360, { duration: 2000 }),
        -1,
        false,
      );
    }
  }, [animated]);

  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${gradientRotation.value}deg` }],
  }));

  const gradientColors = [...HOLOGRAPHIC_CONFIGS.gradients[variant]];

  return (
    <View style={StyleSheet.flatten([{ position: "relative" }, style])}>
      <Animated.View
        style={StyleSheet.flatten([
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          gradientStyle,
        ])}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
          }}
        />
      </Animated.View>
      <View
        style={{
          position: "relative",
          zIndex: 1,
          padding: MOBILE_SPACING[4],
        }}
      >
        {/* Text would go here - this is a placeholder for the actual text implementation */}
        <View>
          {children}
        </View>
      </View>
    </View>
  );
};

// === PARTICLE EFFECT COMPONENT ===
interface ParticleEffectProps extends ViewProps {
  count?: number;
  variant?: keyof ReturnType<typeof HOLOGRAPHIC_CONFIGS>['gradients'];
  speed?: keyof ReturnType<typeof HOLOGRAPHIC_CONFIGS>['speeds'];
  style?: ViewStyle;
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  count = 20,
  variant = "neon",
  speed = "normal",
  style,
  ...props
}) => {
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: useSharedValue(Math.random() * 100),
    y: useSharedValue(Math.random() * 100),
    scale: useSharedValue(Math.random() * 0.5 + 0.5),
    opacity: useSharedValue(Math.random() * 0.5 + 0.5),
  }));

  useEffect(() => {
    particles.forEach((particle) => {
      particle.x.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_CONFIGS.speeds[speed] + Math.random() * 1000,
          }),
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_CONFIGS.speeds[speed] + Math.random() * 1000,
          }),
        ),
        -1,
        false,
      );

      particle.y.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_CONFIGS.speeds[speed] + Math.random() * 1000,
          }),
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_CONFIGS.speeds[speed] + Math.random() * 1000,
          }),
        ),
        -1,
        false,
      );

      particle.opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: HOLOGRAPHIC_CONFIGS.speeds[speed] / 2 }),
          withTiming(1, { duration: HOLOGRAPHIC_CONFIGS.speeds[speed] / 2 }),
        ),
        -1,
        false,
      );
    });
  }, [speed]);

  const gradientColors = [...HOLOGRAPHIC_CONFIGS.gradients[variant]];

  return (
    <View
      style={StyleSheet.flatten([
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        },
        style,
      ])}
      {...props}
    >
      {particles.map((particle) => {
        const particleStyle = useAnimatedStyle(() => ({
          position: "absolute" as const,
          left: `${particle.x.value}%` as unknown as number,
          top: `${particle.y.value}%` as unknown as number,
          width: 4,
          height: 4,
          borderRadius: 2,
          opacity: particle.opacity.value,
          transform: [{ scale: particle.scale.value }],
        }));

        return (
          <Animated.View key={particle.id} style={particleStyle}>
            <LinearGradient
              colors={gradientColors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                borderRadius: 2,
              }}
            />
          </Animated.View>
        );
      })}
    </View>
  );
};

export default {
  HOLOGRAPHIC_CONFIGS,
  HolographicContainer,
  HolographicCard,
  HolographicButton,
  HolographicText,
  ParticleEffect,
};
