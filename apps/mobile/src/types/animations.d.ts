/**
 * Type definitions for animation hooks
 * Matches the actual hook implementations in useUnifiedAnimations
 */

import type { ViewStyle } from "react-native";
import type Animated from "react-native-reanimated";

// Ripple effect hook return type
export interface RippleEffectResult {
  trigger: () => void;
  animatedStyle: Animated.AnimatedStyleProp<ViewStyle>;
}

// Magnetic effect hook return type
export interface MagneticEffectResult {
  handleTouchStart: (
    touchX: number,
    touchY: number,
    centerX: number,
    centerY: number,
  ) => void;
  handleTouchEnd: () => void;
  animatedStyle: Animated.AnimatedStyleProp<ViewStyle>;
}

// Glow effect hook return type
export interface GlowEffectResult {
  animatedStyle: Animated.AnimatedStyleProp<ViewStyle>;
}

// Shimmer effect hook return type
export interface ShimmerEffectResult {
  animatedStyle: Animated.AnimatedStyleProp<ViewStyle>;
}

// Press animation hook return type
export interface PressAnimationResult {
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: Animated.AnimatedStyleProp<ViewStyle>;
}

// Extend the module declarations
declare module "../hooks/useUnifiedAnimations" {
  export function useRippleEffect(): RippleEffectResult;
  export function useMagneticEffect(
    sensitivity?: number,
    maxDistance?: number,
  ): MagneticEffectResult;
  export function useGlowAnimation(
    color?: string,
    intensity?: number,
    duration?: number,
  ): GlowEffectResult;
  export function useShimmerEffect(duration?: number): ShimmerEffectResult;
  export function usePressAnimation(
    config?: "gentle" | "standard" | "bouncy" | "snappy",
  ): PressAnimationResult;
}
