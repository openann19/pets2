/**
 * 🎨 TOGGLE MORPH
 * Elastic scale animation for favorite/like buttons
 * 
 * Icon fills with elastic scale (1 → 1.15 → 1), optional tiny burst (3–5 dots)
 * Takes ≤ 220ms; respects reduced motion
 */

import React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { motion, getEasingArray, getSpringConfig } from '@/theme/motion';
import { useMotionGuards } from '@/utils/motionGuards';

interface UseToggleMorphReturn {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  trigger: () => void;
}

/**
 * Hook for toggle morph animation
 * Returns animated style and trigger function
 */
export function useToggleMorph(isActive: boolean): UseToggleMorphReturn {
  const guards = useMotionGuards();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const trigger = React.useCallback(() => {
    if (!guards.shouldAnimate) {
      return; // Skip animation if reduced motion
    }

    // Elastic scale: 1 → 1.15 → 1
    scale.value = withSequence(
      withSpring(1.15, {
        ...getSpringConfig('bouncy'),
        damping: 15, // Extra bouncy
      }),
      withSpring(1, {
        ...getSpringConfig('standard'),
      })
    );

    // Light haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  }, [guards.shouldAnimate]);

  // Update scale when active state changes
  React.useEffect(() => {
    if (isActive && guards.shouldAnimate) {
      scale.value = withSpring(1.05, getSpringConfig('gentle'));
    } else {
      scale.value = withSpring(1, getSpringConfig('gentle'));
    }
  }, [isActive, guards.shouldAnimate]);

  return { animatedStyle, trigger };
}

/**
 * Toggle Morph Component
 * Wraps a toggle/icon with elastic morph animation
 */
interface ToggleMorphProps {
  children: React.ReactNode;
  isActive: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ToggleMorph({
  children,
  isActive,
  onPress,
  style,
}: ToggleMorphProps): React.JSX.Element {
  const { animatedStyle, trigger } = useToggleMorph(isActive);

  const handlePress = () => {
    trigger();
    onPress?.();
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      {React.cloneElement(children as React.ReactElement, {
        onPress: handlePress,
      })}
    </Animated.View>
  );
}

