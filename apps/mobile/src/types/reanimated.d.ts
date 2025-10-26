/**
 * React Native Reanimated Type Definitions
 * 
 * Provides proper typing for react-native-reanimated SharedValue, DerivedValue,
 * and other animated primitives used throughout the app.
 */

import type { ComponentPropsWithRef } from "react";
import type { ViewStyle, TextStyle, ImageStyle } from "react-native";

declare module "react-native-reanimated" {
  export type SharedValue<T> = {
    readonly value: T;
  };

  export type DerivedValue<T> = Readonly<{ value: T }>;

  export type AnimatedStyle<T> = T;

  export interface UseAnimatedStyleCallback {
    (): AnimatedStyle<ViewStyle | TextStyle | ImageStyle>;
  }

  export interface WorkletFunction<Args extends readonly unknown[], Return> {
    (...args: Args): Return;
  }

  export function useSharedValue<T>(
    initialValue: T,
  ): SharedValue<T>;

  export function useDerivedValue<T>(
    callback: () => T,
    dependencies?: unknown[],
  ): DerivedValue<T>;

  export function useAnimatedStyle<T extends UseAnimatedStyleCallback>(
    callback: T,
    deps?: unknown[],
  ): ReturnType<T>;

  export function withTiming<T extends number>(
    toValue: T,
    config?: {
      duration?: number;
      easing?: (value: number) => number;
    },
  ): T;

  export function withSpring<T extends number>(
    toValue: T,
    config?: {
      damping?: number;
      mass?: number;
      stiffness?: number;
      velocity?: number;
    },
  ): T;

  export function withDecay(
    config: {
      velocity: number;
      deceleration?: number;
      clamp?: [number, number];
    },
  ): number;

  export function interpolate(
    value: number,
    inputRange: number[],
    outputRange: number[],
    extrapolate?: "clamp" | "extend" | "identity",
  ): number;

  export function useAnimatedGestureHandler<
    T extends Record<string, unknown>,
  >(handlers: T): (event: unknown) => void;

  export function withDelay<T extends number>(
    delayMs: number,
    toValue: T,
  ): T;

  export function withRepeat<T extends number>(
    toValue: T,
    reps?: number,
    reverse?: boolean,
  ): T;

  export function withSequence(
    ...animations: number[]
  ): number;

  export function cancelAnimation<T>(sharedValue: SharedValue<T>): void;

  export function runOnJS<Args extends readonly unknown[], Return>(
    fn: (...args: Args) => Return,
  ): WorkletFunction<Args, void>;

  export function runOnUI<Args extends readonly unknown[], Return>(
    fn: (...args: Args) => Return,
  ): WorkletFunction<Args, Return>;

  export function useAnimatedProps<T>(
    callback: () => T,
    deps?: unknown[],
  ): Partial<T>;

  export function withClamp(
    value: number,
    min: number,
    max: number,
  ): number;

  export function interpolateColor(
    value: number,
    inputRange: number[],
    outputRange: string[],
    colorSpace?: "RGB" | "HSV",
  ): string;

  export const Extrapolate: {
    EXTEND: "extend";
    CLAMP: "clamp";
    IDENTITY: "identity";
  };

  export const Easing: {
    linear: (t: number) => number;
    ease: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    poly: (n: number) => (t: number) => number;
    sin: (t: number) => number;
    circle: (t: number) => number;
    exp: (t: number) => number;
    elastic: (bounciness: number) => (t: number) => number;
    back: (s: number) => (t: number) => number;
    bounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
  };
}

/**
 * Animated style prop types for use with Reanimated components
 */
export type AnimatedStyleProp<T> = T;

/**
 * Animated props for components
 */
export type AnimatedProps<T> = T & {
  animatedStyle?: AnimatedStyleProp<ViewStyle | TextStyle | ImageStyle>;
};

/**
 * Worklet callback type
 */
export type WorkletCallback<Args extends readonly unknown[] = readonly unknown[], Return = void> = (
  ...args: Args
) => Return;

