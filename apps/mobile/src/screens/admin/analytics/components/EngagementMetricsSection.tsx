/**
 * Engagement Metrics Section Component
 * Displays engagement metrics (DAU, WAU, MAU, Session duration)
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    engagementGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    engagementCard: {
      width: '48%',
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    engagementLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    engagementValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
  });
}

interface EngagementData {
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  monthlyActiveUsers: number;
  averageSessionDuration: number;
  bounceRate: number;
  retentionRate: number;
}

interface EngagementMetricsSectionProps {
  engagement: EngagementData;
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export const EngagementMetricsSection: React.FC<EngagementMetricsSectionProps> = ({
  engagement,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.engagementGrid}>
      <View style={[styles.engagementCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.engagementLabel, { color: colors.onMuted }]}>DAU</Text>
        <Text style={[styles.engagementValue, { color: colors.onSurface }]}>
          {formatNumber(engagement.dailyActiveUsers)}
        </Text>
      </View>

      <View style={[styles.engagementCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.engagementLabel, { color: colors.onMuted }]}>WAU</Text>
        <Text style={[styles.engagementValue, { color: colors.onSurface }]}>
          {formatNumber(engagement.weeklyActiveUsers)}
        </Text>
      </View>

      <View style={[styles.engagementCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.engagementLabel, { color: colors.onMuted }]}>MAU</Text>
        <Text style={[styles.engagementValue, { color: colors.onSurface }]}>
          {formatNumber(engagement.monthlyActiveUsers)}
        </Text>
      </View>

      <View style={[styles.engagementCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.engagementLabel, { color: colors.onMuted }]}>Session</Text>
        <Text style={[styles.engagementValue, { color: colors.onSurface }]}>
          {Math.round(engagement.averageSessionDuration)}m
        </Text>
      </View>
    </View>
  );
};
