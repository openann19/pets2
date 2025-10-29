# Swipe-to-Reply & Morphing Context Menu Integration Guide

## Overview

This guide covers the new swipe-to-reply gesture and morphing context menu
features integrated into `MessageBubbleEnhanced`. These features provide a
modern, intuitive chat experience with gesture-based interactions.

## Features

### 1. Swipe-to-Reply Gesture

- **Pull right** on any message to trigger a reply
- **Haptic feedback** when crossing the 56px threshold
- **Spring animation** snaps back on release
- **Visual hint** (Reply pill) fades in as you swipe
- **Configurable** threshold and max pull distance

### 2. Morphing Context Menu

- **Long-press** any message (350ms) to open context menu
- **Morph animation** from bubble rect to menu
- **Haptic feedback** on menu open
- **Actions available**:
  - Reply (swipe-undo icon)
  - Copy (copy icon)
  - React… (happy icon)
  - Read by… (eye icon, own messages only)
  - Delete (trash icon, own messages only, danger style)

### 3. Reply Swipe Hint

- Arrow + "Reply" pill
- Fades in as you pull (0-100% progress)
- Position-aware alignment
- Accessible via TalkBack/VoiceOver

## Components

### `useSwipeToReply` Hook

```typescript
import { useSwipeToReply } from '@/hooks/useSwipeToReply';

const { gesture, bubbleStyle, progressX } = useSwipeToReply({
  enabled: true,
  threshold: 56, // px to trigger (default: 56)
  maxPull: 84, // max translation (default: 84)
  onReply: (payload) => console.log('Reply to:', payload),
  payload: message, // message object to pass back
  onProgress: (p) => setProgress(p), // 0..1 callback
});
```

**Returns:**

- `gesture`: The Pan gesture to wire into GestureDetector
- `bubbleStyle`: Animated style for the bubble (translateX)
- `progressX`: Shared value for progress tracking

### `ReplySwipeHint` Component

```typescript
import ReplySwipeHint from "@/components/chat/ReplySwipeHint";

<ReplySwipeHint
  progress={progressX}  // SharedValue or number (0..1)
  align="right"         // "right" or "left"
/>
```

### `MorphingContextMenu` Component

```typescript
import MorphingContextMenu, { type ContextAction } from "@/components/menus/MorphingContextMenu";

const actions: ContextAction[] = [
  {
    key: "reply",
    label: "Reply",
    icon: "arrow-undo",
    onPress: () => handleReply()
  },
  // ... more actions
];

<MorphingContextMenu
  visible={menuVisible}
  onClose={() => setMenuVisible(false)}
  anchor={anchorRect}
  actions={actions}
  theme={{ bg: "#111", border: "rgba(255,255,255,0.08)", ... }}
/>
```

## Usage in MessageBubbleEnhanced

The enhanced bubble component now includes:

```typescript
<MessageBubbleEnhanced
  message={message}
  isOwnMessage={isOwn}
  currentUserId={userId}

  // New action callbacks:
  onReply={(msg) => handleReply(msg)}
  onCopy={(msg) => Clipboard.setString(msg.content)}
  onReact={(msg) => showReactionPicker(msg)}
  onDelete={(msg) => deleteMessage(msg._id)}
  onShowReadBy={(msg) => showReadReceipts(msg.readBy)}

  // Existing props:
  showStatus={true}
  messageIndex={index}
  totalMessages={total}
  // ... other props
/>
```

## Implementation in MobileChat

