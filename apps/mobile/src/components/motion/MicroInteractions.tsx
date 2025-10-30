import React, { memo } from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme';

export interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  haptic?: 'none' | 'light' | 'medium' | 'heavy';
  scaleFrom?: number; // default 0.98
}

export function usePressFeedback(scaleFrom: number = 0.98) {
  const scale = useSharedValue(1);
  const shadow = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: 0.2 * shadow.value,
  }));

  const onPressIn = () => {
    scale.value = withSpring(scaleFrom, { stiffness: 300, damping: 22 });
    shadow.value = withTiming(0.6, { duration: 120 });
  };
  const onPressOut = () => {
    scale.value = withSpring(1, { stiffness: 300, damping: 22 });
    shadow.value = withTiming(1, { duration: 120 });
  };

  return { animatedStyle, onPressIn, onPressOut };
}

const AnimatedPressableBase = ({
  style,
  haptic = 'light',
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: AnimatedPressableProps) => {
  const theme = useTheme();
  const { animatedStyle, onPressIn: handleIn, onPressOut: handleOut } = usePressFeedback(0.98);

  const playHaptic = () => {
    if (haptic === 'light') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    else if (haptic === 'medium') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (haptic === 'heavy') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  return (
    <Animated.View
      style={[
        { shadowColor: theme.colors.primary, shadowRadius: 12, shadowOpacity: 0.2, elevation: 6 },
        animatedStyle,
      ]}
    >
      <Pressable
        style={style}
        onPressIn={(e) => {
          handleIn();
          onPressIn?.(e);
        }}
        onPressOut={(e) => {
          handleOut();
          onPressOut?.(e);
        }}
        onPress={(e) => {
          playHaptic();
          onPress?.(e);
        }}
        accessibilityRole={rest.accessibilityRole ?? 'button'}
        android_ripple={{ color: theme.colors.border }}
        {...rest}
      />
    </Animated.View>
  );
};

export const AnimatedPressable = memo(AnimatedPressableBase);
AnimatedPressable.displayName = 'AnimatedPressable';
