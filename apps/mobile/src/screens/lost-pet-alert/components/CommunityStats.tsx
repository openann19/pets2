/**
 * Community Stats Component
 * Displays community impact statistics
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@mobile/theme';

interface CommunityStatsProps {
  petsFound?: string;
  avgRecovery?: string;
  communityMembers?: string;
}

export const CommunityStats: React.FC<CommunityStatsProps> = ({
  petsFound = '94%',
  avgRecovery = '2.3h',
  communityMembers = '1,247',
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        statsSection: {
          margin: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          backgroundColor: theme.colors.surface,
        },
        statsTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        statsGrid: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
        },
        statItem: {
          alignItems: 'center' as const,
        },
        statValue: {
          fontSize: 20,
          fontWeight: '700' as const,
        },
        statLabel: {
          fontSize: 12,
          marginTop: 2,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.statsSection}>
      <Text style={styles.statsTitle}>Community Impact</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.success }]}>{petsFound}</Text>
          <Text style={styles.statLabel}>Pets Found</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.primary }]}>{avgRecovery}</Text>
          <Text style={styles.statLabel}>Avg Recovery</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: theme.colors.warning }]}>
            {communityMembers}
          </Text>
          <Text style={styles.statLabel}>Community Members</Text>
        </View>
      </View>
    </View>
  );
};

