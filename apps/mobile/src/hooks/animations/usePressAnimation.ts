import { useCallback } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

import { SPRING_CONFIGS } from './configs/springConfigs';
import { prefersReducedMotion } from './configs/accessibility';

/**
 * Hook for press animations
 */

interface UsePressAnimationReturn {
  handlePressIn: () => void;
  handlePressOut: () => void;
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
}

export function usePressAnimation(
  config: keyof typeof SPRING_CONFIGS = 'snappy',
): UsePressAnimationReturn {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = useCallback(() => {
    if (prefersReducedMotion()) return;

    scale.value = withSpring(0.96, SPRING_CONFIGS[config]);
    opacity.value = withSpring(0.8, SPRING_CONFIGS[config]);
  }, [scale, opacity, config]);

  const handlePressOut = useCallback(() => {
    if (prefersReducedMotion()) return;

    scale.value = withSpring(1, SPRING_CONFIGS[config]);
    opacity.value = withSpring(1, SPRING_CONFIGS[config]);
  }, [scale, opacity, config]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return {
    handlePressIn,
    handlePressOut,
    animatedStyle,
  };
}

export default usePressAnimation;
