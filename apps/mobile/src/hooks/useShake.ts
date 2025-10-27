import { useCallback } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useReduceMotion } from './useReducedMotion';

export function useShake(amplitude = 8, duration = 280) {
  const reduced = useReduceMotion();
  const t = useSharedValue(0);

  const style = useAnimatedStyle(() => ({ transform: [{ translateX: t.value }] }));

  const trigger = useCallback(() => {
    'worklet';
    if (reduced) {
      // Minimal nudge for reduced motion preference
      t.value = withTiming(0, { duration: 80 });
      return;
    }
    t.value = withSequence(
      withTiming(-amplitude, { duration: duration * 0.2 }),
      withTiming(amplitude, { duration: duration * 0.4 }),
      withTiming(0, { duration: duration * 0.4 })
    );
  }, [amplitude, duration, reduced]);

  return { style, trigger };
}
