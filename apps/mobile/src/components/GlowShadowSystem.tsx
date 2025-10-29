import React, { type ReactNode, useEffect } from "react";
import { View, type ViewStyle, type ViewProps, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { Spacing } from "../animation";
import { MOBILE_RADIUS } from '../constants/design-tokens';

// === GLOW AND SHADOW CONSTANTS ===
export const GLOW_SHADOW_CONFIGS = {
  // Colored shadows
  coloredShadows: {
    primary: {
      shadowColor: "Theme.colors.primary[500]",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    secondary: {
      shadowColor: "Theme.colors.secondary[500]",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    success: {
      shadowColor: "#22c55e",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    warning: {
      shadowColor: "Theme.colors.status.warning",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    error: {
      shadowColor: "Theme.colors.status.error",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    purple: {
      shadowColor: "Theme.colors.secondary[500]",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 20,
      elevation: 15,
    },
    neon: {
      shadowColor: "#00f5ff",
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 30,
      elevation: 25,
    },
    holographic: {
      shadowColor: "#667eea",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 20,
    },
  },

  // Depth shadows
  depthShadows: {
    sm: {
      shadowColor: "Theme.colors.neutral[950]",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: "Theme.colors.neutral[950]",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: "Theme.colors.neutral[950]",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: "Theme.colors.neutral[950]",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },
    "2xl": {
      shadowColor: "Theme.colors.neutral[950]",
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.3,
      shadowRadius: 32,
      elevation: 16,
    },
  },

  // Glow intensities
  glowIntensities: {
    light: 1.2,
    medium: 1.5,
    heavy: 2.0,
    ultra: 3.0,
  },

  // Animation speeds
  animationSpeeds: {
    slow: 2000,
    normal: 1000,
    fast: 500,
    ultra: 250,
  },
} as const;

// === GLOW CONTAINER COMPONENT ===
interface GlowContainerProps extends ViewProps {
  children: ReactNode;
  color?: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
  intensity?: keyof typeof GLOW_SHADOW_CONFIGS.glowIntensities;
  animated?: boolean;
  speed?: keyof typeof GLOW_SHADOW_CONFIGS.animationSpeeds;
  style?: ViewStyle;
}

export const GlowContainer: React.FC<GlowContainerProps> = ({
  children,
  color = "primary",
  intensity = "medium",
  animated = true,
  speed = "normal",
  style,
  ...props
}) => {
  const glowIntensity = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(GLOW_SHADOW_CONFIGS.glowIntensities[intensity], {
            duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
          }),
          withTiming(1, {
            duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
          }),
        ),
        -1,
        false,
      );
    }
  }, [animated, intensity, speed]);

  const glowStyle = useAnimatedStyle(() => {
    const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];
    return {
      shadowOpacity: baseShadow.shadowOpacity * glowIntensity.value,
      shadowRadius: baseShadow.shadowRadius * glowIntensity.value,
      elevation: baseShadow.elevation * glowIntensity.value,
    };
  });

  const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          shadowColor: baseShadow.shadowColor,
          shadowOffset: baseShadow.shadowOffset,
        },
        animated ? glowStyle : baseShadow,
        style,
      ])}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// === SHADOW CONTAINER COMPONENT ===
interface ShadowContainerProps extends ViewProps {
  children: ReactNode;
  depth?: keyof typeof GLOW_SHADOW_CONFIGS.depthShadows;
  style?: ViewStyle;
}

export const ShadowContainer: React.FC<ShadowContainerProps> = ({
  children,
  depth = "md",
  style,
  ...props
}) => {
  const shadowStyle = GLOW_SHADOW_CONFIGS.depthShadows[depth];

  return (
    <View style={StyleSheet.flatten([shadowStyle, style])} {...props}>
      {children}
    </View>
  );
};

// === NEON BORDER COMPONENT ===
interface NeonBorderProps extends ViewProps {
  children: ReactNode;
  color?: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
  width?: number;
  animated?: boolean;
  speed?: keyof typeof GLOW_SHADOW_CONFIGS.animationSpeeds;
  style?: ViewStyle;
}

