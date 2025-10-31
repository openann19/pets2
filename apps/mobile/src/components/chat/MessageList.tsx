import React, { useCallback } from 'react';
import {
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type { Message } from '../../hooks/useChatData';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { EmptyState } from '../empty/EmptyState';

const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

interface MessageListProps {
  messages: Message[];
  typingUsers: string[];
  isOnline: boolean;
  currentUserId: string;
  matchId: string;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
  onRetryMessage?: (messageId: string) => void;
  flatListRef?: React.RefObject<FlashList<Message>>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function MessageList({
  messages,
  typingUsers,
  isOnline,
  currentUserId,
  matchId,
  onMessagePress,
  onMessageLongPress,
  onRetryMessage,
  flatListRef,
  onScroll,
}: MessageListProps): React.JSX.Element {
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      // Use enhanced bubble for messages with reactions, attachments, or voice notes
      const hasEnhancements = 
        (item as Message & { reactions?: Record<string, number>; attachment?: unknown; voiceNote?: unknown })
          .reactions ||
        (item as Message & { reactions?: Record<string, number>; attachment?: unknown; voiceNote?: unknown })
          .attachment ||
        (item as Message & { reactions?: Record<string, number>; attachment?: unknown; voiceNote?: unknown })
          .voiceNote;
      
      if (hasEnhancements) {
        // Use MessageWithEnhancements for enhanced messages
        const { MessageWithEnhancements } = require('./MessageWithEnhancements');
        const isOwnMessage = item.senderId === currentUserId;
        return (
          <MessageWithEnhancements
            message={item as Message & {
              reactions?: Record<string, number>;
              attachment?: { type: 'image' | 'video' | 'file'; url: string; name?: string; size?: number };
              voiceNote?: { url: string; duration: number; waveform?: number[] };
            }}
            isOwnMessage={isOwnMessage}
            currentUserId={currentUserId}
            matchId={matchId}
            onReply={onMessagePress ? () => onMessagePress(item) : undefined}
            onCopy={onMessagePress ? () => onMessagePress(item) : undefined}
          />
        );
      }
      
      // Use standard MessageItem for regular messages
      return (
        <View>
          <MessageItem
            message={item}
            index={index}
            messages={messages}
            isOnline={isOnline}
            {...(onMessagePress && { onPress: onMessagePress })}
            {...(onMessageLongPress && { onLongPress: onMessageLongPress })}
            {...(onRetryMessage && { onRetry: onRetryMessage })}
          />
        </View>
      );
    },
    [messages, isOnline, onMessagePress, onMessageLongPress, onRetryMessage, currentUserId, matchId],
  );

  const renderTypingIndicator = useCallback(
    () => <TypingIndicator typingUsers={typingUsers} />,
    [typingUsers],
  );

  const renderEmptyState = useCallback(
    () => (
      <EmptyState
        icon="chatbubbles-outline"
        title="Start the conversation"
        subtitle="Send a message to start chatting!"
        variant="info"
      />
    ),
    [],
  );

  const keyExtractor = useCallback((item: Message) => item._id, []);

  // Estimated item size for FlashList (more efficient than getItemLayout)
  const getItemType = useCallback((item: Message) => {
    // Different item types for better recycling
    if (item.audioUrl || item.type === 'image') return 'media';
    if (item.replyTo) return 'reply';
    return 'text';
  }, []);

  const estimatedItemSize = 80;

  return (
    <View style={styles.container}>
      <FlashList<Message>
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        estimatedItemSize={estimatedItemSize}
        getItemType={getItemType}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={100}
        // FlashList optimizations
        drawDistance={250} // Render items within 250px of viewport
        estimatedListSize={{ height: 800, width: 400 }} // Help FlashList optimize
        // Performance props
        removeClippedSubviews={true}
        ListEmptyComponent={messages.length === 0 ? renderEmptyState : undefined}
        ListFooterComponent={renderTypingIndicator}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.lg,
  },
});
