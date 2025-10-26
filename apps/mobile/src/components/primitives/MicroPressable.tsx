import React from 'react';
import { Pressable, type PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
// (Optional) import * as Haptics from 'expo-haptics';

type Props = PressableProps & { scaleFrom?: number; scaleTo?: number; disabledMotion?: boolean };
export default function MicroPressable({ children, scaleFrom=1, scaleTo=0.96, disabledMotion, ...rest }: Props) {
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }), []);
  const animate = (to:number) => { s.value = withTiming(disabledMotion ? 1 : to, { duration: 90 }); };

  return (
    <Animated.View style={style}>
      <Pressable
        onPressIn={(e)=>{ animate(scaleTo); rest.onPressIn?.(e); /* Haptics.impactAsync?.(Haptics.ImpactFeedbackStyle.Light) */ }}
        onPressOut={(e)=>{ animate(scaleFrom); rest.onPressOut?.(e); }}
        {...rest}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
