import { useEffect } from "react";
import {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import { prefersReducedMotion } from "./configs/accessibility";

/**
 * Hook for glow animations
 */

interface UseGlowAnimationReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

export function useGlowAnimation(
  color: string = "#ec4899",
  intensity: number = 1,
  duration: number = 2000,
): UseGlowAnimationReturn {
  const glowIntensity = useSharedValue(0);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const animate = () => {
      glowIntensity.value = withSequence(
        withTiming(intensity, { duration: duration / 2 }),
        withTiming(0, { duration: duration / 2 }),
      );
    };

    const interval = setInterval(animate, duration);
    animate(); // Start immediately

    return () => {
      clearInterval(interval);
    };
  }, [glowIntensity, intensity, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: interpolate(
      glowIntensity.value,
      [0, 1],
      [0.1, 0.8],
      Extrapolate.CLAMP,
    ),
    shadowRadius: interpolate(
      glowIntensity.value,
      [0, 1],
      [4, 16],
      Extrapolate.CLAMP,
    ),
    elevation: interpolate(
      glowIntensity.value,
      [0, 1],
      [2, 12],
      Extrapolate.CLAMP,
    ),
  }));

  return {
    animatedStyle,
  };
}

export default useGlowAnimation;
