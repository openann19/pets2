import type { Message } from '@pawfectmatch/core';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface MessageBubbleProps {
  message: Message;
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
  petInfo
}: MessageBubbleProps): React.JSX.Element {
  const { isDark, colors } = useTheme();

  const formatTime = (timestamp: string) => new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const getStatusIcon = () => {
    if (!showStatus) return null;

    // Check if current user has read the message
    const isRead = message.readBy.some(receipt => receipt.user === currentUserId);

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
      emoji: messageIndex + 1 === 1 ? '🎉' : '🏆'
    };
  };

  const getPetAvatar = () => {
    if (!showAvatars || !petInfo) return null;

    const { species, mood = 'happy' } = petInfo;
    const speciesEmojis = {
      dog: { happy: '🐕', excited: '🐕‍🦺', curious: '🐕', sleepy: '😴', playful: '🐕' },
      cat: { happy: '🐱', excited: '🐱', curious: '🐱', sleepy: '😴', playful: '🐱' },
      bird: { happy: '🐦', excited: '🐦', curious: '🐦', sleepy: '😴', playful: '🐦' },
      rabbit: { happy: '🐰', excited: '🐰', curious: '🐰', sleepy: '😴', playful: '🐰' },
      other: { happy: '🐾', excited: '🐾', curious: '🐾', sleepy: '😴', playful: '🐾' }
    };

    const emojiSet = speciesEmojis[species as keyof typeof speciesEmojis] || speciesEmojis.other;
    return emojiSet[mood];
  };


  const getBubbleStyle = () => {
    if (isOwnMessage) {
      return isDark
        ? styles.ownMessageDark
        : styles.ownMessageLight;
    }
    return isDark
      ? styles.otherMessageDark
      : styles.otherMessageLight;
  };

  const getTextStyle = () => isDark
    ? styles.messageTextDark
    : styles.messageTextLight;

  if (message.messageType === 'image') {
    return (
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
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
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
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
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
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
      <View style={[styles.messageContainer, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
        <TouchableOpacity style={styles.gifBubble}>
          <Text style={styles.gifPlaceholder}>{message.messageType === 'gif' ? '🎭 GIF' : '😊 Sticker'}</Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? <Text style={styles.status}>{getStatusIcon()}</Text> : null}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.messageContainer, isOwnMessage ? styles.ownContainer : styles.otherContainer]}>
      {/* Milestone Badge */}
      {getMilestoneBadge() && (
        <View style={styles.milestoneContainer}>
          <Text style={styles.milestoneText}>
            {getMilestoneBadge()?.emoji} {getMilestoneBadge()?.text}
          </Text>
        </View>
      )}

      {/* Pet Avatar */}
      {showAvatars && getPetAvatar() ? <View style={[styles.avatarContainer, isOwnMessage ? styles.ownAvatar : styles.otherAvatar]}>
        <Text style={styles.avatarEmoji}>
          {getPetAvatar()}
        </Text>
        {petInfo ? <Text style={[styles.avatarName, isDark ? styles.avatarNameDark : styles.avatarNameLight]}>
          {petInfo.name}
        </Text> : null}
      </View> : null}

      <LinearGradient
        colors={isOwnMessage
          ? ['#FF6B6B', '#FF8E8E']
          : [colors.card, colors.background]
        }
        style={[styles.bubble, getBubbleStyle()]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={[styles.messageText, getTextStyle()]}>
          {message.content}
        </Text>

        {/* Proactive UI - Quick reactions for common responses */}
        {!isOwnMessage && showAvatars ? <View style={styles.quickReactions}>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>👍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>❤️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reactionButton}>
            <Text style={styles.reactionEmoji}>😂</Text>
          </TouchableOpacity>
        </View> : null}
      </LinearGradient>

      <View style={styles.messageMeta}>
        <Text style={[styles.timestamp, isDark ? styles.timestampDark : styles.timestampLight]}>
          {formatTime(message.sentAt)}
        </Text>
        {isOwnMessage && showStatus ? <Text style={[styles.status, isDark ? styles.statusDark : styles.statusLight]}>
          {getStatusIcon()}
        </Text> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  milestoneContainer: {
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
  },
  milestoneText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    maxWidth: 120,
  },
  ownAvatar: {
    alignSelf: 'flex-end',
  },
  otherAvatar: {
    alignSelf: 'flex-start',
  },
  avatarEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  avatarName: {
    fontSize: 12,
    fontWeight: '500',
  },
  avatarNameLight: {
    color: '#1A1A1A',
  },
  avatarNameDark: {
    color: '#E0E0E0',
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageLight: {
    backgroundColor: '#FF6B6B',
  },
  ownMessageDark: {
    backgroundColor: '#E55555',
  },
  otherMessageLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  otherMessageDark: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#404040',
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextLight: {
    color: '#1A1A1A',
  },
  messageTextDark: {
    color: '#E0E0E0',
  },
  quickReactions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  reactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
  reactionEmoji: {
    fontSize: 16,
  },
  imageBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  voiceBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  videoBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  gifBubble: {
    backgroundColor: '#F0F0F0',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gifPlaceholder: {
    fontSize: 14,
    color: '#666',
  },
  messageMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  timestampLight: {
    color: '#999',
  },
  timestampDark: {
    color: '#666',
  },
  status: {
    fontSize: 12,
  },
  statusLight: {
    color: '#666',
  },
  statusDark: {
    color: '#999',
  },
});

export default MessageBubble;
