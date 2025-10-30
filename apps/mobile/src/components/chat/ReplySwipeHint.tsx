import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, Extrapolate } from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';

interface ReplySwipeHintProps {
  progress: Animated.SharedValue<number> | number;
  align?: 'right' | 'left';
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
  align = 'right', // hint appears on left side of own bubble; align handles mirroring if needed
}: ReplySwipeHintProps) {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const sty = useAnimatedStyle(() => {
    const p = typeof progress === 'number' ? progress : progress.value / 56; // tolerate either
    const alpha = interpolate(p, [0, 0.15, 1], [0, 0.5, 1], Extrapolate.CLAMP);
    const tx = interpolate(p, [0, 1], [align === 'right' ? -10 : 10, 0]);
    return { opacity: alpha, transform: [{ translateX: tx }] };
  });

  return (
    <Animated.View
      style={[styles.wrap, sty, align === 'left' && { flexDirection: 'row-reverse' }]}
      accessibilityRole="button"
      accessibilityLabel="Swipe to reply"
    >
      <View style={styles.pill}>
        <Ionicons
          name="arrow-undo"
          size={14}
          color={theme.colors.onPrimary}
        />
        <Text style={styles.txt}>Reply</Text>
      </View>
    </Animated.View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    wrap: { position: 'absolute', bottom: -18, right: theme.spacing.sm },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.primary,
      opacity: 0.9,
    },
    txt: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.6875,
      fontWeight: theme.typography.h2.weight,
    },
  });
}
