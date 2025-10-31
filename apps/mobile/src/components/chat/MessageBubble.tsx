/**
 * MessageBubble Component
 * Main component that orchestrates message display with all enhancements
 */

import { useTheme } from '@/theme';
import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useReduceMotion } from '../../hooks/useReducedMotion';
import { useBubbleRetryShake } from '../../hooks/useBubbleRetryShake';
import { MessageBubbleActions } from './MessageBubbleActions';
import { MessageBubbleAvatar } from './MessageBubbleAvatar';
import { MessageBubbleContent } from './MessageBubbleContent';
import { MessageBubbleMeta } from './MessageBubbleMeta';
import { MessageBubbleMilestone } from './MessageBubbleMilestone';
import { createMessageBubbleStyles } from './MessageBubbleStyles';
import type { MessageStatus } from './MessageStatusTicks';
import type { MessageWithStatus } from './MessageBubbleTypes';

interface MessageBubbleProps {
  message: MessageWithStatus;
  isOwnMessage: boolean;
  showStatus?: boolean;
  currentUserId: string;
  messageIndex?: number; // For milestone tracking
  totalMessages?: number; // For milestone tracking
  showAvatars?: boolean; // Enable living pet avatars
  petInfo?: {
    name: string;
    species: string;
    mood?: 'happy' | 'excited' | 'curious' | 'sleepy' | 'playful';
  };
  onRetry?: (message: MessageWithStatus) => Promise<boolean> | boolean;
  onReply?: (message: MessageWithStatus) => void;
  onCopy?: (message: MessageWithStatus) => void;
  onReact?: (message: MessageWithStatus) => void;
  onDelete?: (message: MessageWithStatus) => void;
  onShowReadBy?: (message: MessageWithStatus) => void;
}

/**
 * Optimized Message Bubble Component
 * Handles message display, status indicators, and theming
 */
export function MessageBubble({
  message,
  isOwnMessage,
  showStatus = true,
  currentUserId,
  messageIndex,
  totalMessages,
  showAvatars = false,
  petInfo,
  onRetry,
  onReply,
  onCopy,
  onReact,
  onDelete,
  onShowReadBy,
}: MessageBubbleProps): React.JSX.Element {
  const theme = useTheme();
  const shouldReduceMotion = useReduceMotion();
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();
  const styles = useMemo(() => createMessageBubbleStyles(theme), [theme]);

  // Default status if not provided
  const messageStatus: MessageStatus = message.status || 'sent';

  // Build accessibility label
  const senderName = typeof message.sender === 'object' && message.sender && 'name' in message.sender 
    ? (message.sender as { name?: string }).name || 'Unknown' 
    : 'Unknown';
  const messageTypeLabel =
    message.messageType === 'text'
      ? 'text message'
      : message.messageType === 'image'
        ? 'image'
        : message.messageType === 'voice'
          ? 'voice message'
          : message.messageType === 'video'
            ? 'video'
            : message.messageType === 'gif'
              ? 'GIF'
              : message.messageType === 'sticker'
                ? 'sticker'
                : 'message';
  const accessibilityLabel = isOwnMessage
    ? `Your ${messageTypeLabel}: ${message.content}`
    : `${messageTypeLabel} from ${senderName}: ${message.content}`;
  const accessibilityHint = isOwnMessage
    ? 'Long press for options'
    : 'Swipe right or long press to reply';

  const handleRetry = async () => {
    if (!onRetry) return;
    const result = await Promise.resolve(onRetry(message)).catch(() => false);
    if (!result) {
      shake();
    }
  };

  // For media messages (image, voice, video, gif), render simplified version
  if (
    message.messageType === 'image' ||
    message.messageType === 'voice' ||
    message.messageType === 'video' ||
    message.messageType === 'gif' ||
    message.messageType === 'sticker'
  ) {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessible
      >
        <MessageBubbleContent message={message} isOwnMessage={isOwnMessage} />
        <MessageBubbleMeta
          message={message}
          isOwnMessage={isOwnMessage}
          showStatus={showStatus}
          currentUserId={currentUserId}
          {...(messageStatus === 'failed' && onRetry ? { onRetry: handleRetry } : {})}
        />
      </View>
    );
  }

  // For text messages, render full enhanced version
  return (
    <MessageBubbleActions
      message={message}
      isOwnMessage={isOwnMessage}
      messageStatus={messageStatus}
      {...(onReply !== undefined ? { onReply } : {})}
      {...(onCopy !== undefined ? { onCopy } : {})}
      {...(onReact !== undefined ? { onReact } : {})}
      {...(onDelete !== undefined ? { onDelete } : {})}
      {...(onShowReadBy !== undefined ? { onShowReadBy } : {})}
    >
      <Animated.View
        style={[
          StyleSheet.flatten([
            styles.messageContainer,
            isOwnMessage ? styles.ownContainer : styles.otherContainer,
          ]),
          ...(isOwnMessage && messageStatus === 'failed' && bubbleShakeStyle && !shouldReduceMotion ? [bubbleShakeStyle] : []),
        ]}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessible
      >
        {/* Milestone Badge */}
        {(messageIndex !== undefined || totalMessages !== undefined) && (
          <MessageBubbleMilestone 
            {...(messageIndex !== undefined ? { messageIndex } : {})} 
            {...(totalMessages !== undefined ? { totalMessages } : {})} 
          />
        )}

        {/* Pet Avatar */}
        <MessageBubbleAvatar
          isOwnMessage={isOwnMessage}
          showAvatars={showAvatars}
          {...(petInfo !== undefined ? { petInfo } : {})}
        />

        {/* Message Content */}
        <MessageBubbleContent message={message} isOwnMessage={isOwnMessage} />

        {/* Timestamp and status */}
        <MessageBubbleMeta
          message={message}
          isOwnMessage={isOwnMessage}
          showStatus={showStatus}
          currentUserId={currentUserId}
          {...(messageStatus === 'failed' && onRetry ? { onRetry: handleRetry } : {})}
        />
      </Animated.View>
    </MessageBubbleActions>
  );
}

export default MessageBubble;
