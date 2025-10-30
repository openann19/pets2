/**
 * Type declarations for Expo components to resolve React Navigation v7 JSX conflicts
 */

import React from 'react';
import { ImageProps, ScrollViewProps, TextProps, ViewProps } from 'react-native';

// Ionicons type declaration
declare module '@expo/vector-icons' {
  import type { ViewProps } from 'react-native';

  export interface IconProps extends ViewProps {
    name: string;
    size?: number;
    color?: string;
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  }

  export const Ionicons: React.ComponentType<IconProps>;
}

// LinearGradient type declaration
declare module 'expo-linear-gradient' {
  export interface LinearGradientProps {
    colors: string[];
    start?: { x: number; y: number };
    end?: { x: number; y: number };
    locations?: number[];
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    children?: React.ReactNode;
  }

  export const LinearGradient: React.ComponentType<LinearGradientProps>;
}

// BlurView type declaration
declare module 'expo-blur' {
  export interface BlurViewProps {
    intensity?: number;
    tint?: 'light' | 'dark' | 'default';
    style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
    children?: React.ReactNode;
  }

  export const BlurView: React.ComponentType<BlurViewProps>;
}

// SafeAreaView type declaration
declare module 'react-native-safe-area-context' {
  export interface SafeAreaViewProps extends ViewProps {
    children?: React.ReactNode;
  }

  export const SafeAreaView: React.ComponentType<SafeAreaViewProps>;
  export const SafeAreaProvider: React.ComponentType<{
    children?: React.ReactNode;
  }>;
}

// Animated components type declarations
declare module 'react-native' {
  export interface AnimatedViewProps extends ViewProps {
    children?: React.ReactNode;
  }

  export interface AnimatedValue {
    setValue(value: number): void;
    setOffset(offset: number): void;
    flattenOffset(): void;
    extractOffset(): void;
    addListener(callback: (state: { value: number }) => void): string;
    removeListener(id: string): void;
    removeAllListeners(): void;
    interpolate(config: {
      inputRange: number[];
      outputRange: number[] | string[];
      extrapolate?: 'extend' | 'clamp' | 'identity';
    }): AnimatedValue;
  }

  export interface AnimatedValueXY {
    x: AnimatedValue;
    y: AnimatedValue;
    setValue(value: { x: number; y: number }): void;
    setOffset(offset: { x: number; y: number }): void;
    flattenOffset(): void;
    extractOffset(): void;
    getLayout(): { left: AnimatedValue; top: AnimatedValue };
    getTranslateTransform(): Array<{
      translateX: AnimatedValue;
      translateY: AnimatedValue;
    }>;
  }

  export interface AnimationConfig {
    toValue: number | AnimatedValue;
    duration?: number;
    easing?: (value: number) => number;
    delay?: number;
    useNativeDriver?: boolean;
    isInteraction?: boolean;
  }

  export interface SpringAnimationConfig {
    toValue: number | AnimatedValue;
    friction?: number;
    tension?: number;
    speed?: number;
    bounciness?: number;
    useNativeDriver?: boolean;
    isInteraction?: boolean;
  }

  export interface CompositeAnimation {
    start(callback?: (result: { finished: boolean }) => void): void;
    stop(): void;
    reset(): void;
  }

  export const Animated: {
    View: React.ComponentType<AnimatedViewProps>;
    Text: React.ComponentType<TextProps>;
    Image: React.ComponentType<ImageProps>;
    ScrollView: React.ComponentType<ScrollViewProps>;
    timing: (value: AnimatedValue, config: AnimationConfig) => CompositeAnimation;
    spring: (value: AnimatedValue, config: SpringAnimationConfig) => CompositeAnimation;
    Value: new (value: number) => AnimatedValue;
    ValueXY: new (value?: { x: number; y: number }) => AnimatedValueXY;
    loop: (animation: CompositeAnimation) => CompositeAnimation;
    sequence: (animations: CompositeAnimation[]) => CompositeAnimation;
    interpolate: (
      value: AnimatedValue,
      config: {
        inputRange: number[];
        outputRange: number[] | string[];
        extrapolate?: 'extend' | 'clamp' | 'identity';
      },
    ) => AnimatedValue;
  };
}

// React Navigation type enhancements for v7 compatibility
declare module '@react-navigation/native' {
  export interface NavigationProp<
    ParamList extends Record<string, object | undefined> = Record<string, object | undefined>,
    RouteName extends keyof ParamList = string,
  > {
    navigate<RouteName extends keyof ParamList>(
      ...args: RouteName extends unknown
        ? [screen: RouteName] | [screen: RouteName, params: ParamList[RouteName]]
        : never
    ): void;
    goBack(): void;
    reset(state: { index: number; routes: Array<{ name: string; params?: object }> }): void;
    canGoBack(): boolean;
    dispatch(action: { type: string; payload?: unknown }): void;
    setParams(params: Partial<ParamList[RouteName]>): void;
    addListener(
      event: string,
      callback: (data: { type: string; target?: string }) => void,
    ): () => void;
    isFocused(): boolean;
  }
}

// React Native Reanimated type declarations
declare module 'react-native-reanimated' {
  export interface AnimatedViewProps extends ViewProps {
    children?: React.ReactNode;
  }

  export interface AnimatedTextProps extends TextProps {
    children?: React.ReactNode;
  }

  export interface AnimatedImageProps extends ImageProps {
    // Additional animated image specific props can be added here
    animated?: boolean;
  }

  export interface AnimatedScrollViewProps extends ScrollViewProps {
    children?: React.ReactNode;
  }

  // SharedValue type
  export interface SharedValue<T> {
    value: T;
    _value?: T;
  }

  export const Animated: {
    View: React.ComponentType<AnimatedViewProps>;
    Text: React.ComponentType<AnimatedTextProps>;
    Image: React.ComponentType<AnimatedImageProps>;
    ScrollView: React.ComponentType<AnimatedScrollViewProps>;
  };

  export function useSharedValue<T>(value: T): SharedValue<T>;
  export function useAnimatedStyle<T>(updater: () => T): T;
  export function withTiming<T>(value: T, config?: unknown): T;
  export function withSpring<T>(value: T, config?: unknown): T;
  export function withSequence<T>(...values: T[]): T;
  export function withDelay<T>(delay: number, value: T): T;
  export function runOnJS(fn: (...args: unknown[]) => void): (...args: unknown[]) => void;
  export const Easing: {
    linear: (t: number) => number;
    ease: (t: number) => number;
    quad: (t: number) => number;
    cubic: (t: number) => number;
    poly: (n: number) => (t: number) => number;
    sin: (t: number) => number;
    circle: (t: number) => number;
    exp: (t: number) => number;
    elastic: (bounciness?: number) => (t: number) => number;
    back: (s?: number) => (t: number) => number;
    bounce: (t: number) => number;
    bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => number;
    in: (easing: (t: number) => number) => (t: number) => number;
    out: (easing: (t: number) => number) => (t: number) => number;
    inOut: (easing: (t: number) => number) => (t: number) => number;
  };
}

// Utility type for React Navigation screens
export type ScreenComponentType<P = Record<string, unknown>> = React.ComponentType<P> & {
  displayName?: string;
};
