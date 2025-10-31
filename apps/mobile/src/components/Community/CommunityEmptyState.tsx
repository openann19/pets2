/**
 * Community Empty State Component
 * Displays when there are no posts in the feed
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface CommunityEmptyStateProps {
  onCreatePost?: () => void;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['3xl'] + theme.spacing.xl,
    },
    icon: {
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginTop: theme.spacing.lg,
      color: theme.colors.onSurface,
    },
    text: {
      fontSize: theme.typography.body.size * 0.875,
      marginTop: theme.spacing.sm,
      color: theme.colors.onMuted,
    },
  });
};

export const CommunityEmptyState: React.FC<CommunityEmptyStateProps> = ({ onCreatePost: _onCreatePost }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <Ionicons
        name="people-outline"
        size={64}
        color={theme.colors.onMuted}
        style={styles.icon}
      />
      <Text style={styles.title}>No posts yet</Text>
      <Text style={styles.text}>Be the first to share something!</Text>
    </View>
  );
};

