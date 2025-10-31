import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { BlurView } from 'expo-blur';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Message } from '../../hooks/useChatData';
import { chatService } from '../../services/chatService';
import { logger } from '../../services/logger';
import { getExtendedColors } from '../../theme/adapters';
import { ReactionPicker } from './ReactionPicker';

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
  const styles = useMemo(() => makeStyles(theme), [theme]);

  const isMyMessage = message.senderId === 'me' || message.senderId === 'current-user';
  const showAvatar =
    !isMyMessage && (index === 0 || messages[index - 1]?.senderId !== message.senderId);
  const nextMessage = messages[index + 1];
  const showTime =
    index === messages.length - 1 ||
    !nextMessage ||
    nextMessage.senderId !== message.senderId ||
    new Date(nextMessage.timestamp).getTime() - new Date(message.timestamp).getTime() > 300000;
  const showDateHeader = shouldShowDateHeader(message, messages[index - 1]);
  const hasError = message.error === true;

  const formatMessageTime = useCallback((timestamp: string): string => {
    const messageTime = new Date(timestamp);
    const now = new Date();
    const isToday = messageTime.toDateString() === now.toDateString();

    if (isToday) {
      return messageTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      return messageTime.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  }, []);

  const getDateHeader = useCallback((timestamp: string): string => {
    const messageDate = new Date(timestamp);
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === now.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
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
        logger.error('Failed to send reaction', { error: err });
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
          <BlurView
            intensity={20}
            style={styles.dateHeaderBlur}
          >
            <Text style={[styles.dateHeaderText, { color: colors.onMuted }]}>
              {getDateHeader(message.timestamp)}
            </Text>
          </BlurView>
        </View>
      )}

      {/* Message Container */}
      <View style={[styles.messageContainer, isMyMessage ? styles.myMessageContainer : null]}>
        {/* Avatar */}
        {!isMyMessage && showAvatar && (
          <TouchableOpacity style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100',
              }}
              style={[styles.avatar, isOnline ? styles.avatarOnline : null]}
            />
            {isOnline && (
              <View style={[styles.onlineIndicator, { backgroundColor: theme.colors.success }]} />
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
                    backgroundColor: theme.palette.neutral[50],
                    borderColor: theme.palette.neutral[200],
                  },
                ],
            hasError
              ? [
                  styles.errorMessage,
                  {
                    backgroundColor: `${theme.colors.danger}20`,
                    borderColor: theme.colors.danger,
                  },
                ]
              : null,
          ]}
        >
          {message.type === 'image' ? (
            <Image
              source={{ uri: message.content }}
              style={styles.messageImage}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                { color: isMyMessage ? theme.palette.neutral[50] : theme.palette.neutral[800] },
                hasError ? { color: theme.colors.danger } : null,
              ]}
            >
              {message.content}
            </Text>
          )}

          {/* Message Status */}
          {isMyMessage && (
            <View style={styles.messageStatus}>
              {message.status === 'sending' && (
                <Text style={[styles.sendingText, { color: `${theme.palette.neutral[50]}B3` }]}>
                  Sending...
                </Text>
              )}
              {message.status === 'failed' && (
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={handleRetry}
                >
                  <Ionicons
                    name="refresh"
                    size={12}
                    color={theme.colors.danger}
                  />
                  <Text style={[styles.retryText, { color: theme.colors.danger }]}>Retry</Text>
                </TouchableOpacity>
              )}
              {hasError && (
                <View style={styles.errorIndicator}>
                  <Ionicons
                    name="alert-circle"
                    size={12}
                    color={theme.colors.danger}
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
                    justifyContent: 'flex-end',
                    marginRight: theme.spacing.sm,
                  }
                : null,
            ]}
          >
            <Text style={[styles.messageTime, { color: theme.palette.neutral[500] }]}>
              {formatMessageTime(message.timestamp)}
            </Text>
            {isMyMessage && !hasError && (
              <View style={styles.readReceiptContainer}>
                <Ionicons
                  name={message.read ? 'checkmark-done' : 'checkmark'}
                  size={14}
                  color={message.read ? theme.colors.success : theme.palette.neutral[500]}
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
            <View
              key={emoji}
              style={styles.reactionBadge}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              {count > 1 && <Text style={styles.reactionCount}>{count}</Text>}
            </View>
          ))}
        </View>
      )}

      {/* Reaction Picker */}
      <ReactionPicker
        visible={showReactionPicker}
        onClose={() => {
          setShowReactionPicker(false);
        }}
        onSelect={handleReactionSelect}
      />
    </View>
  );
}

const shouldShowDateHeader = (currentMessage: Message, previousMessage?: Message): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.timestamp).toDateString();
  const previousDate = new Date(previousMessage.timestamp).toDateString();

  return currentDate !== previousDate;
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    dateHeader: {
      alignItems: 'center',
      marginVertical: theme.spacing.md,
    },
    dateHeaderBlur: {
      borderRadius: theme.radii.lg,
      overflow: 'hidden',
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
    },
    dateHeaderText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
    },
    messageContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xs,
      alignItems: 'flex-end',
      paddingHorizontal: theme.spacing.xs,
    },
    myMessageContainer: {
      justifyContent: 'flex-end',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: theme.spacing.xs,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: theme.palette.neutral[50],
    },
    avatarOnline: {
      borderColor: '#4CAF50',
    },
    avatarSpacer: {
      width: 40,
    },
    onlineIndicator: {
      position: 'absolute',
      bottom: -1,
      right: -1,
      width: 12,
      height: 12,
      borderRadius: 6,
      borderWidth: 2,
      borderColor: theme.palette.neutral[50],
    },
    messageBubble: {
      maxWidth: '75%',
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.xl,
      marginBottom: theme.spacing.xs,
      position: 'relative',
    },
    myMessage: {
      marginLeft: 40,
      borderBottomRightRadius: theme.radii.md,
    },
    otherMessage: {
      borderBottomLeftRadius: theme.radii.md,
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
      borderRadius: theme.radii.lg,
      resizeMode: 'cover',
    },
    messageStatus: {
      position: 'absolute',
      bottom: theme.spacing.xs,
      right: theme.spacing.xs,
    },
    sendingText: {
      fontSize: 10,
      fontStyle: 'italic',
    },
    retryButton: {
      backgroundColor: theme.colors.danger,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
      marginTop: theme.spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    retryText: {
      fontSize: 12,
      fontWeight: '500',
    },
    errorIndicator: {
      marginLeft: theme.spacing.xs,
    },
    timeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.xs,
      marginLeft: 40,
      marginBottom: theme.spacing.xs,
    },
    messageTime: {
      fontSize: 12,
      fontWeight: '500',
    },
    readReceiptContainer: {
      marginLeft: theme.spacing.xs,
    },
    readIndicator: {
      marginLeft: theme.spacing.xs,
    },
    reactionsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 4,
      marginTop: 4,
      paddingHorizontal: theme.spacing.sm,
    },
    reactionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.palette.neutral[100],
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
      fontWeight: '600',
      color: theme.palette.neutral[500],
    },
  });
}
