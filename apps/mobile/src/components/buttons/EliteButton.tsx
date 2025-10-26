/**
 * PROJECT HYPERION: ELITE BUTTON COMPONENT
 *
 * Composed button using the composition pattern. This demonstrates how to
 * combine multiple effects to create a premium button experience while
 * maintaining clean, maintainable code.
 *
 * Architecture:
 * - BaseButton: Core functionality
 * - EffectWrappers: Individual visual effects
 * - Composition: Combine effects declaratively
 */

import React, { forwardRef } from "react";
import type { View, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";

import BaseButton, { type BaseButtonProps } from "./BaseButton";
import {
  WithGlowFX,
  WithMagneticFX,
  WithRippleFX,
  WithShimmerFX,
  WithPressFX,
  WithGradientFX,
} from "./EffectWrappers";

// === TYPES ===
export interface EliteButtonProps extends BaseButtonProps {
  // Effect toggles
  glowEffect?: boolean;
  magneticEffect?: boolean;
  rippleEffect?: boolean;
  shimmerEffect?: boolean;
  pressEffect?: boolean;
  gradientEffect?: boolean;

  // Effect configurations
  glowColor?: string;
  glowIntensity?: number;
  magneticSensitivity?: number;
  shimmerDuration?: number;
  gradientName?: "primary" | "secondary" | "success" | "warning" | "error" | "glass" | "glow";
  gradientColors?: string[];

  // Haptic feedback
  hapticFeedback?: boolean;
}

// === MAIN COMPONENT ===
const EliteButton = forwardRef<View, EliteButtonProps>(
  (
    {
      // Effect toggles
      glowEffect = false,
      magneticEffect = false,
      rippleEffect = true,
      shimmerEffect = false,
      pressEffect = true,
      gradientEffect = false,

      // Effect configurations
      glowColor,
      glowIntensity = 1,
      magneticSensitivity = 0.3,
      shimmerDuration = 2000,
      gradientName,
      gradientColors,

      // Haptic feedback
      hapticFeedback = true,

      // Base button props
      style,
      onPress,
      ...baseProps
    },
    ref,
  ) => {
    // Enhanced press handler with haptic feedback
    const handlePress = () => {
      if (hapticFeedback) {
        // Haptic feedback would be implemented here
        // Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    };

    // Create the button with all effects applied
    let ButtonComponent = (
      <BaseButton {...baseProps} onPress={handlePress} style={style} />
    );

    // Apply effects in reverse order (outermost to innermost)
    if (shimmerEffect) {
      ButtonComponent = (
        <WithShimmerFX duration={shimmerDuration} style={style}>
          {ButtonComponent}
        </WithShimmerFX>
      );
    }

    if (gradientEffect) {
      ButtonComponent = (
        <WithGradientFX
          gradient={gradientName}
          colors={gradientColors}
          style={style}
        >
          {ButtonComponent}
        </WithGradientFX>
      );
    }

    if (rippleEffect) {
      ButtonComponent = (
        <WithRippleFX style={style}>{ButtonComponent}</WithRippleFX>
      );
    }

    if (pressEffect) {
      ButtonComponent = (
        <WithPressFX style={style}>{ButtonComponent}</WithPressFX>
      );
    }

    if (magneticEffect) {
      ButtonComponent = (
        <WithMagneticFX sensitivity={magneticSensitivity} style={style}>
          {ButtonComponent}
        </WithMagneticFX>
      );
    }

    if (glowEffect) {
      ButtonComponent = (
        <WithGlowFX color={glowColor} intensity={glowIntensity} style={style}>
          {ButtonComponent}
        </WithGlowFX>
      );
    }

    return ButtonComponent;
  },
);

// Display name for debugging
EliteButton.displayName = "EliteButton";

// === PRESET CONFIGURATIONS ===
export const EliteButtonPresets = {
  // Basic premium button
  premium: (props: EliteButtonProps) => (
    <EliteButton
      {...props}
      glowEffect={true}
      rippleEffect={true}
      pressEffect={true}
    />
  ),

  // Holographic button with shimmer
  holographic: (props: EliteButtonProps) => (
    <EliteButton
      {...props}
      gradientEffect={true}
      gradientName="primary"
      shimmerEffect={true}
      glowEffect={true}
      rippleEffect={true}
      pressEffect={true}
    />
  ),

  // Magnetic interactive button
  magnetic: (props: EliteButtonProps) => (
    <EliteButton
      {...props}
      magneticEffect={true}
      rippleEffect={true}
      pressEffect={true}
      glowEffect={true}
    />
  ),

  // Glass morphism button
  glass: (props: EliteButtonProps) => (
    <EliteButton
      {...props}
      variant="ghost"
      glowEffect={true}
      rippleEffect={true}
      pressEffect={true}
      style={StyleSheet.flatten([
        {
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.2)",
        },
        props.style,
      ])}
    />
  ),

  // Neon button with intense glow
  neon: (props: EliteButtonProps) => (
    <EliteButton
      {...props}
      glowEffect={true}
      glowIntensity={2}
      glowColor="#00f5ff"
      rippleEffect={true}
      pressEffect={true}
      shimmerEffect={true}
      shimmerDuration={1000}
    />
  ),
};

export default EliteButton;
