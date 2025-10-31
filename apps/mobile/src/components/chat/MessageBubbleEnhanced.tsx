import { useTheme } from '@/theme';
import type { Message, User } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, runOnJS, useAnimatedRef } from 'react-native-reanimated';
import { useBubbleRetryShake } from '../../hooks/useBubbleRetryShake';
import { useHighlightPulse } from '../../hooks/useHighlightPulse';
import { useSwipeToReply } from '../../hooks/useSwipeToReply';
import MorphingContextMenu, { type ContextAction } from '../menus/MorphingContextMenu';
import MessageStatusTicks from './MessageStatusTicks';
import MessageTimestampBadge from './MessageTimestampBadge';
import ReadByPopover from './ReadByPopover';
import ReplySwipeHint from './ReplySwipeHint';
import RetryBadge from './RetryBadge';

interface MessageBubbleEnhancedProps {
  message: Message;
  isOwnMessage: boolean;
  showStatus?: boolean;
  currentUserId: string;
  messageIndex?: number;
  totalMessages?: number;
  showAvatars?: boolean;
  highlightId?: string; // New prop for reply jump highlighting
  petInfo?: {
    name: string;
    species: string;
    mood?: 'happy' | 'excited' | 'curious' | 'sleepy' | 'playful';
  };
  users?: Map<string, User>; // For read receipt display
  onRetry?: () => void;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onShowReadBy?: (message: Message) => void;
}

type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

function getMessageStatus(message: Message, currentUserId: string): MessageStatus {
  // Determine status based on message readBy array
  const readByCount = message.readBy.length;

  if (readByCount === 0) {
    return 'sent'; // Message sent but not delivered/read yet
  }

  // Check if current user has read the message
  const isRead = message.readBy.some((receipt) => receipt.user === currentUserId);

  if (isRead) {
    return 'read';
  }

  // If someone read it but not current user, it's delivered
  if (readByCount > 0) {
    return 'delivered';
  }

  return 'sent';
}

