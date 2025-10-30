/**
 * Key Metrics Section Component
 * Displays main analytics metrics (users, matches, messages, revenue)
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../../../theme';
import { getExtendedColors } from '../../../../theme/adapters';
import type { ExtendedColors } from '../../../../theme/adapters';

function __makeStyles_styles(colors: ExtendedColors) {
  return StyleSheet.create({
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    secondaryMetricCard: {
      flex: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.card ?? colors.surface ?? '#FFFFFF',
      shadowColor: colors.shadow ?? colors.border ?? 'rgba(15, 23, 42, 0.12)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
    },
    metricTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginLeft: 8,
      color: colors.text ?? '#0F172A',
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
      color: colors.text ?? '#0F172A',
    },
    metricTrend: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    metricTrendText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textMuted ?? colors.onMuted ?? '#64748B',
    },
    metricSubtext: {
      fontSize: 12,
      marginTop: 4,
      color: colors.textSecondary ?? colors.textMuted ?? '#64748B',
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

const getTrendColor = (trend: 'up' | 'down' | 'stable', colors: ExtendedColors): string => {
  switch (trend) {
    case 'up':
      return colors.success ?? '#10B981';
    case 'down':
      return colors.danger ?? '#EF4444';
    default:
      return colors.textMuted ?? colors.onMuted ?? '#64748B';
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
  const theme = useTheme();
  const colors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => __makeStyles_styles(colors), [colors]);

  return (
    <View style={styles.metricsGrid}>
      {/* Users Metric */}
      <View style={styles.metricCard}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="people"
            size={20}
            color={colors.info ?? colors.primary ?? '#2563EB'}
          />
          <Text style={styles.metricTitle}>Users</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.users.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.users.trend)}
            size={16}
            color={getTrendColor(analytics.users.trend, colors)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.users.trend, colors) },
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
            color={colors.primary ?? colors.accent ?? '#2563EB'}
          />
          <Text style={styles.metricTitle}>Matches</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.matches.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.matches.trend)}
            size={16}
            color={getTrendColor(analytics.matches.trend, colors)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.matches.trend, colors) },
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
            color={colors.primary ?? colors.accent ?? '#2563EB'}
          />
          <Text style={styles.metricTitle}>Messages</Text>
        </View>
        <Text style={styles.metricValue}>{formatNumber(analytics.messages.total)}</Text>
        <View style={styles.metricTrend}>
          <Ionicons
            name={getTrendIcon(analytics.messages.trend)}
            size={16}
            color={getTrendColor(analytics.messages.trend, colors)}
          />
          <Text
            style={[
              styles.metricTrendText,
              { color: getTrendColor(analytics.messages.trend, colors) },
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
            color={colors.success ?? '#10B981'}
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
