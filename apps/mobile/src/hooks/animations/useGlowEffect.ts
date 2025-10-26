/**
 * useGlowEffect Hook
 * Glow animation effect
 */

import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

export const useGlowEffect = (enabled = true) => {
  const glowIntensity = useSharedValue(1);

  useEffect(() => {
    if (enabled) {
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        false,
      );
    }
  }, [enabled]);

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowIntensity.value * 0.4,
    shadowRadius: glowIntensity.value * 20,
  }));

  return {
    glowStyle,
  };
};

export default useGlowEffect;
