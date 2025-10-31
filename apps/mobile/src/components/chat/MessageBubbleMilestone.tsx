/**
 * MessageBubbleMilestone Component
 * Displays milestone badges for significant message counts
 */

import { useTheme } from '@mobile/theme';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface MessageBubbleMilestoneProps {
  messageIndex?: number;
  totalMessages?: number;
}

export function MessageBubbleMilestone({
  messageIndex,
  totalMessages,
}: MessageBubbleMilestoneProps): React.JSX.Element | null {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        milestoneContainer: {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.md,
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          marginBottom: theme.spacing.xs,
          alignSelf: 'center',
        },
        milestoneText: {
          fontSize: 12,
          fontWeight: '600',
          color: theme.colors.primary,
        },
      }),
    [theme],
  );

  const getMilestoneBadge = () => {
    if (!messageIndex || !totalMessages) return null;

    const milestones = [1, 5, 10, 25, 50, 100];
    const isMilestone = milestones.includes(messageIndex + 1);

    if (!isMilestone) return null;

    return {
      text: messageIndex + 1 === 1 ? 'First message!' : `${messageIndex + 1} messages!`,
      emoji: messageIndex + 1 === 1 ? '🎉' : '🏆',
    };
  };

  const milestone = getMilestoneBadge();

  if (!milestone) return null;

  return (
    <View style={styles.milestoneContainer}>
      <Text style={styles.milestoneText}>
        {milestone.emoji} {milestone.text}
      </Text>
    </View>
  );
}

