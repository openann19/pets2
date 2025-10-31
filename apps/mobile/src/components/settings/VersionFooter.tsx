/**
 * VersionFooter Component
 * Displays app version information
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme';

export function VersionFooter(): React.JSX.Element {
  const theme = useTheme();

  const styles = StyleSheet.create({
    versionSection: {
      alignItems: 'center',
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
    },
    versionText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      fontWeight: theme.typography.body.weight,
    },
    versionSubtitle: {
      fontSize: theme.typography.body.size * 0.857, // ~12px
      color: theme.colors.onMuted,
      marginTop: theme.spacing.xs,
    },
  });

  return (
    <View style={styles.versionSection}>
      <Text style={styles.versionText}>PawfectMatch v1.0.0</Text>
      <Text style={styles.versionSubtitle}>Built with ❤️ for pet lovers</Text>
    </View>
  );
}

