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
import { View, type ViewStyle, type StyleProp } from "react-native";
import Animated from "react-native-reanimated";

import {
  useGlowAnimation,
  useMagneticEffect,
  useRippleEffect,
  useShimmerEffect,
  usePressAnimation,
} from "../../hooks/useUnifiedAnimations";
import { Theme } from "../../theme/unified-theme";
import { getPrimaryColor } from "../../theme/helpers";

// === TYPES ===
interface EffectWrapperProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

// === 1. GLOW EFFECT WRAPPER ===
interface WithGlowFXProps extends EffectWrapperProps {
  color?: string;
  intensity?: number;
  duration?: number;
}

export const WithGlowFX = forwardRef<Animated.View, WithGlowFXProps>(
  (
    {
      children,
      color = getPrimaryColor(500),
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
      <Animated.View ref={ref} style={[glowStyle, style]}>
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

export const WithMagneticFX = forwardRef<Animated.View, WithMagneticFXProps>(
  (
    { children, sensitivity = 0.3, maxDistance = 30, style, disabled = false },
    ref,
  ) => {
    const magneticEffect = useMagneticEffect(
      disabled ? 0 : sensitivity,
      maxDistance,
    );
    const {
      handleTouchStart,
      handleTouchEnd,
      animatedStyle: magneticStyle,
    } = magneticEffect;

    return (
      <Animated.View
        ref={ref}
        style={[magneticStyle, style]}
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
  ({ children, style }, ref) => {
    const { animatedStyle } = useRippleEffect();

    return (
      <View ref={ref} style={style}>
        <Animated.View style={animatedStyle}>{children}</Animated.View>
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
  ({ children, style }, ref) => {
    const { animatedStyle: shimmerStyle } = useShimmerEffect();

    return (
      <View ref={ref} style={style}>
        <Animated.View style={shimmerStyle}>{children}</Animated.View>
      </View>
    );
  },
);

WithShimmerFX.displayName = "WithShimmerFX";

// === 5. PRESS ANIMATION WRAPPER ===
interface WithPressFXProps extends EffectWrapperProps {
  config?: "gentle" | "standard" | "bouncy" | "snappy";
}

export const WithPressFX = forwardRef<Animated.View, WithPressFXProps>(
  ({ children, config = "snappy", style, disabled = false }, ref) => {
    const {
      handlePressIn,
      handlePressOut,
      animatedStyle: pressStyle,
    } = usePressAnimation(config);

    return (
      <Animated.View
        ref={ref as any}
        style={[pressStyle, style]}
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
  ({ children, gradient, colors, style }, ref) => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { LinearGradient } = require("expo-linear-gradient") as any;

    const gradientConfig = gradient ? Theme.gradients[gradient] : undefined;
    const gradientColors: string[] = colors ||
      (Array.isArray(gradientConfig) ? gradientConfig : []) || [
        getPrimaryColor(500),
        Theme.colors.primary[400] || Theme.colors.primary[400],
      ];

    return (
      <LinearGradient
        ref={ref as any}
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
