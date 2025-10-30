/**
 * ✅ OPERATION SUCCESS MORPH
 * Primary button morphs to checkmark; background pulses once
 * Duration: ≤ 300ms; reduced motion → color fade only
 * Optional haptic success
 */

import React from 'react';
import type { ViewStyle, TextStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { Text, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';

import { motion, getEasingArray } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseSuccessMorphReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  textAnimatedStyle: ReturnType<typeof useAnimatedStyle>;
  trigger: () => void;
  isComplete: boolean;
}

/**
 * Hook for success morph animation
 * Button morphs to checkmark with pulse
 */
export function useSuccessMorph(): UseSuccessMorphReturn {
  const guards = useMotionGuards();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const bgOpacity = useSharedValue(1);
  const [isComplete, setIsComplete] = React.useState(false);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: `rgba(34, 197, 94, ${bgOpacity.value})`, // success green
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  const trigger = React.useCallback(() => {
    if (!guards.shouldAnimate) {
      // Reduced motion: just fade
      opacity.value = withTiming(0, {
        duration: motion.duration.base,
      });
      setIsComplete(true);
      return;
    }

    // Morph sequence: scale → pulse → morph
    scale.value = withSequence(
      withTiming(0.95, {
        duration: motion.duration.fast,
        easing: getEasingArray('standard'),
      }),
      withTiming(1.05, {
        duration: motion.duration.fast,
        easing: getEasingArray('emphasized'),
      }),
      withTiming(1, {
        duration: motion.duration.base,
        easing: getEasingArray('emphasized'),
      }),
    );

    // Background pulse: opacity +2%
    bgOpacity.value = withSequence(
      withTiming(1.02, {
        duration: motion.duration.fast,
      }),
      withTiming(1, {
        duration: motion.duration.base,
        easing: getEasingArray('emphasized'),
      }),
    );

    // Text fade out
    opacity.value = withTiming(0, {
      duration: motion.duration.fast,
    });

    // Success haptic
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    // Mark complete after animation
    setTimeout(() => {
      setIsComplete(true);
    }, motion.duration.slow);
  }, [guards.shouldAnimate]);

  return {
    animatedStyle,
    textAnimatedStyle,
    trigger,
    isComplete,
  };
}

/**
 * Success Morph Button Component
 */
interface SuccessMorphButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function SuccessMorphButton({
  children,
  onPress,
  style,
  textStyle,
}: SuccessMorphButtonProps): React.JSX.Element {
  const { animatedStyle, textAnimatedStyle, trigger, isComplete } = useSuccessMorph();

  const handlePress = () => {
    if (!isComplete) {
      trigger();
      onPress?.();
    }
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[animatedStyle, style as any]}>
        {isComplete ? (
          <Text style={[{ color: 'white', fontSize: 24 }, textStyle]}>✓</Text>
        ) : (
          <Animated.View style={textAnimatedStyle as any}>{children}</Animated.View>
        )}
      </Animated.View>
    </Pressable>
  );
}
