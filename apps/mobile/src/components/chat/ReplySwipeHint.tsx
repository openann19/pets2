import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedStyle,
  Extrapolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

interface ReplySwipeHintProps {
  progress: Animated.SharedValue<number> | number;
  align?: "right" | "left";
}

/**
 * ReplySwipeHint - Animated hint pill that appears during swipe-to-reply
 * 
 * Features:
 * - Arrow icon with "Reply" text
 * - Smooth fade in/out based on swipe progress
 * - Positioned relative to bubble alignment
 * - Fully accessible via TalkBack/VoiceOver
 */
export default function ReplySwipeHint({
  progress, // shared value (0..1) OR number
  align = "right", // hint appears on left side of own bubble; align handles mirroring if needed
}: ReplySwipeHintProps) {
  const sty = useAnimatedStyle(() => {
    const p = typeof progress === "number" ? progress : progress.value / 56; // tolerate either
    const alpha = interpolate(p, [0, 0.15, 1], [0, 0.5, 1], Extrapolate.CLAMP);
    const tx = interpolate(p, [0, 1], [align === "right" ? -10 : 10, 0]);
    return { opacity: alpha, transform: [{ translateX: tx }] };
  });

  return (
    <Animated.View 
      style={[styles.wrap, sty, align === "left" && { flexDirection: "row-reverse" }]
      accessibilityRole="button"
      accessibilityLabel="Swipe to reply"
    >
      <View style={styles.pill}>
        <Ionicons name="arrow-undo" size={14} color="#fff" />
        <Text style={styles.txt}>Reply</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: "absolute", bottom: -18, right: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: "rgba(17,17,17,0.7)",
  },
  txt: { color: "#fff", fontSize: 11, fontWeight: "600" },
});

