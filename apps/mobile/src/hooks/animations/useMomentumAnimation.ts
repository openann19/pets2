/**
 * 🎯 MOMENTUM ANIMATION HOOK
 * 
 * Creates natural deceleration animations from gesture velocity
 * Uses physics-based decay or spring-based momentum
 * 
 * Phase 2: Advanced Gestures - Part of animation enhancement plan
 */

import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withDecay, withSpring } from 'react-native-reanimated';
import { springs, fromVelocity, type SpringConfig } from '@/foundation/motion';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import type { SharedValue } from 'react-native-reanimated';
import type { AnimatedStyle } from 'react-native-reanimated';

export interface MomentumAnimationConfig {
  /** Initial velocity (px/s) */
  initialVelocity: number;
  /** Friction coefficient (0-1), higher = more friction */
  friction?: number;
  /** Clamp values (min, max) */
  clamp?: [number, number];
  /** Use spring instead of decay */
  useSpring?: boolean;
  /** Spring config (if useSpring) */
  springConfig?: SpringConfig;
}

/**
 * Momentum animation hook
 * Creates natural deceleration animation from velocity
 * 
 * @example
 * ```tsx
 * const gesture = Gesture.Pan()
 *   .onEnd((e) => {
 *     const { animatedStyle } = useMomentumAnimation({
 *       initialVelocity: e.velocityX,
 *       friction: 0.95,
 *       clamp: [0, SCREEN_WIDTH],
 *     });
 *   });
 * ```
 */
export function useMomentumAnimation(
  config: MomentumAnimationConfig
): { animatedStyle: AnimatedStyle; position: SharedValue<number> } {
  const {
    initialVelocity,
    friction = 0.95,
    clamp,
    useSpring = false,
    springConfig = springs.standard,
  } = config;
  
  const reduceMotion = useReduceMotion();
  const position = useSharedValue(0);
  
  useEffect(() => {
    if (reduceMotion) {
      position.value = 0;
      return;
    }
    
    if (useSpring) {
      // Spring-based momentum (more natural)
      position.value = withSpring(
        initialVelocity * 0.1, // Convert velocity to displacement
        {
          ...springConfig,
          velocity: initialVelocity,
        }
      );
    } else {
      // Decay-based momentum (physics-accurate)
      const decayConfig: Parameters<typeof withDecay>[0] = {
        velocity: initialVelocity,
        deceleration: friction,
      };
      
      if (clamp) {
        decayConfig.clamp = clamp;
      }
      
      position.value = withDecay(decayConfig);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialVelocity, useSpring, springConfig, friction, clamp, reduceMotion]);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: reduceMotion ? 0 : position.value }],
  }));
  
  return { animatedStyle, position };
}

/**
 * Convert gesture velocity to spring config
 * Higher velocity = snappier spring
 */
export function velocityToSpring(velocity: number): SpringConfig {
  return fromVelocity(velocity);
}

