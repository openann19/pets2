/**
 * MessageBubbleContent Component
 * Handles rendering of different message types (text, image, voice, video, gif)
 */

import { useTheme } from '@mobile/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import type { MessageWithStatus } from './MessageBubbleTypes';

interface MessageBubbleContentProps {
  message: MessageWithStatus;
  isOwnMessage: boolean;
}

export function MessageBubbleContent({
  message,
  isOwnMessage,
}: MessageBubbleContentProps): React.JSX.Element {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        bubble: {
          paddingHorizontal: theme.spacing.md,
          paddingVertical: theme.spacing.sm,
          borderRadius: theme.radii.lg,
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
          borderRadius: theme.radii.md,
          padding: theme.spacing.xs,
        },
        gifBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
        },
        voiceBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
        },
        videoBubble: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
        },
        imagePlaceholder: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        gifPlaceholder: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        voicePlaceholder: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        videoPlaceholder: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        reactionContainer: {
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: theme.spacing.xs,
          gap: theme.spacing.xs,
        },
        reactionButton: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          marginHorizontal: theme.spacing.xs,
        },
        reactionEmoji: {
          fontSize: 14,
        },
      }),
    [theme],
  );

  const getBubbleStyle = () => {
    if (isOwnMessage) {
      return theme.isDark ? styles.ownMessageDark : styles.ownMessageLight;
    }
    return theme.isDark ? styles.otherMessageDark : styles.otherMessageLight;
  };

  const getTextStyle = () => (theme.isDark ? styles.messageTextDark : styles.messageTextLight);

  if (message.messageType === 'image') {
    return (
      <TouchableOpacity
        style={styles.imageBubble}
        accessibilityRole="image"
        accessibilityLabel="Image message"
        accessibilityHint="Tap to view full image"
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Text style={styles.imagePlaceholder} allowFontScaling>📷 Image</Text>
      </TouchableOpacity>
    );
  }

  if (message.messageType === 'voice') {
    return (
      <TouchableOpacity
        style={styles.voiceBubble}
        accessibilityRole="button"
        accessibilityLabel="Voice message"
        accessibilityHint="Tap to play voice message"
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Text style={styles.voicePlaceholder} allowFontScaling>🎵 Voice Message</Text>
      </TouchableOpacity>
    );
  }

  if (message.messageType === 'video') {
    return (
      <TouchableOpacity
        style={styles.videoBubble}
        accessibilityRole="button"
        accessibilityLabel="Video message"
        accessibilityHint="Tap to play video"
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Text style={styles.videoPlaceholder} allowFontScaling>🎥 Video Message</Text>
      </TouchableOpacity>
    );
  }

  if (message.messageType === 'gif' || message.messageType === 'sticker') {
    return (
      <TouchableOpacity
        style={styles.gifBubble}
        accessibilityRole="image"
        accessibilityLabel={message.messageType === 'gif' ? 'GIF message' : 'Sticker message'}
        accessibilityHint="Tap to view full size"
        hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
      >
        <Text style={styles.gifPlaceholder} allowFontScaling>
          {message.messageType === 'gif' ? '🎭 GIF' : '😊 Sticker'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
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
      <Text style={StyleSheet.flatten([styles.messageText, getTextStyle()])} allowFontScaling>
        {message.content}
      </Text>

      {/* Proactive UI - Quick reactions for common responses */}
      {message.messageType === 'text' && (
        <View style={styles.reactionContainer}>
          <TouchableOpacity
            style={styles.reactionButton}
            accessibilityRole="button"
            accessibilityLabel="Add thumbs up reaction"
            accessibilityHint="Tap to add thumbs up reaction"
            hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
          >
            <Text style={styles.reactionEmoji} allowFontScaling>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            accessibilityRole="button"
            accessibilityLabel="Add heart reaction"
            accessibilityHint="Tap to add heart reaction"
            hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
          >
            <Text style={styles.reactionEmoji} allowFontScaling>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.reactionButton}
            accessibilityRole="button"
            accessibilityLabel="Add laughing reaction"
            accessibilityHint="Tap to add laughing reaction"
            hitSlop={{ top: 11, bottom: 11, left: 11, right: 11 }}
          >
            <Text style={styles.reactionEmoji} allowFontScaling>😂</Text>
          </TouchableOpacity>
        </View>
      )}
    </LinearGradient>
  );
}

