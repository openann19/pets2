import { useTheme } from '@/theme';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { springs } from '@/foundation/motion';

export interface MessageTimestampBadgeProps {
  iso: string; // ISO time
  visible?: boolean; // controls anim in/out
  textColor?: string;
  bgColor?: string;
  accentColor?: string; // for tiny dot
}

function formatClock(iso: string): string {
  const d = new Date(iso);
  const hh = d.getHours();
  const mm = d.getMinutes();
  const h12 = ((hh + 11) % 12) + 1;
  const ampm = hh >= 12 ? 'PM' : 'AM';
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  return `${h12}:${pad(mm)} ${ampm}`;
}

export default function MessageTimestampBadge({
  iso,
  visible = true,
  textColor,
  bgColor,
  accentColor,
}: MessageTimestampBadgeProps) {
  const { colors } = useTheme();

  const finalTextColor = textColor || colors.onSurface;
  const finalBgColor = bgColor || colors.surface;
  const finalAccentColor = accentColor || colors.primary;
  const shown = useSharedValue(visible ? 1 : 0);

  useEffect(() => {
    shown.value = visible
      ? withSpring(1, springs.standard)
      : withTiming(0, { duration: 120 });
  }, [visible]);

  const sty = useAnimatedStyle(() => ({
    opacity: shown.value,
    transform: [{ scale: 0.96 + 0.04 * shown.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, { backgroundColor: finalBgColor }, sty]}>
      <View style={[styles.dot, { backgroundColor: finalAccentColor }]} />
      <Text style={[styles.txt, { color: finalTextColor }]}>{formatClock(iso)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 6,
  },
  dot: { width: 4, height: 4, borderRadius: 2 },
  txt: { fontSize: 11, fontWeight: '600' },
});
