import React, { useRef, useState } from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  type ViewStyle,
  type AccessibilityProps,
  type PressableProps,
} from 'react-native';
import type { NativeSyntheticEvent, NativeTouchEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from '../../utils/A11yHelpers';
import { springs } from '@/foundation/motion';

type Props = {
  children: React.ReactNode;
  onPress?: () => void | Promise<void>;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  rippleColor?: string; // e.g. "rgba(236,72,153,0.35)" (Theme pink)
  haptics?: boolean;
  scaleFrom?: number; // 0.98 default
} & AccessibilityProps;

export default function MicroPressable({
  children,
  onPress,
  style,
  disabled,
  rippleColor = 'rgba(236,72,153,0.35)',
  haptics = true,
  scaleFrom = 0.98,
  ...accessibilityProps
}: Props) {
  const reduceMotion = useReducedMotion();
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const prog = useSharedValue(0);
  const scale = useSharedValue(1);
  const pressingRef = useRef(false);

  const animationDuration = reduceMotion ? 0 : 450;

  const onPressIn = (
    e: NativeSyntheticEvent<NativeTouchEvent & { locationX: number; locationY: number }>,
  ) => {
    pressingRef.current = true;
    const { locationX, locationY } = e.nativeEvent;
    x.value = locationX;
    y.value = locationY;
    prog.value = 0;
    prog.value = withTiming(1, { duration: animationDuration });
    scale.value = withSpring(scaleFrom, springs.light);
    if (haptics && !reduceMotion) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    pressingRef.current = false;
    if (!reduceMotion) {
      scale.value = withSpring(1, springs.standard);
    }
  };

  const circle = useAnimatedStyle(() => {
    const r = Math.max(layout.w, layout.h) * 0.75;
    return {
      position: 'absolute' as const,
      top: y.value - r,
      left: x.value - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      opacity: 1 - prog.value,
      transform: [{ scale: interpolate(prog.value, [0, 1], [0.1, 1.8]) }],
      backgroundColor: rippleColor,
    };
  });

  const wrap = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Pressable
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={disabled}
      style={style}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ w: width, h: height });
      }}
      {...accessibilityProps}
    >
      <Animated.View style={wrap}>
        <View style={styles.overflow}>
          <Animated.View
            style={circle}
            pointerEvents="none"
          />
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overflow: { overflow: 'hidden', borderRadius: 9999 },
});
