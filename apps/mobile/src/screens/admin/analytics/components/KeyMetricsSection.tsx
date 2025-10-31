/**
 * Key Metrics Section Component
 * Displays main analytics metrics (users, matches, messages, revenue)
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    metricCard: {
      flex: 1,
      minWidth: '48%',
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      ...theme.shadows.elevation2,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.xs,
    },
    metricTitle: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginLeft: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    metricValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    metricTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    metricTrendText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onMuted,
    },
    metricSubtext: {
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs,
      color: theme.colors.onMuted,
    },
  });
}

interface MetricData {
  total: number;
  growth: number;
  trend: 'up' | 'down' | 'stable';
}

interface AnalyticsData {
  users: MetricData;
  matches: MetricData;
  messages: MetricData;
  revenue: {
    totalRevenue: number;
    monthlyRecurringRevenue: number;
  };
}

interface KeyMetricsSectionProps {
  analytics: AnalyticsData;
}

const getTrendIcon = (
  trend: 'up' | 'down' | 'stable',
): 'trending-up' | 'trending-down' | 'remove' => {
  switch (trend) {
    case 'up':
      return 'trending-up';
    case 'down':
      return 'trending-down';
    default:
      return 'remove';
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'stable', theme: AppTheme): string => {
  switch (trend) {
    case 'up':
      return theme.colors.success;
    case 'down':
      return theme.colors.danger;
    default:
      return theme.colors.onMuted;
  }
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);

export const KeyMetricsSection: React.FC<KeyMetricsSectionProps> = ({ analytics }) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.metricsGrid}>
      {/* Users Metric */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="people"
            size={20}
            color={colors.info}
          />
          <Text style={styles.metricTitle}>Users</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.users.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.users.trend)}
            size={16}
            color={getTrendColor(analytics.users.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.users.trend, theme) },
            ]}
          >
            {analytics.users.growth > 0 ? '+' : ''}
            {analytics.users.growth}%
          </Text>
        </View>
      </View>

      {/* Matches Metric */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="heart"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.metricTitle}>Matches</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.matches.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.matches.trend)}
            size={16}
            color={getTrendColor(analytics.matches.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.matches.trend, theme) },
            ]}
          >
            {analytics.matches.growth > 0 ? '+' : ''}
            {analytics.matches.growth}%
          </Text>
        </View>
      </View>

      {/* Messages Metric */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="chatbubble"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.metricTitle}>Messages</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.messages.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.messages.trend)}
            size={16}
            color={getTrendColor(analytics.messages.trend, theme)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.messages.trend, theme) },
            ]}
          >
            {analytics.messages.growth > 0 ? '+' : ''}
            {analytics.messages.growth}%
          </Text>
        </View>
      </View>

      {/* Revenue Metric */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="cash"
            size={20}
            color={colors.success}
          />
          <Text style={styles.metricTitle}>Revenue</Text>
        </View>
        <Text style={styles.metricValue}>{formatCurrency(analytics.revenue.totalRevenue)}</Text>
        <Text style={styles.metricSubtext}>
          MRR: {formatCurrency(analytics.revenue.monthlyRecurringRevenue)}
        </Text>
      </View>
    </View>
  );
};
