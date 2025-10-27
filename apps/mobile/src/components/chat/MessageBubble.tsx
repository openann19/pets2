import type { Message } from "@pawfectmatch/core";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedRef,
  measure,
  runOnJS,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useTheme } from "../../theme/Provider";
import { Theme } from "../../theme/unified-theme";
import { useSwipeToReply } from "../../hooks/useSwipeToReply";
import ReplySwipeHint from "./ReplySwipeHint";
import MorphingContextMenu, { type ContextAction } from "../menus/MorphingContextMenu";
import MessageStatusTicks, { type MessageStatus } from "./MessageStatusTicks";
import RetryBadge from "./RetryBadge";
import { useBubbleRetryShake } from "../../hooks/useBubbleRetryShake";

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
    mood?: "happy" | "excited" | "curious" | "sleepy" | "playful";
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
  const { isDark, colors } = useTheme();
  const { style: bubbleShakeStyle, shake } = useBubbleRetryShake();
  
  // Default status if not provided
  const messageStatus: MessageStatus = message.status || "sent";
  
  // Measure anchor rect for morphing menu
  const bubbleRef = useAnimatedRef<Animated.View>();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [anchor, setAnchor] = React.useState<{ x: number; y: number; width: number; height: number }>();

  // Swipe-to-reply gesture
  const { gesture: swipeGesture, bubbleStyle, progressX } = useSwipeToReply({
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
          height: m.height 
        });
      }
      runOnJS(setMenuVisible)(true);
      Haptics.selectionAsync().catch(() => {});
    });

  const tap = Gesture.Tap();
  const composed = Gesture.Exclusive(swipeGesture, Gesture.Simultaneous(longPress, tap));

  // Menu actions
  const canReadBy = isOwnMessage && (messageStatus === "delivered" || messageStatus === "read");
  const actions: ContextAction[] = [
    { key: "reply", label: "Reply", icon: "arrow-undo", onPress: () => onReply?.(message) },
    { key: "copy", label: "Copy", icon: "copy", onPress: () => onCopy?.(message) },
    { key: "react", label: "React…", icon: "happy", onPress: () => onReact?.(message) },
    ...(canReadBy ? [{ key: "readby", label: "Read by…", icon: "eye", onPress: () => onShowReadBy?.(message) }] : []),
    ...(isOwnMessage
      ? [{ key: "delete", label: "Delete", icon: "trash", onPress: () => onDelete?.(message), danger: true }]
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
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusIcon = () => {
    if (!showStatus) return null;

    // Check if current user has read the message
    const isRead = message.readBy.some(
      (receipt) => receipt.user === currentUserId,
    );

    if (isRead) return "✓✓";
    return "✓";
  };

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
        <TouchableOpacity style={styles.imageBubble}>
          <Text style={styles.imagePlaceholder}>📷 Image</Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? (
            <Text style={styles.status}>{getStatusIcon()}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (message.messageType === "voice") {
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
          {isOwnMessage && showStatus ? (
            <Text style={styles.status}>{getStatusIcon()}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (message.messageType === "video") {
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
          {isOwnMessage && showStatus ? (
            <Text style={styles.status}>{getStatusIcon()}</Text>
          ) : null}
        </View>
      </View>
    );
  }

  if (message.messageType === "gif" || message.messageType === "sticker") {
    return (
      <View
        style={StyleSheet.flatten([
          styles.messageContainer,
          isOwnMessage ? styles.ownContainer : styles.otherContainer,
        ])}
      >
        <TouchableOpacity style={styles.gifBubble}>
          <Text style={styles.gifPlaceholder}>
            {message.messageType === "gif" ? "🎭 GIF" : "😊 Sticker"}
          </Text>
        </TouchableOpacity>
        <View style={styles.messageMeta}>
          <Text style={styles.timestamp}>{formatTime(message.sentAt)}</Text>
          {isOwnMessage && showStatus ? (
            <Text style={styles.status}>{getStatusIcon()}</Text>
          ) : null}
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
            isOwnMessage && messageStatus === "failed" && bubbleShakeStyle,
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
                isDark ? styles.avatarNameDark : styles.avatarNameLight,
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
              ? ["#FF6B6B", "#FF8E8E"]
              : ["#F0F0F0", "#E0E0E0"]
          }
          style={StyleSheet.flatten([styles.bubble, getBubbleStyle()])}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        <Text style={StyleSheet.flatten([styles.messageText, getTextStyle()])}>
          {message.content}
        </Text>

        {/* Proactive UI - Quick reactions for common responses */}
        {!isOwnMessage && showAvatars ? (
          <View style={styles.quickReactions}>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>👍</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>❤️</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.reactionButton}>
              <Text style={styles.reactionEmoji}>😂</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </LinearGradient>

      <View style={styles.messageMeta}>
        <Text
          style={StyleSheet.flatten([
            styles.timestamp,
            isDark ? styles.timestampDark : styles.timestampLight,
          ])}
        >
          {formatTime(message.sentAt)}
        </Text>
        {isOwnMessage && showStatus ? (
          <View style={styles.statusRow}>
            <MessageStatusTicks
              status={messageStatus}
              size={12}
              sentColor="#9ca3af"
              deliveredColor="#9ca3af"
              readColor="#3b82f6"
              failedColor="#ef4444"
            />
            {messageStatus === "failed" && (
              <RetryBadge onPress={handleRetry} />
            )}
          </View>
        ) : null}
        </View>
      </Animated.View>

      {/* Reply swipe hint - appears during swipe */}
      {!isOwnMessage && (
        <ReplySwipeHint progress={progressX} align="right" />
      )}
      </Animated.View>
      </GestureDetector>

      {/* Context menu */}
      <MorphingContextMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        anchor={anchor}
        actions={actions}
        theme={{
          bg: isDark ? "#111" : "#fff",
          border: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)",
          text: isDark ? "#fff" : "#111",
          sub: isDark ? "#9ca3af" : "#666",
          item: isDark ? "#181818" : "#f8f9fa",
          itemPressed: isDark ? "#222" : "#e0e0e0",
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 4,
    maxWidth: "80%",
    position: "relative",
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
    color: Theme.colors.neutral[0],
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
    shadowColor: Theme.colors.neutral[900],
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
    backgroundColor: Theme.colors.neutral[0],
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
  quickReactions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.2)",
  },
  reactionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
  },
  reactionEmoji: {
    fontSize: 16,
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
  voiceBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  voicePlaceholder: {
    fontSize: 14,
    color: "#666",
  },
  videoBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  videoPlaceholder: {
    fontSize: 14,
    color: "#666",
  },
  gifBubble: {
    backgroundColor: "#F0F0F0",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  gifPlaceholder: {
    fontSize: 14,
    color: "#666",
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    marginRight: 4,
  },
  timestampLight: {
    color: "#999",
  },
  timestampDark: {
    color: "#666",
  },
  status: {
    fontSize: 12,
  },
  statusLight: {
    color: "#666",
  },
  statusDark: {
    color: "#999",
  },
});

export default MessageBubble;
