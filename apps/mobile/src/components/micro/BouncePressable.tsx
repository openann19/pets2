import React, { memo } from "react";
import { Pressable, type PressableProps } from "react-native";
import Animated, { useSharedValue, withSpring, useAnimatedStyle } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useReducedMotion } from "../../utils/A11yHelpers";

type Props = PressableProps & {
  scaleFrom?: number;     // 0.96
  scaleTo?: number;       // 1
  haptics?: boolean;      // true
};

const BouncePressable = memo(function BouncePressable({
  children, scaleFrom = 0.96, scaleTo = 1, haptics = true, onPressIn, onPressOut, onPress, ...rest
}: Props) {
  const reduceMotion = useReducedMotion();
  const s = useSharedValue(scaleTo);

  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <Pressable
      {...rest}
      onPressIn={(e) => {
        if (!reduceMotion) {
          s.value = withSpring(scaleFrom, { stiffness: 500, damping: 28, mass: 0.7 });
        }
        if (haptics && !reduceMotion) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        if (!reduceMotion) {
          s.value = withSpring(scaleTo, { stiffness: 380, damping: 22, mass: 0.7 });
        }
        onPressOut?.(e);
      }}
      onPress={onPress}
      style={({ pressed }) => [{ opacity: pressed ? 0.95 : 1 }]
    >
      {typeof children === 'function' ? (
        <Animated.View style={style}>{children({ pressed: false })}</Animated.View>
      ) : (
        <Animated.View style={style}>{children}</Animated.View>
      )}
    </Pressable>
  );
});

export default BouncePressable;

