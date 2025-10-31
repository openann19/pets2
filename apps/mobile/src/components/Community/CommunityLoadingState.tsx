/**
 * Community Loading State Component
 * Displays loading indicator while fetching posts
 */

import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface CommunityLoadingStateProps {
  message?: string;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    text: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
    },
  });
};

export const CommunityLoadingState: React.FC<CommunityLoadingStateProps> = ({
  message = 'Loading community...',
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
      />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
};

