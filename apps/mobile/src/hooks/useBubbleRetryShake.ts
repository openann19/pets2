import { useCallback } from "react";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export function useBubbleRetryShake(amplitude: number = 10, totalMs: number = 260) {
  const x = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  const shake = useCallback(() => {
    "worklet";
    x.value = withSequence(
      withTiming(-amplitude, { duration: totalMs * 0.2 }),
      withTiming(amplitude, { duration: totalMs * 0.35 }),
      withTiming(-amplitude * 0.6, { duration: totalMs * 0.2 }),
      withTiming(0, { duration: totalMs * 0.25 }),
    );
  }, [amplitude, totalMs]);

  return { style, shake };
}

