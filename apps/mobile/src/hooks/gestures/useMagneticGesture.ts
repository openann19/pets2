/**
 * 🎯 MAGNETIC GESTURE HOOK
 * 
 * Advanced gesture handler with magnetic snap points
 * Provides smooth, natural-feeling interactions with velocity-based snapping
 * 
 * Phase 2: Advanced Gestures - Part of animation enhancement plan
 */

import { Gesture } from 'react-native-gesture-handler';
import { useSharedValue, useAnimatedStyle, withSpring, runOnJS } from 'react-native-reanimated';
import { haptic } from '@/foundation/haptics';
import { springs, fromVelocity, type SpringConfig } from '@/foundation/motion';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import type { SharedValue } from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

export interface MagneticGestureConfig {
  /** Snap points in pixels (e.g., [0, 200, 400] for bottom sheet) */
  snapPoints: number[];
  /** Distance threshold for snapping (px) */
  snapThreshold?: number;
  /** Minimum velocity to trigger snap (px/s) */
  velocityThreshold?: number;
  /** Enable haptic feedback on snap */
  hapticOnSnap?: boolean;
  /** Spring config for snap animation */
  springConfig?: SpringConfig;
  /** Resistance factor at boundaries (0-1) */
  resistance?: number;
  /** Axis for gesture */
  axis?: 'x' | 'y';
}

export interface MagneticGestureResult {
  /** Current position (animated) */
  position: SharedValue<number>;
  /** Current velocity */
  velocity: SharedValue<number>;
  /** Active snap point index */
  activeSnapIndex: SharedValue<number>;
  /** Gesture handlers */
  gesture: Gesture;
  /** Animated style */
  animatedStyle: AnimatedStyle;
}

/**
 * Magnetic gesture hook with snap points
 * 
 * @example
 * ```tsx
 * const { gesture, animatedStyle } = useMagneticGesture({
 *   snapPoints: [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT],
 *   snapThreshold: 50,
 *   velocityThreshold: 500,
 *   hapticOnSnap: true,
 *   axis: 'y',
 * });
 * 
 * <GestureDetector gesture={gesture}>
 *   <Animated.View style={animatedStyle}>
 *     {children}
 *   </Animated.View>
 * </GestureDetector>
 * ```
 */
export function useMagneticGesture(
  config: MagneticGestureConfig
): MagneticGestureResult {
  const {
    snapPoints,
    snapThreshold = 50,
    velocityThreshold = 500,
    hapticOnSnap = true,
    springConfig = springs.standard,
    resistance = 0.3,
    axis = 'x',
  } = config;
  
  const reduceMotion = useReduceMotion();
  const position = useSharedValue(snapPoints[0] || 0);
  const velocity = useSharedValue(0);
  const activeSnapIndex = useSharedValue(0);
  
  const findNearestSnapPoint = (value: number): number => {
    'worklet';
    let nearest = snapPoints[0];
    let minDistance = Math.abs(value - nearest);
    
    for (let i = 1; i < snapPoints.length; i++) {
      const distance = Math.abs(value - snapPoints[i]);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = snapPoints[i];
      }
    }
    
    return nearest;
  };
  
  const triggerHaptic = () => {
    if (hapticOnSnap) {
      haptic.light();
    }
  };
  
  const gesture = Gesture.Pan()
    .onUpdate((e) => {
      if (reduceMotion) return;
      
      const translation = axis === 'x' ? e.translationX : e.translationY;
      const startValue = snapPoints[activeSnapIndex.value] || 0;
      const newValue = startValue + translation;
      
      // Apply resistance at boundaries
      const minPoint = Math.min(...snapPoints);
      const maxPoint = Math.max(...snapPoints);
      
      let finalValue = newValue;
      if (newValue < minPoint) {
        const overflow = minPoint - newValue;
        finalValue = minPoint - overflow * resistance;
      } else if (newValue > maxPoint) {
        const overflow = newValue - maxPoint;
        finalValue = maxPoint + overflow * resistance;
      }
      
      position.value = finalValue;
      velocity.value = axis === 'x' ? e.velocityX : e.velocityY;
    })
    .onEnd((e) => {
      if (reduceMotion) {
        position.value = snapPoints[0];
        return;
      }
      
      const currentVel = axis === 'x' ? e.velocityX : e.velocityY;
      const absVelocity = Math.abs(currentVel);
      
      // Determine target snap point
      let targetSnapPoint: number;
      let targetIndex: number;
      
      if (absVelocity > velocityThreshold) {
        // Velocity-based snap
        const direction = currentVel > 0 ? 1 : -1;
        const currentIndex = activeSnapIndex.value;
        const nextIndex = Math.max(
          0,
          Math.min(snapPoints.length - 1, currentIndex + direction)
        );
        targetSnapPoint = snapPoints[nextIndex];
        targetIndex = nextIndex;
      } else {
        // Distance-based snap
        const currentValue = position.value;
        const nearest = findNearestSnapPoint(currentValue);
        const distanceToNearest = Math.abs(currentValue - nearest);
        
        if (distanceToNearest < snapThreshold) {
          targetSnapPoint = nearest;
          targetIndex = snapPoints.indexOf(nearest);
        } else {
          // Snap to nearest
          targetSnapPoint = nearest;
          targetIndex = snapPoints.indexOf(nearest);
        }
      }
      
      // Animate to target
      activeSnapIndex.value = targetIndex;
      const finalSpringConfig = absVelocity > velocityThreshold 
        ? fromVelocity(currentVel)
        : springConfig;
        
      position.value = withSpring(
        targetSnapPoint,
        {
          ...finalSpringConfig,
          velocity: currentVel,
        },
        () => {
          if (targetIndex !== activeSnapIndex.value) {
            runOnJS(triggerHaptic)();
          }
        }
      );
    });
  
  const animatedStyle = useAnimatedStyle(() => {
    const transform = axis === 'x' 
      ? [{ translateX: position.value }]
      : [{ translateY: position.value }];
      
    return {
      transform: reduceMotion ? [] : transform,
    };
  });
  
  return {
    position,
    velocity,
    activeSnapIndex,
    gesture,
    animatedStyle,
  };
}

