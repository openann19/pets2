import React, { useMemo, useRef } from "react";
import { type LayoutChangeEvent, StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

export type ReactionItem = { emoji: string; label?: string };
export interface ReactionBarMagneticProps {
  reactions?: ReactionItem[];
  onSelect: (emoji: string) => void;
  onCancel?: () => void;
  influenceRadius?: number; // px
  baseSize?: number; // px
  backgroundColor?: string;
  borderColor?: string;
}

const DEFAULTS: ReactionItem[] = [
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🔥", label: "Fire" },
  { emoji: "🎉", label: "Party" },
  { emoji: "👍", label: "Like" },
  { emoji: "👏", label: "Clap" },
];

export default function ReactionBarMagnetic({
  reactions = DEFAULTS,
  onSelect,
  onCancel,
  influenceRadius = 80,
  baseSize = 28,
  backgroundColor = "#fff",
  borderColor = "#e6e6e6",
}: ReactionBarMagneticProps) {
  const centers = useMemo(() => reactions.map(() => ({ x: useSharedValue(0) })), [reactions.length]);
  const touchX = useSharedValue<number | null>(null);
  const active = useSharedValue(false);

  const onItemLayout = (index: number) => (e: LayoutChangeEvent) => {
    const { x, width } = e.nativeEvent.layout;
    const center = centers[index];
    if (center) {
      center.x.value = x + width / 2;
    }
  };

  const pan = Gesture.Pan()
    .onBegin((e) => {
      active.value = true;
      touchX.value = e.x;
    })
    .onChange((e) => {
      touchX.value = e.x;
    })
    .onEnd(() => {
      const x = touchX.value;
      active.value = false;
      if (x == null) {
        onCancel?.();
        return;
      }
      // pick nearest
      'worklet';
      let bestIdx = 0;
      let bestDist = Number.MAX_SAFE_INTEGER;
      for (let i = 0; i < centers.length; i++) {
        const center = centers[i];
        const centerX = center?.x.value ?? 0;
        const d = Math.abs(centerX - x);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = i;
        }
      }
      const bestReaction = reactions[bestIdx];
      if (bestReaction) {
        runOnJS(onSelect)(bestReaction.emoji);
      }
      touchX.value = null;
    })
    .onFinalize(() => {
      active.value = false;
      touchX.value = null;
    });

  return (
    <GestureDetector gesture={pan}>
      <View style={[styles.wrap, { backgroundColor, borderColor }]}>
        {reactions.map((r, i) => {
          const s = useAnimatedStyle(() => {
            const center = centers[i];
            const x = center?.x.value ?? 0;
            const t = touchX.value;
            const isActive = active.value && t != null;

            // proximity 0..1
            const p = !isActive ? 0 : Math.max(0, 1 - Math.abs((t! - x) / influenceRadius));
            const scale = 1 + p * 0.35; // up to 1.35x
            const lift = -p * 14; // lift up to -14
            const tilt = (p * 12 * (t! - x)) / influenceRadius; // slight tilt

            return {
              transform: [
                { translateY: withSpring(isActive ? lift : 0, { damping: 15 }) },
                { rotate: `${tilt}deg` },
                { scale: withSpring(isActive ? scale : 1, { damping: 18 }) },
              ],
              zIndex: Math.round(100 * scale),
            };
          });

          return (
            <Animated.View
              key={r.emoji}
              onLayout={onItemLayout(i)}
              style={[styles.item]}
              accessibilityLabel={r.label ?? r.emoji}
              accessibilityRole="button"
            >
              <Animated.Text style={[styles.emoji, { fontSize: baseSize }, s]}>
                {r.emoji}
              </Animated.Text>
            </Animated.View>
          );
        })}
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    paddingHorizontal: 8,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  item: {
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  emoji: {
    textShadowColor: "rgba(0,0,0,0.15)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
