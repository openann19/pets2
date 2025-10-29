import React, { useCallback, useMemo } from "react";
import { StyleSheet, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  cancelAnimation,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type HapticStyle = "light" | "medium" | "heavy";

export interface DoubleTapLikePlusProps {
  children: React.ReactNode;
  onDoubleTap?: () => void;
  onSingleTap?: () => void;
  maxDelay?: number;
  style?: any;
  disabled?: boolean;
  heartSize?: number;
  heartColor?: string;
  // particles: how many hearts explode
  particles?: number;
  haptics?: { enabled: boolean; style?: HapticStyle };
}

export function DoubleTapLikePlus({
  children,
  onDoubleTap,
  onSingleTap,
  maxDelay = 280,
  style,
  disabled = false,
  heartSize = 64,
  heartColor = "#ff3b5c",
  particles = 8,
  haptics = { enabled: true, style: "medium" },
}: DoubleTapLikePlusProps) {
  // base scale micro-bounce
  const scale = useSharedValue(1);

  // particle fields
  const items = useMemo(() => Array.from({ length: particles }, (_, i) => i), [particles]);
  const pScale = useMemo(() => items.map(() => useSharedValue(0)), [items]);
  const pX = useMemo(() => items.map(() => useSharedValue(0)), [items]);
  const pY = useMemo(() => items.map(() => useSharedValue(0)), [items]);
  const pOpacity = useMemo(() => items.map(() => useSharedValue(0)), [items]);
  const pRotate = useMemo(() => items.map(() => useSharedValue(0)), [items]);

  const triggerHaptic = useCallback(() => {
    if (!haptics.enabled) return;
    const style =
      haptics.style === "light"
        ? Haptics.ImpactFeedbackStyle.Light
        : haptics.style === "heavy"
        ? Haptics.ImpactFeedbackStyle.Heavy
        : Haptics.ImpactFeedbackStyle.Medium;
    Haptics.impactAsync(style);
  }, [haptics]);

  const explode = useCallback(() => {
    "worklet";
    // cancel any ongoing
    items.forEach((i) => {
      cancelAnimation(pScale[i]!);
      cancelAnimation(pX[i]!);
      cancelAnimation(pY[i]!);
      cancelAnimation(pOpacity[i]!);
      cancelAnimation(pRotate[i]!);
    });

    // configure random fan-out
    items.forEach((i) => {
      const angle = (Math.PI * 2 * i) / items.length + Math.random() * 0.4 - 0.2;
      const radius = 28 + Math.random() * 20;
      const dx = Math.cos(angle) * radius;
      const dy = Math.sin(angle) * radius * 0.9;

      pScale[i]!.value = 0;
      pOpacity[i]!.value = 0;
      pX[i]!.value = 0;
      pY[i]!.value = 0;
      pRotate[i]!.value = 0;

      pScale[i]!.value = withSpring(1, { damping: 12, stiffness: 260 });
      pOpacity[i]!.value = withTiming(1, { duration: 90 });
      pX[i]!.value = withSpring(dx, { damping: 16, stiffness: 180 });
      pY[i]!.value = withSpring(dy, { damping: 16, stiffness: 180 });
      pRotate[i]!.value = withSpring((Math.random() > 0.5 ? 1 : -1) * 40);

      // fade away
      pOpacity[i]!.value = withDelay(
        220,
        withTiming(0, { duration: 160 })
      );
      pScale[i]!.value = withDelay(220, withTiming(0.2, { duration: 160 }));
    });
  }, [items, pOpacity, pRotate, pScale, pX, pY]);

  const bounce = useCallback(() => {
    "worklet";
    scale.value = 0.96;
    scale.value = withSpring(1, { damping: 14, stiffness: 400 });
  }, [scale]);

  const onDouble = useCallback(() => {
    runOnJS(triggerHaptic)();
    explode();
    bounce();
    onDoubleTap && onDoubleTap();
  }, [bounce, explode, onDoubleTap, triggerHaptic]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const singleTap = Gesture.Tap()
    .enabled(!disabled)
    .maxDuration(220)
    .onEnd((_e, ok) => {
      "worklet";
      if (!ok) return;
      bounce();
      if (onSingleTap) runOnJS(onSingleTap)();
    });

  const doubleTap = Gesture.Tap()
    .enabled(!disabled)
    .numberOfTaps(2)
    .maxDelay(maxDelay)
    .onEnd((_e, ok) => {
      "worklet";
      if (!ok) return;
      onDouble();
    });

  return (
    <GestureDetector gesture={Gesture.Exclusive(doubleTap, singleTap)}>
      <Animated.View style={[styles.wrap, style, containerStyle]}>
        {children}

        {/* center heart (brief) */}
        <Animated.Text
          style={[
            styles.heart,
            {
              fontSize: heartSize,
              color: heartColor,
            },
          ]}
        >
          {/* kept empty to avoid persistent overlay; particles do the show */}
        </Animated.Text>

        {/* particle burst */}
        {items.map((i) => {
          const s = useAnimatedStyle(() => ({
            position: "absolute" as const,
            left: "50%" as const,
            top: "50%" as const,
            transform: [
              { translateX: -heartSize / 2 + (pX[i]?.value ?? 0) },
              { translateY: -heartSize / 2 + (pY[i]?.value ?? 0) },
              { rotate: `${pRotate[i]?.value ?? 0}deg` },
              { scale: pScale[i]?.value ?? 0 },
            ],
            opacity: pOpacity[i]?.value ?? 0,
          }));
          return (
            <Animated.Text key={i} style={[styles.particle, s, { fontSize: heartSize * 0.45, color: heartColor }]>
              ❤️
            </Animated.Text>
          );
        })}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "relative" },
  heart: {
    // placeholder (you can show a brief big heart if you want)
    width: 0,
    height: 0,
  },
  particle: {
    textShadowColor: "rgba(0,0,0,0.25)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default DoubleTapLikePlus;
