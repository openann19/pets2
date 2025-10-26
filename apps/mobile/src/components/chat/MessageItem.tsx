import React, { useCallback, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { Message } from "../../hooks/useChatData";
import { useTheme } from "../../theme/Provider";
import { getExtendedColors } from "../../theme/adapters";
import { ReactionPicker } from "./ReactionPicker";
import { chatService } from "../../services/chatService";
import { Theme } from '../../theme/unified-theme';
import { logger } from "../../services/logger";

interface MessageItemProps {
  message: Message;
  index: number;
  messages: Message[];
  isOnline: boolean;
  onPress?: (message: Message) => void;
  onLongPress?: (message: Message) => void;
  onRetry?: (messageId: string) => void;
}

export function MessageItem({
  message,
  index,
  messages,
  isOnline,
  onPress,
  onLongPress,
  onRetry,
}: MessageItemProps): React.JSX.Element {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({});

  const isMyMessage =
    message.senderId === "me" || message.senderId === "current-user";
  const showAvatar =
    !isMyMessage &&
    (index === 0 || messages[index - 1]?.senderId !== message.senderId);
  const nextMessage = messages[index + 1];
  const showTime =
    index === messages.length - 1 ||
    !nextMessage ||
    nextMessage.senderId !== message.senderId ||
    new Date(nextMessage.timestamp).getTime() -
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

  const handleLongPress = useCallback(() => {
    setShowReactionPicker(true);
    onLongPress?.(message);
  }, [message, onLongPress]);

  const handleReactionSelect = useCallback(
    async (reaction: string) => {
      try {
        if (message.matchId && message._id) {
          await chatService.sendReaction(message.matchId, message._id, reaction);
        }
        // Update local reactions
        setReactions((prev) => ({
          ...prev,
          [reaction]: (prev[reaction] || 0) + 1,
        }));
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Failed to send reaction", { error: err });
      }
      setShowReactionPicker(false);
    },
    [message],
  );

  const handleRetry = useCallback(() => {
    onRetry?.(message._id);
  }, [message._id, onRetry]);

  return (
    <View>
      {/* Date Header */}
      {showDateHeader && (
        <View style={styles.dateHeader}>
          <BlurView intensity={20} style={styles.dateHeaderBlur}>
            <Text style={[styles.dateHeaderText, { color: colors.textMuted }]}>
              {getDateHeader(message.timestamp)}
            </Text>
          </BlurView>
        </View>
      )}

      {/* Message Container */}
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : null,
        ]}
      >
        {/* Avatar */}
        {!isMyMessage && showAvatar && (
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100",
              }}
              style={[styles.avatar, isOnline ? styles.avatarOnline : null]}
            />
            {isOnline && (
              <View
                style={[
                  styles.onlineIndicator,
                  { backgroundColor: Theme.colors.status.success },
                ]}
              />
            )}
          </TouchableOpacity>
        )}
        {!isMyMessage && !showAvatar && <View style={styles.avatarSpacer} />}

        {/* Message Bubble */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handlePress}
          onLongPress={handleLongPress}
          style={[
            styles.messageBubble,
            isMyMessage
              ? [styles.myMessage, { backgroundColor: colors.primary }]
              : [
                  styles.otherMessage,
                  {
                    backgroundColor: Theme.colors.neutral[0],
                    borderColor: Theme.colors.neutral[200],
                  },
                ],
            hasError
              ? [
                  styles.errorMessage,
                  {
                    backgroundColor: `${Theme.colors.status.error}20`,
                    borderColor: Theme.colors.status.error,
                  },
                ]
              : null,
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
                { color: isMyMessage ? Theme.colors.neutral[0] : Theme.colors.neutral[800] },
                hasError ? { color: Theme.colors.status.error } : null,
              ]}
            >
              {message.content}
            </Text>
          )}

          {/* Message Status */}
          {isMyMessage && (
            <View style={styles.messageStatus}>
              {message.status === "sending" && (
                <Text style={[styles.sendingText, { color: `${Theme.colors.neutral[0]}B3` }]}> 
                  Sending...
                </Text>
              )}
              {message.status === "failed" && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons name="refresh" size={12} color={Theme.colors.status.error} />
                  <Text style={[styles.retryText, { color: Theme.colors.status.error }]}> 
                    Retry
                  </Text>
                </TouchableOpacity>
              )}
              {hasError && (
                <View style={styles.errorIndicator}>
                  <Ionicons
                    name="alert-circle"
                    size={12}
                    color={Theme.colors.status.error}
                  />
                </View>
              )}
            </View>
          )}
        </TouchableOpacity>

        {/* Time and Read Receipt */}
        {showTime && (
          <View
            style={[
              styles.timeContainer,
              isMyMessage
                ? {
                    justifyContent: "flex-end",
                    marginRight: Theme.spacing.sm,
                  }
                : null,
            ]}
          >
            <Text style={[styles.messageTime, { color: Theme.colors.neutral[500] }]}>
              {formatMessageTime(message.timestamp)}
            </Text>
            {isMyMessage && !hasError && (
              <View style={styles.readReceiptContainer}>
                <Ionicons
                  name={message.read ? "checkmark-done" : "checkmark"}
                  size={14}
                  color={message.read ? Theme.colors.status.success : Theme.colors.neutral[500]}
                  style={styles.readIndicator}
                />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Reactions */}
      {Object.keys(reactions).length > 0 && (
        <View style={styles.reactionsContainer}>
          {Object.entries(reactions).map(([emoji, count]) => (
            <View key={emoji} style={styles.reactionBadge}>
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => setShowReactionPicker(false)}
        onSelect={handleReactionSelect}
      />
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
    marginVertical: Theme.spacing.md,
  },
  dateHeaderBlur: {
    borderRadius: Theme.borderRadius.lg,
    overflow: "hidden",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: Theme.spacing.xs,
    alignItems: "flex-end",
    paddingHorizontal: Theme.spacing.xs,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    position: "relative",
    marginRight: Theme.spacing.xs,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: Theme.colors.neutral[0],
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
    borderColor: Theme.colors.neutral[0],
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius["2xl"],
    marginBottom: Theme.spacing.xs,
    position: "relative",
  },
  myMessage: {
    marginLeft: 40,
    borderBottomRightRadius: Theme.borderRadius.md,
  },
  otherMessage: {
    borderBottomLeftRadius: Theme.borderRadius.md,
    borderWidth: 0.5,
  },
  errorMessage: {
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: Theme.borderRadius.lg,
    resizeMode: "cover",
  },
  messageStatus: {
    position: "absolute",
    bottom: Theme.spacing.xs,
    right: Theme.spacing.xs,
  },
  sendingText: {
    fontSize: 10,
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.lg,
    marginTop: Theme.spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: Theme.spacing.xs,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorIndicator: {
    marginLeft: Theme.spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Theme.spacing.xs,
    marginLeft: 40,
    marginBottom: Theme.spacing.xs,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  readReceiptContainer: {
    marginLeft: Theme.spacing.xs,
  },
  readIndicator: {
    marginLeft: Theme.spacing.xs,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: Theme.spacing.sm,
  },
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Theme.colors.neutral[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: Theme.colors.neutral[500],
  },
});
