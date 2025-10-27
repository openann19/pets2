import React, { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import DoubleTapLikePlus from "./DoubleTapLikePlus";
import ReactionBarMagnetic from "../chat/ReactionBarMagnetic";

/**
 * Wraps content with:
 *  - Double tap to like (optimistic)
 *  - Long press to open reactions
 * Uses require-to-fail so a recognized long-press cancels double-tap.
 */
export interface LikeArbitratorProps {
  children: React.ReactNode;
  /** optimistic like toggle; return a cleanup function if you need cancel on undo */
  onLike: () => void | (() => void);
  /** fired if user undoes within the window or server rejects */
  onUndo?: () => void;
  /** fired when a reaction is chosen from the bar */
  onReact?: (emoji: string) => void;
  /** show undo pill for N ms (used by external UndoPill hook) */
  triggerUndo?: () => void;
  /** accessibility label for long-press */
  a11yLongPressLabel?: string;
}

export default function LikeArbitrator({
  children,
  onLike,
  onUndo,
  onReact,
  triggerUndo,
  a11yLongPressLabel = "Open reactions",
}: LikeArbitratorProps) {
  const [reactionsOpen, setReactionsOpen] = useState(false);

  // small lift when long-press begins (visual affordance)
  const lift = useSharedValue(0);
  const liftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: lift.value }],
  }));

  const closeReactions = useCallback(() => { setReactionsOpen(false); }, []);
  const openReactions = useCallback(() => { setReactionsOpen(true); }, []);

  const handleDoubleTap = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const cleanup = onLike();
    triggerUndo?.();
    // if onLike returns a cleanup, store it in closure of Undo (handled in hook usage)
    // nothing else needed here
  }, [onLike, triggerUndo]);

  const handleSelectReaction = useCallback(
    (emoji: string) => {
      Haptics.selectionAsync().catch(() => {});
      onReact?.(emoji);
      setReactionsOpen(false);
    },
    [onReact],
  );

  // --- GESTURES -------------------------------------------------------------

  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .minDuration(350)
        .maxDistance(8)
        .hitSlop({ top: 4, bottom: 4, left: 4, right: 4 })
        .onBegin(() => {
          lift.value = -4;
        })
        .onStart(() => {
          runOnJS(openReactions)();
        })
        .onFinalize(() => {
          lift.value = withSpring(0, { damping: 18, stiffness: 320 });
        }),
    [openReactions, lift],
  );

  const singleTap = Gesture.Tap()
    .maxDuration(220)
    .maxDistance(8)
    .onEnd((_e, ok) => {
      "worklet";
      if (!ok) return;
      // single taps just bounce the content a smidge for feedback (DoubleTapLikePlus already handles)
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(280)
    .maxDuration(260)
    .maxDistance(8)
    // CRITICAL: if long-press recognizes, double-tap must fail
    .requireExternalGestureToFail(longPress)
    .onEnd((_e, ok) => {
      "worklet";
      if (!ok) return;
      runOnJS(handleDoubleTap)();
    });

  // Exclusive: once one wins, the other cancels.
  const composed = Gesture.Exclusive(
    Gesture.Simultaneous(doubleTap, singleTap),
    longPress,
  );

  return (
    <View style={styles.root} accessible accessibilityLabel={a11yLongPressLabel}>
      <GestureDetector gesture={composed}>
        <Animated.View style={liftStyle}>
          <DoubleTapLikePlus onDoubleTap={handleDoubleTap}>
            {children}
          </DoubleTapLikePlus>
        </Animated.View>
      </GestureDetector>

      {reactionsOpen ? (
        <View style={styles.reactionOverlay} pointerEvents="box-none">
          <ReactionBarMagnetic
            onSelect={handleSelectReaction}
            onCancel={closeReactions}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { position: "relative" },
  reactionOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
});

