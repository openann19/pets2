import React, { useCallback, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { Message } from "../../hooks/useChatData";
import { useTheme } from "../../contexts/ThemeContext";
import { Spacing, BorderRadius } from "../../styles/GlobalStyles";
import { ReactionPicker } from "./ReactionPicker";
import { chatService } from "../../services/chatService";
import { tokens } from "@pawfectmatch/design-tokens";

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
  const { colors } = useTheme();
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
          await chatService.sendReaction({
            matchId: message.matchId,
            messageId: message._id,
            reaction,
          });
        }
        // Update local reactions
        setReactions((prev) => ({
          ...prev,
          [reaction]: (prev[reaction] || 0) + 1,
        }));
      } catch (error) {
        console.error("Failed to send reaction:", error);
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
            <Text
              style={StyleSheet.flatten([
                styles.dateHeaderText,
                { color: colors.gray600 },
              ])}
            >
              {getDateHeader(message.timestamp)}
            </Text>
          </BlurView>
        </View>
      )}

      {/* Message Container */}
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isMyMessage && styles.myMessageContainer,
        ])}
      >
        {/* Avatar */}
        {!isMyMessage && showAvatar && (
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100",
              }}
              style={StyleSheet.flatten([
                styles.avatar,
                isOnline && styles.avatarOnline,
              ])}
            />
            {isOnline && (
              <View
                style={StyleSheet.flatten([
                  styles.onlineIndicator,
                  { backgroundColor: colors.success },
                ])}
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
          style={StyleSheet.flatten([
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
          ])}
        >
          {message.type === "image" ? (
            <Image
              source={{ uri: message.content }}
              style={styles.messageImage}
            />
          ) : (
            <Text
              style={StyleSheet.flatten([
                styles.messageText,
                { color: isMyMessage ? colors.white : colors.gray800 },
                hasError && { color: colors.error },
              ])}
            >
              {message.content}
            </Text>
          )}

          {/* Message Status */}
          {isMyMessage && (
            <View style={styles.messageStatus}>
              {message.status === "sending" && (
                <Text
                  style={StyleSheet.flatten([
                    styles.sendingText,
                    { color: `${colors.white}B3` },
                  ])}
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
                  <Text
                    style={StyleSheet.flatten([
                      styles.retryText,
                      { color: colors.error },
                    ])}
                  >
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

        {/* Time and Read Receipt */}
        {showTime && (
          <View
            style={StyleSheet.flatten([
              styles.timeContainer,
              isMyMessage && {
                justifyContent: "flex-end",
                marginRight: Spacing.sm,
              },
            ])}
          >
            <Text
              style={StyleSheet.flatten([
                styles.messageTime,
                { color: colors.gray500 },
              ])}
            >
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
    marginVertical: Spacing.md,
  },
  dateHeaderBlur: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  dateHeaderText: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
    alignItems: "flex-end",
    paddingHorizontal: Spacing.xs,
  },
  myMessageContainer: {
    justifyContent: "flex-end",
  },
  avatarContainer: {
    position: "relative",
    marginRight: Spacing.xs,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xs,
    position: "relative",
  },
  myMessage: {
    marginLeft: 40,
    borderBottomRightRadius: BorderRadius.sm,
  },
  otherMessage: {
    borderBottomLeftRadius: BorderRadius.sm,
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
    borderRadius: BorderRadius.md,
    resizeMode: "cover",
  },
  messageStatus: {
    position: "absolute",
    bottom: Spacing.xs,
    right: Spacing.xs,
  },
  sendingText: {
    fontSize: 10,
    fontStyle: "italic",
  },
  retryButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  retryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  errorIndicator: {
    marginLeft: Spacing.xs,
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
    marginLeft: 40,
    marginBottom: Spacing.xs,
  },
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  readReceiptContainer: {
    marginLeft: Spacing.xs,
  },
  readIndicator: {
    marginLeft: Spacing.xs,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
    paddingHorizontal: Spacing.sm,
  },
  reactionBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
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
    color: "#6B7280",
  },
});
