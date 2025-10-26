/**
 * PROJECT HYPERION: EFFECT WRAPPER COMPONENTS
 *
 * Composition-based effect system for buttons. Each wrapper adds a single effect:
 * - WithGlowFX: Animated glow effect
 * - WithMagneticFX: Magnetic touch-following effect
 * - WithRippleFX: Press ripple effect
 * - WithShimmerFX: Shimmer animation effect
 *
 * These can be combined to create complex button behaviors while maintaining
 * single responsibility and reusability.
 */

import type { ReactNode } from "react";
import React, { forwardRef } from "react";
import { View, type ViewStyle, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import {
  useGlowAnimation,
  useMagneticEffect,
  usePressAnimation,
} from "../../hooks/useUnifiedAnimations";
import {
  useRippleEffect,
  useShimmerEffect,
} from "../../hooks/usePremiumAnimations";
import { Theme } from "../../theme/unified-theme";

// === TYPES ===
interface EffectWrapperProps {
  children: ReactNode;
  style?: ViewStyle;
  disabled?: boolean;
}

// === 1. GLOW EFFECT WRAPPER ===
interface WithGlowFXProps extends EffectWrapperProps {
  color?: string;
  intensity?: number;
  duration?: number;
}

export const WithGlowFX = forwardRef<View, WithGlowFXProps>(
  (
    {
      children,
      color = Theme.colors.primary[500],
      intensity = 1,
      duration = 2000,
      style,
      disabled = false,
    },
    ref,
  ) => {
    const { animatedStyle: glowStyle } = useGlowAnimation(
      disabled ? "transparent" : color,
      disabled ? 0 : intensity,
      duration,
    );

    return (
      <Animated.View ref={ref} style={StyleSheet.flatten([glowStyle, style])}>
        {children}
      </Animated.View>
    );
  },
);

WithGlowFX.displayName = "WithGlowFX";

// === 2. MAGNETIC EFFECT WRAPPER ===
interface WithMagneticFXProps extends EffectWrapperProps {
  sensitivity?: number;
  maxDistance?: number;
}

export const WithMagneticFX = forwardRef<View, WithMagneticFXProps>(
  (
    { children, sensitivity = 0.3, maxDistance = 30, style, disabled = false },
    ref,
  ) => {
    const {
      handleTouchStart,
      handleTouchEnd,
      animatedStyle: magneticStyle,
    } = useMagneticEffect(disabled ? 0 : sensitivity, maxDistance);

    return (
      <Animated.View
        ref={ref}
        style={StyleSheet.flatten([magneticStyle, style])}
        onTouchStart={(event) => {
          if (disabled) return;
          const { pageX, pageY } = event.nativeEvent;
          // Get center position (would need proper measurement in real implementation)
          const centerX = 0; // This would be calculated
          const centerY = 0; // This would be calculated
          handleTouchStart(pageX, pageY, centerX, centerY);
        }}
        onTouchEnd={disabled ? undefined : handleTouchEnd}
      >
        {children}
      </Animated.View>
    );
  },
);

WithMagneticFX.displayName = "WithMagneticFX";

// === 3. RIPPLE EFFECT WRAPPER ===
interface WithRippleFXProps extends EffectWrapperProps {
  color?: string;
}

export const WithRippleFX = forwardRef<View, WithRippleFXProps>(
  (
    { children, color = "rgba(255, 255, 255, 0.3)", style, disabled = false },
    ref,
  ) => {
    const { triggerRipple, rippleStyle } = useRippleEffect();

    const handlePressIn = () => {
      if (!disabled) {
        triggerRipple();
      }
    };

    return (
      <View ref={ref} style={style}>
        {children}
        {!disabled && (
          <Animated.View
            style={StyleSheet.flatten([
              {
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: color,
                marginTop: -50,
                marginLeft: -50,
              },
              rippleStyle,
            ])}
            pointerEvents="none"
          />
        )}
      </View>
    );
  },
);

WithRippleFX.displayName = "WithRippleFX";

// === 4. SHIMMER EFFECT WRAPPER ===
interface WithShimmerFXProps extends EffectWrapperProps {
  duration?: number;
  color?: string;
}

export const WithShimmerFX = forwardRef<View, WithShimmerFXProps>(
  (
    {
      children,
      duration = 2000,
      color = "rgba(255, 255, 255, 0.1)",
      style,
      disabled = false,
    },
    ref,
  ) => {
    const { shimmerStyle } = useShimmerEffect(!disabled && duration > 0);

    return (
      <View ref={ref} style={style}>
        {children}
        {!disabled && (
          <Animated.View
            style={StyleSheet.flatten([
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: color,
              },
              shimmerStyle,
            ])}
            pointerEvents="none"
          />
        )}
      </View>
    );
  },
);

WithShimmerFX.displayName = "WithShimmerFX";

// === 5. PRESS ANIMATION WRAPPER ===
interface WithPressFXProps extends EffectWrapperProps {
  config?: "gentle" | "standard" | "bouncy" | "snappy";
}

export const WithPressFX = forwardRef<View, WithPressFXProps>(
  ({ children, config = "snappy", style, disabled = false }, ref) => {
    const {
      handlePressIn,
      handlePressOut,
      animatedStyle: pressStyle,
    } = usePressAnimation(config);

    return (
      <Animated.View
        ref={ref}
        style={StyleSheet.flatten([pressStyle, style])}
        onTouchStart={disabled ? undefined : handlePressIn}
        onTouchEnd={disabled ? undefined : handlePressOut}
      >
        {children}
      </Animated.View>
    );
  },
);

WithPressFX.displayName = "WithPressFX";

// === 6. GRADIENT WRAPPER ===
interface WithGradientFXProps extends EffectWrapperProps {
  gradient?: keyof typeof Theme.gradients;
  colors?: string[];
  angle?: number;
}

export const WithGradientFX = forwardRef<View, WithGradientFXProps>(
  ({ children, gradient, colors, angle = 135, style }, ref) => {
    const { LinearGradient } = require("expo-linear-gradient");

    const gradientConfig = gradient ? (Theme.gradients as any)[gradient] : null;
    const gradientColors =
      colors || Array.isArray(gradientConfig?.colors)
        ? gradientConfig?.colors
        : [Theme.colors.primary[500], Theme.colors.primary[400]];

    return (
      <LinearGradient
        ref={ref}
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={style}
      >
        {children}
      </LinearGradient>
    );
  },
);

WithGradientFX.displayName = "WithGradientFX";

// === EXPORT ALL WRAPPERS ===
export const EffectWrappers = {
  WithGlowFX,
  WithMagneticFX,
  WithRippleFX,
  WithShimmerFX,
  WithPressFX,
  WithGradientFX,
};

export default EffectWrappers;
