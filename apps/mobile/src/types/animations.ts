/**
 * Animation Type Definitions
 * Provides type safety for React Native Reanimated values and animations
 */

import type { SharedValue } from 'react-native-reanimated';

/**
 * Standard animation values for common use cases
 */
export interface AnimationValues {
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
}

/**
 * Welcome screen specific animation values
 */
export interface WelcomeAnimationValues {
  logoScale: SharedValue<number>;
  logoOpacity: SharedValue<number>;
  titleOpacity: SharedValue<number>;
  titleTranslateY: SharedValue<number>;
  subtitleOpacity: SharedValue<number>;
  subtitleTranslateY: SharedValue<number>;
  featuresOpacity: SharedValue<number>;
  featuresTranslateY: SharedValue<number>;
  buttonOpacity: SharedValue<number>;
  buttonScale: SharedValue<number>;
  confettiScale: SharedValue<number>;
}

/**
 * Memory weave screen animation values
 */
export interface MemoryWeaveAnimationValues {
  scrollX: SharedValue<number>;
  fadeAnim: SharedValue<number>;
  scaleAnim: SharedValue<number>;
}

/**
 * Common animation configuration types
 */
export interface SpringConfig {
  damping?: number;
  stiffness?: number;
  mass?: number;
  velocity?: number;
}

export interface TimingConfig {
  duration?: number;
  easing?: (value: number) => number;
}

/**
 * Animation state types
 */
export type AnimationState = 'idle' | 'running' | 'finished' | 'cancelled';

/**
 * Animation callback types
 */
export type AnimationCallback = (finished?: boolean) => void;

/**
 * Gesture animation types
 */
export interface GestureAnimationValues {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  rotation: SharedValue<number>;
}

/**
 * Card animation values for swipe gestures
 */
export interface CardAnimationValues extends GestureAnimationValues {
  opacity: SharedValue<number>;
  zIndex: SharedValue<number>;
}

/**
 * List animation values for FlatList items
 */
export interface ListItemAnimationValues {
  opacity: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
}

/**
 * Modal animation values
 */
export interface ModalAnimationValues {
  backdropOpacity: SharedValue<number>;
  contentScale: SharedValue<number>;
  contentTranslateY: SharedValue<number>;
}

/**
 * Tab animation values
 */
export interface TabAnimationValues {
  indicatorPosition: SharedValue<number>;
  indicatorWidth: SharedValue<number>;
}

/**
 * Button animation values
 */
export interface ButtonAnimationValues {
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
  backgroundColor: SharedValue<string>;
}

/**
 * Loading animation values
 */
export interface LoadingAnimationValues {
  rotation: SharedValue<number>;
  scale: SharedValue<number>;
  opacity: SharedValue<number>;
}
