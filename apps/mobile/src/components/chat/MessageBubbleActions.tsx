/**
 * MessageBubbleActions Component
 * Handles gestures (swipe, long-press) and context menu
 */

import { useTheme } from '@mobile/theme';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, runOnJS, useAnimatedRef, type AnimatedStyle } from 'react-native-reanimated';

import { useReduceMotion } from '../../hooks/useReducedMotion';
import { useSwipeToReply } from '../../hooks/useSwipeToReply';
import MorphingContextMenu, { type ContextAction } from '../menus/MorphingContextMenu';
import type { MessageStatus } from './MessageStatusTicks';
import type { MessageWithStatus } from './MessageBubbleTypes';
import ReplySwipeHint from './ReplySwipeHint';

interface MessageBubbleActionsProps {
  message: MessageWithStatus;
  isOwnMessage: boolean;
  messageStatus: MessageStatus;
  onReply?: (message: MessageWithStatus) => void;
  onCopy?: (message: MessageWithStatus) => void;
  onReact?: (message: MessageWithStatus) => void;
  onDelete?: (message: MessageWithStatus) => void;
  onShowReadBy?: (message: MessageWithStatus) => void;
  children: React.ReactNode;
  bubbleStyle?: AnimatedStyle<Record<string, unknown>>;
}

export function MessageBubbleActions({
  message,
  isOwnMessage,
  messageStatus,
  onReply,
  onCopy,
  onReact,
  onDelete,
  onShowReadBy,
  children,
  bubbleStyle: externalBubbleStyle,
}: MessageBubbleActionsProps): React.JSX.Element {
  const theme = useTheme();
  const shouldReduceMotion = useReduceMotion();
  const bubbleRef = useAnimatedRef<Animated.View>();
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchor, setAnchor] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>();

  // Swipe-to-reply gesture
  const {
    gesture: swipeGesture,
    bubbleStyle: swipeBubbleStyle,
    progressX,
  } = useSwipeToReply({
    enabled: true,
    onReply: onReply || (() => {}),
    payload: message,
  });

  const bubbleStyle = externalBubbleStyle || swipeBubbleStyle;

  // Long-press gesture for context menu
  const handleOpenMenu = (rect: { x: number; y: number; width: number; height: number }) => {
    setAnchor(rect);
    setMenuVisible(true);
    Haptics.selectionAsync().catch(() => {});
  };

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .maxDistance(10)
    .onStart(() => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const m = measure(bubbleRef);
      if (m !== null) {
        // Type guard for measure result - measure returns { pageX, pageY, width, height }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
        const measureResult = m as { pageX: number; pageY: number; width: number; height: number };
        const rect = {
          x: measureResult.pageX,
          y: measureResult.pageY,
          width: measureResult.width,
          height: measureResult.height,
        };
        runOnJS(handleOpenMenu)(rect);
      }
      runOnJS(setMenuVisible)(true);
      Haptics.selectionAsync().catch(() => {});
    });

  const tap = Gesture.Tap();
  const composed = Gesture.Exclusive(swipeGesture, Gesture.Simultaneous(longPress, tap));

  // Menu actions
  const canReadBy = isOwnMessage && (messageStatus === 'delivered' || messageStatus === 'read');
  const actions: ContextAction[] = [
    { key: 'reply', label: 'Reply', icon: 'arrow-undo', onPress: () => onReply?.(message) },
    { key: 'copy', label: 'Copy', icon: 'copy', onPress: () => onCopy?.(message) },
    { key: 'react', label: 'React…', icon: 'happy', onPress: () => onReact?.(message) },
    ...(canReadBy
      ? [{ key: 'readby', label: 'Read by…', icon: 'eye', onPress: () => onShowReadBy?.(message) }]
      : []),
    ...(isOwnMessage
      ? [
          {
            key: 'delete',
            label: 'Delete',
            icon: 'trash',
            onPress: () => onDelete?.(message),
            danger: true,
          },
        ]
      : []),
  ];

  return (
    <>
      <GestureDetector gesture={composed}>
        <Animated.View
          ref={bubbleRef}
          accessibilityRole="button"
          accessibilityLabel={isOwnMessage ? 'Your message' : 'Message from other user'}
          accessibilityHint={
            isOwnMessage
              ? 'Long press to open message options menu'
              : 'Swipe right or long press to reply to this message'
          }
          accessibilityState={{ disabled: false }}
        >
          <Animated.View style={bubbleStyle}>
            {children}
          </Animated.View>
          {/* Reply swipe hint - appears during swipe */}
          {!isOwnMessage && !shouldReduceMotion && (
            <ReplySwipeHint
              progress={progressX}
              align="right"
            />
          )}
        </Animated.View>
      </GestureDetector>

      {/* Context menu */}
      {anchor && (
        <MorphingContextMenu
          visible={menuVisible}
          onClose={() => {
            setMenuVisible(false);
          }}
          anchor={anchor}
          actions={actions}
          theme={{
            bg: theme.colors.surface,
            border: theme.colors.border,
            text: theme.colors.onSurface,
            sub: theme.colors.onMuted,
            item: theme.colors.bg,
            itemPressed: theme.colors.surface,
          }}
        />
      )}
    </>
  );
}

