/**
 * Comments Section Component
 * Displays comments for a post
 */

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { CommunityComment } from '../../services/communityAPI';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    commentsSection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
    },
    comment: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    commentAuthor: {
      fontWeight: theme.typography.h2.weight,
      marginEnd: theme.spacing.xs + theme.spacing.xs / 2,
    },
    commentText: {
      flex: 1,
    },
  });
}

interface CommentsSectionProps {
  comments: CommunityComment[];
  maxVisible?: number;
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  comments,
  maxVisible = 3,
}) => {
  const theme = useTheme();
  const styles = __makeStyles_styles(theme);

  if (comments.length === 0) return null;

  return (
    <View style={[styles.commentsSection, { borderTopColor: theme.colors.border }]}>
      {comments.slice(0, maxVisible).map((comment) => (
        <View key={comment._id} style={styles.comment}>
          <Text style={[styles.commentAuthor, { color: theme.colors.onSurface }]}>
            {comment.author.name}
          </Text>
          <Text style={[styles.commentText, { color: theme.colors.onMuted }]}>
            {comment.content}
          </Text>
        </View>
      ))}
    </View>
  );
};

