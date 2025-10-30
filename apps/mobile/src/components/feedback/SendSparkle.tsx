import React, { forwardRef, useImperativeHandle, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";

export type SendSparkleHandle = { burst: () => void };

interface SendSparkleProps {
  count?: number;          // number of particles
  size?: number;           // base font size
  duration?: number;       // ms until particles fade
  colors?: string[];       // text colors to pick from
  style?: any;             // wrapper style (position:relative recommended)
}

const GLYPHS = ["✦", "✧", "✺", "✨"];

export const SendSparkle = forwardRef<SendSparkleHandle, SendSparkleProps>(
  (
    {
      count = 10,
      size = 14,
      duration = 450,
      colors = ["#ffffff", "#fde047", "#f472b6", "#60a5fa"],
      style,
    },
    ref,
  ) => {
    const items = useMemo(
      () =>
        Array.from({ length: count }, (_, i) => ({
          i,
          glyph: GLYPHS[i % GLYPHS.length],
          color: colors[i % colors.length],
          // animated fields
          x: useSharedValue(0),
          y: useSharedValue(0),
          s: useSharedValue(0),
          o: useSharedValue(0),
          r: useSharedValue(0),
        })),
      [count, colors],
    );

    const burst = () => {
      "worklet";
      const spread = 34; // px
      items.forEach((p) => {
        cancelAnimation(p.x);
        cancelAnimation(p.y);
        cancelAnimation(p.s);
        cancelAnimation(p.o);
        cancelAnimation(p.r);

        // random radial fan
        const angle = (Math.random() * Math.PI * 2);
        const radius = spread * (0.4 + Math.random() * 1);
        const dx = Math.cos(angle) * radius;
        const dy = -Math.abs(Math.sin(angle) * radius); // bias upward

        p.x.value = 0;
        p.y.value = 0;
        p.s.value = 0;
        p.o.value = 0;
        p.r.value = 0;

        p.s.value = withSpring(1, { damping: 12, stiffness: 240 });
        p.o.value = withTiming(1, { duration: 80 });
        p.x.value = withSpring(dx, { damping: 16, stiffness: 160 });
        p.y.value = withSpring(dy, { damping: 16, stiffness: 160 });
        p.r.value = withSpring((Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 25));

        // fade out + shrink
        p.o.value = withDelay(120, withTiming(0, { duration }));
        p.s.value = withDelay(120, withTiming(0.2, { duration }));
      });
    };

    useImperativeHandle(ref, () => ({ burst }), [items]);

    return (
      <View pointerEvents="none" style={[styles.wrap, style]}>
        {items.map((p) => {
          const sty = useAnimatedStyle(() => ({
            transform: [
              { translateX: p.x.value },
              { translateY: p.y.value },
              { rotate: `${p.r.value}deg` },
              { scale: p.s.value },
            ],
            opacity: p.o.value,
          }));
          return (
            <Animated.Text
              key={p.i}
              style={[styles.glyph, sty, { fontSize: size, color: p.color }]}
            >
              {p.glyph}
            </Animated.Text>
          );
        })}
      </View>
    );
  },
);

const styles = StyleSheet.create({
  wrap: { position: "absolute", right: 0, bottom: 0, width: 0, height: 0 },
  glyph: {
    position: "absolute",
    left: -6,
    top: -6,
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});

export default SendSparkle;

