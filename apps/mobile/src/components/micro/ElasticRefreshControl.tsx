/**
 * 🎈 ELASTIC REFRESH CONTROL
 * Custom RefreshControl wrapper with elastic pull-to-refresh animation
 * Uses theme tokens and respects reduced motion
 */

import React from 'react';
import { RefreshControl, type RefreshControlProps, Platform } from 'react-native';
import {
  useSharedValue,
  withTiming,
  Extrapolate,
  interpolate,
  useAnimatedReaction,
} from 'react-native-reanimated';
import { useAnimatedScrollHandler } from 'react-native-reanimated';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface ElasticRefreshControlProps extends RefreshControlProps {
  onRefresh: () => Promise<void> | void;
  refreshing: boolean;
}

/**
 * Elastic RefreshControl Component
 * Wraps native RefreshControl with elastic pull animation
 */
export function ElasticRefreshControl({
  onRefresh,
  refreshing,
  ...refreshControlProps
}: ElasticRefreshControlProps): React.JSX.Element {
  const guards = useMotionGuards();
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(refreshing);
  const scaleY = useSharedValue(1);

  React.useEffect(() => {
    isRefreshing.value = refreshing;
  }, [refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;

      // Only track negative scroll (pulling down)
      if (offset < 0 && !isRefreshing.value) {
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
      const targetScale = interpolate(current, [0, maxPull], [1, 1.15], Extrapolate.CLAMP);

      scaleY.value = withTiming(targetScale, {
        duration: motion.duration.fast,
        easing: getEasingArray('standard'),
      });
    },
  );

  // Handle refresh trigger
  React.useEffect(() => {
    if (scrollY.value > 80 && !isRefreshing.value && !refreshing) {
      // Snap back animation
      scaleY.value = withTiming(1, {
        duration: motion.duration.fast,
        easing: getEasingArray('emphasized'),
      });

      // Trigger refresh
      Promise.resolve(onRefresh()).catch(() => {
        // Error handled by parent
      });
    }
  }, [scrollY.value, refreshing]);

  // For React Native, we use the native RefreshControl
  // The animation is handled by the scroll handler
  return (
    <RefreshControl
      {...refreshControlProps}
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor={refreshControlProps.tintColor}
      colors={Platform.OS === 'android' ? [refreshControlProps.tintColor || '#EC4899'] : undefined}
    />
  );
}

/**
 * Hook to use elastic pull-to-refresh with scroll handler
 * Returns scroll handler and refresh control props
 */
export function useElasticPullToRefresh(
  onRefresh: () => Promise<void> | void,
  refreshing: boolean,
) {
  const guards = useMotionGuards();
  const scrollY = useSharedValue(0);
  const isRefreshing = useSharedValue(refreshing);

  React.useEffect(() => {
    isRefreshing.value = refreshing;
  }, [refreshing]);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      const offset = event.contentOffset.y;

      if (offset < 0 && !isRefreshing.value) {
        scrollY.value = Math.abs(offset);
      } else {
        scrollY.value = 0;
      }
    },
  });

  return {
    scrollHandler,
    refreshControl: (
      <ElasticRefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    ),
  };
}
