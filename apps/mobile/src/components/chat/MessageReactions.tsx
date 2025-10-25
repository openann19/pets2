import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import Text, { BodySmall } from "../Text";

interface Reaction {
  emoji: string;
  label: string;
}

interface MessageReactionsProps {
  visible: boolean;
  onClose: () => void;
  onReactionSelect: (emoji: string) => void;
  position: { x: number; y: number };
}

const REACTIONS: Reaction[] = [
  { emoji: "👍", label: "Like" },
  { emoji: "❤️", label: "Love" },
  { emoji: "😂", label: "Laugh" },
  { emoji: "😮", label: "Wow" },
  { emoji: "😢", label: "Sad" },
  { emoji: "🎉", label: "Celebrate" },
];

export function MessageReactions({
  visible,
  onClose,
  onReactionSelect,
  position,
}: MessageReactionsProps) {
  const [scaleAnim] = useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim]);

  const handleReactionSelect = (emoji: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onReactionSelect(emoji);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="none">
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.container,
            {
              top: position.y - 70,
              left: Math.max(10, Math.min(position.x - 150, 300)),
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <BlurView intensity={80} style={styles.blurContainer}>
            <LinearGradient
              colors={["rgba(255,255,255,0.95)", "rgba(255,255,255,0.9)"]}
              style={styles.reactionsContainer}
            >
              {REACTIONS.map((reaction, index) => (
                <TouchableOpacity
                  key={reaction.emoji}
                  style={[
                    styles.reactionButton,
                    index === 0 && styles.firstReaction,
                    index === REACTIONS.length - 1 && styles.lastReaction,
                  ]}
                  onPress={() => {
                    handleReactionSelect(reaction.emoji);
                  }}
                  activeOpacity={0.7}
                >
                  <Animated.Text style={styles.emoji}>
                    {reaction.emoji}
                  </Animated.Text>
                </TouchableOpacity>
              ))}
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
}

interface ReactionBubbleProps {
  reactions: Array<{ emoji: string; count: number; userReacted: boolean }>;
  onReactionPress: (emoji: string) => void;
  onAddReaction: () => void;
}

export function ReactionBubble({
  reactions,
  onReactionPress,
  onAddReaction,
}: ReactionBubbleProps) {
  if (reactions.length === 0) return null;

  return (
    <View style={styles.bubbleContainer}>
      {reactions.map((reaction) => (
        <TouchableOpacity
          key={reaction.emoji}
          style={[
            styles.reactionBubble,
            reaction.userReacted && styles.reactionBubbleActive,
          ]}
          onPress={() => {
            onReactionPress(reaction.emoji);
          }}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={
              reaction.userReacted
                ? ["#fef2f2", "#fee2e2"]
                : ["#ffffff", "#f9fafb"]
            }
            style={styles.bubbleGradient}
          >
            <Text style={styles.bubbleEmoji}>{reaction.emoji}</Text>
            {reaction.count > 1 && (
              <BodySmall style={styles.bubbleCount}>
                {reaction.count}
              </BodySmall>
            )}
          </LinearGradient>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.addReactionButton}
        onPress={onAddReaction}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["#f9fafb", "#f3f4f6"]}
          style={styles.addReactionGradient}
        >
          <Text style={styles.addReactionText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "transparent",
  },
  container: {
    position: "absolute",
    width: 300,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reactionsContainer: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  reactionButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  firstReaction: {
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
  },
  lastReaction: {
    borderTopRightRadius: 24,
    borderBottomRightRadius: 24,
  },
  emoji: {
    fontSize: 28,
  },
  bubbleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
    gap: 4,
  },
  reactionBubble: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  reactionBubbleActive: {
    borderColor: "#ef4444",
  },
  bubbleGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  bubbleEmoji: {
    fontSize: 16,
  },
  bubbleCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
  addReactionButton: {
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  addReactionGradient: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  addReactionText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#9ca3af",
  },
});
