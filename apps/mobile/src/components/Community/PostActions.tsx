/**
 * Post Actions Component
 * Displays like, comment, and share action buttons
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Interactive } from '../primitives/Interactive';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginEnd: theme.spacing.lg + theme.spacing.xs,
    },
    actionText: {
      marginStart: theme.spacing.xs + theme.spacing.xs / 2,
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
    },
  });
}

interface PostActionsProps {
  postId: string;
  liked: boolean;
  likes: number;
  commentsCount: number;
  onLike: () => void;
  onComment: () => void;
  onShare?: () => void;
  isLiking?: boolean;
}

export const PostActions: React.FC<PostActionsProps> = ({
  liked,
  likes,
  commentsCount,
  onLike,
  onComment,
  onShare,
  isLiking = false,
}) => {
  const theme = useTheme();
  const styles = __makeStyles_styles(theme);

  return (
    <View style={styles.actions}>
      <Interactive
        onPress={onLike}
        disabled={isLiking}
        accessibilityLabel="Like post"
        accessibilityRole="button"
        accessibilityState={{ selected: liked }}
      >
        <View style={styles.actionButton}>
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={24}
            color={liked ? theme.colors.primary : theme.colors.onMuted}
          />
          <Text
            style={[
              styles.actionText,
              { color: liked ? theme.colors.primary : theme.colors.onMuted },
            ]}
          >
            {likes}
          </Text>
        </View>
      </Interactive>

      <Interactive
        onPress={onComment}
        accessibilityLabel="View comments"
        accessibilityRole="button"
      >
        <View style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={24}
            color={theme.colors.onMuted}
          />
          <Text style={[styles.actionText, { color: theme.colors.onMuted }]}>
            {commentsCount}
          </Text>
        </View>
      </Interactive>

      {onShare && (
        <Interactive
          onPress={onShare}
          accessibilityLabel="Share post"
          accessibilityRole="button"
        >
          <View style={styles.actionButton}>
            <Ionicons
              name="share-outline"
              size={24}
              color={theme.colors.onMuted}
            />
          </View>
        </Interactive>
      )}
    </View>
  );
};

