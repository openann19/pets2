import React, { useCallback } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { Message } from "../../hooks/useChatData";
import { ReactionBubble } from "./MessageReactions";
import { tokens } from "@pawfectmatch/design-tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  isOnline: boolean;
  onPress?: (message: Message) => void;
  onLongPress?: (message: Message, event?: any) => void;
  onRetry?: (messageId: string) => void;
  onReactionPress?: (messageId: string, emoji: string) => void;
  onAddReaction?: (messageId: string) => void;
}

export function MessageItem({
  message,
  index,
  messages,
  isOnline,
  onPress,
  onLongPress,
  onRetry,
  onReactionPress,
  onAddReaction,
}: MessageItemProps): React.JSX.Element {
  const { colors } = useTheme();

  const isMyMessage =
    message.senderId === "me" || message.senderId === "current-user";
  const showAvatar =
    !isMyMessage &&
    (index === 0 || messages[index - 1]?.senderId !== message.senderId);
  const showTime =
    index === messages.length - 1 ||
    messages[index + 1]?.senderId !== message.senderId ||
    new Date(messages[index + 1]?.timestamp || message.timestamp).getTime() -
      new Date(message.timestamp).getTime() >
      300000;
  const showDateHeader = shouldShowDateHeader(message, messages[index - 1]);
  const hasError = message.error === true;

  const formatMessageTime = useCallback((timestamp: string): string => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const isToday = messageTime.toDateString() === now.toDateString();

    if (isToday) {
      return messageTime.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } else {
      return messageTime.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }, []);

  const getDateHeader = useCallback((timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === now.toDateString()) {
      return "Today";
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return messageDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }
  }, []);

  const handlePress = useCallback(() => {
    onPress?.(message);
  }, [message, onPress]);

  const handleLongPress = useCallback((event: any) => {
    onLongPress?.(message, event);
  }, [message, onLongPress]);

  const handleRetry = useCallback(() => {
    onRetry?.(message._id);
  }, [message._id, onRetry]);

  const handleReactionPress = useCallback((emoji: string) => {
    onReactionPress?.(message._id, emoji);
  }, [message._id, onReactionPress]);

  const handleAddReaction = useCallback(() => {
    onAddReaction?.(message._id);
  }, [message._id, onAddReaction]);

  return (
    <View>
      {/* Date Header */}
      {showDateHeader && (
        <View style={styles.dateHeader}>
          <BlurView intensity={20} style={styles.dateHeaderBlur}>
            <Text style={[styles.dateHeaderText, { color: colors.gray600 }]}>
              {getDateHeader(message.timestamp)}
            </Text>
          </BlurView>
        </View>
      )}

      {/* Message Container */}
      <View
        style={[
          styles.messageContainer,
          isMyMessage && styles.myMessageContainer,
        ]}
      >
        {/* Avatar */}
        {!isMyMessage && showAvatar && (
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100",
              }}
              style={[styles.avatar, isOnline && styles.avatarOnline]}
            />
            {isOnline && (
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: colors.success },
                ]}
              />
            )}
          </TouchableOpacity>
        )}
        {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}

        {/* Message Bubble */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPress ? handlePress : undefined}
          onLongPress={onLongPress ? handleLongPress : undefined}
          style={[
            styles.messageBubble,
            isMyMessage
              ? [styles.myMessage, { backgroundColor: colors.primary }]
              : [
                  styles.otherMessage,
                  {
                    backgroundColor: colors.white,
                    borderColor: colors.gray200,
                  },
                ],
            hasError && [
              styles.errorMessage,
              {
                backgroundColor: `${colors.error}20`,
                borderColor: colors.error,
              },
            ],
          ]}
        >
          {message.type === "image" ? (
            <Image
              source={{ uri: message.content }}
              style={styles.messageImage}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                { color: isMyMessage ? colors.white : colors.gray800 },
                hasError && { color: colors.error },
              ]}
            >
              {message.content}
            </Text>
          )}

          {/* Message Status */}
          {isMyMessage && (
            <View style={styles.messageStatus}>
              {message.status === "sending" && (
                <Text
                  style={[styles.sendingText, { color: `${colors.white}B3` }]}
                >
                  Sending...
                </Text>
              )}
              {message.status === "failed" && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={12} color={colors.error} />
                  <Text style={[styles.retryText, { color: colors.error }]}>
                    Retry
                  </Text>
                </TouchableOpacity>
              )}
              {hasError && (
                <View style={styles.errorIndicator}>
                  <Ionicons
                    name="alert-circle"
                    size={12}
                    color={colors.error}
                  />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Reactions */}
        {message.reactions && message.reactions.length > 0 && onReactionPress && onAddReaction && (
          <ReactionBubble
            reactions={message.reactions}
            onReactionPress={handleReactionPress}
            onAddReaction={handleAddReaction}
          />
        )}

        {/* Time and Read Receipt */}
        {showTime && (
          <View
            style={[
              styles.timeContainer,
              isMyMessage && {
                justifyContent: "flex-end",
                marginRight: tokens.spacing.sm,
              },
            ]}
          >
            <Text style={[styles.messageTime, { color: colors.gray500 }]}>
              {formatMessageTime(message.timestamp)}
            </Text>
            {isMyMessage && !hasError && (
              <View style={styles.readReceiptContainer}>
                <Ionicons
                  name={message.read ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={message.read ? colors.success : colors.gray500}
                  style={styles.readIndicator}
                />
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const shouldShowDateHeader = (
  currentMessage: Message,
  previousMessage?: Message,
): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();

  return currentDate !== previousDate;
};

const styles = StyleSheet.create({
  dateHeader: {
    alignItems: "center",
    marginVertical: tokens.spacing.md,
  },
  dateHeaderBlur: {
    borderRadius: tokens.borderRadius.lg,
    overflow: "hidden",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
  },
  dateHeaderText: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: tokens.spacing.xs,
    alignItems: "flex-end",
    paddingHorizontal: tokens.spacing.xs,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    position: "relative",
    marginRight: tokens.spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  avatarOnline: {
    borderColor: "#4CAF50",
  },
  avatarSpacer: {
    width: 40,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: -1,
    right: -1,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.xl,
    marginBottom: tokens.spacing.xs,
    position: "relative",
  },
  myMessage: {
    marginLeft: 40,
    borderBottomRightRadius: tokens.borderRadius.sm,
  },
  otherMessage: {
    borderBottomLeftRadius: tokens.borderRadius.sm,
    borderWidth: 0.5,
  },
  errorMessage: {
    borderWidth: 1,
  },
  messageText: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: tokens.borderRadius.md,
    resizeMode: "cover",
  },
  messageStatus: {
    position: "absolute",
    bottom: tokens.spacing.xs,
    right: tokens.spacing.xs,
  },
  sendingText: {
    fontSize: 10,
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: tokens.spacing.sm,
    paddingVertical: tokens.spacing.xs,
    borderRadius: tokens.borderRadius.md,
    marginTop: tokens.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  retryText: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
  },
  errorIndicator: {
    marginLeft: tokens.spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: tokens.spacing.xs,
    marginLeft: 40,
    marginBottom: tokens.spacing.xs,
  },
  messageTime: {
    fontSize: tokens.typography.body.fontSize,
    lineHeight: tokens.typography.body.lineHeight,
  },
  readReceiptContainer: {
    marginLeft: tokens.spacing.xs,
  },
  readIndicator: {
    marginLeft: tokens.spacing.xs,
  },
});
