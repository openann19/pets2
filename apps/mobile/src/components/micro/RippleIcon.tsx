import React, { memo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

type Props = { size?: number; stroke?: number; trigger: number; color?: string };

const RippleIcon = memo(function RippleIcon({
  size = 36,
  stroke = 2,
  trigger,
  color = 'rgba(236,72,153,0.35)',
}: Props) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = 0;
    t.value = withTiming(1, { duration: 450 });
  }, [trigger]);
  const s = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [{ scale: interpolate(t.value, [0, 1], [0.4, 2]) }],
    borderColor: color,
    width: size,
    height: size,
    borderWidth: stroke,
    borderRadius: size / 2,
    position: 'absolute' as const,
  }));
  return (
    <Animated.View
      pointerEvents="none"
      style={s}
    />
  );
});

export default RippleIcon;
