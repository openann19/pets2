import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View, Image } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { ReadReceipt as CoreReadReceipt, User } from '@pawfectmatch/core';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { springs } from '@/foundation/motion';

export interface ReadReceiptDisplay {
  userId: string;
  name: string;
  avatar?: string; // uri
  readAt: string; // ISO
}

export interface ReadByPopoverProps {
  visible: boolean;
  onClose: () => void;
  receipts: CoreReadReceipt[];
  users?: Map<string, User>; // Optional map to lookup user details
  // anchor is bubble's screen coords (from measure)
  anchor?: { x: number; y: number };
  theme?: {
    bg?: string;
    text?: string;
    subtext?: string;
    border?: string;
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
  theme: themeOverride,
}: ReadByPopoverProps) {
  const theme = useTheme() as AppTheme;
  const styles = makeStyles(theme);
  
  // Use theme override if provided, otherwise use semantic theme
  const bgColor = themeOverride?.bg ?? theme.colors.surface;
  const textColor = themeOverride?.text ?? theme.colors.onSurface;
  const subtextColor = themeOverride?.subtext ?? theme.colors.onMuted;
  const borderColor = themeOverride?.border ?? theme.utils.alpha(theme.colors.onSurface, 0.08);
  const alpha = useSharedValue(0);
  const scale = useSharedValue(0.96);

  React.useEffect(() => {
    if (visible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      alpha.value = withTiming(1, { duration: 140 });
      scale.value = withSpring(1, springs.standard);
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
    const name = user ? `${user.firstName} ${user.lastName}`.trim() : 'Unknown User';
    const avatar = user?.avatar;

    return {
      userId: r.user,
      name,
      avatar: avatar ?? '',
      readAt: r.readAt,
    };
  });

  const top = Math.max(24, (anchor?.y ?? 200) - 12);
  const left = Math.max(12, (anchor?.x ?? 12) - 160);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      accessibilityViewIsModal
      accessibilityLabel="Read receipts"
    >
      {/* Backdrop */}
      <Pressable
        style={styles.backdrop}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close read receipts"
        accessibilityHint="Tap outside to close"
      >
        <Animated.View style={[styles.backdropFill, { opacity: alpha.value }]} />
      </Pressable>

      {/* Popover */}
      <Animated.View
        style={[
          styles.pop,
          popSty,
          {
            backgroundColor: bgColor,
            borderColor: borderColor,
            top,
            left,
          },
        ]}
        pointerEvents="box-none"
      >
        <Text style={[styles.title, { color: textColor }]} allowFontScaling>Read by</Text>

        {displayReceipts.length === 0 ? (
          <Text style={[styles.empty, { color: subtextColor }]} allowFontScaling>Nobody yet</Text>
        ) : (
          <View style={styles.list} accessibilityRole="list">
            {displayReceipts.map((r) => (
              <View
                key={r.userId}
                style={styles.row}
                accessibilityRole="listitem"
                accessibilityLabel={`${r.name} read at ${formatShort(r.readAt)}`}
              >
                {r.avatar ? (
                  <Image
                    source={{ uri: r.avatar }}
                    style={styles.avatar}
                    accessibilityRole="image"
                    accessibilityLabel={`${r.name}'s avatar`}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarFallback]} />
                )}
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.name, { color: textColor }]}
                    numberOfLines={1}
                    allowFontScaling
                  >
                    {r.name}
                  </Text>
                  <Text style={[styles.sub, { color: subtextColor }]} allowFontScaling>
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

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    backdrop: { position: 'absolute', inset: 0 },
    backdropFill: { flex: 1, backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.25) },
    pop: {
      position: 'absolute',
      width: 220,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      borderWidth: 1,
    },
    title: { fontSize: 12, fontWeight: '700', marginBottom: theme.spacing.sm, opacity: 0.9 },
    empty: { fontSize: 12 },
    list: { gap: theme.spacing.md },
    row: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
    avatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.1) },
    avatarFallback: { backgroundColor: theme.utils.alpha(theme.colors.onSurface, 0.15) },
    name: { fontSize: 13, fontWeight: '600' },
    sub: { fontSize: 11 },
  });
