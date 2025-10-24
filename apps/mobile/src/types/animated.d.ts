/**
 * Type definitions for React Native Animated API
 * Fixes type issues with Animated values in styles
 */

declare module "react-native" {
  namespace Animated {
    // Value types
    interface AnimatedValue {
      interpolate(config: InterpolationConfig): AnimatedValue;
      addListener(callback: (value: { value: number }) => void): string;
      removeListener(id: string): void;
      removeAllListeners(): void;
      setValue(value: number): void;
      getValue(): number;
    }

    interface AnimatedValueXY {
      x: AnimatedValue;
      y: AnimatedValue;
      interpolate(config: InterpolationConfigXY): AnimatedValueXY;
      addListener(callback: (value: { x: number; y: number }) => void): string;
      removeListener(id: string): void;
      removeAllListeners(): void;
      setValue(value: { x: number; y: number }): void;
      getValue(): { x: number; y: number };
    }

    // Interpolation config
    interface InterpolationConfig {
      inputRange: number[];
      outputRange: number[] | string[];
      extrapolate?: "clamp" | "identity" | "extend";
      extrapolateLeft?: "clamp" | "identity" | "extend";
      extrapolateRight?: "clamp" | "identity" | "extend";
    }

    interface InterpolationConfigXY {
      inputRange: number[];
      outputRange: Array<{ x: number; y: number }>;
      extrapolate?: "clamp" | "identity" | "extend";
    }

    // Animation configurations
    interface TimingAnimationConfig {
      toValue: number | AnimatedValue | AnimatedValueXY;
      duration?: number;
      easing?: (value: number) => number;
      delay?: number;
      useNativeDriver?: boolean;
    }

    interface SpringAnimationConfig {
      toValue: number | AnimatedValue | AnimatedValueXY;
      friction?: number;
      tension?: number;
      speed?: number;
      bounciness?: number;
      delay?: number;
      useNativeDriver?: boolean;
    }

    interface DecayAnimationConfig {
      velocity: number | { x: number; y: number };
      deceleration?: number;
      useNativeDriver?: boolean;
    }

    // Composite animation
    interface CompositeAnimation {
      start: (callback?: (result: { finished: boolean }) => void) => void;
      stop: () => void;
      reset: () => void;
    }

    // Parallel, sequence, stagger
    function parallel(
      animations: CompositeAnimation[],
      config?: { stopTogether?: boolean },
    ): CompositeAnimation;

    function sequence(animations: CompositeAnimation[]): CompositeAnimation;

    function stagger(
      delay: number,
      animations: CompositeAnimation[],
    ): CompositeAnimation;

    function delay(time: number): CompositeAnimation;

    function loop(
      animation: CompositeAnimation,
      config?: { iterations?: number },
    ): CompositeAnimation;

    // Timing and spring functions
    function timing(
      value: AnimatedValue | AnimatedValueXY,
      config: TimingAnimationConfig,
    ): CompositeAnimation;

    function spring(
      value: AnimatedValue | AnimatedValueXY,
      config: SpringAnimationConfig,
    ): CompositeAnimation;

    function decay(
      value: AnimatedValue | AnimatedValueXY,
      config: DecayAnimationConfig,
    ): CompositeAnimation;

    // Value constructors
    function Value(value: number): AnimatedValue;
    function ValueXY(value?: { x: number; y: number }): AnimatedValueXY;

    // Event handling
    interface AnimatedEvent {
      nativeEvent: Record<string, any>;
    }

    function event<T>(
      argMapping: Array<T> | T,
      config?: {
        listener?: (event: AnimatedEvent) => void;
        useNativeDriver?: boolean;
      },
    ): T;
  }
}

export {};
