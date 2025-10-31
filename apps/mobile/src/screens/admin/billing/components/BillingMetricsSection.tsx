/**
 * Billing Metrics Section Component
 * Displays revenue and subscription metrics
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { BillingMetrics } from '../hooks/useAdminBilling';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    metricsContainer: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    metricCard: {
      width: (SCREEN_WIDTH - theme.spacing['2xl'] - theme.spacing.sm) / 2,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    metricTitle: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginStart: theme.spacing.sm,
    },
    metricValue: {
      fontSize: theme.typography.h2.size * 0.875,
      fontWeight: theme.typography.h1.weight,
    },
    secondaryMetrics: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    secondaryMetricCard: {
      flex: 1,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      ...theme.shadows.elevation2,
    },
    secondaryMetricLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs,
    },
    secondaryMetricValue: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
  });

interface BillingMetricsSectionProps {
  metrics: BillingMetrics;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);

export const BillingMetricsSection = ({
  metrics,
}: BillingMetricsSectionProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.metricsContainer}>
      <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
        Revenue Overview
      </Text>
      <View style={styles.metricsGrid}>
        <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="cash"
              size={20}
              color={theme.colors.success}
            />
            <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
              Total Revenue
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(metrics.totalRevenue)}
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="trending-up"
              size={20}
              color={theme.colors.info}
            />
            <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>MRR</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(metrics.monthlyRecurringRevenue)}
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="people"
              size={20}
              color={theme.colors.primary}
            />
            <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>ARPU</Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            {formatCurrency(metrics.averageRevenuePerUser)}
          </Text>
        </View>

        <View style={[styles.metricCard, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={theme.colors.success}
            />
            <Text style={[styles.metricTitle, { color: theme.colors.onSurface }]}>
              Active Subs
            </Text>
          </View>
          <Text style={[styles.metricValue, { color: theme.colors.onSurface }]}>
            {metrics.activeSubscriptions}
          </Text>
        </View>
      </View>

      <View style={styles.secondaryMetrics}>
        <View style={[styles.secondaryMetricCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.secondaryMetricLabel, { color: theme.colors.onMuted }]}>
            Conversion Rate
          </Text>
          <Text style={[styles.secondaryMetricValue, { color: theme.colors.onSurface }]}>
            {metrics.conversionRate.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.secondaryMetricCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.secondaryMetricLabel, { color: theme.colors.onMuted }]}>
            Churn Rate
          </Text>
          <Text style={[styles.secondaryMetricValue, { color: theme.colors.danger }]}>
            {metrics.churnRate.toFixed(1)}%
          </Text>
        </View>
        <View style={[styles.secondaryMetricCard, { backgroundColor: theme.colors.surface }]}>
          <Text style={[styles.secondaryMetricLabel, { color: theme.colors.onMuted }]}>
            Revenue Growth
          </Text>
          <Text
            style={[
              styles.secondaryMetricValue,
              {
                color: metrics.revenueGrowth > 0 ? theme.colors.success : theme.colors.danger,
              },
            ]}
          >
            {metrics.revenueGrowth > 0 ? '+' : ''}
            {metrics.revenueGrowth.toFixed(1)}%
          </Text>
        </View>
      </View>
    </View>
  );
};
