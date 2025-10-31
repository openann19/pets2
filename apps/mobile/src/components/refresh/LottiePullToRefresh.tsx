/**
 * Lottie Pull-to-Refresh Component
 * Fixes U-02: Lottie pull-to-refresh with paw scratch animation
 * 
 * Features:
 * - Lottie animation during pull gesture
 * - Smooth progress-based animation
 * - Haptic feedback on threshold
 * - Theme-aware colors
 * - Accessibility support
 * - Reduced motion support
 */

import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  RefreshControl,
  StyleSheet,
  View,
  type RefreshControlProps,
  type ViewStyle,
  Platform,
} from 'react-native';
import LottieView from 'lottie-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@mobile/theme';
import { useReducedMotion } from '../../hooks/useReducedMotion';

interface LottiePullToRefreshProps extends Omit<RefreshControlProps, 'refreshing' | 'onRefresh'> {
  /** Whether refresh is in progress */
  refreshing: boolean;
  /** Callback when refresh is triggered */
  onRefresh: () => Promise<void> | void;
  /** Custom Lottie animation source (defaults to paw scratch if available) */
  animationSource?: any;
  /** Animation progress multiplier (0-1) - automatically tracked if not provided */
  progress?: number;
  /** Enable haptic feedback */
  enableHaptics?: boolean;
  /** Threshold for haptic feedback (in pixels pulled) */
  hapticThreshold?: number;
  /** Container style */
  containerStyle?: ViewStyle;
}

/**
 * Lottie Pull-to-Refresh Component
 * Provides a branded pull-to-refresh experience with Lottie animation
 * Falls back to standard RefreshControl if Lottie animation is not available
 */
export function LottiePullToRefresh({
  refreshing,
  onRefresh,
  animationSource,
  progress,
  enableHaptics = true,
  hapticThreshold = 50,
  containerStyle,
  ...refreshControlProps
}: LottiePullToRefreshProps): React.JSX.Element {
  const theme = useTheme();
  const reducedMotion = useReducedMotion();
  const animationRef = useRef<LottieView>(null);
  const [hasTriggeredHaptic, setHasTriggeredHaptic] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const progressAnimated = useRef(new Animated.Value(0)).current;

  // Use provided progress or track internally
  const currentProgress = progress ?? pullProgress;

  // Update animation progress
  useEffect(() => {
    Animated.timing(progressAnimated, {
      toValue: Math.min(currentProgress, 1),
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [currentProgress, progressAnimated]);

  // Handle haptic feedback when threshold is crossed
  useEffect(() => {
    if (enableHaptics && !hasTriggeredHaptic && currentProgress > 0.8) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      setHasTriggeredHaptic(true);
    } else if (currentProgress < 0.8) {
      setHasTriggeredHaptic(false);
    }
  }, [currentProgress, enableHaptics, hasTriggeredHaptic]);

  // Control animation playback
  useEffect(() => {
    if (!animationRef.current || reducedMotion) return;

    if (refreshing) {
      // Play animation when refreshing
      animationRef.current.play();
    } else {
      // Reset to beginning when not refreshing
      animationRef.current.reset();
    }
  }, [refreshing, reducedMotion]);

  // Animate progress during pull
  const animatedProgress = progressAnimated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Try to load default animation, fall back if not available
  let defaultAnimationSource: any = null;
  try {
    // Try to require the animation file
    defaultAnimationSource = animationSource || require('../../../assets/animations/paw-scratch.json');
  } catch (e) {
    // Animation file not found, will use standard RefreshControl
    defaultAnimationSource = null;
  }

  const hasLottieAnimation = defaultAnimationSource && !reducedMotion;

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Custom Lottie animation overlay - only visible during pull */}
      {hasLottieAnimation && !refreshing && currentProgress > 0 && (
        <View style={styles.animationOverlay} pointerEvents="none">
          <LottieView
            ref={animationRef}
            source={defaultAnimationSource}
            progress={animatedProgress}
            style={styles.animation}
            autoPlay={false}
            loop={false}
            speed={1.5}
            colorFilters={[
              {
                keypath: '**',
                color: theme.colors.primary,
              },
            ]}
          />
        </View>
      )}

      {/* Native RefreshControl with custom tint */}
      <RefreshControl
        {...refreshControlProps}
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={theme.colors.primary}
        colors={Platform.OS === 'android' ? [theme.colors.primary] : undefined}
        progressBackgroundColor={theme.colors.bg}
        // Hide default indicator during pull if Lottie is showing (iOS)
        // Keep visible when refreshing or on Android
        style={
          hasLottieAnimation && currentProgress > 0 && !refreshing && Platform.OS === 'ios'
            ? styles.hiddenIndicator
            : undefined
        }
      />
    </View>
  );
}

/**
 * Hook for using Lottie pull-to-refresh with scroll views
 * Provides progress tracking and refresh state management
 */
export function useLottiePullToRefresh(
  onRefresh: () => Promise<void>,
  options?: {
    enableHaptics?: boolean;
    hapticThreshold?: number;
    animationSource?: any;
  },
) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const scrollY = React.useRef(0);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
      setPullProgress(0);
    }
  };

  const handleScroll = (event: any) => {
    const offset = event.nativeEvent.contentOffset.y;

    // Track pull progress (negative offset = pulling down)
    if (offset < 0) {
      const pullDistance = Math.abs(offset);
      const maxPull = 100; // Maximum pull distance
      const progress = Math.min(pullDistance / maxPull, 1);
      setPullProgress(progress);
    } else {
      setPullProgress(0);
    }

    scrollY.current = offset;
  };

  const refreshControl = (
    <LottiePullToRefresh
      refreshing={refreshing}
      onRefresh={handleRefresh}
      progress={pullProgress}
      enableHaptics={options?.enableHaptics ?? true}
      hapticThreshold={options?.hapticThreshold ?? 50}
      animationSource={options?.animationSource}
    />
  );

  return {
    refreshing,
    refreshControl,
    onScroll: handleScroll,
    scrollEventThrottle: 16,
  };
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  animationOverlay: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  animation: {
    width: 60,
    height: 60,
  },
  hiddenIndicator: {
    opacity: 0,
  },
});

