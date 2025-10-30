import { useCallback } from 'react';
import { Platform } from 'react-native';
import { Gesture } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

export interface UseSwipeToReplyOpts<T = unknown> {
  enabled?: boolean;
  threshold?: number; // px to trigger
  maxPull?: number; // max translation
  onReply: (payload: T) => void;
  payload: T; // message object/id to pass back
  onProgress?: (p: number) => void; // 0..1 pull progress
}

/**
 * useSwipeToReply - Swipe to reply gesture hook with haptic feedback
 *
 * Implements a pull-to-right gesture with:
 * - Haptic tick on threshold cross
 * - Spring-animated snap-back on release
 * - Configurable threshold and max pull distance
 * - Progress callback for visual feedback
 */
export function useSwipeToReply<T>({
  enabled = true,
  threshold = 56,
  maxPull = 84,
  onReply,
  payload,
  onProgress,
}: UseSwipeToReplyOpts<T>) {
  const x = useSharedValue(0);
  const crossed = useSharedValue(false);

  const vibrate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
  };

  const gesture = Gesture.Pan()
    .enabled(enabled)
    .activeOffsetX([6, 9999]) // start only on right drag
    .failOffsetY([16, -16]) // keep vertical tolerant
    .onUpdate((e) => {
      const nx = Math.min(Math.max(e.translationX, 0), maxPull);
      x.value = nx;
      const p = Math.min(1, nx / threshold);
      if (onProgress) runOnJS(onProgress)(p);
      if (nx >= threshold && !crossed.value) {
        crossed.value = true;
        runOnJS(vibrate)();
      }
      if (nx < threshold && crossed.value) {
        crossed.value = false;
      }
    })
    .onEnd(() => {
      const didTrigger = x.value >= threshold;
      if (didTrigger) {
        runOnJS(onReply)(payload);
      }
      x.value = withSpring(0, { damping: 16, stiffness: 300 });
      if (onProgress) runOnJS(onProgress)(0);
      crossed.value = false;
    });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }],
  }));

  return { gesture, bubbleStyle, progressX: x };
}
