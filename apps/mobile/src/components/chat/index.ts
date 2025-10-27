// Enhanced version with all features (swipe-to-reply, gesture support, read-by, timestamp badge)
export { MessageBubbleEnhanced } from "./MessageBubbleEnhanced";
// Basic version (legacy)
export { MessageBubble as BasicMessageBubble } from "./MessageBubble";
export { MobileVoiceRecorder } from "./MobileVoiceRecorder";
export { MessageInput } from "./MessageInput";
export { MessageList } from "./MessageList";
export { TypingIndicator } from "./TypingIndicator";
export { QuickReplies } from "./QuickReplies";
export { ReactionPicker } from "./ReactionPicker";
export { default as ReactionBarMagnetic } from "./ReactionBarMagnetic";
export { default as MessageStatusTicks } from "./MessageStatusTicks";
export { default as RetryBadge } from "./RetryBadge";
export { default as MessageTimestampBadge } from "./MessageTimestampBadge";
export { default as ReadByPopover } from "./ReadByPopover";
export { default as ReplySwipeHint } from "./ReplySwipeHint";
export { default as ReplyPreviewBar } from "./ReplyPreviewBar";

// Export types
export type { ReactionItem, ReactionBarMagneticProps } from "./ReactionBarMagnetic";
export type { MessageStatus, MessageStatusTicksProps } from "./MessageStatusTicks";
export type { MessageTimestampBadgeProps } from "./MessageTimestampBadge";
export type { ReadByPopoverProps, ReadReceiptDisplay } from "./ReadByPopover";
export type { ReplyTarget } from "./ReplyPreviewBar";
