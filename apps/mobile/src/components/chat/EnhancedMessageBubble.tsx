/**
 * Enhanced Message Bubble with Reactions Integration
 * Integrates chatService for reactions functionality
 */

import type { Message } from "@pawfectmatch/core";
import { chatService, type MessageWithReactions } from "../../services/chatService";
import React, { useState, useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../contexts/ThemeContext";

interface EnhancedMessageBubbleProps {
  message: MessageWithReactions;
  isOwnMessage: boolean;
  showStatus?: boolean;
  currentUserId: string;
  matchId: string;
  messageIndex?: number;
  totalMessages?: number;
  showAvatars?: boolean;
  petInfo?: {
    name: string;
    species: string;
    mood?: "happy" | "excited" | "curious" | "sleepy" | "playful";
  };
}

const REACTION_EMOJIS = ["👍", "❤️", "😂", "😊", "🎉", "🔥"];

export function EnhancedMessageBubble({
  message,
  isOwnMessage,
  showStatus = true,
  currentUserId,
  matchId,
  messageIndex,
  totalMessages,
  showAvatars = false,
  petInfo,
}: EnhancedMessageBubbleProps): React.JSX.Element {
  const { isDark, colors } = useTheme();
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || {});
  const [isReacting, setIsReacting] = useState(false);

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleLongPress = useCallback(() => {
    if (isReacting) return;
    setShowReactionPicker(true);
  }, [isReacting]);

  const handleReactionPress = useCallback(
    async (emoji: string) => {
      if (isReacting) return;

      setIsReacting(true);
      setShowReactionPicker(false);

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

        // Update with server response if needed
      } catch (error) {
        // Rollback optimistic update
        setLocalReactions(message.reactions || {});
        Alert.alert("Error", "Failed to send reaction. Please try again.");
      } finally {
        setIsReacting(false);
      }
    },
    [isReacting, localReactions, matchId, message._id],
  );

  const getStatusIcon = () => {
    if (!showStatus) return null;
    const isRead = message.readBy.some(
      (receipt) => receipt.user === currentUserId,
    );
    if (isRead) return "✓✓";
    return "✓";
  };

  const getBubbleStyle = () => {
    if (isOwnMessage) {
      return isDark ? styles.ownMessageDark : styles.ownMessageLight;
    }
    return isDark ? styles.otherMessageDark : styles.otherMessageLight;
  };

  const getTextStyle = () =>
    isDark ? styles.messageTextDark : styles.messageTextLight;

  return (
    <>
      <Pressable onLongPress={handleLongPress}>
        <View
          style={[
            styles.messageContainer,
            isOwnMessage ? styles.ownContainer : styles.otherContainer,
          ]}
        >
          {/* Avatar placeholder */}
          {showAvatars && petInfo ? (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {petInfo.species === "dog" ? "🐕" : "🐱"}
              </Text>
            </View>
          ) : null}

          <LinearGradient
            colors={
              isOwnMessage
                ? ["#FF6B6B", "#FF8E8E"]
                : [colors.card, colors.background]
            }
            style={[styles.bubble, getBubbleStyle()]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={[styles.messageText, getTextStyle()]}>
              {message.content}
            </Text>
          </LinearGradient>

          {/* Display reactions */}
          {localReactions && Object.keys(localReactions).length > 0 && (
            <View style={styles.reactionsContainer}>
              {Object.entries(localReactions).map(([emoji, count]) => (
                <TouchableOpacity
                  key={emoji}
                  style={styles.reactionBadge}
                  onPress={() => handleReactionPress(emoji)}
                >
                  <Text style={styles.reactionEmoji}>{emoji}</Text>
                  {count > 1 && (
                    <Text style={styles.reactionCount}>{count}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={styles.messageMeta}>
            <Text
              style={[
                styles.timestamp,
                isDark ? styles.timestampDark : styles.timestampLight,
              ]}
            >
              {formatTime(message.sentAt)}
            </Text>
            {isOwnMessage && showStatus ? (
              <Text
                style={[
                  styles.status,
                  isDark ? styles.statusDark : styles.statusLight,
                ]}
              >
                {getStatusIcon()}
              </Text>
            ) : null}
          </View>
        </View>
      </Pressable>

      {/* Reaction Picker Modal */}
      <Modal
        visible={showReactionPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReactionPicker(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowReactionPicker(false)}
        >
          <View style={styles.reactionPicker}>
            {REACTION_EMOJIS.map((emoji) => (
              <TouchableOpacity
                key={emoji}
                style={styles.reactionPickerButton}
                onPress={() => handleReactionPress(emoji)}
              >
                <Text style={styles.reactionPickerEmoji}>{emoji}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  ownContainer: {
    justifyContent: "flex-end",
  },
  otherContainer: {
    justifyContent: "flex-start",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
  },
  avatarText: {
    fontSize: 16,
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
    maxWidth: "80%",
  },
  ownMessageDark: {
    backgroundColor: "#8B5CF6",
  },
  ownMessageLight: {
    backgroundColor: "#FF6B6B",
  },
  otherMessageDark: {
    backgroundColor: "#374151",
  },
  otherMessageLight: {
    backgroundColor: "#FFFFFF",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextDark: {
    color: "#FFFFFF",
  },
  messageTextLight: {
    color: "#111827",
  },
  reactionsContainer: {
    flexDirection: "row",
    marginTop: 4,
    flexWrap: "wrap",
    gap: 4,
  },
  reactionBadge: {
    backgroundColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 14,
  },
  reactionCount: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  timestampDark: {
    color: "#9CA3AF",
  },
  timestampLight: {
    color: "#9CA3AF",
  },
  status: {
    fontSize: 11,
    marginLeft: 4,
  },
  statusDark: {
    color: "#9CA3AF",
  },
  statusLight: {
    color: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
    paddingBottom: 100,
  },
  reactionPicker: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 24,
    marginHorizontal: 40,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  reactionPickerButton: {
    padding: 12,
  },
  reactionPickerEmoji: {
    fontSize: 32,
  },
});

