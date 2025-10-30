/**
 * ✨ PREMIUM SHIMMER & GLEAM
 * Tokenized shimmer sweep (opacity 0 → 0.18 → 0) across gradient badges
 * Once per view; disabled by reduced motion
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { View } from 'react-native';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseShimmerReturn {
  shimmerStyle: ReturnType<typeof useAnimatedStyle>;
  trigger: () => void;
}

/**
 * Hook for premium shimmer effect
 * Sweeps across element once per trigger
 */
export function useShimmer(): UseShimmerReturn {
  const guards = useMotionGuards();
  const shimmerOpacity = useSharedValue(0);
  const shimmerTranslateX = useSharedValue(-100);

  const shimmerStyle = useAnimatedStyle(() => {
    if (!guards.shouldAnimate) {
      return { opacity: 0 };
    }

    return {
      opacity: shimmerOpacity.value,
      transform: [{ translateX: shimmerTranslateX.value }],
    };
  });

  const trigger = React.useCallback(() => {
    if (!guards.shouldAnimate || guards.shouldSkipHeavy) {
      return; // Skip on reduced motion or low-end
    }

    // Reset position
    shimmerTranslateX.value = -100;
    shimmerOpacity.value = 0;

    // Sweep animation: translate from -100% to 100%, opacity 0 → 0.18 → 0
    shimmerTranslateX.value = withSequence(
      withTiming(100, {
        duration: motion.duration.xslow,
        easing: getEasingArray('standard'),
      }),
    );

    shimmerOpacity.value = withSequence(
      withTiming(motion.opacity.shimmer, {
        duration: motion.duration.xslow * 0.3,
        easing: getEasingArray('decel'),
      }),
      withTiming(motion.opacity.shimmer, {
        duration: motion.duration.xslow * 0.4,
      }),
      withTiming(0, {
        duration: motion.duration.xslow * 0.3,
        easing: getEasingArray('accel'),
      }),
    );
  }, [guards.shouldAnimate, guards.shouldSkipHeavy]);

  return {
    shimmerStyle,
    trigger,
  };
}

/**
 * Premium Shimmer Component
 * Wraps gradient badges with shimmer sweep
 */
interface PremiumShimmerProps {
  children: React.ReactNode;
  gradient: [string, string];
  style?: ViewStyle;
  onViewDidAppear?: () => void;
}

export function PremiumShimmer({
  children,
  gradient,
  style,
  onViewDidAppear,
}: PremiumShimmerProps): React.JSX.Element {
  const { shimmerStyle, trigger } = useShimmer();

  React.useEffect(() => {
    // Trigger shimmer once when view appears
    const timer = setTimeout(() => {
      trigger();
      onViewDidAppear?.();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[{ overflow: 'hidden' }, style]}>
      {children}
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '50%',
            backgroundColor: 'white',
            opacity: 0.3,
          },
          shimmerStyle,
        ]}
      />
    </View>
  );
}
