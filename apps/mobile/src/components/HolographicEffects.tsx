import { LinearGradient } from "expo-linear-gradient";
import React, { type ReactNode, useEffect } from "react";
import { View, type ViewStyle, type ViewProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';

// === HOLOGRAPHIC CONSTANTS ===
// Theme-independent constants
export const HOLOGRAPHIC_SPEEDS = {
  slow: 3000,
  normal: 2000,
  fast: 1000,
  ultra: 500,
} as const;

export const HOLOGRAPHIC_VARIANTS = ['rainbow', 'cyber', 'sunset', 'ocean', 'neon', 'aurora'] as const;
export type HolographicVariant = typeof HOLOGRAPHIC_VARIANTS[number];

// Theme-dependent config factory
export const HOLOGRAPHIC_CONFIGS = (theme: AppTheme) => {
  return {
    // Gradient sets for different holographic effects
    gradients: {
    rainbow: [
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.warning,
      theme.colors.success,
      theme.colors.info,
      theme.colors.primary,
    ],
    cyber: [
      theme.colors.info,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.success,
      theme.colors.primary,
      theme.colors.primary,
    ],
    sunset: [
      theme.colors.danger,
      theme.colors.warning,
      theme.colors.success,
      theme.colors.info,
      theme.colors.primary,
      theme.colors.danger,
      theme.colors.warning,
    ],
    ocean: [
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.info,
      theme.colors.info,
      theme.colors.success,
    ],
    neon: [
      theme.colors.info,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.success,
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.info,
      theme.colors.warning,
    ],
    aurora: [
      theme.colors.primary,
      theme.colors.primary,
      theme.colors.info,
      theme.colors.success,
      theme.colors.warning,
      theme.colors.danger,
      theme.colors.primary,
    ],
    },

    // Shimmer configurations
    shimmer: {
      width: 100,
      opacity: 0.3,
      angle: 45,
    },
  } as const;
};

// === HOLOGRAPHIC CONTAINER COMPONENT ===
interface HolographicContainerProps extends ViewProps {
  children: ReactNode;
  variant?: keyof ReturnType<typeof HOLOGRAPHIC_CONFIGS>['gradients'];
  speed?: keyof typeof HOLOGRAPHIC_SPEEDS;
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
        withTiming(360, { duration: HOLOGRAPHIC_SPEEDS[speed] }),
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
          withTiming(100, { duration: HOLOGRAPHIC_SPEEDS[speed] }),
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
          withTiming(1.5, { duration: HOLOGRAPHIC_SPEEDS[speed] / 2 }),
          withTiming(1, { duration: HOLOGRAPHIC_SPEEDS[speed] / 2 }),
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
      style={[
        {
          borderRadius: theme.radii['2xl'],
          overflow: "hidden",
          position: "relative",
        },
        glow ? glowStyle : {},
        style,
      ] as any}
      {...props}
    >
      {/* Animated Gradient Background */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          gradientStyle,
        ] as any}
      >
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            borderRadius: theme.radii['2xl'],
          }}
        />
      </Animated.View>

      {/* Shimmer Effect */}
      {shimmer && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255, 255, 255, 0.1)",
            },
            shimmerStyle,
          ] as any}
        />
      )}

      {/* Content */}
      <View
        style={{
          position: "relative",
          zIndex: 1,
          padding: theme.spacing['2xl'],
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
  variant?: HolographicVariant;
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
  const theme = useTheme();
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return { padding: theme.spacing.lg };
      case "lg":
        return { padding: theme.spacing['3xl'] };
      case "xl":
        return { padding: theme.spacing['4xl'] };
      default:
        return { padding: theme.spacing['2xl'] };
    }
  };

  const sizeConfig = getSizeConfig();

  return (
    <HolographicContainer
      variant={variant}
      animated={animated}
      shimmer={shimmer}
      glow={glow}
      style={[sizeConfig, style] as ViewStyle}
      {...props}
    >
      {children}
    </HolographicContainer>
  );
};

// === HOLOGRAPHIC BUTTON COMPONENT ===
interface HolographicButtonProps extends ViewProps {
  children: ReactNode;
  variant?: HolographicVariant;
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

  const theme = useTheme();
  const getSizeConfig = () => {
    switch (size) {
      case "sm":
        return {
          paddingHorizontal: theme.spacing['2xl'],
          paddingVertical: theme.spacing.sm,
          minHeight: theme.spacing['3xl'] + theme.spacing.sm,
        };
      case "lg":
        return {
          paddingHorizontal: theme.spacing['4xl'],
          paddingVertical: theme.spacing['2xl'],
          minHeight: theme.spacing['3xl'] + theme.spacing['2xl'] * 2,
        };
      default:
        return {
          paddingHorizontal: theme.spacing['3xl'],
          paddingVertical: theme.spacing.lg,
          minHeight: theme.spacing['3xl'] + theme.spacing.lg * 2,
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
      style={[animatedStyle, style] as any}
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
        style={[
          sizeConfig,
          {
            justifyContent: "center",
            alignItems: "center",
            opacity: disabled ? 0.5 : 1,
          },
        ] as ViewStyle}
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
  variant?: HolographicVariant;
  size?: number;
  weight?: "normal" | "bold";
  animated?: boolean;
  style?: ViewStyle;
}

export const HolographicText: React.FC<HolographicTextProps> = ({
  children,
  variant = "rainbow",
  size,
  weight = "normal",
  animated = true,
  style,
}) => {
  const theme = useTheme();
  // Note: fontSize and weight are available for future text implementation
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fontSize = size ?? theme.typography.body.size;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _weight = weight;
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

  const configs = HOLOGRAPHIC_CONFIGS(theme);
  const gradientColors = [...configs.gradients[variant]];

  return (
    <View style={[{ position: "relative" }, style]}>
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          },
          gradientStyle,
        ] as any}
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
          padding: theme.spacing.xs,
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
  speed?: keyof typeof HOLOGRAPHIC_SPEEDS;
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
            duration: HOLOGRAPHIC_SPEEDS[speed] + Math.random() * 1000,
          }),
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_SPEEDS[speed] + Math.random() * 1000,
          }),
        ),
        -1,
        false,
      );

      particle.y.value = withRepeat(
        withSequence(
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_SPEEDS[speed] + Math.random() * 1000,
          }),
          withTiming(Math.random() * 100, {
            duration: HOLOGRAPHIC_SPEEDS[speed] + Math.random() * 1000,
          }),
        ),
        -1,
        false,
      );

      particle.opacity.value = withRepeat(
        withSequence(
          withTiming(0, { duration: HOLOGRAPHIC_SPEEDS[speed] / 2 }),
          withTiming(1, { duration: HOLOGRAPHIC_SPEEDS[speed] / 2 }),
        ),
        -1,
        false,
      );
    });
  }, [speed]);

  const theme = useTheme();
  const configs = HOLOGRAPHIC_CONFIGS(theme);
  const gradientColors = [...configs.gradients[variant]];

  return (
    <View
      style={[
        {
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
        },
        style,
      ]}
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
