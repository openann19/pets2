# Message Bubble Component Setup

## Overview

The chat system now uses **`MessageBubbleEnhanced`** as the primary message bubble component with full feature integration including swipe-to-reply, gesture support, read receipts, and timestamp badges.

## Components Created

### 1. **MessageTimestampBadge.tsx**
- Animated timestamp display with fade/scale effects
- Toggle visibility with tap gesture
- 12-hour time format
- Fully customizable colors

### 2. **ReadByPopover.tsx**  
- Long-press popover showing message read recipients
- Displays avatars, names, and read times
- Spring-animated appearance with backdrop
- Dynamic positioning based on bubble anchor

### 3. **ReplySwipeHint.tsx** (already existed)
- Visual feedback during swipe-to-reply gesture
- Arrow indicator with "Reply" text
- Smooth fade based on swipe progress

## Usage

### Import the Enhanced Component

```typescript
import { MessageBubbleEnhanced } from '@/components/chat';

// In your component
<MessageBubbleEnhanced
  message={message}
  isOwnMessage={isOwnMessage}
  currentUserId={currentUserId}
  messageIndex={index}
  totalMessages={total}
  showAvatars={true}
  petInfo={petInfo}
  users={userMap}
  onRetry={handleRetry}
  onReply={handleReply}
  onCopy={handleCopy}
  onReact={handleReact}
  onDelete={handleDelete}
  onShowReadBy={handleShowReadBy}
/>
```

## Features

### Gestures
- **Tap**: Toggles timestamp badge visibility
- **Swipe Right**: Reply to message (reply hint appears)
- **Long-Press**: Opens context menu with actions

### Context Menu Actions
- Reply
- Copy
- React
- Read by (for own delivered/read messages)
- Delete (for own messages)

### Status Detection
Automatically determines message status from `readBy` array:
- `sent` - Message sent but not delivered
- `delivered` - Read by someone (but not current user)
- `read` - Read by current user
- `failed` - Failed to send

### Animations
- **Swipe Animation**: Horizontal translation with ReplySwipeHint
- **Timestamp Badge**: Fade + scale on show/hide
- **ReadBy Popover**: Morph animation from bubble to menu
- **Shake Animation**: For failed message retry
- **Status Ticks**: Crossfade between states with pulse effect

## Props

```typescript
interface MessageBubbleEnhancedProps {
  message: Message;
  isOwnMessage: boolean;
  showStatus?: boolean;
  currentUserId: string;
  messageIndex?: number;
  totalMessages?: number;
  showAvatars?: boolean;
  petInfo?: {
    name: string;
    species: string;
    mood?: "happy" | "excited" | "curious" | "sleepy" | "playful";
  };
  users?: Map<string, User>; // For read receipt display
  onRetry?: () => void;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onShowReadBy?: (message: Message) => void;
}
```

## Exports

```typescript
// Enhanced version (recommended)
export { MessageBubbleEnhanced } from "./MessageBubbleEnhanced";

// Basic legacy version
export { MessageBubble as BasicMessageBubble } from "./MessageBubble";

// Supporting components
export { default as MessageTimestampBadge } from "./MessageTimestampBadge";
export { default as ReadByPopover } from "./ReadByPopover";
export { default as ReplySwipeHint } from "./ReplySwipeHint";
export { default as MessageStatusTicks } from "./MessageStatusTicks";
export { default as RetryBadge } from "./RetryBadge";
```

## Integration Notes

- **Haptic Feedback**: Provided for all major interactions
- **Theme Support**: Full dark/light mode support
- **Accessibility**: Proper roles, labels, and states
- **Performance**: All animations run on UI thread (Reanimated)
- **Type Safety**: Full TypeScript support with strict typing

## Migration

If using the old `MessageBubble`, simply replace:

```typescript
// Old
import { MessageBubble } from '@/components/chat';

// New  
import { MessageBubbleEnhanced } from '@/components/chat';

// Then use <MessageBubbleEnhanced ... />
```

## Files Modified

- `apps/mobile/src/components/chat/index.ts` - Updated exports
- `apps/mobile/src/components/chat/MessageBubble.tsx` - Added swipe-to-reply integration
- Created: `MessageTimestampBadge.tsx`, `ReadByPopover.tsx`, `MessageBubbleEnhanced.tsx`

