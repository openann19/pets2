import React, { useCallback, useState } from "react";
import {
  FlatList,
  View,
  StyleSheet,
  Clipboard,
  Alert,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import type { Message } from "../../hooks/useChatData";
import { MessageItem } from "./MessageItem";
import { MessageBubbleEnhanced } from "./MessageBubbleEnhanced";
import { TypingIndicator } from "./TypingIndicator";
import { chatService } from "../../services/chatService";
import { matchesAPI } from "../../services/api";

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
  currentUserId,
  matchId,
  onMessagePress,
  onMessageLongPress,
  onRetryMessage,
  flatListRef,
  onScroll,
}: MessageListProps): React.JSX.Element {
  const [replyTarget, setReplyTarget] = useState<Message | null>(null);
  
  // Action handlers for enhanced bubble
  const handleReply = useCallback((message: Message) => {
    setReplyTarget(message);
  }, []);
  
  const handleCopy = useCallback((message: Message) => {
    Clipboard.setString(message.content);
  }, []);
  
  const handleReact = useCallback(async (message: Message) => {
    // Open reaction picker
    Alert.alert("Add Reaction", "Choose a reaction", [
      { text: "👍 Like", onPress: () => chatService.sendReaction(matchId, message._id, "like") },
      { text: "❤️ Love", onPress: () => chatService.sendReaction(matchId, message._id, "love") },
      { text: "😂 Laugh", onPress: () => chatService.sendReaction(matchId, message._id, "laugh") },
      { text: "Cancel", style: "cancel" },
    ]);
  }, [matchId]);
  
  const handleDelete = useCallback(async (message: Message) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            try {
              await matchesAPI.deleteMessage(matchId, message._id);
            } catch (error) {
              Alert.alert("Error", "Failed to delete message");
            }
          }
        },
      ]
    );
  }, [matchId]);
  
  const handleShowReadBy = useCallback((message: Message) => {
    Alert.alert("Read by", `Message was read by ${message.read ? "recipient" : "no one yet"}`);
  }, []);

  const renderMessage = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const isOwnMessage = item.senderId === currentUserId || item.senderId === "me";
      
      // Use enhanced bubble when in production-ready mode
      // For now, keep using MessageItem for compatibility
      return (
        <View>
          <MessageItem
            message={item}
            index={index}
            messages={messages}
            isOnline={isOnline}
            onPress={onMessagePress}
            onLongPress={onMessageLongPress}
            onRetry={onRetryMessage}
          />
        </View>
      );
    },
    [messages, isOnline, currentUserId, onMessagePress, onMessageLongPress, onRetryMessage],
  );

  const renderTypingIndicator = useCallback(
    () => <TypingIndicator typingUsers={typingUsers} />,
    [typingUsers],
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
