import React, { useEffect } from 'react';
import { View, Image, Pressable, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/Provider';
import { useTranslation } from 'react-i18next';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import { haptic } from '../../ui/haptics';

export type ReplyTarget = {
  author?: string;
  text?: string;
  thumbnail?: string;
};

export default function ReplyPreviewBar({
  target,
  visible = false,
  onCancel,
  onPress,
}: {
  target?: ReplyTarget | null;
  visible?: boolean;
  onCancel: () => void;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const reduced = useReduceMotion();
  const { t } = useTranslation('chat');

  const y = useSharedValue(20);
  const alpha = useSharedValue(0);
  const x = useSharedValue(0);

  useEffect(() => {
    if (visible && target) {
      alpha.value = withTiming(1, { duration: 140 });
      y.value = reduced
        ? withTiming(0, { duration: 140 })
        : withSpring(0, { damping: 16, stiffness: 320 });
    } else {
      alpha.value = withTiming(0, { duration: 120 });
      y.value = withTiming(20, { duration: 120 });
      x.value = 0;
    }
  }, [visible, target, reduced]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      x.value = e.translationX;
    })
    .onEnd(() => {
      const threshold = 64;
      if (Math.abs(x.value) > threshold) {
        runOnJS(haptic.selection)();
        const dir = Math.sign(x.value) || 1;
        x.value = withTiming(dir * 260, { duration: 160 }, () => {
          runOnJS(onCancel)();
        });
      } else {
        x.value = reduced
          ? withTiming(0, { duration: 160 })
          : withSpring(0, { damping: 16, stiffness: 300 });
      }
    });

  const sty = useAnimatedStyle(() => ({
    opacity: alpha.value,
    transform: [{ translateY: y.value }, { translateX: x.value }],
  }));

  if (!target) return null;

  const styles = makeStyles(theme);

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[styles.wrap, sty]}
        testID="reply-preview"
        accessibilityRole="summary"
      >
        <View style={styles.leading} />
        <View style={styles.iconWrap}>
          <Ionicons name="arrow-undo" size={16} color={theme.colors.text} />
        </View>

        <Pressable style={styles.content} onPress={onPress} testID="reply-preview-content">
          <Text style={styles.author} numberOfLines={1}>
            {target.author ?? t('replyingTo')}
          </Text>
          <Text style={styles.snippet} numberOfLines={1}>
            {target.text ?? t('media')}
          </Text>
        </Pressable>

        {target.thumbnail ? (
          <Image source={{ uri: target.thumbnail }} style={styles.thumb} />
        ) : null}

        <Pressable
          onPress={() => {
            haptic.selection();
            onCancel();
          }}
          style={styles.close}
          hitSlop={12}
          testID="reply-preview-close"
          accessibilityLabel={t('dismiss')}
          accessibilityRole="button"
        >
          <Ionicons name="close" size={16} color={theme.colors.textMuted} />
        </Pressable>
      </Animated.View>
    </GestureDetector>
  );
}

const makeStyles = (theme: any) =>
  StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.bgAlt,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      gap: theme.spacing.sm,
    },
    leading: {
      width: 3,
      height: 28,
      borderRadius: theme.radius.sm,
      backgroundColor: theme.colors.primary,
    },
    iconWrap: { width: 20, alignItems: 'center' },
    content: { flex: 1, gap: 2 },
    author: {
      color: theme.colors.textMuted,
      fontSize: 12,
      fontWeight: '600',
    },
    snippet: {
      color: theme.colors.text,
      fontSize: 14,
      fontWeight: '500',
    },
    thumb: { width: 28, height: 28, borderRadius: theme.radius.sm, marginLeft: theme.spacing.sm },
    close: { padding: 6, marginLeft: theme.spacing.sm },
  });
