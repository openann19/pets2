import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Animated } from "react-native";
import { Spacing, BorderRadius } from "../../animation";
import { useTheme } from "../../theme/Provider";
import { Theme } from '../../theme/unified-theme';

interface TypingIndicatorProps {
  typingUsers: string[];
  animationValue?: Animated.Value;
}

export function TypingIndicator({
  typingUsers,
  animationValue,
}: TypingIndicatorProps): React.JSX.Element | null {
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
        style={StyleSheet.flatten([
          styles.typingBubble,
          { backgroundColor: colors.white, borderColor: colors.gray200 },
        ])}
      >
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={StyleSheet.flatten([
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
              ])}
            />
          ))}
        </View>
        {typingUsers.length > 1 && (
          <Text
            style={StyleSheet.flatten([
              styles.typingText,
              { color: colors.gray500 },
            ])}
          >
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
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "Theme.colors.neutral[0]",
  },
  typingBubble: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.xl,
    borderBottomLeftRadius: BorderRadius.sm,
    marginLeft: Spacing.xs,
    borderWidth: 0.5,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  typingText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: Spacing.xs,
  },
});
