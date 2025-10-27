import React, { useEffect } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export type ReplyTarget = {
  id: string;
  author?: string;
  text?: string;
  thumbnail?: string; // optional small image uri
};

export default function ReplyPreviewBar({
  target,
  visible = false,
  onCancel,
  onPress,
  bg = "#111",
  border = "rgba(255,255,255,0.08)",
  text = "#fff",
  sub = "#9ca3af",
}: {
  target?: ReplyTarget | null;
  visible?: boolean;
  onCancel: () => void;
  onPress?: () => void; // jump-to-thread
  bg?: string;
  border?: string;
  text?: string;
  sub?: string;
}) {
  const y = useSharedValue(20);
  const alpha = useSharedValue(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (visible && target) {
      alpha.value = withTiming(1, { duration: 140 });
      y.value = withSpring(0, { damping: 16, stiffness: 320 });
    } else {
      alpha.value = withTiming(0, { duration: 120 });
      y.value = withTiming(20, { duration: 120 });
      x.value = 0;
    }
  }, [visible, target]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd(() => {
      const threshold = 64;
      if (Math.abs(x.value) > threshold) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
        x.value = withTiming(Math.sign(x.value) * 260, { duration: 160 }, () =>
          runOnJS(onCancel)(),
        );
      } else {
        x.value = withSpring(0, { damping: 16, stiffness: 300 });
      }
    });

  const sty = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [{ translateY: y.value }, { translateX: x.value }],
  }));

  if (!target) return null;

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          styles.wrap,
          { backgroundColor: bg, borderColor: border },
          sty,
        ]}
      >
        {/* leading bar */}
        <View style={styles.leading} />

        {/* icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="arrow-undo" size={16} color={text} />
        </View>

        {/* content */}
        <Pressable style={styles.content} onPress={onPress}>
          <Text style={[styles.author, { color: sub }]} numberOfLines={1}>
            {target.author ?? "Replying to"}
          </Text>
          <Text style={[styles.snippet, { color: text }]} numberOfLines={1}>
            {target.text ?? "Media"}
          </Text>
        </Pressable>

        {/* thumb (optional) */}
        {target.thumbnail ? (
          <Image source={{ uri: target.thumbnail }} style={styles.thumb} />
        ) : null}

        {/* close */}
        <Pressable
          onPress={() => {
            Haptics.selectionAsync().catch(() => {});
            onCancel();
          }}
          style={styles.close}
          hitSlop={8}
        >
          <Ionicons name="close" size={16} color={sub} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  leading: {
    width: 3,
    height: "100%",
    borderRadius: 3,
    backgroundColor: "#ec4899",
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  content: { flex: 1 },
  author: { fontSize: 11, fontWeight: "700" },
  snippet: { fontSize: 13, fontWeight: "600" },
  thumb: { width: 28, height: 28, borderRadius: 6, marginLeft: 6 },
  close: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: "center", justifyContent: "center",
  },
});

