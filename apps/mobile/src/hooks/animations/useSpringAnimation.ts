import { useCallback } from 'react';
import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { springs, type SpringConfig } from '@/foundation/motion';
import { TIMING_CONFIGS } from './configs/timingConfigs';
import { prefersReducedMotion } from './configs/accessibility';

/**
 * Hook for spring animations
 */

interface UseSpringAnimationReturn {
  value: ReturnType<typeof useSharedValue<number>>;
  animate: (toValue: number, customConfig?: Partial<SpringConfig>) => void;
  reset: () => void;
}

export function useSpringAnimation(
  initialValue: number = 0,
  config: keyof typeof springs = 'standard',
): UseSpringAnimationReturn {
  const animatedValue = useSharedValue(initialValue);

  const animate = useCallback(
    (toValue: number, customConfig?: Partial<SpringConfig>) => {
      const springConfig = {
        ...springs[config],
        ...customConfig,
      };

      // Respect reduced motion preference
      if (prefersReducedMotion()) {
        animatedValue.value = withTiming(toValue, {
          duration: TIMING_CONFIGS.standard,
        });
      } else {
        animatedValue.value = withSpring(toValue, springConfig);
      }
    },
    [animatedValue, config],
  );

  const reset = useCallback(() => {
    animatedValue.value = withSpring(initialValue, springs[config]);
  }, [animatedValue, initialValue, config]);

  return {
    value: animatedValue,
    animate,
    reset,
  };
}

export default useSpringAnimation;
