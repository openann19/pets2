/**
 * Cohort Retention Section Component
 * Displays user retention by cohort (signup date)
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    retentionGrid: {
      gap: theme.spacing.xs,
    },
    cohortRow: {
      flexDirection: 'row',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.radii.sm,
      marginBottom: theme.spacing.xs,
      alignItems: 'center',
    },
    cohortLabel: {
      fontSize: theme.typography.body.size * 0.9,
      fontWeight: theme.typography.body.weight,
      minWidth: 100,
    },
    retentionCell: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: theme.spacing.xs,
    },
    retentionValue: {
      fontSize: theme.typography.body.size * 0.9,
      fontWeight: theme.typography.body.weight,
    },
    retentionLabel: {
      fontSize: theme.typography.body.size * 0.8,
      marginTop: 2,
    },
    periodHeader: {
      flexDirection: 'row',
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.xs,
    },
    periodHeaderCell: {
      flex: 1,
      alignItems: 'center',
    },
    periodHeaderText: {
      fontSize: theme.typography.body.size * 0.8,
      fontWeight: theme.typography.body.weight,
    },
    summaryCard: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginTop: theme.spacing.md,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    summaryLabel: {
      fontSize: theme.typography.body.size * 0.9,
    },
    summaryValue: {
      fontSize: theme.typography.body.size * 0.9,
      fontWeight: theme.typography.body.weight,
    },
  });
}

export interface RetentionData {
  cohort: string; // e.g., "2024-01"
  totalUsers: number;
  week1: number; // percentage retained
  week2: number;
  week4: number;
  month2: number;
  month3: number;
  month6: number;
  month12: number;
}

export interface CohortRetentionData {
  cohorts: RetentionData[];
  averageRetention: {
    week1: number;
    week2: number;
    week4: number;
    month2: number;
    month3: number;
    month6: number;
    month12: number;
  };
  latestCohortSize: number;
}

interface CohortRetentionSectionProps {
  retention: CohortRetentionData;
}

const getRetentionColor = (value: number, theme: AppTheme): string => {
  if (value >= 70) return theme.colors.success;
  if (value >= 50) return theme.colors.warning;
  return theme.colors.danger;
};

export const CohortRetentionSection: React.FC<CohortRetentionSectionProps> = ({
  retention,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const periods = ['Week 1', 'Week 2', 'Week 4', 'Month 2', 'Month 3', 'Month 6', 'Month 12'];
  const periodKeys: (keyof RetentionData)[] = [
    'week1',
    'week2',
    'week4',
    'month2',
    'month3',
    'month6',
    'month12',
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.onSurface }]}>Cohort Retention</Text>
        <Text style={[styles.title, { color: colors.onMuted, fontSize: theme.typography.body.size * 0.9 }]}>
          {retention.latestCohortSize.toLocaleString()} users in latest cohort
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.periodHeader}>
            <View style={{ minWidth: 100 }} />
            {periods.map((period) => (
              <View key={period} style={styles.periodHeaderCell}>
                <Text style={[styles.periodHeaderText, { color: colors.onMuted }]}>
                  {period}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.retentionGrid}>
            {retention.cohorts.slice(0, 6).map((cohort) => (
              <View key={cohort.cohort}>
                <View
                  style={[
                    styles.cohortRow,
                    { backgroundColor: colors.surface, shadowColor: colors.border },
                  ]}
                >
                  <Text style={[styles.cohortLabel, { color: colors.onSurface }]}>
                    {cohort.cohort}
                  </Text>
                  <Text style={[styles.retentionValue, { color: colors.onMuted, minWidth: 60 }]}>
                    {cohort.totalUsers}
                  </Text>
                  {periodKeys.map((key) => {
                    const value = cohort[key] as number;
                    const color = getRetentionColor(value, theme);
                    return (
                      <View key={key} style={styles.retentionCell}>
                        <Text style={[styles.retentionValue, { color }]}>
                          {value.toFixed(0)}%
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.onSurface, marginBottom: theme.spacing.sm }]}>
          Average Retention
        </Text>
        {periodKeys.map((key, index) => {
          const avgValue = retention.averageRetention[key as keyof typeof retention.averageRetention] as number;
          const color = getRetentionColor(avgValue, theme);
          return (
            <View key={key} style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.onMuted }]}>
                {periods[index]}:
              </Text>
              <Text style={[styles.summaryValue, { color }]}>{avgValue.toFixed(1)}%</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};
