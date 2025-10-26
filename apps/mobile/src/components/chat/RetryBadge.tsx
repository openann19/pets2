import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

export default function RetryBadge({
  onPress,
  disabled,
  bg = "#111",
}: {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  bg?: string;
}) {
  const s = useSharedValue(1);
  const sty = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const bounce = () => {
    "worklet";
    s.value = 0.92;
    s.value = withSpring(1, { damping: 14, stiffness: 380 });
  };

  const handlePress = () => {
    bounce();
    const r = onPress();
    if (r && typeof (r as any).then === "function") {
      // no-op; the bubble can react (shake) based on promise result
    }
  };

  return (
    <Animated.View style={[styles.wrap, sty]}>
      <Pressable
        onPress={handlePress}
        android_ripple={{ color: "rgba(255,255,255,0.12)", borderless: true }}
        disabled={disabled}
        style={[styles.btn, { backgroundColor: bg }]}
        accessibilityRole="button"
        accessibilityLabel="Retry sending message"
      >
        <Ionicons name="refresh" size={14} color="#fff" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginLeft: 6 },
  btn: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
});