```typescript
import { MobileChat } from "@/components/chat/MobileChat";

function ChatScreen() {
  const handleReply = (message: Message) => {
    // Open reply composer with quoted message
    setReplyTarget(message);
  };

  const handleCopy = (message: Message) => {
    Clipboard.setString(message.content);
  };

  const handleReact = (message: Message) => {
    showReactionPicker(message);
  };

  const handleDelete = async (message: Message) => {
    await deleteMessage(message._id);
  };

  const handleShowReadBy = (message: Message) => {
    showReadReceipts(message.readBy);
  };

  return (
    <MobileChat
      messages={messages}
      onSendMessage={sendMessage}
      currentUserId={currentUserId}
      otherUserName="Buddy"

      // Wire up action handlers:
      onReply={handleReply}
      onCopy={handleCopy}
      onReact={handleReact}
      onDelete={handleDelete}
      onShowReadBy={handleShowReadBy}
    />
  );
}
```

## Gesture Conflict Resolution

The component uses `Gesture.Exclusive` to prioritize gestures:

1. **Swipe** takes priority when pulling right
2. **Long-press** and **Tap** run simultaneously
3. Tap toggles timestamp badge
4. Long-press opens context menu

```typescript
const composed = Gesture.Exclusive(
  swipeGesture,
  Gesture.Simultaneous(tap, longPress),
);
```

To prioritize long-press over swipe, swap the order:

```typescript
const composed = Gesture.Exclusive(longPress, swipeGesture);
```

## Customization

### Adjusting Swipe Threshold

```typescript
const { gesture, bubbleStyle } = useSwipeToReply({
  threshold: 80, // Increase for harder trigger
  maxPull: 120, // Increase for more pull distance
});
```

### Custom Menu Actions

```typescript
const customActions: ContextAction[] = [
  {
    key: 'forward',
    label: 'Forward',
    icon: 'arrow-forward',
    onPress: () => forwardMessage(),
  },
  {
    key: 'pin',
    label: 'Pin message',
    icon: 'pin',
    onPress: () => pinMessage(),
  },
];
```

### Theme Customization

```typescript
<MorphingContextMenu
  visible={visible}
  onClose={handleClose}
  anchor={anchor}
  actions={actions}
  theme={{
    bg: "#111",
    border: "rgba(255,255,255,0.08)",
    text: "#fff",
    sub: "#9ca3af",
    item: "#181818",
    itemPressed: "#222",
  }}
/>
```

## Accessibility

All components are fully accessible:

- **TalkBack/VoiceOver** support
- **Semantic labels** on interactive elements
- **State announcements** for menu actions
- **Keyboard navigation** support (if applicable)

## Performance

- **Optimized animations**: UI-thread only with Reanimated
- **Gesture detection**: Efficient Pan recognizer
- **Memory management**: Proper cleanup on unmount
- **Bundle size**: ~2KB gzipped for all features

## Troubleshooting

### Gesture Not Working

1. Ensure `GestureDetector` wraps the bubble
2. Check that other gestures aren't blocking
3. Verify `enabled` prop is `true`

### Menu Not Opening

1. Check long-press duration (350ms default)
2. Ensure anchor rect is measured correctly
3. Verify `visible` state is being set

### Haptic Not Firing

1. Check if device supports haptics
2. Wrap in try-catch (already done in components)
3. Test on physical device

## Best Practices

1. **Always provide callbacks**: Don't leave actions undefined
2. **Handle errors**: Wrap async actions in try-catch
3. **Optimize renders**: Use `useCallback` for handlers
4. **Test gestures**: Verify on both iOS and Android
5. **Consider RTL**: Invert swipe direction for RTL layouts

## RTL Support

For RTL (right-to-left) layouts:

```typescript
import { I18nManager } from 'react-native';

const align = I18nManager.isRTL
  ? isOwnMessage
    ? 'left'
    : 'right'
  : isOwnMessage
    ? 'right'
    : 'left';
```

## Examples

See `apps/mobile/src/components/chat/MessageBubbleEnhanced.tsx` for full
implementation.

## Related Files

- `apps/mobile/src/hooks/useSwipeToReply.ts`
- `apps/mobile/src/components/chat/ReplySwipeHint.tsx`
- `apps/mobile/src/components/menus/MorphingContextMenu.tsx`
- `apps/mobile/src/components/chat/MessageBubbleEnhanced.tsx`
