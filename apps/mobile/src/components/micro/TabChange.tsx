/**
 * 🎯 TAB CHANGE FEEDBACK
 * Android ripple / iOS subtle slide
 * Underline glides; icon scale 0.9→1.0; haptic light
 * Duration: 180–220ms; matches platform idioms
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseTabChangeReturn {
  iconStyle: ReturnType<typeof useAnimatedStyle>;
  underlineStyle: ReturnType<typeof useAnimatedStyle>;
  trigger: () => void;
}

/**
 * Hook for tab change animation
 * Platform-aware: Android ripple effect, iOS subtle slide
 */
export function useTabChange(isActive: boolean): UseTabChangeReturn {
  const guards = useMotionGuards();
  const iconScale = useSharedValue(isActive ? 1 : 0.9);
  const underlineOpacity = useSharedValue(isActive ? 1 : 0);
  const underlineWidth = useSharedValue(isActive ? 100 : 0);

  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }],
    };
  });

  const underlineStyle = useAnimatedStyle(() => {
    return {
      opacity: underlineOpacity.value,
      width: `${underlineWidth.value}%`,
    };
  });

  const trigger = React.useCallback(() => {
    if (!guards.shouldAnimate) {
      return;
    }

    // Icon scale animation
    iconScale.value = withTiming(isActive ? 1 : 0.9, {
      duration: motion.duration.base,
      easing: getEasingArray('emphasized'),
    });

    // Underline animation
    underlineOpacity.value = withTiming(isActive ? 1 : 0, {
      duration: motion.duration.base,
      easing: getEasingArray('standard'),
    });

    underlineWidth.value = withTiming(isActive ? 100 : 0, {
      duration: motion.duration.base,
      easing: getEasingArray('standard'),
    });

    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [isActive, guards.shouldAnimate]);

  // Update when active state changes
  React.useEffect(() => {
    trigger();
  }, [isActive]);

  return {
    iconStyle,
    underlineStyle,
    trigger,
  };
}

/**
 * Tab Change Indicator Component
 */
interface TabChangeIndicatorProps {
  isActive: boolean;
  children: React.ReactNode;
  underlineColor?: string;
  style?: ViewStyle;
}

export function TabChangeIndicator({
  isActive,
  children,
  underlineColor,
  style,
}: TabChangeIndicatorProps): React.JSX.Element {
  const { iconStyle, underlineStyle } = useTabChange(isActive);

  return (
    <Animated.View style={[{ alignItems: 'center' }, style]}>
      <Animated.View style={iconStyle}>{children}</Animated.View>
      <Animated.View
        style={[
          {
            height: 2,
            backgroundColor: underlineColor || '#EC4899',
            marginTop: 4,
          },
          underlineStyle,
        ]}
      />
    </Animated.View>
  );
}
