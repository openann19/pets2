import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { BillingMetrics } from '../hooks/useAdminBilling';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { getExtendedColors } from '@/theme/adapters';
import type { ExtendedColors } from '@/theme/adapters';

function __makeStyles_styles(theme: AppTheme, colors: ExtendedColors) {
  return StyleSheet.create({
    metricsContainer: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 16,
      color: colors.text,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 16,
    },
    metricCard: {
      flex: 1,
      minWidth: '47%',
      borderRadius: 12,
      padding: 16,
      backgroundColor: colors.card,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    metricHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    metricTitle: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textMuted,
    },
    metricValue: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
    },
    secondaryMetrics: {
      flexDirection: 'row',
      gap: 8,
    },
    secondaryMetricCard: {
      flex: 1,
      borderRadius: 8,
      padding: 12,
      backgroundColor: colors.card,
    },
    secondaryMetricLabel: {
      fontSize: 11,
      marginBottom: 4,
      color: colors.textMuted,
    },
    secondaryMetricValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
  });
}

interface BillingMetricsSectionProps {
  metrics: BillingMetrics;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const BillingMetricsSection = ({
  metrics,
}: BillingMetricsSectionProps): React.JSX.Element => {
  const theme = useTheme();
  const extendedColors = useMemo(() => getExtendedColors(theme), [theme]);
  const styles = useMemo(() => __makeStyles_styles(theme, extendedColors), [theme, extendedColors]);
  const { colors } = extendedColors;

  return (
    <View style={styles.metricsContainer}>
      <Text style={styles.sectionTitle}>Revenue Overview</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="cash"
              size={20}
              color={colors.success}
            />
            <Text style={styles.metricTitle}>Total Revenue</Text>
          </View>
          <Text style={styles.metricValue}>{formatCurrency(metrics.totalRevenue)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="trending-up"
              size={20}
              color={colors.info}
            />
            <Text style={styles.metricTitle}>MRR</Text>
          </View>
          <Text style={styles.metricValue}>{formatCurrency(metrics.monthlyRecurringRevenue)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="people"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.metricTitle}>ARPU</Text>
          </View>
          <Text style={styles.metricValue}>{formatCurrency(metrics.averageRevenuePerUser)}</Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <Ionicons
              name="checkmark-circle"
              size={20}
              color={colors.success}
            />
            <Text style={styles.metricTitle}>Active Subs</Text>
          </View>
          <Text style={styles.metricValue}>{metrics.activeSubscriptions}</Text>
        </View>
      </View>

      <View style={styles.secondaryMetrics}>
        <View style={styles.secondaryMetricCard}>
          <Text style={styles.secondaryMetricLabel}>Conversion Rate</Text>
          <Text style={styles.secondaryMetricValue}>{metrics.conversionRate.toFixed(1)}%</Text>
        </View>
        <View style={styles.secondaryMetricCard}>
          <Text style={styles.secondaryMetricLabel}>Churn Rate</Text>
          <Text style={[styles.secondaryMetricValue, { color: colors.danger }]}>
            {metrics.churnRate.toFixed(1)}%
          </Text>
        </View>
        <View style={styles.secondaryMetricCard}>
          <Text style={styles.secondaryMetricLabel}>Revenue Growth</Text>
          <Text
            style={[
              styles.secondaryMetricValue,
              {
                color: metrics.revenueGrowth > 0 ? colors.success : colors.danger,
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
