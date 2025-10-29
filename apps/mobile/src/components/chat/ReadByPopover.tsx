import React from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Image,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { ReadReceipt as CoreReadReceipt, User } from "@pawfectmatch/core";

export interface ReadReceiptDisplay {
  userId: string;
  name: string;
  avatar?: string;   // uri
  readAt: string;    // ISO
}

export interface ReadByPopoverProps {
  visible: boolean;
  onClose: () => void;
  receipts: CoreReadReceipt[];
  users?: Map<string, User>; // Optional map to lookup user details
  // anchor is bubble's screen coords (from measure)
  anchor?: { x: number; y: number };
  theme?: {
    bg?: string; text?: string; subtext?: string; border?: string;
  };
}

function formatShort(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const clock = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (sameDay) return clock;
  return `${d.getMonth() + 1}/${d.getDate()} ${clock}`;
}

export default function ReadByPopover({
  visible,
  onClose,
  receipts,
  users,
  anchor,
  theme,
}: ReadByPopoverProps) {
  const alpha = useSharedValue(0);
  const scale = useSharedValue(0.96);

  React.useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      alpha.value = withTiming(1, { duration: 140 });
      scale.value = withSpring(1, { damping: 16, stiffness: 320 });
    } else {
      alpha.value = withTiming(0, { duration: 120 });
      scale.value = withTiming(0.96, { duration: 120 });
    }
  }, [visible]);

  const popSty = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [{ scale: scale.value }],
  }));

  // Transform core ReadReceipt to display format
  const displayReceipts: ReadReceiptDisplay[] = receipts.map((r) => {
    const user = users?.get(r.user);
    const name = user 
      ? `${user.firstName} ${user.lastName}`.trim() 
      : "Unknown User";
    const avatar = user?.avatar;

    return {
      userId: r.user,
      name,
      avatar,
      readAt: r.readAt,
    };
  });

  const top = Math.max(24, (anchor?.y ?? 200) - 12);
  const left = Math.max(12, (anchor?.x ?? 12) - 160);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View style={[styles.backdropFill, { opacity: alpha.value }] />
      </Pressable>

      {/* Popover */}
      <Animated.View
        style={[
          styles.pop,
          popSty,
          {
            backgroundColor: theme?.bg ?? "#111",
            borderColor: theme?.border ?? "rgba(255,255,255,0.08)",
            top,
            left,
          },
        ]}
        pointerEvents="box-none"
      >
        <Text style={[styles.title, { color: theme?.text ?? "#fff" }]>
          Read by
        </Text>

        {displayReceipts.length === 0 ? (
          <Text style={[styles.empty, { color: theme?.subtext ?? "#9ca3af" }]>
            Nobody yet
          </Text>
        ) : (
          <View style={styles.list}>
            {displayReceipts.map((r) => (
              <View key={r.userId} style={styles.row}>
                {r.avatar ? (
                  <Image source={{ uri: r.avatar }} style={styles.avatar} />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: theme?.text ?? "#fff" }] numberOfLines={1}>
                    {r.name}
                  </Text>
                  <Text style={[styles.sub, { color: theme?.subtext ?? "#9ca3af" }]>
                    {formatShort(r.readAt)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", inset: 0 },
  backdropFill: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)" },
  pop: {
    position: "absolute",
    width: 220,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  title: { fontSize: 12, fontWeight: "700", marginBottom: 8, opacity: 0.9 },
  empty: { fontSize: 12 },
  list: { gap: 10 },
  row: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#222" },
  avatarFallback: { backgroundColor: "#333" },
  name: { fontSize: 13, fontWeight: "600" },
  sub: { fontSize: 11 },
});

