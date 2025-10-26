/**
 * 🎯 BOUNCE PRESSABLE - PRESS FEEDBACK
 * Press animation + haptics
 * Uses press motion preset
 */

import React from 'react';
import Animated, { 
  useSharedValue, 
  withSpring, 
  useAnimatedStyle 
} from 'react-native-reanimated';
import { Pressable, ViewStyle } from 'react-native';
import { useMotion } from '../motion/useMotion';
import { haptic } from '../haptics';
import { Motion } from '../motion/useMotion';

export interface BouncePressableProps {
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  style?: ViewStyle;
  hapticFeedback?: 'tap' | 'confirm' | 'super';
}

/**
 * BouncePressable - Pressable with bounce animation and haptics
 * 
 * Usage:
 * ```tsx
 * <BouncePressable onPress={handlePress} hapticFeedback="confirm">
 *   <Button />
 * </BouncePressable>
 * ```
 */
export function BouncePressable({ 
  children, 
  onPress, 
  disabled = false,
  style,
  hapticFeedback = 'tap'
}: BouncePressableProps) {
  const scale = useSharedValue(1);
  const m = useMotion('press');
  const spring = Motion.spring.chip;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(m.scaleFrom ?? 0.98, spring);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, spring);
  };

  const handlePress = () => {
    // Trigger haptic feedback
    if (hapticFeedback === 'tap') {
      haptic.tap();
    } else if (hapticFeedback === 'confirm') {
      haptic.confirm();
    } else if (hapticFeedback === 'super') {
      haptic.super();
    }
    
    onPress?.();
  };

  return (
    <Animated.View style={[style, animatedStyle]}>
      <Pressable
        disabled={disabled}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{ flex: 1 }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}

