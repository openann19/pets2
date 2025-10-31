/**
 * Community List Footer Component
 * Displays loading indicator at the bottom of the feed while loading more posts
 */

import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface CommunityListFooterProps {
  isLoading: boolean;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      paddingVertical: theme.spacing.lg + theme.spacing.xs,
      alignItems: 'center',
    },
  });
};

export const CommunityListFooter: React.FC<CommunityListFooterProps> = ({ isLoading }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (!isLoading) return null;

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="small"
        color={theme.colors.primary}
      />
    </View>
  );
};

