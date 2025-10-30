/**
 * useSwipeAnimations Hook
 *
 * Extracts animation logic from SwipeScreen for improved modularity and testability.
 * Manages position, rotation, and swipe animations with spring physics.
 *
 * @example
 * ```typescript
 * const {
 *   position,
 *   rotate,
 *   swipeRight,
 *   swipeLeft,
 *   snapBack,
 * } = useSwipeAnimations();
 *
 * // Apply animations to card
 * <Animated.View style={{ transform: [{ translateX: position.x }] }} />
 *
 * // Trigger swipe right
 * await swipeRight(async () => {
 *   await handleSwipe("like");
 * });
 * ```
 */

import { useState, useCallback } from 'react';
import { Animated, Easing } from 'react-native';
import { Dimensions } from 'react-native';
import { useReducedMotion } from './useReducedMotion';

const { width: screenWidth } = Dimensions.get('window');

export interface UseSwipeAnimationsParams {
  /**
   * Animation duration for swipe actions (default: 300ms)
   */
  duration?: number;

  /**
   * Rotation range in degrees (default: ["-10deg", "0deg", "10deg"])
   */
  rotationRange?: [string, string, string];

  /**
   * Use native driver for animations (default: false for position animations)
   */
  useNativeDriver?: boolean;

  /**
   * Callback when animation completes
   */
  onAnimationComplete?: () => void;
}

export interface UseSwipeAnimationsReturn {
  /**
   * Position animation value (XY)
   */
  position: Animated.ValueXY;

  /**
   * Rotation interpolation based on X position
   */
  rotate: Animated.AnimatedInterpolation<string>;

  /**
   * Execute swipe right animation
   * @param onComplete - Optional callback when animation completes
   */
  swipeRight: (onComplete?: () => Promise<void> | void) => Promise<void>;

  /**
   * Execute swipe left animation
   * @param onComplete - Optional callback when animation completes
   */
  swipeLeft: (onComplete?: () => Promise<void> | void) => Promise<void>;

  /**
   * Snap back to center with spring animation
   * @param onComplete - Optional callback when animation completes
   */
  snapBack: (onComplete?: () => void) => void;

  /**
   * Reset position to zero
   */
  resetPosition: () => void;

  /**
   * Apply offset to position (for gesture tracking)
   * @param dx - X offset
   * @param dy - Y offset
   */
  setOffset: (dx: number, dy: number) => void;
}

/**
 * Creates animated values and helper functions for swipe card animations.
 *
 * @param params - Configuration for animations
 * @returns Animated values and animation functions
 */
export const useSwipeAnimations = (params?: UseSwipeAnimationsParams): UseSwipeAnimationsReturn => {
  const {
    duration = 300,
    rotationRange = ['-10deg', '0deg', '10deg'],
    useNativeDriver = false,
    onAnimationComplete,
  } = params ?? {};

  const reducedMotion = useReducedMotion();

  // Initialize position animation
  const [position] = useState(() => new Animated.ValueXY());

  // Calculate rotation based on X position
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: rotationRange,
    extrapolate: 'clamp',
  });

  /**
   * Execute swipe right animation
   */
  const swipeRight = useCallback(
    async (onComplete?: () => Promise<void> | void): Promise<void> => {
      const direction = screenWidth;
      const animDuration = reducedMotion ? 0 : duration;

      return new Promise((resolve) => {
        Animated.timing(position, {
          toValue: { x: direction, y: 0 },
          duration: animDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }).start(async () => {
          await onComplete?.();
          onAnimationComplete?.();
          resolve();
        });
      });
    },
    [position, duration, useNativeDriver, onAnimationComplete, reducedMotion],
  );

  /**
   * Execute swipe left animation
   */
  const swipeLeft = useCallback(
    async (onComplete?: () => Promise<void> | void): Promise<void> => {
      const direction = -screenWidth;
      const animDuration = reducedMotion ? 0 : duration;

      return new Promise((resolve) => {
        Animated.timing(position, {
          toValue: { x: direction, y: 0 },
          duration: animDuration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }).start(async () => {
          await onComplete?.();
          onAnimationComplete?.();
          resolve();
        });
      });
    },
    [position, duration, useNativeDriver, onAnimationComplete, reducedMotion],
  );

  /**
   * Snap back to center with spring animation
   */
  const snapBack = useCallback(
    (onComplete?: () => void): void => {
      if (reducedMotion) {
        Animated.timing(position, {
          toValue: { x: 0, y: 0 },
          duration: 0,
          useNativeDriver,
        }).start(() => {
          onComplete?.();
          onAnimationComplete?.();
        });
      } else {
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          friction: 8,
          tension: 40,
          useNativeDriver,
        }).start(() => {
          onComplete?.();
          onAnimationComplete?.();
        });
      }
    },
    [position, useNativeDriver, onAnimationComplete, reducedMotion],
  );

  /**
   * Reset position to zero
   */
  const resetPosition = useCallback((): void => {
    position.setValue({ x: 0, y: 0 });
  }, [position]);

  /**
   * Apply offset to position for gesture tracking
   */
  const setOffset = useCallback(
    (dx: number, dy: number): void => {
      position.setOffset({ x: dx, y: dy });
    },
    [position],
  );

  return {
    position,
    rotate,
    swipeRight,
    swipeLeft,
    snapBack,
    resetPosition,
    setOffset,
  };
};
