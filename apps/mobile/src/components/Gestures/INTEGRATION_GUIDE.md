# Advanced Interaction Components - Integration Guide

This guide shows how to integrate the new advanced interaction components (LikeArbitrator, UndoPill, SendSparkle, MessageStatusTicks, etc.) into your app.

## Components Overview

### 1. LikeArbitrator + UndoPill + useLikeWithUndo

Combines double-tap to like with long-press for reactions, plus an undo mechanism.

**Usage Example:**

```tsx
import LikeArbitrator, { type LikeArbitratorProps } from "@/components/Gestures/LikeArbitrator";
import UndoPill from "@/components/feedback/UndoPill";
import { useLikeWithUndo } from "@/hooks/useLikeWithUndo";

function PostCard({ post }: { post: { id: string } }) {
  const { likeNow, triggerUndoPill, undoNow } = useLikeWithUndo({
    onLike: () => {
      // optimistic toggle
      likePostLocally(post.id);
      // return a cleanup to revert
      return () => unlikePostLocally(post.id);
    },
    onUndo: () => {
      // optional: also tell server if needed
      api.unlike(post.id).catch(() => {});
    },
  });

  return (
    <>
      <LikeArbitrator
        onLike={likeNow}
        triggerUndo={triggerUndoPill}
        onReact={(emoji) => api.react(post.id, emoji)}
      >
        {/* your media */}
        <YourImageComponent />
      </LikeArbitrator>

      {/* global position is fine; multiple cards can reuse the same pill */}
      <UndoPill onUndo={undoNow} />
    </>
  );
}
```

### 2. SendSparkle + useShake

Add particle bursts on successful send and shake animation on failure.

**Usage Example:**

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";
import { useRef } from "react";
import SendSparkle, { SendSparkleHandle } from "@/components/feedback/SendSparkle";
import { useShake } from "@/hooks/useShake";

function MobileChat({ onSendMessage }) {
  const sendScale = useSharedValue(1);
  const sendBtnStyle = useAnimatedStyle(() => ({ transform: [{ scale: sendScale.value }] }));
  const sparkleRef = useRef<SendSparkleHandle>(null);
  const { style: inputShakeStyle, trigger: triggerShake } = useShake(10, 260);

  const pressBounce = () => {
    "worklet";
    sendScale.value = 0.92;
    sendScale.value = withSpring(1, { damping: 14, stiffness: 380 });
  };

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    // optimistic bounce
    pressBounce();
    try {
      const maybePromise = onSendMessage(inputText.trim(), "text");
      setInputText("");

      if (maybePromise && typeof (maybePromise as any).then === "function") {
        const ok = await (maybePromise as Promise<any>).then(() => true).catch(() => false);
        if (ok) {
          sparkleRef.current?.burst();
        } else {
          triggerShake();
        }
      } else {
        // sync handler: assume success
        sparkleRef.current?.burst();
      }
    } catch {
      triggerShake();
    }
  };

  return (
    <Animated.View style={[styles.inputRow, inputShakeStyle]}>
      <TextInput ... />

      <Animated.View style={sendBtnStyle}>
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? colors.primary : colors.gray400 }]}
          onPress={handleSendText}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="white" />
          {/* Sparkles anchored to the bottom-right of the button */}
          <SendSparkle ref={sparkleRef} />
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}
```

### 3. MessageStatusTicks + RetryBadge + useBubbleRetryShake

Show message status (sending → sent → delivered → read) with retry capability.

**Usage Example:**

```tsx
import Animated from "react-native-reanimated";
import MessageStatusTicks, { type MessageStatus } from "@/components/chat/MessageStatusTicks";
import RetryBadge from "@/components/chat/RetryBadge";
import { useBubbleRetryShake } from "@/hooks/useBubbleRetryShake";

function MessageBubble({ message, onRetry }) {
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();

  const tryRetry = async () => {
    if (!onRetry) return;
    const result = await Promise.resolve(onRetry(message)).catch(() => false);
    if (!result) {
      // re-failed → shake
      shake();
    }
  };

  return (
    <Animated.View
      style={[styles.bubble, isOwnMessage ? styles.own : styles.other, bubbleShakeStyle]}
    >
      <Text style={styles.text}>{message.content}</Text>

      {/* footer row: ticks + optional retry */}
      {isOwnMessage && (
        <View style={styles.footerRow}>
          <MessageStatusTicks
            status={message.status}
            size={12}
            sentColor="#9ca3af"
            deliveredColor="#9ca3af"
            readColor="#3b82f6"
            failedColor="#ef4444"
          />
          {message.status === "failed" ? (
            <RetryBadge onPress={tryRetry} />
          ) : null}
        </View>
      )}
    </Animated.View>
  );
}
```

## Message Status Flow

When you enqueue the message:
- `status = "sending"` (shows pulsing clock icon)

If the POST succeeds:
- `status = "sent"` (shows single checkmark)

On delivery receipt:
- `status = "delivered"` (shows double checkmark)

On read receipt:
- `status = "read"` (shows blue double checkmark)

If the send fails:
- `status = "failed"` (shows red alert icon + retry badge appears)

## Features

- **Gesture arbitration**: Long-press overrides double-tap
- **Optimistic updates**: Immediate UI feedback
- **Undo mechanism**: Two-second window to undo actions
- **Particle effects**: UI-thread animations for sparkles
- **Status indicators**: Animated transitions between states
- **Retry capability**: Failed messages can be retried with shake feedback
- **Accessibility**: All components include proper a11y labels

## Integration Points

1. **Posts/Media Cards**: Use `LikeArbitrator` + `UndoPill`
2. **Chat Input**: Use `SendSparkle` + `useShake`
3. **Message Bubbles**: Use `MessageStatusTicks` + `RetryBadge` + `useBubbleRetryShake`

