import { useCallback } from "react";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

export function useShake(amplitude: number = 8, duration: number = 280) {
  const t = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: t.value }],
  }));

  const trigger = useCallback(() => {
    "worklet";
    // simple left-right jiggle
    t.value = withSequence(
      withTiming(-amplitude, { duration: duration * 0.2 }),
      withTiming(amplitude, { duration: duration * 0.4 }),
      withTiming(0, { duration: duration * 0.4 }),
    );
  }, [amplitude, duration, t]);

  return { style, trigger };
}

