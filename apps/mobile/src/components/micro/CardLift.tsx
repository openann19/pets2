/**
 * 📱 CARD LIFT ON SCROLL HOVER
 * Slight elevate + parallax of background image (≤ 4px) tied to scroll offset
 * Zero jank; disabled on low-end
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedReaction,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

import { motion } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseCardLiftReturn {
  cardStyle: ReturnType<typeof useAnimatedStyle>;
  imageStyle: ReturnType<typeof useAnimatedStyle>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
}

/**
 * Hook for card lift effect on scroll
 * Elevates card and parallaxes background image
 */
export function useCardLift(scrollOffset: number = 0): UseCardLiftReturn {
  const guards = useMotionGuards();
  const translateY = useSharedValue(0);
  const imageTranslateY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;
      
      // Calculate lift based on scroll position relative to card
      const relativeOffset = offset - scrollOffset;
      
      // Lift card by up to 4px as it scrolls into view
      if (guards.shouldAnimate && !guards.lowEnd) {
        translateY.value = interpolate(
          relativeOffset,
          [-100, 0, 100],
          [-2, 0, 2],
          Extrapolate.CLAMP
        );
        
        // Parallax image in opposite direction (≤ 4px)
        imageTranslateY.value = interpolate(
          relativeOffset,
          [-100, 0, 100],
          [2, 0, -2],
          Extrapolate.CLAMP
        );
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => {
    if (!guards.shouldAnimate || guards.lowEnd) {
      return {};
    }

    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const imageStyle = useAnimatedStyle(() => {
    if (!guards.shouldAnimate || guards.lowEnd) {
      return {};
    }

    return {
      transform: [{ translateY: imageTranslateY.value }],
    };
  });

  return {
    cardStyle,
    imageStyle,
    scrollHandler,
  };
}

/**
 * Card Lift Component
 * Wraps card with lift and parallax effects
 */
interface CardLiftProps {
  children: React.ReactNode;
  scrollOffset?: number;
  style?: ViewStyle;
}

export function CardLift({
  children,
  scrollOffset,
  style,
}: CardLiftProps): React.JSX.Element {
  const { cardStyle } = useCardLift(scrollOffset);

  return (
    <Animated.View style={[cardStyle, style]}>
      {children}
    </Animated.View>
  );
}

