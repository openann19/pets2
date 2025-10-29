import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import type { ViewStyle } from 'react-native';

interface WindowWithUndoPill extends Window {
  __undoPillShow?: () => void;
  __undoPillHide?: () => void;
}

export interface UndoPillProps {
  /** visible window in ms */
  duration?: number;
  /** called if user taps Undo before the window finishes */
  onUndo: () => void;
  /** top-level style override */
  style?: ViewStyle;
  /** testID for testing */
  testID?: string;
}

/**
 * Animated pill that slides in, shows a shrinking progress bar, and slides out.
 * Fully UI-thread driven (no JS timers). Exposes an imperative .trigger() via ref.
 */
export default function UndoPill({ duration = 2000, onUndo, style, testID }: UndoPillProps) {
  const visible = useSharedValue(0); // 0 hidden, 1 shown
  const progress = useSharedValue(0); // 0..1

  // expose an imperative trigger via event channel (simple pattern: call window.dispatchEvent…)
  // OR control from parent via key change. For simplicity we use mount-level trigger helpers.
  const firstMount = useRef(true);

  // Animate show/hide logic whenever visible flips to 1
  useAnimatedReaction(
    () => visible.value,
    (v, prev) => {
      if (v === 1 && prev !== undefined && prev !== 1) {
        // slide in
        // progress goes 1->0 over duration; when reaches 0, auto-hide + finalize
        progress.value = 1;
        progress.value = withTiming(0, { duration });
      } else if (v === 0 && prev !== undefined && prev !== 1) {
        // reset progress for next time
        progress.value = 0;
      }
    },
    [],
  );

  // Slide/opacity styles
  const wrapStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withSpring(visible.value ? 0 : 20, {
          damping: 16,
          stiffness: 240,
        }),
      },
    ],
    opacity: withTiming(visible.value ? 1 : 0, { duration: 120 }),
  }));

  const barWidth = useAnimatedStyle(() => {
    const percentage = progress.value * 100;
    return {
      flexGrow: percentage,
      flexShrink: 0,
      flexBasis: 0,
    };
  });

  // Detect auto-dismiss (progress reached 0)
  useAnimatedReaction(
    () => progress.value,
    (val, prev) => {
      if (prev && prev > 0 && val <= 0) {
        // time's up — hide
        visible.value = 0;
      }
    },
    [],
  );

  const performUndo = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
    onUndo();
  };

  const onPressUndo = () => {
    // quick shake + hide
    Haptics.selectionAsync().catch(() => {});
    // little shake animation
    // use withSequence so it's still UI-thread
    // We just "jog" the progress to zero faster (instant cancel), then hide
    progress.value = withTiming(0, { duration: 150 });
    runOnJS(performUndo)();
  };

  // Public trigger helpers — you can keep these or call setShow from parent by toggling key
  useEffect(() => {
    // attach to window for imperative calls:
    const show = () => {
      visible.value = 1;
    };
    const hide = () => {
      visible.value = 0;
    };
    if (typeof window !== 'undefined') {
      const win = window as unknown as WindowWithUndoPill;
      win.__undoPillShow = show;
      win.__undoPillHide = hide;
    }

    return () => {
      if (typeof window !== 'undefined') {
        const win = window as unknown as WindowWithUndoPill;
        delete win.__undoPillShow;
        delete win.__undoPillHide;
      }
    };
  }, [visible]);

  return (
    <Animated.View
      style={[styles.wrap, style, wrapStyle]}
      pointerEvents="box-none"
      testID={testID}
    >
      <View style={styles.pill}>
        <Text style={styles.txt}>Liked • </Text>
        <Pressable
          onPress={onPressUndo}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Undo like"
        >
          <Text style={[styles.txt, styles.undo]}>Undo</Text>
        </Pressable>
      </View>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressBar, barWidth]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#111',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  txt: { color: '#fff', fontWeight: '600' },
  undo: { textDecorationLine: 'underline' },
  progressTrack: {
    marginTop: 6,
    height: 2,
    width: '60%',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#ec4899',
  },
});
