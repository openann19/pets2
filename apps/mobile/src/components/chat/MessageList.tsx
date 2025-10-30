import React, { useCallback } from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from 'react-native';
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
  flatListRef?: React.RefObject<FlatList<Message>>;
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function MessageList({
  messages,
  typingUsers,
  isOnline,
  currentUserId: _currentUserId,
  matchId: _matchId,
  onMessagePress,
  onMessageLongPress,
  onRetryMessage,
  flatListRef,
  onScroll,
}: MessageListProps): React.JSX.Element {
  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      // Use enhanced bubble when in production-ready mode
      // For now, keep using MessageItem for compatibility
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
    [messages, isOnline, onMessagePress, onMessageLongPress, onRetryMessage],
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

  const getItemLayout = useCallback(
    (data: ArrayLike<Message> | null | undefined, index: number) => {
      // Dynamic height calculation based on message content
      const message = data?.[index];
      let estimatedHeight = 80;

      if (message) {
        // Account for message content
        if (message.content.length > 100) estimatedHeight += 20;

        // Account for reply to message
        if (message.replyTo) estimatedHeight += 40;

        // Account for attachment
        if (message.audioUrl || message.type === 'image') estimatedHeight += 120;
      }

      return {
        length: estimatedHeight,
        offset: estimatedHeight * index,
        index,
      };
    },
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList<Message>
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
        onScroll={onScroll}
        scrollEventThrottle={100}
        initialNumToRender={20}
        windowSize={10}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
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
