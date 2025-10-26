import React, { useRef, useState } from "react";
import { Pressable, View, StyleSheet, type ViewStyle } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withSpring, interpolate } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type Props = {
  children: React.ReactNode;
  onPress?: () => void | Promise<void>;
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  rippleColor?: string;      // e.g. "rgba(236,72,153,0.35)" (Theme pink)
  haptics?: boolean;
  scaleFrom?: number;        // 0.98 default
};

export default function MicroPressable({
  children,
  onPress,
  style,
  disabled,
  rippleColor = "rgba(236,72,153,0.35)",
  haptics = true,
  scaleFrom = 0.98,
}: Props) {
  const [layout, setLayout] = useState({ w: 0, h: 0 });
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const prog = useSharedValue(0);
  const scale = useSharedValue(1);
  const pressingRef = useRef(false);

  const onPressIn = (e: any) => {
    pressingRef.current = true;
    const { locationX, locationY } = e.nativeEvent;
    x.value = locationX;
    y.value = locationY;
    prog.value = 0;
    prog.value = withTiming(1, { duration: 450 });
    scale.value = withSpring(scaleFrom, { damping: 18, stiffness: 420, mass: 0.6 });
    if (haptics) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const onPressOut = () => {
    pressingRef.current = false;
    scale.value = withSpring(1, { damping: 18, stiffness: 300 });
  };

  const circle = useAnimatedStyle(() => {
    const r = Math.max(layout.w, layout.h) * 0.75;
    return {
      position: "absolute",
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
      onLayout={e => {
        const { width, height } = e.nativeEvent.layout;
        setLayout({ w: width, h: height });
      }}
    >
      <Animated.View style={wrap}>
        <View style={styles.overflow}>
          <Animated.View style={circle} pointerEvents="none" />
          {children}
        </View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  overflow: { overflow: "hidden", borderRadius: 9999 },
});

