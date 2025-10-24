import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Animated } from "react-native";
import { tokens } from "@pawfectmatch/design-tokens";
import { useTheme } from "../../contexts/ThemeContext";

interface TypingIndicatorProps {
  typingUsers: string[];
  animationValue?: Animated.Value;
}

export function TypingIndicator({
  typingUsers,
  animationValue,
}: TypingIndicatorProps): React.JSX.Element {
  const { colors } = useTheme();

  if (typingUsers.length === 0) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=100",
        }}
        style={styles.avatar}
      />
      <View
        style={[
          styles.typingBubble,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ]}
      >
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={[
                styles.typingDot,
                {
                  backgroundColor: colors.gray500,
                  opacity:
                    animationValue?.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.3, 1, 0.3],
                    }) ?? 0.5,
                  transform: [
                    {
                      translateY:
                        animationValue?.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, -3, 0],
                        }) ?? 0,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
        {typingUsers.length > 1 && (
          <Text style={[styles.typingText, { color: colors.gray500 }]}>
            {typingUsers.length} people are typing...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: tokens.spacing.lg,
    marginBottom: tokens.spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  typingBubble: {
    paddingHorizontal: tokens.spacing.md,
    paddingVertical: tokens.spacing.sm,
    borderRadius: tokens.borderRadius.xl,
    borderBottomLeftRadius: tokens.borderRadius.sm,
    marginLeft: tokens.spacing.xs,
    borderWidth: 0.5,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: tokens.spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingText: {
    fontSize: tokens.typography.caption.fontSize,
    fontStyle: "italic",
    marginTop: tokens.spacing.xs,
  },
});
