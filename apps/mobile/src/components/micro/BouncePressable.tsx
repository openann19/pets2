/**
 * BouncePressable - Micro-interaction component with bounce animation
 * Provides haptic feedback and visual bounce effect on press
 * Uses motion tokens for consistency
 */
import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { motionDurations, motionEasing, motionScale, motionOpacity, motionSpring } from '@/theme/motion';
import { usePrefersReducedMotion } from '@/utils/motionGuards';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface BouncePressableProps extends PressableProps {
  scaleFrom?: number;
  haptic?: 'light' | 'medium' | 'heavy' | false;
  children: React.ReactNode;
}

export const BouncePressable: React.FC<BouncePressableProps> = ({
  scaleFrom = motionScale.pressed,
  haptic = 'light',
  onPress,
  children,
  style,
  ...props
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prefersReducedMotion = usePrefersReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: prefersReducedMotion ? 1 : scale.value }],
    opacity: prefersReducedMotion ? 1 : opacity.value,
  }));

  const handlePressIn = () => {
    if (prefersReducedMotion) return;
    
    scale.value = withSpring(scaleFrom, motionSpring.snappy);
    opacity.value = withTiming(motionOpacity.pressed, { 
      duration: motionDurations.fast,
      easing: motionEasing.decel,
    });
    
    if (haptic) {
      const hapticStyle = haptic === 'light' 
        ? Haptics.ImpactFeedbackStyle.Light
        : haptic === 'medium'
        ? Haptics.ImpactFeedbackStyle.Medium
        : Haptics.ImpactFeedbackStyle.Heavy;
      Haptics.impactAsync(hapticStyle).catch(() => {});
    }
  };

  const handlePressOut = () => {
    if (prefersReducedMotion) return;
    
    scale.value = withSpring(1, motionSpring.standard);
    opacity.value = withTiming(1, { 
      duration: motionDurations.fast,
      easing: motionEasing.emphasized,
    });
  };

  const handlePress = (event: any) => {
    if (onPress) {
      onPress(event);
    }
  };

  return (
    <AnimatedPressable
      style={[style, animatedStyle]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {children}
    </AnimatedPressable>
  );
};
