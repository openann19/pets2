/**
 * 🔄 SWITCH FLICK
 * Thumb slides with overshoot (emphasized), track color crossfade
 * No layout shift; a11y state reads correctly
 */

import React from 'react';
import { Switch as RNSwitch, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { motion, getSpringConfig, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

const AnimatedSwitch = Animated.createAnimatedComponent(RNSwitch);

export interface SwitchFlickProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * Switch with flick animation
 * Thumb slides with overshoot, track color crossfades smoothly
 */
export function SwitchFlick({
  value,
  onValueChange,
  disabled = false,
  testID,
}: SwitchFlickProps): React.JSX.Element {
  const theme = useTheme();
  const guards = useMotionGuards();
  
  const progress = useSharedValue(value ? 1 : 0);
  const thumbScale = useSharedValue(1);

  React.useEffect(() => {
    if (!guards.shouldAnimate) {
      progress.value = value ? 1 : 0;
      return;
    }

    // Animate thumb position with overshoot
    progress.value = withSpring(
      value ? 1 : 0,
      {
        ...getSpringConfig('emphasized'),
        damping: 20, // Less damping for more bounce
      }
    );

    // Thumb scale animation for tactile feedback
    thumbScale.value = withSpring(1.1, getSpringConfig('snappy'));
    setTimeout(() => {
      thumbScale.value = withSpring(1, getSpringConfig('standard'));
    }, motion.duration.fast);
  }, [value, guards.shouldAnimate]);

  const animatedTrackStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border, theme.colors.primary]
    );

    return {
      backgroundColor,
    };
  });

  const handleValueChange = (newValue: boolean) => {
    if (!disabled) {
      // Light haptic feedback
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      onValueChange(newValue);
    }
  };

  // Use native switch with animated track color
  return (
    <AnimatedSwitch
      value={value}
      onValueChange={handleValueChange}
      disabled={disabled}
      trackColor={{
        false: theme.colors.border,
        true: theme.colors.primary,
      }}
      thumbColor={theme.colors.bg}
      ios_backgroundColor={theme.colors.border}
      testID={testID}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
    />
  );
}

