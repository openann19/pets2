/**
 * 🎆 MAP FAB BLOOM
 * FAB expands ripple 1.0 → 1.1 scale and returns; shadow up/down
 * Duration: 180ms; haptic light
 */

import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useTheme } from '@/theme';
import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export interface FABBloomProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  accessibilityLabel?: string;
  testID?: string;
}

/**
 * FAB with bloom animation
 * Expands ripple on press, shadow elevates
 */
export function FABBloom({
  children,
  onPress,
  style,
  accessibilityLabel,
  testID,
}: FABBloomProps): React.JSX.Element {
  const theme = useTheme();
  const guards = useMotionGuards();
  
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  const animatedStyle = useAnimatedStyle(() => {
    if (!guards.shouldAnimate) {
      return {};
    }

    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: shadowOpacity.value,
    };
  });

  const handlePressIn = () => {
    if (guards.shouldAnimate) {
      // Bloom: scale up
      scale.value = withSequence(
        withTiming(1.1, {
          duration: motion.duration.fast,
          easing: getEasingArray('standard'),
        }),
        withTiming(1, {
          duration: motion.duration.fast,
          easing: getEasingArray('emphasized'),
        })
      );

      // Shadow up then down
      shadowOpacity.value = withSequence(
        withTiming(0.25, {
          duration: motion.duration.fast,
        }),
        withTiming(0.15, {
          duration: motion.duration.fast,
        })
      );
    }

    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress?.();
  };

  return (
    <AnimatedTouchableOpacity
      onPress={handlePressIn}
      style={[
        style,
        animatedStyle,
        {
          shadowColor: theme.colors.border,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
          elevation: 6,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
    >
      {children}
    </AnimatedTouchableOpacity>
  );
}

