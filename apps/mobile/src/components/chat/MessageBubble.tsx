import { useTheme } from '@mobile/src/theme';
import type { Message } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { measure, runOnJS, useAnimatedRef } from 'react-native-reanimated';
import { useBubbleRetryShake } from '../../hooks/useBubbleRetryShake';
import { useSwipeToReply } from '../../hooks/useSwipeToReply';
import MorphingContextMenu, { type ContextAction } from '../menus/MorphingContextMenu';
import MessageStatusTicks, { type MessageStatus } from './MessageStatusTicks';
import ReplySwipeHint from './ReplySwipeHint';
import RetryBadge from './RetryBadge';

interface MessageBubbleProps {
  message: Message & { status?: MessageStatus };
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
  onRetry?: (message: Message) => Promise<boolean> | boolean;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onShowReadBy?: (message: Message) => void;
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
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();

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
          backgroundColor: theme.colors.primary,
        },
        ownMessageDark: {
          backgroundColor: theme.colors.primary,
        },
        otherMessageLight: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        otherMessageDark: {
          backgroundColor: theme.colors.surface,
          borderWidth: 1,
          borderColor: theme.colors.onSurface.primary,
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
        avatarContainer: {
          position: 'absolute',
          bottom: -16,
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
          backgroundColor: theme.colors.primary,
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
      }),
    [theme],
  );

  // Default status if not provided
  const messageStatus: MessageStatus = message.status || 'sent';

  // Measure anchor rect for morphing menu
  const bubbleRef = useAnimatedRef<Animated.View>();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [anchor, setAnchor] = React.useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>();

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

  // Long-press gesture for context menu
  const handleOpenMenu = (rect: { x: number; y: number; width: number; height: number }) => {
    setAnchor(rect);
    setMenuVisible(true);
    Haptics.selectionAsync().catch(() => {});
  };

  const longPress = Gesture.LongPress()
    .minDuration(350)
    .maxDistance(10)
    .onStart(() => {
      const m = measure(bubbleRef);
      if (m) {
        runOnJS(handleOpenMenu)({
          x: m.pageX,
          y: m.pageY,
          width: m.width,
          height: m.height,
        });
      }
      runOnJS(setMenuVisible)(true);
      Haptics.selectionAsync().catch(() => {});
    });

  const tap = Gesture.Tap();
  const composed = Gesture.Exclusive(swipeGesture, Gesture.Simultaneous(longPress, tap));

  // Menu actions
  const canReadBy = isOwnMessage && (messageStatus === 'delivered' || messageStatus === 'read');
  const actions: ContextAction[] = [
    { key: 'reply', label: 'Reply', icon: 'arrow-undo', onPress: () => onReply?.(message) },
    { key: 'copy', label: 'Copy', icon: 'copy', onPress: () => onCopy?.(message) },
    { key: 'react', label: 'React…', icon: 'happy', onPress: () => onReact?.(message) },
    ...(canReadBy
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

  const handleRetry = async () => {
    if (!onRetry) return;
    const result = await Promise.resolve(onRetry(message)).catch(() => false);
    if (!result) {
      shake();
    }
  };

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusIcon = () => {
    if (!showStatus) return null;

    // Check if current user has read the message
    const isRead = message.readBy.some((receipt) => receipt.user === currentUserId);

    if (isRead) return '✓✓';
    return '✓';
  };

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
        <TouchableOpacity style={styles.imageBubble}>
          <Text style={styles.imagePlaceholder}>📷 Image</Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? <Text style={styles.status}>{getStatusIcon()}</Text> : null}
        </View>
      </View>
    );
  }

  if (message.messageType === 'voice') {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <TouchableOpacity style={styles.voiceBubble}>
          <Text style={styles.voicePlaceholder}>🎵 Voice Message</Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? <Text style={styles.status}>{getStatusIcon()}</Text> : null}
        </View>
      </View>
    );
  }

  if (message.messageType === 'video') {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <TouchableOpacity style={styles.videoBubble}>
          <Text style={styles.videoPlaceholder}>🎥 Video Message</Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? <Text style={styles.status}>{getStatusIcon()}</Text> : null}
        </View>
      </View>
    );
  }

  if (message.messageType === 'gif' || message.messageType === 'sticker') {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <TouchableOpacity style={styles.gifBubble}>
          <Text style={styles.gifPlaceholder}>
            {message.messageType === 'gif' ? '🎭 GIF' : '😊 Sticker'}
          </Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? <Text style={styles.status}>{getStatusIcon()}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <>
      <GestureDetector gesture={composed}>
        <Animated.View
          ref={bubbleRef}
          style={[
            StyleSheet.flatten([
              styles.messageContainer,
              isOwnMessage ? styles.ownContainer : styles.otherContainer,
            ]),
            isOwnMessage && messageStatus === 'failed' && bubbleShakeStyle,
          ]}
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

          <Animated.View style={bubbleStyle}>
            <LinearGradient
              colors={
                isOwnMessage
                  ? [theme.colors.primary, theme.colors.primary + '80']
                  : [theme.colors.surface, theme.colors.bg]
              }
              style={StyleSheet.flatten([styles.bubble, getBubbleStyle()])}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={StyleSheet.flatten([styles.messageText, getTextStyle()])}>
                {message.content}
              </Text>

              {/* Proactive UI - Quick reactions for common responses */}
              {message.messageType === 'text' && (
                <View style={styles.reactionContainer}>
                  <TouchableOpacity style={styles.reactionButton}>
                    <Text style={styles.reactionEmoji}>��</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reactionButton}>
                    <Text style={styles.reactionEmoji}>❤️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.reactionButton}>
                    <Text style={styles.reactionEmoji}>😂</Text>
                  </TouchableOpacity>
                </View>
              )}
            </LinearGradient>

            {/* Timestamp and status */}
            <View style={styles.messageMeta}>
              <Text
                style={StyleSheet.flatten([
                  styles.timestamp,
                  theme.isDark ? styles.timestampDark : styles.timestampLight,
                ])}
              >
                {formatTime(message.sentAt)}
              </Text>
              {isOwnMessage && showStatus ? (
                <View style={styles.statusRow}>
                  <MessageStatusTicks
                    status={messageStatus}
                    size={12}
                    sentColor={theme.colors.onMuted}
                    deliveredColor={theme.colors.onMuted}
                    readColor={theme.colors.success}
                    failedColor={theme.colors.danger}
                  />
                  {messageStatus === 'failed' && <RetryBadge onPress={handleRetry} />}
                </View>
              ) : null}
            </View>
          </Animated.View>

          {/* Reply swipe hint - appears during swipe */}
          {!isOwnMessage && (
            <ReplySwipeHint
              progress={progressX}
              align="right"
            />
          )}
        </Animated.View>
      </GestureDetector>

      {/* Context menu */}
      <MorphingContextMenu
        visible={menuVisible}
        onClose={() => {
          setMenuVisible(false);
        }}
        anchor={anchor}
        actions={actions}
        theme={{
          bg: theme.colors.surface,
          border: theme.colors.border,
          text: theme.colors.onSurface,
          sub: theme.colors.onMuted,
          item: theme.colors.bg,
          itemPressed: theme.colors.surface,
        }}
      />
    </>
  );
}

export default MessageBubble;
