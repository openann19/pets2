/**
 * usePulseEffect Hook
 * Pulse animation effect
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const usePulseEffect = (enabled = true) => {
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return {
    pulseStyle,
  };
};

export default usePulseEffect;

