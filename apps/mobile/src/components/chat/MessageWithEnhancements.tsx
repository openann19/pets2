/**
 * Enhanced Message Component with Reactions, Attachments, and Voice Notes
 * Integrates all chat enhancement features into a single component
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import type { Message } from "@pawfectmatch/core";
import { useTheme } from "../../theme/Provider";
import { getExtendedColors } from "../../theme/adapters";
import { chatService } from "../../services/chatService";
import ReactionBarMagnetic from "./ReactionBarMagnetic";
import { AttachmentPreview } from "./AttachmentPreview";
import { VoiceWaveform } from "./VoiceWaveform";
import { DoubleTapLikePlus } from "../Gestures/DoubleTapLikePlus";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const MAX_BUBBLE_WIDTH = SCREEN_WIDTH * 0.75;

interface MessageWithEnhancementsProps {
  message: Message & {
    reactions?: Record<string, number>;
    attachment?: {
      type: "image" | "video" | "file";
      url: string;
      name?: string;
      size?: number;
    };
    voiceNote?: {
      url: string;
      duration: number;
      waveform?: number[];
    };
  };
  isOwnMessage: boolean;
  currentUserId: string;
  matchId: string;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onDelete?: (message: Message) => void;
}

export function MessageWithEnhancements({
  message,
  isOwnMessage,
  currentUserId,
  matchId,
  onReply,
  onCopy,
  onDelete,
}: MessageWithEnhancementsProps) {
  const theme = useTheme();
  const colors = getExtendedColors(theme);
  
  const [showReactionBar, setShowReactionBar] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || {});
  const [isReacting, setIsReacting] = useState(false);

  // Animation values
  const reactionBarOpacity = useSharedValue(0);
  const messageScale = useSharedValue(1);

  // Animated styles
  const reactionBarStyle = useAnimatedStyle(() => ({
    opacity: reactionBarOpacity.value,
    transform: [{ scale: reactionBarOpacity.value }],
  }));

  const messageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));

  // Handle long press to show reactions
  const handleLongPress = useCallback(() => {
    if (isReacting) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowReactionBar(true);
    reactionBarOpacity.value = withSpring(1, { damping: 15, stiffness: 300 });
  }, [isReacting, reactionBarOpacity]);

  // Handle reaction selection
  const handleReactionSelect = useCallback(
    async (emoji: string) => {
      if (isReacting) return;

      setIsReacting(true);
      setShowReactionBar(false);
      reactionBarOpacity.value = withTiming(0, { duration: 200 });

      try {
        // Optimistic update
        const updatedReactions = { ...localReactions };
        if (updatedReactions[emoji]) {
          updatedReactions[emoji] += 1;
        } else {
          updatedReactions[emoji] = 1;
        }
        setLocalReactions(updatedReactions);

        // Send to backend
        await chatService.sendReaction(matchId, message._id, emoji);
        
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        // Rollback optimistic update
        setLocalReactions(message.reactions || {});
        Alert.alert("Error", "Failed to send reaction. Please try again.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      } finally {
        setIsReacting(false);
      }
    },
    [isReacting, localReactions, matchId, message._id, message.reactions, reactionBarOpacity]
  );

  // Handle reaction bar cancel
  const handleReactionCancel = useCallback(() => {
    setShowReactionBar(false);
    reactionBarOpacity.value = withTiming(0, { duration: 200 });
  }, [reactionBarOpacity]);

  // Handle double tap like
  const handleDoubleTapLike = useCallback(() => {
    handleReactionSelect("❤️");
  }, [handleReactionSelect]);

  // Create long press gesture
  const longPressGesture = Gesture.LongPress()
    .minDuration(500)
    .onStart(() => {
      "worklet";
      messageScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    })
    .onEnd(() => {
      "worklet";
      messageScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      runOnJS(handleLongPress)();
    });

  // Render attachment if present
  const renderAttachment = () => {
    if (!message.attachment) return null;

    const { type, url, name, size } = message.attachment;

    if (type === "image") {
      return (
        <DoubleTapLikePlus
          onDoubleTap={handleDoubleTapLike}
          heartColor="#ff3b5c"
          particles={6}
          haptics={{ enabled: true, style: "medium" }}
        >
          <Image
            source={{ uri: url }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
        </DoubleTapLikePlus>
      );
    }

    return (
      <View style={styles.fileAttachment}>
        <Ionicons
          name={type === "video" ? "videocam" : "document"}
          size={24}
          color={colors.primary}
        />
        <View style={styles.fileInfo}>
          <Text style={[styles.fileName, { color: colors.text }] numberOfLines={1}>
            {name || "File"}
          </Text>
          {size && (
            <Text style={[styles.fileSize, { color: colors.textSecondary }]>
              {(size / 1024 / 1024).toFixed(1)} MB
            </Text>
          )}
        </View>
      </View>
    );
  };

  // Render voice note if present
  const renderVoiceNote = () => {
    if (!message.voiceNote) return null;

    return (
      <VoiceWaveform
        waveform={message.voiceNote.waveform || []}
        duration={message.voiceNote.duration}
        isPlaying={false}
        progress={0}
      />
    );
  };

  // Render reactions
  const renderReactions = () => {
    const reactions = Object.entries(localReactions);
    if (reactions.length === 0) return null;

    return (
      <View style={styles.reactionsContainer}>
        {reactions.map(([emoji, count]) => (
          <TouchableOpacity
            key={emoji}
            style={[
              styles.reactionBubble,
              { backgroundColor: colors.background, borderColor: colors.border }
            ]}
            onPress={() => handleReactionSelect(emoji)}
          >
            <Text style={styles.reactionEmoji}>{emoji}</Text>
            <Text style={[styles.reactionCount, { color: colors.textSecondary }]>
              {count}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const bubbleBackgroundColor = isOwnMessage ? colors.primary : colors.card;
  const textColor = isOwnMessage ? colors.white : colors.text;

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessageContainer]}>
      <GestureDetector gesture={longPressGesture}>
        <Animated.View style={[styles.messageWrapper, messageStyle]}>
          <LinearGradient
            colors={
              isOwnMessage
                ? [colors.primary, colors.primaryDark || colors.primary]
                : [colors.card, colors.surfaceElevated || colors.card]
            }
            style={[
              styles.messageBubble,
              isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble,
            ]}
          >
            {/* Message Content */}
            {message.content && (
              <Text style={[styles.messageText, { color: textColor }]>
                {message.content}
              </Text>
            )}

            {/* Attachment */}
            {renderAttachment()}

            {/* Voice Note */}
            {renderVoiceNote()}

            {/* Message Timestamp */}
            <Text style={[styles.timestamp, { color: isOwnMessage ? colors.white : colors.textSecondary }]>
              {new Date(message.sentAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </Text>
          </LinearGradient>

          {/* Reactions */}
          {renderReactions()}

          {/* Reaction Bar */}
          {showReactionBar && (
            <Animated.View style={[styles.reactionBarContainer, reactionBarStyle]}>
              <ReactionBarMagnetic
                onSelect={handleReactionSelect}
                onCancel={handleReactionCancel}
                influenceRadius={80}
                baseSize={32}
                backgroundColor={colors.card}
                borderColor={colors.border}
              />
            </Animated.View>
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    marginHorizontal: 16,
  },
  ownMessageContainer: {
    alignItems: "flex-end",
  },
  messageWrapper: {
    maxWidth: MAX_BUBBLE_WIDTH,
    position: "relative",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    minWidth: 60,
  },
  ownMessageBubble: {
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  attachmentImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginTop: 8,
  },
  fileAttachment: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    marginTop: 8,
  },
  fileInfo: {
    marginLeft: 12,
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: "600",
  },
  fileSize: {
    fontSize: 12,
    marginTop: 2,
  },
  timestamp: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },
  reactionBubble: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "600",
  },
  reactionBarContainer: {
    position: "absolute",
    bottom: -60,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 1000,
  },
});

export default MessageWithEnhancements;