export const NeonBorder: React.FC<NeonBorderProps> = ({
  children,
  color = "neon",
  width = 2,
  animated = true,
  speed = "normal",
  style,
  ...props
}) => {
  const borderOpacity = useSharedValue(1);

  useEffect(() => {
    if (animated) {
      borderOpacity.value = withRepeat(
        withSequence(
          withTiming(0.3, {
            duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
          }),
          withTiming(1, {
            duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
          }),
        ),
        -1,
        false,
      );
    }
  }, [animated, speed]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];
  const baseStyle = {
    borderWidth: width,
    borderColor: baseShadow.shadowColor,
    borderRadius: MOBILE_RADIUS["2xl"],
    ...baseShadow,
  };

  return (
    <Animated.View
      style={StyleSheet.flatten([
        baseStyle,
        animated ? animatedStyle : undefined,
        style,
      ])}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// === GLOWING CARD COMPONENT ===
interface GlowingCardProps extends ViewProps {
  children: ReactNode;
  glowColor?: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
  shadowDepth?: keyof typeof GLOW_SHADOW_CONFIGS.depthShadows;
  glowIntensity?: keyof typeof GLOW_SHADOW_CONFIGS.glowIntensities;
  animated?: boolean;
  style?: ViewStyle;
}

export const GlowingCard: React.FC<GlowingCardProps> = ({
  children,
  glowColor = "primary",
  shadowDepth = "lg",
  glowIntensity = "medium",
  animated = true,
  style,
  ...props
}) => {
  return (
    <GlowContainer
      color={glowColor}
      intensity={glowIntensity}
      animated={animated}
      style={StyleSheet.flatten([
        {
          borderRadius: MOBILE_RADIUS["2xl"],
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          padding: 16, // Spacing.lg equivalent
        },
        GLOW_SHADOW_CONFIGS.depthShadows[shadowDepth],
        style,
      ])}
      {...props}
    >
      {children}
    </GlowContainer>
  );
};

// === PULSING GLOW COMPONENT ===
interface PulsingGlowProps extends ViewProps {
  children: ReactNode;
  color?: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
  intensity?: keyof typeof GLOW_SHADOW_CONFIGS.glowIntensities;
  speed?: keyof typeof GLOW_SHADOW_CONFIGS.animationSpeeds;
  style?: ViewStyle;
}

export const PulsingGlow: React.FC<PulsingGlowProps> = ({
  children,
  color = "primary",
  intensity = "heavy",
  speed = "normal",
  style,
  ...props
}) => {
  const pulseScale = useSharedValue(1);
  const glowIntensity = useSharedValue(1);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, {
          duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
        }),
        withTiming(1, {
          duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
        }),
      ),
      -1,
      false,
    );

    glowIntensity.value = withRepeat(
      withSequence(
        withTiming(GLOW_SHADOW_CONFIGS.glowIntensities[intensity], {
          duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
        }),
        withTiming(1, {
          duration: GLOW_SHADOW_CONFIGS.animationSpeeds[speed],
        }),
      ),
      -1,
      false,
    );
  }, [intensity, speed]);

  const animatedStyle = useAnimatedStyle(() => {
    const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];
    return {
      transform: [{ scale: pulseScale.value }],
      shadowOpacity: baseShadow.shadowOpacity * glowIntensity.value,
      shadowRadius: baseShadow.shadowRadius * glowIntensity.value,
      elevation: baseShadow.elevation * glowIntensity.value,
    };
  });

  const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          shadowColor: baseShadow.shadowColor,
          shadowOffset: baseShadow.shadowOffset,
        },
        animatedStyle,
        style,
      ])}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

// === MULTI-LAYER SHADOW COMPONENT ===
interface MultiLayerShadowProps extends ViewProps {
  children: ReactNode;
  layers?: Array<{
    color: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
    offset: { width: number; height: number };
    radius: number;
    opacity: number;
  }>;
  style?: ViewStyle;
}

export const MultiLayerShadow: React.FC<MultiLayerShadowProps> = ({
  children,
  layers = [
    {
      color: "primary",
      offset: { width: 0, height: 4 },
      radius: 8,
      opacity: 0.3,
    },
    {
      color: "secondary",
      offset: { width: 0, height: 8 },
      radius: 16,
      opacity: 0.2,
    },
  ],
  style,
  ...props
}) => {
  return (
    <View
      style={StyleSheet.flatten([
        {
          position: "relative",
        },
        style,
      ])}
      {...props}
    >
      {/* Shadow layers */}
      {layers.map((layer, index) => {
        const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[layer.color];
        return (
          <View
            key={index}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "transparent",
              shadowColor: baseShadow.shadowColor,
              shadowOffset: layer.offset,
              shadowOpacity: layer.opacity,
              shadowRadius: layer.radius,
              elevation: layer.radius / 2,
              zIndex: -1 - index,
            }}
          />
        );
      })}

      {/* Content */}
      <View style={{ position: "relative", zIndex: 1 }}>{children}</View>
    </View>
  );
};

// === FLOATING SHADOW COMPONENT ===
interface FloatingShadowProps extends ViewProps {
  children: ReactNode;
  color?: keyof typeof GLOW_SHADOW_CONFIGS.coloredShadows;
  depth?: keyof typeof GLOW_SHADOW_CONFIGS.depthShadows;
  animated?: boolean;
  style?: ViewStyle;
}

export const FloatingShadow: React.FC<FloatingShadowProps> = ({
  children,
  color = "primary",
  depth = "xl",
  animated = true,
  style,
  ...props
}) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-8, { duration: 2000 }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        false,
      );
    }
  }, [animated]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const baseShadow = GLOW_SHADOW_CONFIGS.coloredShadows[color];
  const depthShadow = GLOW_SHADOW_CONFIGS.depthShadows[depth];

  return (
    <Animated.View
      style={StyleSheet.flatten([
        {
          shadowColor: baseShadow.shadowColor,
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: baseShadow.shadowOpacity,
          shadowRadius: baseShadow.shadowRadius,
          elevation: baseShadow.elevation,
        },
        depthShadow,
        animated ? animatedStyle : {},
        style,
      ])}
      {...props}
    >
      {children}
    </Animated.View>
  );
};

export default {
  GLOW_SHADOW_CONFIGS,
  GlowContainer,
  ShadowContainer,
  NeonBorder,
  GlowingCard,
  PulsingGlow,
  MultiLayerShadow,
  FloatingShadow,
};