export function MessageBubbleEnhanced({
  message,
  isOwnMessage,
  showStatus = true,
  currentUserId,
  messageIndex,
  totalMessages,
  showAvatars = false,
  highlightId,
  petInfo,
  users,
  onRetry,
  onReply,
  onCopy,
  onReact,
  onDelete,
  onShowReadBy,
}: MessageBubbleEnhancedProps) {
  const theme = useTheme();
  const containerRef = useAnimatedRef<Animated.View>();
  const bubbleRef = useAnimatedRef<Animated.View>();

  const [showTime, setShowTime] = useState(true);
  const [showReadBy, setShowReadBy] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | undefined>(undefined);
  const [menuAnchor, setMenuAnchor] = useState<
    { x: number; y: number; width: number; height: number } | undefined
  >(undefined);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        messageContainer: {
          marginVertical: 4,
          maxWidth: '80%',
          position: 'relative',
        },
        ownContainer: {
          alignSelf: 'flex-end',
          alignItems: 'flex-end',
        },
        otherContainer: {
          alignSelf: 'flex-start',
          alignItems: 'flex-start',
        },
        bubble: {
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: 16,
          maxWidth: '100%',
        },
        ownMessageLight: {
          backgroundColor: theme.colors.danger,
        },
        ownMessageDark: {
          backgroundColor: theme.colors.danger,
        },
        otherMessageLight: {
          backgroundColor: theme.colors.bg,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        otherMessageDark: {
          backgroundColor: theme.colors.onSurface,
          borderWidth: 1,
          borderColor: theme.colors.onSurface,
        },
        messageText: {
          fontSize: 16,
          lineHeight: 20,
        },
        messageTextLight: {
          color: theme.colors.onSurface,
        },
        messageTextDark: {
          color: theme.colors.bg,
        },
        imageBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 4,
        },
        gifBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 20,
        },
        voiceBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          padding: 12,
        },
        loadingText: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        gifPlaceholder: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        messageMeta: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 4,
        },
        timestamp: {
          fontSize: 12,
        },
        timestampLight: {
          color: theme.colors.onMuted,
        },
        timestampDark: {
          color: theme.colors.onMuted,
        },
        statusRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 8,
        },
        status: {
          fontSize: 12,
        },
        statusLight: {
          color: theme.colors.onMuted,
        },
        statusDark: {
          color: theme.colors.onMuted,
        },
        footerRow: {
          flexDirection: 'row',
          alignItems: 'center',
          marginLeft: 8,
        },
        avatarContainer: {
          position: 'absolute',
          bottom: -16,
        },
        ownAvatar: {
          right: -16,
        },
        otherAvatar: {
          left: -16,
        },
        avatar: {
          width: 32,
          height: 32,
          borderRadius: 16,
          borderWidth: 2,
          borderColor: theme.colors.bg,
        },
        avatarEmoji: {
          fontSize: 16,
          textAlign: 'center',
          lineHeight: 28,
        },
        avatarName: {
          fontSize: 10,
          fontWeight: '500',
        },
        avatarNameLight: {
          color: theme.colors.onSurface,
        },
        avatarNameDark: {
          color: theme.colors.bg,
        },
        reactionButton: {
          backgroundColor: theme.colors.surface,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginHorizontal: 2,
        },
        reactionEmoji: {
          fontSize: 14,
        },
        retryBadge: {
          backgroundColor: theme.colors.danger,
          borderRadius: 12,
          paddingHorizontal: 8,
          paddingVertical: 4,
          marginLeft: 8,
        },
        retryText: {
          fontSize: 12,
          fontWeight: '500',
          color: theme.colors.bg,
        },
        milestoneContainer: {
          position: 'absolute',
          top: -20,
          left: 0,
          right: 0,
          alignItems: 'center',
        },
        milestoneText: {
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.primary,
          backgroundColor: theme.colors.bg,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: theme.colors.primary,
        },
        replyQuote: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
          paddingVertical: 6,
          paddingHorizontal: 8,
          backgroundColor: theme.colors.surface,
          borderRadius: 8,
          borderLeftWidth: 3,
          borderLeftColor: theme.colors.primary,
        },
        replyBar: {
          width: 3,
          height: 16,
          backgroundColor: theme.colors.primary,
          borderRadius: 2,
          marginRight: 8,
        },
        replyAuthor: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.onSurface,
          flex: 1,
        },
        replyText: {
          fontSize: 12,
          color: theme.colors.onMuted,
          marginTop: 2,
        },
        replySnippet: {
          fontSize: 11,
          color: theme.colors.onMuted,
          marginTop: 2,
        },
      }),
    [theme],
  );

  const messageStatus = getMessageStatus(message, currentUserId);
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();

  // Swipe-to-reply gesture
  const {
    gesture: swipeGesture,
    bubbleStyle,
    progressX,
  } = useSwipeToReply({
    enabled: true,
    onReply: onReply || (() => {}),
    payload: message,
  });

  // Highlight pulse when jumped to (for reply/quote navigation)
  const { highlightStyle } = useHighlightPulse(
    highlightId === message._id ? message._id : undefined,
  );

  const handleRetry = useCallback(() => {
    shake();
    if (onRetry) {
      onRetry();
    }
  }, [shake, onRetry]);

  // Tap gesture toggles timestamp
  const tap = Gesture.Tap().onEnd(() => {
    runOnJS(setShowTime)((v) => !v);
  });

  // Long-press for context menu
  const longPressMenu = Gesture.LongPress()
    .minDuration(350)
    .maxDistance(10)
    .onStart(() => {
      // Measure bubble to place popover and menu
      const m = measure(bubbleRef);
      if (m) {
        runOnJS(setMenuAnchor)({ x: m.pageX, y: m.pageY, width: m.width, height: m.height });
      }
      runOnJS(setMenuVisible)(true);
      Haptics.selectionAsync().catch(() => {});
    });

  // Long-press opens read-by if own message and delivered/read
  const canShowReadBy = isOwnMessage && (messageStatus === 'delivered' || messageStatus === 'read');

  const longPressReadBy = Gesture.LongPress()
    .minDuration(350)
    .maxDistance(10)
    .enabled(canShowReadBy)
    .onStart(() => {
      // Measure bubble to place popover
      const m = measure(containerRef);
      if (m) {
        runOnJS(setAnchor)({ x: m.pageX + m.width, y: m.pageY + m.height / 2 });
      }
      runOnJS(setShowReadBy)(true);
      Haptics.selectionAsync().catch(() => {});
    });

  // Menu actions
  const canReadByInMenu =
    isOwnMessage && (messageStatus === 'delivered' || messageStatus === 'read');
  const actions: ContextAction[] = [
    { key: 'reply', label: 'Reply', icon: 'arrow-undo', onPress: () => onReply?.(message) },
    { key: 'copy', label: 'Copy', icon: 'copy', onPress: () => onCopy?.(message) },
    { key: 'react', label: 'React…', icon: 'happy', onPress: () => onReact?.(message) },
    ...(canReadByInMenu
      ? [{ key: 'readby', label: 'Read by…', icon: 'eye', onPress: () => onShowReadBy?.(message) }]
      : []),
    ...(isOwnMessage
      ? [
          {
            key: 'delete',
            label: 'Delete',
            icon: 'trash',
            onPress: () => onDelete?.(message),
            danger: true,
          },
        ]
      : []),
  ];

  const composed = Gesture.Exclusive(
    swipeGesture,
    Gesture.Simultaneous(tap, longPressMenu, longPressReadBy),
  );

  // formatTime reserved for future implementation
  // const formatTime = (timestamp: string) =>
  //   new Date(timestamp).toLocaleTimeString([], {
  //     hour: '2-digit',
  //     minute: '2-digit',
  //   });

  const getMilestoneBadge = () => {
    if (!messageIndex || !totalMessages) return null;

    const milestones = [1, 5, 10, 25, 50, 100];
    const isMilestone = milestones.includes(messageIndex + 1);

    if (!isMilestone) return null;

    return {
      text: messageIndex + 1 === 1 ? 'First message!' : `${messageIndex + 1} messages!`,
      emoji: messageIndex + 1 === 1 ? '🎉' : '🏆',
    };
  };

  const getPetAvatar = () => {
    if (!showAvatars || !petInfo) return null;

    const { species, mood = 'happy' } = petInfo;
    const speciesEmojis = {
      dog: {
        happy: '🐕',
        excited: '🐕‍🦺',
        curious: '🐕',
        sleepy: '😴',
        playful: '🐕',
      },
      cat: {
        happy: '🐱',
        excited: '🐱',
        curious: '🐱',
        sleepy: '😴',
        playful: '🐱',
      },
      bird: {
        happy: '🐦',
        excited: '🐦',
        curious: '🐦',
        sleepy: '😴',
        playful: '🐦',
      },
      rabbit: {
        happy: '🐰',
        excited: '🐰',
        curious: '🐰',
        sleepy: '😴',
        playful: '🐰',
      },
      other: {
        happy: '🐾',
        excited: '🐾',
        curious: '🐾',
        sleepy: '😴',
        playful: '🐾',
      },
    };

    const emojiSet = speciesEmojis[species as keyof typeof speciesEmojis] || speciesEmojis.other;
    return emojiSet[mood];
  };

  const getBubbleStyle = () => {
    if (isOwnMessage) {
      return theme.isDark ? styles.ownMessageDark : styles.ownMessageLight;
    }
    return theme.isDark ? styles.otherMessageDark : styles.otherMessageLight;
  };

  const getTextStyle = () => (theme.isDark ? styles.messageTextDark : styles.messageTextLight);

  if (message.messageType === 'image') {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <View style={styles.imageBubble}>
          <Text style={styles.gifPlaceholder}>📷 Image</Text>
        </View>
        <View style={styles.messageMeta}>
          <MessageTimestampBadge
            iso={message.sentAt}
            visible={showTime}
            textColor={isOwnMessage ? theme.colors.bg : theme.colors.onSurface}
            bgColor={
              isOwnMessage
                ? theme.colors.onSurface + '30'
                : theme.colors.onSurface + '23'
            }
            accentColor={
              isOwnMessage
                ? theme.colors.onSurface + 'B3'
                : theme.colors.onSurface + '80'
            }
          />
          {isOwnMessage && showStatus && (
            <View style={styles.footerRow}>
              <MessageStatusTicks
                status={messageStatus}
                size={12}
              />
              {messageStatus === 'failed' ? <RetryBadge onPress={handleRetry} /> : null}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <>
      <GestureDetector gesture={composed}>
        <Animated.View
          ref={containerRef}
          style={StyleSheet.flatten([
            styles.messageContainer,
            isOwnMessage ? styles.ownContainer : styles.otherContainer,
            bubbleShakeStyle,
            highlightStyle,
          ])}
        >
          {/* Milestone Badge */}
          {getMilestoneBadge() && (
            <View style={styles.milestoneContainer}>
              <Text style={styles.milestoneText}>
                {getMilestoneBadge()?.emoji} {getMilestoneBadge()?.text}
              </Text>
            </View>
          )}

          {/* Pet Avatar */}
          {showAvatars && getPetAvatar() ? (
            <View
              style={StyleSheet.flatten([
                styles.avatarContainer,
                isOwnMessage ? styles.ownAvatar : styles.otherAvatar,
              ])}
            >
              <Text style={styles.avatarEmoji}>{getPetAvatar()}</Text>
              {petInfo ? (
                <Text
                  style={StyleSheet.flatten([
                    styles.avatarName,
                    theme.isDark ? styles.avatarNameDark : styles.avatarNameLight,
                  ])}
                >
                  {petInfo.name}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Animated.View
            style={bubbleStyle}
            ref={bubbleRef}
          >
            <LinearGradient
              colors={
                isOwnMessage
                  ? [theme.colors.danger, theme.colors.danger + '80']
                  : [theme.colors.surface, theme.colors.bg]
              }
              style={StyleSheet.flatten([styles.bubble, getBubbleStyle()])}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Reply Quote */}
              {message.replyTo ? (
                <View style={styles.replyQuote}>
                  <View style={styles.replyBar} />
                  <Text
                    style={styles.replyAuthor}
                    numberOfLines={1}
                  >
                    {message.replyTo.author ?? 'Replying to'}
                  </Text>
                  <Text
                    style={styles.replySnippet}
                    numberOfLines={2}
                  >
                    {message.replyTo.text ?? 'Media'}
                  </Text>
                </View>
              ) : null}

              <Text style={StyleSheet.flatten([styles.messageText, getTextStyle()])}>
                {message.content}
              </Text>
            </LinearGradient>
            {/* Reply swipe hint */}
            <ReplySwipeHint
              progress={progressX}
              align={isOwnMessage ? 'right' : 'left'}
            />
          </Animated.View>

          <View style={styles.messageMeta}>
            <MessageTimestampBadge
              iso={message.sentAt}
              visible={showTime}
              textColor={isOwnMessage ? theme.colors.bg : theme.colors.onSurface}
              bgColor={
                isOwnMessage
                  ? theme.colors.onSurface + '30'
                  : theme.colors.onSurface + '23'
              }
              accentColor={
                isOwnMessage
                  ? theme.colors.onSurface + 'B3'
                  : theme.colors.onSurface + '80'
              }
            />
            {isOwnMessage && showStatus && (
              <View style={styles.footerRow}>
                <MessageStatusTicks
                  status={messageStatus}
                  size={12}
                />
                {messageStatus === 'failed' ? <RetryBadge onPress={handleRetry} /> : null}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Read-by popover */}
      <ReadByPopover
        visible={showReadBy}
        onClose={() => {
          setShowReadBy(false);
        }}
        receipts={message.readBy}
        {...(users !== undefined && { users })}
        {...(anchor !== undefined && { anchor })}
        theme={{
          bg: theme.isDark ? theme.colors.onSurface : theme.colors.bg,
          text: theme.isDark ? theme.colors.bg : theme.colors.onSurface,
          subtext: theme.isDark
            ? theme.colors.onMuted
            : theme.colors.onMuted,
          border: theme.isDark
            ? theme.colors.onSurface + '80'
            : theme.colors.onSurface + '80',
        }}
      />

      {/* Morphing context menu */}
      <MorphingContextMenu
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
        }}
        {...(menuAnchor !== undefined && { anchor: menuAnchor })}
        actions={actions}
        theme={{
          bg: theme.isDark ? theme.colors.onSurface : theme.colors.bg,
          border: theme.isDark
            ? theme.colors.onSurface + '80'
            : theme.colors.onSurface + '80',
          text: theme.isDark ? theme.colors.bg : theme.colors.onSurface,
          sub: theme.isDark ? theme.colors.onMuted : theme.colors.onMuted,
          item: theme.isDark ? theme.colors.onSurface : theme.colors.surface,
          itemPressed: theme.isDark ? theme.colors.onSurface : theme.colors.surface,
        }}
      />
    </>
  );
}

export default MessageBubbleEnhanced;
