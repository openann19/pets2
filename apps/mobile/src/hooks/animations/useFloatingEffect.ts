/**
 * useFloatingEffect Hook
 * Floating animation effect
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const useFloatingEffect = (enabled = true) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    if (enabled) {
      translateY.value = withRepeat(
        withSequence(
          withTiming(-10, { duration: 2000 }),
          withTiming(0, { duration: 2000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const floatingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return {
    floatingStyle,
  };
};

export default useFloatingEffect;

