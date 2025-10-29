import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

export type ContextAction = {
  key: string;
  label: string;
  icon?: string;
  onPress: () => void | Promise<void>;
  danger?: boolean;
  disabled?: boolean;
};

interface MorphingContextMenuProps {
  visible: boolean;
  onClose: () => void;
  anchor?: { x: number; y: number; width: number; height: number };
  actions: ContextAction[];
  theme?: { 
    bg: string; 
    border: string; 
    text: string; 
    sub: string; 
    item: string; 
    itemPressed: string;
    danger?: string;
  };
}

/**
 * MorphingContextMenu - Long-press menu that morphs from bubble rect
 * 
 * Advanced animated context menu with:
 * - Morph animation from bubble to menu
 * - Spring-based transitions
 * - Haptic feedback on open
 * - Accessible action items
 * - Theme customization
 * 
 * Pass the bubble's measured rect and a list of actions.
 */
export default function MorphingContextMenu({
  visible,
  onClose,
  anchor,  // { x, y, width, height } in screen coords
  actions,
  theme = {
    bg: "#111", 
    border: "rgba(255,255,255,0.08)", 
    text: "#fff", 
    sub: "#9ca3af",
    item: "#181818", 
    itemPressed: "#222",
    danger: "#ef4444",
  },
}: MorphingContextMenuProps) {
  const alpha = useSharedValue(0);
  const t = useSharedValue(0); // 0..1 morph progress

  React.useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      alpha.value = withTiming(1, { duration: 140 });
      t.value = withSpring(1, { damping: 16, stiffness: 320 });
    } else {
      alpha.value = withTiming(0, { duration: 120 });
      t.value = withTiming(0, { duration: 120 });
    }
  }, [visible, alpha, t]);

  // final menu size
  const W = 240;
  const H = Math.min(340, 56 + actions.length * 48);
  // start from bubble rect
  const origin = anchor ?? { x: 40, y: 300, width: 90, height: 42 };

  const style = useAnimatedStyle(() => {
    // interpolate rect → target rect
    const cxStart = origin.x + origin.width / 2;
    const cyStart = origin.y + origin.height / 2;
    const cxEnd = origin.x + (origin.width > 180 ? origin.width / 2 : W / 2); // keep near bubble
    const left = interpolate(t.value, [0, 1], [origin.x, cxStart - W / 2], Extrapolate.CLAMP);
    const top = interpolate(t.value, [0, 1], [origin.y, Math.max(24, cyStart - H / 2)], Extrapolate.CLAMP);
    const width = interpolate(t.value, [0, 1], [origin.width, W]);
    const height = interpolate(t.value, [0, 1], [origin.height, H]);
    const radius = interpolate(t.value, [0, 1], [16, 18]);

    return {
      left, top, width, height, borderRadius: radius,
      opacity: alpha.value,
      transform: [{ scale: 0.98 + 0.02 * t.value }],
    };
  });

  return (
    <Modal 
      visible={visible} 
      transparent 
      animationType="none" 
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropFill, { opacity: alpha.value }] />
      </Pressable>

      {/* Shell morphing from bubble */}
      <Animated.View 
        style={[
          styles.shell, 
          style, 
          { backgroundColor: theme.bg, borderColor: theme.border }
        ]} 
      />

      {/* Content fades in slightly after morph */}
      <Animated.View
        pointerEvents="box-none"
        style={[
          styles.content,
          useAnimatedStyle(() => ({
            opacity: interpolate(t.value, [0.2, 1], [0, 1]),
          })),
        ]}
      >
        <View
          style={[
            styles.menu,
            {
              left: origin.x + (origin.width > W ? 0 : (origin.width / 2 - W / 2)),
              top: Math.max(24, origin.y + origin.height / 2 - H / 2),
              width: W,
              height: H,
              backgroundColor: theme.bg,
              borderColor: theme.border,
            },
          ]}
        >
          <Text style={[styles.title, { color: theme.sub }]>Message options</Text>

          {actions.map((a) => (
            <Pressable
              key={a.key}
              onPress={() => {
                a.onPress();
                onClose();
              }}
              disabled={a.disabled}
              android_ripple={{ color: "rgba(255,255,255,0.06)" }}
              style={({ pressed }) => [
                styles.item,
                { 
                  backgroundColor: pressed ? theme.itemPressed : theme.item, 
                  opacity: a.disabled ? 0.5 : 1 
                },
              ]}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              accessibilityState={{ disabled: a.disabled }}
            >
              <View style={styles.itemRow}>
                {a.icon ? (
                  <Ionicons 
                    name={a.icon} 
                    size={18} 
                    color={a.danger ? (theme.danger ?? "#ef4444") : theme.text} 
                  />
                ) : null}
                <Text 
                  style={[
                    styles.itemText, 
                    { color: a.danger ? (theme.danger ?? "#ef4444") : theme.text }
                  ]}
                >
                  {a.label}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", inset: 0 },
  backdropFill: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  shell: { position: "absolute", borderWidth: 1 },
  content: { position: "absolute", inset: 0 },
  menu: {
    position: "absolute",
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
  },
  title: { 
    paddingHorizontal: 12, 
    paddingTop: 10, 
    paddingBottom: 6, 
    fontSize: 12, 
    fontWeight: "700" 
  },
  item: { 
    height: 44, 
    justifyContent: "center", 
    paddingHorizontal: 12 
  },
  itemRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    gap: 10 
  },
  itemText: { 
    fontSize: 14, 
    fontWeight: "600" 
  },
});

