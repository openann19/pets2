import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

export function useHighlightPulse(triggerKey?: string) {
  const glow = useSharedValue(0);

  useEffect(() => {
    if (!triggerKey) return;
    glow.value = 0;
    glow.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(0, { duration: 380 }),
      withTiming(1, { duration: 220 }),
      withTiming(0, { duration: 380 }),
    );
  }, [triggerKey]);

  const style = useAnimatedStyle(() => ({
    // overlay glow: you can swap for borderColor, shadow, etc.
    shadowColor: '#ec4899',
    shadowOpacity: 0.35 * glow.value,
    shadowRadius: 14 * glow.value,
    elevation: glow.value > 0 ? 4 : 0,
    transform: [{ scale: 1 + glow.value * 0.015 }],
  }));

  return { highlightStyle: style };
}
