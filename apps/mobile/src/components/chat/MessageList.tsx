import React, { useCallback } from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import { Message } from '../hooks/useChatData';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { tokens } from '@pawfectmatch/design-tokens';

interface MessageListProps {
  messages: Message[];
  typingUsers: string[];
  isOnline: boolean;
  onMessagePress?: (message: Message) => void;
  onMessageLongPress?: (message: Message) => void;
  onRetryMessage?: (messageId: string) => void;
  flatListRef?: React.RefObject<FlatList>;
  onScroll?: (event: { nativeEvent: { contentOffset: { x: number; y: number } } }) => void;
}

export function MessageList({
  messages,
  typingUsers,
  isOnline,
  onMessagePress,
  onMessageLongPress,
  onRetryMessage,
  flatListRef,
  onScroll,
}: MessageListProps): React.JSX.Element {
  const renderMessage = useCallback(({ item, index }: { item: Message; index: number }) => (
    <MessageItem
      message={item}
      index={index}
      messages={messages}
      isOnline={isOnline}
      onPress={onMessagePress}
      onLongPress={onMessageLongPress}
      onRetry={onRetryMessage}
    />
  ), [messages, isOnline, onMessagePress, onMessageLongPress, onRetryMessage]);

  const renderTypingIndicator = useCallback(() => (
    <TypingIndicator typingUsers={typingUsers} />
  ), [typingUsers]);

  const keyExtractor = useCallback((item: Message) => item._id, []);

  const getItemLayout = useCallback((data: Message[] | null | undefined, index: number) => ({
    length: 80, // Approximate message height
    offset: 80 * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <FlatList
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
        ListFooterComponent={renderTypingIndicator}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    paddingBottom: tokens.spacing.lg,
  },
});