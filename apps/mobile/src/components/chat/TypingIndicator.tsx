import { useTheme } from '@mobile/theme';
import React, { useMemo } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';

interface TypingIndicatorProps {
  typingUsers: string[];
  animationValue?: Animated.Value;
}

export function TypingIndicator({
  typingUsers,
  animationValue,
}: TypingIndicatorProps): React.JSX.Element | null {
  const { colors, spacing, radius } = useTheme();

  if (typingUsers.length === 0) return null;

  return (
    <View style={styles.container}>
      <Image
        source={{
          uri: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=100',
        }}
        style={styles.avatar}
      />
      <View
        style={StyleSheet.flatten([
          styles.typingBubble,
          { backgroundColor: colors.bgElevated, borderColor: colors.border },
        ])}
      >
        <View style={styles.typingDots}>
          {[0, 1, 2].map((i) => (
            <Animated.View
              key={i}
              style={StyleSheet.flatten([
                styles.typingDot,
                {
                  backgroundColor: colors.textMuted,
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
          <Text style={StyleSheet.flatten([styles.typingText, { color: colors.textMuted }])}>
            {typingUsers.length} people are typing...
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = useMemo(
  () =>
    StyleSheet.create({
      container: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.sm,
      },
      avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
      },
      typingBubble: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: radius.md, // 0.75rem
        borderBottomLeftRadius: 2, // 0.125rem
        marginLeft: spacing.xs,
        borderWidth: 0.5,
      },
      typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
      },
      typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 2,
      },
      typingText: {
        fontSize: 12,
        fontStyle: 'italic',
        marginTop: spacing.xs,
      },
    }),
  [spacing, radius],
);

export default TypingIndicator;
