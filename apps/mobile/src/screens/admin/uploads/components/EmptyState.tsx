/**
 * Empty State Component
 * Displays when no uploads are found
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export const EmptyState = (): React.JSX.Element => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      <Ionicons
        name="images-outline"
        size={64}
        color={theme.colors.onMuted}
      />
      <Text style={[styles.text, { color: theme.colors.onMuted }]}>No uploads found</Text>
    </View>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing['4xl'],
    },
    text: {
      fontSize: theme.typography.body.size,
      marginTop: theme.spacing.lg,
    },
  });

