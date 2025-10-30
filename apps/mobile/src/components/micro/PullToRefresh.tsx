/**
 * 🎈 ELASTIC PULL-TO-REFRESH
 * Stretchy indicator that scales up to 1.15, then snaps back
 * Progress arcs from theme tokens
 * Duration: 180–300ms; no UI thread hits
 */

import React from 'react';
import { View, type ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedReaction,
  Extrapolate,
  interpolate,
} from 'react-native-reanimated';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UsePullToRefreshReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  scrollHandler: ReturnType<typeof useAnimatedScrollHandler>;
  refreshing: boolean;
}

/**
 * Hook for elastic pull-to-refresh animation
 * Returns animated style and scroll handler
 */
export function usePullToRefresh(
  onRefresh: () => Promise<void>
): UsePullToRefreshReturn {
  const guards = useMotionGuards();
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(false);
  const scaleY = useSharedValue(1);
  const [refreshing, setRefreshing] = React.useState(false);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;
      
      // Only track negative scroll (pulling down)
      if (offset < 0) {
        scrollY.value = Math.abs(offset);
      } else {
        scrollY.value = 0;
      }
    },
  });

  // Animate scaleY based on scroll offset
  useAnimatedReaction(
    () => scrollY.value,
    (current) => {
      if (!guards.shouldAnimate || isRefreshing.value) {
        return;
      }

      // Scale up to 1.15 as user pulls
      const maxPull = 80; // pixels
      const targetScale = interpolate(
        current,
        [0, maxPull],
        [1, 1.15],
        Extrapolate.CLAMP
      );
      
      scaleY.value = withTiming(targetScale, {
        duration: motion.duration.fast,
        easing: getEasingArray('standard'),
      });
    }
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scaleY: scaleY.value }],
    };
  });

  // Trigger refresh
  React.useEffect(() => {
    if (scrollY.value > 80 && !isRefreshing.value && !refreshing) {
      isRefreshing.value = true;
      setRefreshing(true);
      
      // Snap back animation
      scaleY.value = withTiming(1, {
        duration: motion.duration.fast,
        easing: getEasingArray('emphasized'),
      });

      onRefresh().finally(() => {
        isRefreshing.value = false;
        setRefreshing(false);
        scrollY.value = 0;
      });
    }
  }, [scrollY.value]);

  return {
    animatedStyle,
    scrollHandler,
    refreshing,
  };
}

/**
 * Pull to Refresh Indicator Component
 */
interface PullToRefreshIndicatorProps {
  style?: ViewStyle;
  color?: string;
}

export function PullToRefreshIndicator({
  style,
  color,
}: PullToRefreshIndicatorProps): React.JSX.Element {
  const { animatedStyle } = usePullToRefresh(async () => {
    // Default implementation - should be overridden
  });

  return (
    <Animated.View
      style={[
        {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: color || '#EC4899',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

