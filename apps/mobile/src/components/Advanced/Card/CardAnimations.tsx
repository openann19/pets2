/**
 * 🎨 CARD ANIMATIONS
 * Extracts animation logic from AdvancedCard
 */

import { useRef, useState, useCallback } from 'react';
import { Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '@pawfectmatch/core';

export type CardInteraction =
  | 'hover'
  | 'press'
  | 'longPress'
  | 'swipe'
  | 'tilt'
  | 'glow'
  | 'bounce'
  | 'elastic';

export type CardInteractionType = CardInteraction;

interface UseCardAnimationsProps {
  interactions?: CardInteraction[];
  haptic?: 'light' | 'medium' | 'heavy';
  disabled?: boolean;
  loading?: boolean;
}

export function useCardAnimations({
  interactions = ['hover', 'press'],
  haptic = 'light',
  disabled = false,
  loading = false,
}: UseCardAnimationsProps) {
  // Animation Values
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const elevation = useRef(new Animated.Value(4)).current;
  const tiltX = useRef(new Animated.Value(0)).current;
  const tiltY = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(0)).current;

  // State
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Haptic Feedback
  const triggerHaptic = useCallback(
    async (type: 'light' | 'medium' | 'heavy' = haptic) => {
      if (disabled) return;

      try {
        await Haptics.impactAsync(
          type === 'light'
            ? Haptics.ImpactFeedbackStyle.Light
            : type === 'medium'
              ? Haptics.ImpactFeedbackStyle.Medium
              : Haptics.ImpactFeedbackStyle.Heavy,
        );
      } catch (error) {
        logger.debug('Haptic feedback not available');
      }
    },
    [disabled, haptic],
  );

  // Press Animation
  const animatePress = useCallback(
    (pressed: boolean) => {
      if (disabled || loading || isLoading) return;

      setIsPressed(pressed);

      const animations: Animated.CompositeAnimation[] = [];

      if (interactions.includes('press')) {
        animations.push(
          Animated.spring(scale, {
            toValue: pressed ? 0.98 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
        );
      }

      if (interactions.includes('glow')) {
        animations.push(
          Animated.timing(glow, {
            toValue: pressed ? 1 : 0,
            duration: 200,
            useNativeDriver: false,
          }),
        );
      }

      if (interactions.includes('bounce')) {
        animations.push(
          Animated.spring(elevation, {
            toValue: pressed ? 12 : 4,
            tension: 400,
            friction: 3,
            useNativeDriver: false,
          }),
        );
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start();
      }

      if (pressed) {
        triggerHaptic('light');
      }
    },
    [disabled, loading, isLoading, interactions, scale, glow, elevation, triggerHaptic],
  );

  // Hover Animation
  const animateHover = useCallback(
    (hovered: boolean) => {
      if (disabled || loading || isLoading) return;

      setIsHovered(hovered);

      const animations: Animated.CompositeAnimation[] = [];

      if (interactions.includes('hover')) {
        animations.push(
          Animated.spring(scale, {
            toValue: hovered ? 1.02 : 1,
            tension: 300,
            friction: 10,
            useNativeDriver: true,
          }),
        );
      }

      if (interactions.includes('glow')) {
        animations.push(
          Animated.timing(glow, {
            toValue: hovered ? 0.5 : 0,
            duration: 300,
            useNativeDriver: false,
          }),
        );
      }

      if (animations.length > 0) {
        Animated.parallel(animations).start();
      }
    },
    [disabled, loading, isLoading, interactions, scale, glow],
  );

  return {
    // Animation refs
    scale,
    opacity,
    rotation,
    glow,
    elevation,
    tiltX,
    tiltY,
    shimmer,
    // State
    isPressed,
    isHovered,
    isLoading,
    setIsLoading,
    // Methods
    triggerHaptic,
    animatePress,
    animateHover,
  };
}
