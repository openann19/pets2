import type { Message, User } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState, useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedRef,
  measure,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/Provider";
import { useBubbleRetryShake } from "../../hooks/useBubbleRetryShake";
import { useSwipeToReply } from "../../hooks/useSwipeToReply";
import { useHighlightPulse } from "../../hooks/useHighlightPulse";
import ReplySwipeHint from "./ReplySwipeHint";
import MorphingContextMenu, { type ContextAction } from "../menus/MorphingContextMenu";
import MessageTimestampBadge from "./MessageTimestampBadge";
import ReadByPopover from "./ReadByPopover";
import MessageStatusTicks from "./MessageStatusTicks";
import RetryBadge from "./RetryBadge";

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
    mood?: "happy" | "excited" | "curious" | "sleepy" | "playful";
  };
  users?: Map<string, User>; // For read receipt display
  onRetry?: () => void;
  onReply?: (message: Message) => void;
  onCopy?: (message: Message) => void;
  onReact?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onShowReadBy?: (message: Message) => void;
}

type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

function getMessageStatus(message: Message, currentUserId: string): MessageStatus {
  // Determine status based on message readBy array
  const readByCount = message.readBy.length;
  
  if (readByCount === 0) {
    return "sent"; // Message sent but not delivered/read yet
  }
  
  // Check if current user has read the message
  const isRead = message.readBy.some(receipt => receipt.user === currentUserId);
  
  if (isRead) {
    return "read";
  }
  
  // If someone read it but not current user, it's delivered
  if (readByCount > 0) {
    return "delivered";
  }
  
  return "sent";
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
  const { isDark, colors } = useTheme();
  const containerRef = useAnimatedRef<Animated.View>();
  const bubbleRef = useAnimatedRef<Animated.View>();
  
  const [showTime, setShowTime] = useState(true);
  const [showReadBy, setShowReadBy] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [anchor, setAnchor] = useState<{ x: number; y: number } | undefined>(undefined);
  const [menuAnchor, setMenuAnchor] = useState<{ x: number; y: number; width: number; height: number } | undefined>(undefined);
  
  const messageStatus = getMessageStatus(message, currentUserId);
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();
  
  // Swipe-to-reply gesture
  const { gesture: swipeGesture, bubbleStyle, progressX } = useSwipeToReply({
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
  const canShowReadBy = isOwnMessage && (messageStatus === "delivered" || messageStatus === "read");
  
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
  const canReadByInMenu = isOwnMessage && (messageStatus === "delivered" || messageStatus === "read");
  const actions: ContextAction[] = [
    { key: "reply", label: "Reply", icon: "arrow-undo", onPress: () => onReply?.(message) },
    { key: "copy", label: "Copy", icon: "copy", onPress: () => onCopy?.(message) },
    { key: "react", label: "React…", icon: "happy", onPress: () => onReact?.(message) },
    ...(canReadByInMenu ? [{ key: "readby", label: "Read by…", icon: "eye", onPress: () => onShowReadBy?.(message) }] : []),
    ...(isOwnMessage
      ? [{ key: "delete", label: "Delete", icon: "trash", onPress: () => onDelete?.(message), danger: true }]
      : []),
  ];

  const composed = Gesture.Exclusive(
    swipeGesture,
    Gesture.Simultaneous(tap, longPressMenu, longPressReadBy)
  );

  const formatTime = (timestamp: string) =>
    new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMilestoneBadge = () => {
    if (!messageIndex || !totalMessages) return null;

    const milestones = [1, 5, 10, 25, 50, 100];
    const isMilestone = milestones.includes(messageIndex + 1);

    if (!isMilestone) return null;

    return {
      text:
        messageIndex + 1 === 1
          ? "First message!"
          : `${messageIndex + 1} messages!`,
      emoji: messageIndex + 1 === 1 ? "🎉" : "🏆",
    };
  };

  const getPetAvatar = () => {
    if (!showAvatars || !petInfo) return null;

    const { species, mood = "happy" } = petInfo;
    const speciesEmojis = {
      dog: {
        happy: "🐕",
        excited: "🐕‍🦺",
        curious: "🐕",
        sleepy: "😴",
        playful: "🐕",
      },
      cat: {
        happy: "🐱",
        excited: "🐱",
        curious: "🐱",
        sleepy: "😴",
        playful: "🐱",
      },
      bird: {
        happy: "🐦",
        excited: "🐦",
        curious: "🐦",
        sleepy: "😴",
        playful: "🐦",
      },
      rabbit: {
        happy: "🐰",
        excited: "🐰",
        curious: "🐰",
        sleepy: "😴",
        playful: "🐰",
      },
      other: {
        happy: "🐾",
        excited: "🐾",
        curious: "🐾",
        sleepy: "😴",
        playful: "🐾",
      },
    };

    const emojiSet =
      speciesEmojis[species as keyof typeof speciesEmojis] ||
      speciesEmojis.other;
    return emojiSet[mood];
  };

  const getBubbleStyle = () => {
    if (isOwnMessage) {
      return isDark ? styles.ownMessageDark : styles.ownMessageLight;
    }
    return isDark ? styles.otherMessageDark : styles.otherMessageLight;
  };

  const getTextStyle = () =>
    isDark ? styles.messageTextDark : styles.messageTextLight;

  if (message.messageType === "image") {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <View style={styles.imageBubble}>
          <Text style={styles.imagePlaceholder}>📷 Image</Text>
        </View>
        <View style={styles.messageMeta}>
          <MessageTimestampBadge
            iso={message.sentAt}
            visible={showTime}
            textColor={isOwnMessage ? "#fff" : "#111"}
            bgColor={isOwnMessage ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)"}
            accentColor={isOwnMessage ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"}
          />
          {isOwnMessage && showStatus && (
            <View style={styles.footerRow}>
              <MessageStatusTicks status={messageStatus} size={12} />
              {messageStatus === "failed" ? <RetryBadge onPress={handleRetry} /> : null}
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
                    isDark ? styles.avatarNameDark : styles.avatarNameLight,
                  ])}
                >
                  {petInfo.name}
                </Text>
              ) : null}
            </View>
          ) : null}

          <Animated.View style={bubbleStyle} ref={bubbleRef}>
            <LinearGradient
              colors={
                isOwnMessage
                  ? ["#FF6B6B", "#FF8E8E"]
                  : [colors.bgElevated, colors.bg]
              }
              style={StyleSheet.flatten([styles.bubble, getBubbleStyle()])}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              {/* Reply Quote */}
              {message.replyTo ? (
                <View style={styles.replyQuote}>
                  <View style={styles.replyBar} />
                  <Text style={styles.replyAuthor} numberOfLines={1}>
                    {message.replyTo.author ?? "Replying to"}
                  </Text>
                  <Text style={styles.replySnippet} numberOfLines={2}>
                    {message.replyTo.text ?? "Media"}
                  </Text>
                </View>
              ) : null}
              
              <Text style={StyleSheet.flatten([styles.messageText, getTextStyle()])}>
                {message.content}
              </Text>
            </LinearGradient>
            {/* Reply swipe hint */}
            <ReplySwipeHint progress={progressX} align={isOwnMessage ? "right" : "left"} />
          </Animated.View>

          <View style={styles.messageMeta}>
            <MessageTimestampBadge
              iso={message.sentAt}
              visible={showTime}
              textColor={isOwnMessage ? "#fff" : "#111"}
              bgColor={isOwnMessage ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.14)"}
              accentColor={isOwnMessage ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.5)"}
            />
            {isOwnMessage && showStatus && (
              <View style={styles.footerRow}>
                <MessageStatusTicks status={messageStatus} size={12} />
                {messageStatus === "failed" ? <RetryBadge onPress={handleRetry} /> : null}
              </View>
            )}
          </View>
        </Animated.View>
      </GestureDetector>

      {/* Read-by popover */}
      <ReadByPopover
        visible={showReadBy}
        onClose={() => setShowReadBy(false)}
        receipts={message.readBy}
        users={users}
        anchor={anchor}
        theme={{
          bg: isDark ? "#111" : "#fff",
          text: isDark ? "#fff" : "#111",
          subtext: isDark ? "#9ca3af" : "#666",
          border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
        }}
      />

      {/* Morphing context menu */}
      <MorphingContextMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={menuAnchor}
        actions={actions}
        theme={{
          bg: isDark ? "#111" : "#fff",
          border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          text: isDark ? "#fff" : "#111",
          sub: isDark ? "#9ca3af" : "#666",
          item: isDark ? "#181818" : "#f9fafb",
          itemPressed: isDark ? "#222" : "#f3f4f6",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
  },
  ownContainer: {
    alignSelf: "flex-end",
    alignItems: "flex-end",
  },
  otherContainer: {
    alignSelf: "flex-start",
    alignItems: "flex-start",
  },
  milestoneContainer: {
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: "#FF6B6B",
    borderRadius: 12,
  },
  milestoneText: {
    fontSize: 12,
    color: "#fff",
    fontWeight: "600",
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    maxWidth: 120,
  },
  ownAvatar: {
    alignSelf: "flex-end",
  },
  otherAvatar: {
    alignSelf: "flex-start",
  },
  avatarEmoji: {
    fontSize: 20,
    marginRight: 4,
  },
  avatarName: {
    fontSize: 12,
    fontWeight: "500",
  },
  avatarNameLight: {
    color: "#1A1A1A",
  },
  avatarNameDark: {
    color: "#E0E0E0",
  },
  bubble: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ownMessageLight: {
    backgroundColor: "#FF6B6B",
  },
  ownMessageDark: {
    backgroundColor: "#E55555",
  },
  otherMessageLight: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  otherMessageDark: {
    backgroundColor: "#2A2A2A",
    borderWidth: 1,
    borderColor: "#404040",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageTextLight: {
    color: "#1A1A1A",
  },
  messageTextDark: {
    color: "#E0E0E0",
  },
  imageBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholder: {
    fontSize: 14,
    color: "#666",
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  replyQuote: {
    marginBottom: 6,
    padding: 8,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.06)",
    position: "relative",
    borderLeftWidth: 3,
    borderLeftColor: "#ec4899",
    paddingLeft: 10,
  },
  replyBar: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderRadius: 3,
    backgroundColor: "#ec4899",
  },
  replyAuthor: {
    fontSize: 11,
    fontWeight: "700",
    opacity: 0.8,
    marginBottom: 2,
  },
  replySnippet: {
    marginTop: 2,
    fontSize: 12,
    opacity: 0.9,
  },
});

export default MessageBubbleEnhanced;

