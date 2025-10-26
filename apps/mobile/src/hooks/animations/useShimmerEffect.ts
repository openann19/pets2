/**
 * useShimmerEffect Hook
 * Shimmer animation effect
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from "react-native-reanimated";

export const useShimmerEffect = (enabled = true) => {
  const shimmerOffset = useSharedValue(-100);

  useEffect(() => {
    if (enabled) {
      shimmerOffset.value = withRepeat(
        withSequence(
          withTiming(100, { duration: 2000 }),
          withDelay(1000, withTiming(-100, { duration: 0 })),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerOffset.value }],
  }));

  return {
    shimmerStyle,
    animatedStyle: shimmerStyle,
  };
};

export default useShimmerEffect;

