import { useCallback } from "react";
import type { PanGestureHandlerGestureEvent } from "react-native-gesture-handler";
import {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  interpolate,
  Extrapolate,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Dimensions } from "react-native";

import { SPRING_CONFIGS } from "./configs/springConfigs";
import { TIMING_CONFIGS } from "./configs/timingConfigs";
import { prefersReducedMotion } from "./configs/accessibility";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Hook for swipe gesture animations
 */

interface UseSwipeGestureReturn {
  gestureHandler: ReturnType<typeof useAnimatedGestureHandler>;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  translateX: ReturnType<typeof useSharedValue<number>>;
  translateY: ReturnType<typeof useSharedValue<number>>;
}

export function useSwipeGesture(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  threshold: number = 120,
): UseSwipeGestureReturn {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      // Optional: Add haptic feedback on start
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: (event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      const absX = Math.abs(translationX);
      const absY = Math.abs(translationY);

      // Determine swipe direction
      if (absX > threshold && absX > absY) {
        // Horizontal swipe
        if (translationX > 0) {
          // Swipe right
          translateX.value = withTiming(SCREEN_WIDTH + 100, {
            duration: TIMING_CONFIGS.standard,
          });
          opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
          if (onSwipeRight) runOnJS(onSwipeRight)();
        } else {
          // Swipe left
          translateX.value = withTiming(-SCREEN_WIDTH - 100, {
            duration: TIMING_CONFIGS.standard,
          });
          opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
          if (onSwipeLeft) runOnJS(onSwipeLeft)();
        }
      } else if (absY > threshold && translationY < 0) {
        // Swipe up
        translateY.value = withTiming(-SCREEN_HEIGHT - 100, {
          duration: TIMING_CONFIGS.standard,
        });
        opacity.value = withTiming(0, { duration: TIMING_CONFIGS.standard });
        if (onSwipeUp) runOnJS(onSwipeUp)();
      } else {
        // Return to center
        translateX.value = withSpring(0, SPRING_CONFIGS.standard);
        translateY.value = withSpring(0, SPRING_CONFIGS.standard);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolate.CLAMP,
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation}deg` },
      ] as const,
      opacity: opacity.value,
    };
  });

  return {
    gestureHandler,
    animatedStyle,
    translateX,
    translateY,
  };
}

export default useSwipeGesture;
