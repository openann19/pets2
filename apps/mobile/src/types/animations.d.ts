/**
 * Type definitions for animation hooks
 * Adds missing properties to fix TypeScript errors
 */

import { ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

// Ripple effect hook return type
interface RippleEffectResult {
  rippleStyle: Animated.AnimatedStyleProp<ViewStyle>;
  triggerRipple: () => void;
  // Alias for backward compatibility
  startRipple: () => void;
  animatedStyle: {
    transform: { scale: number }[];
    opacity: number;
  };
}

// Magnetic effect hook return type
interface MagneticEffectResult {
  magneticStyle: Animated.AnimatedStyleProp<ViewStyle>;
  onTouchMove: (event: any) => void;
  onTouchEnd: () => void;
  resetMagnetic: () => void;
}

// Glow effect hook return type
interface GlowEffectResult {
  glowStyle: Animated.AnimatedStyleProp<ViewStyle>;
  glowOpacity: Animated.SharedValue<number>;
  pulseGlow: () => void;
}

// Extend the module declarations
declare module '../hooks/useUnifiedAnimations' {
  export function useRippleEffect(): RippleEffectResult;
  export function useMagneticEffect(strength?: number, maxDistance?: number): MagneticEffectResult;
  export function useGlowEffect(intensity?: number): GlowEffectResult;
}

declare module '../hooks/usePremiumAnimations' {
  export function useRippleEffect(): RippleEffectResult;
  export function useMagneticEffect(strength?: number, maxDistance?: number): MagneticEffectResult;
  export function useGlowEffect(intensity?: number): GlowEffectResult;
}

declare module '../hooks/useMotionSystem' {
  export function useRippleEffect(duration?: number): RippleEffectResult;
  export function useMagneticEffect(strength?: number, maxDistance?: number): MagneticEffectResult;
  export function useGlowEffect(intensity?: number): GlowEffectResult;
}
