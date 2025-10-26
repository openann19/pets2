import React, { useRef, useState } from "react";
import { View, StyleSheet, type ViewStyle, type LayoutChangeEvent, GestureResponderEvent } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from "react-native-reanimated";
import { Theme } from "../../theme/unified-theme";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number; // 0..1
  glow?: boolean;
};

export default function ParallaxCard({ children, style, intensity = 0.6, glow = true }: Props) {
  const [box, setBox] = useState({ w: 0, h: 0 });
  const rx = useSharedValue(0);
  const ry = useSharedValue(0);
  const s = useSharedValue(1);

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBox({ w: width, h: height });
  };

  const onPressIn = (e: GestureResponderEvent) => {
    const { locationX, locationY } = e.nativeEvent;
    const dx = (locationX / Math.max(box.w, 1)) - 0.5;
    const dy = (locationY / Math.max(box.h, 1)) - 0.5;
    rx.value = withSpring(interpolate(dy, [-0.5, 0.5], [6, -6]) * intensity);
    ry.value = withSpring(interpolate(dx, [-0.5, 0.5], [-6, 6]) * intensity);
    s.value = withSpring(0.995);
  };

  const onPressOut = () => {
    rx.value = withSpring(0);
    ry.value = withSpring(0);
    s.value = withSpring(1);
  };

  const a = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateX: `${rx.value}deg` }, { rotateY: `${ry.value}deg` }, { scale: s.value }],
    shadowOpacity: glow ? 0.2 : 0.1,
    shadowRadius: glow ? 24 : 12,
    shadowColor: Theme.colors.primary[500],
  }));

  return (
    <View onLayout={onLayout} style={style}
      onStartShouldSetResponder={() => true}
      onResponderGrant={onPressIn}
      onResponderMove={onPressIn}
      onResponderRelease={onPressOut}
      onResponderTerminate={onPressOut}
    >
      <Animated.View style={[a, styles.radius]}>{children}</Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  radius: { borderRadius: Theme.borderRadius["2xl"], overflow: "visible" },
});

