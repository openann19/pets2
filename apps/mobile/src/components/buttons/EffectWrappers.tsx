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

import type { ReactNode } from 'react';
import React, { forwardRef, type Ref } from 'react';
import { View, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { type AnimatedStyleProp } from 'react-native-reanimated';

import { useGlowAnimation, usePressAnimation } from '../../hooks/useUnifiedAnimations';
import { useMagneticEffect, useRippleEffect, useShimmerEffect } from '../../hooks/animations';

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

export const WithGlowFX = forwardRef<Animated.View, WithGlowFXProps>(
  (
    {
      children,
      color = Theme.colors.primary[500],
      intensity = 1,
      duration = 2000,
      style,
      disabled = false,
    },
    ref: Ref<Animated.View>,
  ) => {
    const { animatedStyle: glowStyle } = useGlowAnimation(
      disabled ? 'transparent' : color,
      disabled ? 0 : intensity,
      duration,
    );

    return (
      <Animated.View
        ref={ref}
        style={[glowStyle as AnimatedStyleProp<ViewStyle>, style]}
      >
        {children}
      </Animated.View>
    );
  },
);

WithGlowFX.displayName = 'WithGlowFX';

// === 2. MAGNETIC EFFECT WRAPPER ===
interface WithMagneticFXProps extends EffectWrapperProps {
  sensitivity?: number;
  maxDistance?: number;
}

export const WithMagneticFX = forwardRef<Animated.View, WithMagneticFXProps>(
  (
    { children, sensitivity = 0.3, maxDistance = 30, style, disabled = false },
    ref: Ref<Animated.View>,
  ) => {
    const { magneticStyle, handleMagneticMove, resetMagnetic } = useMagneticEffect(!disabled);

    return (
      <Animated.View
        ref={ref}
        style={[magneticStyle as AnimatedStyleProp<ViewStyle>, style]}
      >
        {children}
      </Animated.View>
    );
  },
);

WithMagneticFX.displayName = 'WithMagneticFX';

// === 3. RIPPLE EFFECT WRAPPER ===
interface WithRippleFXProps extends EffectWrapperProps {
  color?: string;
}

export const WithRippleFX = forwardRef<View, WithRippleFXProps>(
  ({ children, color = 'rgba(255, 255, 255, 0.3)', style, disabled = false }, ref) => {
    const { triggerRipple, rippleStyle } = useRippleEffect();

    const handlePressIn = () => {
      if (!disabled) {
        triggerRipple();
      }
    };

    return (
      <View
        ref={ref}
        style={style}
      >
        {children}
        {!disabled && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 100,
                height: 100,
                borderRadius: 50,
                backgroundColor: color,
                marginTop: -50,
                marginLeft: -50,
              } as ViewStyle,
              rippleStyle as AnimatedStyleProp<ViewStyle>,
            ]}
            pointerEvents="none"
          />
        )}
      </View>
    );
  },
);

WithRippleFX.displayName = 'WithRippleFX';

// === 4. SHIMMER EFFECT WRAPPER ===
interface WithShimmerFXProps extends EffectWrapperProps {
  duration?: number;
  color?: string;
}

export const WithShimmerFX = forwardRef<View, WithShimmerFXProps>(
  (
    { children, duration = 2000, color = 'rgba(255, 255, 255, 0.1)', style, disabled = false },
    ref,
  ) => {
    const { shimmerStyle } = useShimmerEffect(!disabled && duration > 0);

    return (
      <View
        ref={ref}
        style={style}
      >
        {children}
        {!disabled && (
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: color,
              } as ViewStyle,
              shimmerStyle as AnimatedStyleProp<ViewStyle>,
            ]}
            pointerEvents="none"
          />
        )}
      </View>
    );
  },
);

WithShimmerFX.displayName = 'WithShimmerFX';

// === 5. PRESS ANIMATION WRAPPER ===
interface WithPressFXProps extends EffectWrapperProps {
  config?: 'gentle' | 'standard' | 'bouncy' | 'snappy';
}

export const WithPressFX = forwardRef<Animated.View, WithPressFXProps>(
  ({ children, config = 'snappy', style, disabled = false }, ref: Ref<Animated.View>) => {
    const { handlePressIn, handlePressOut, animatedStyle: pressStyle } = usePressAnimation(config);

    return (
      <Animated.View
        ref={ref}
        style={[pressStyle as AnimatedStyleProp<ViewStyle>, style]}
        onTouchStart={disabled ? undefined : handlePressIn}
        onTouchEnd={disabled ? undefined : handlePressOut}
      >
        {children}
      </Animated.View>
    );
  },
);

WithPressFX.displayName = 'WithPressFX';

interface WithGradientFXProps extends EffectWrapperProps {
  gradient?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'glass' | 'glow';
  colors?: string[];
  angle?: number;
}

export const WithGradientFX = forwardRef<View, WithGradientFXProps>(
  ({ children, gradient, colors, angle = 135, style }, ref) => {
    const { LinearGradient } = require('expo-linear-gradient');

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

WithGradientFX.displayName = 'WithGradientFX';

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
