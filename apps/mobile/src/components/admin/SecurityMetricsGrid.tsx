/**
 * SecurityMetricsGrid Component
 * Displays security metrics in a grid layout
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface SecurityMetrics {
  totalAlerts?: number;
  criticalAlerts?: number;
  highAlerts?: number;
  mediumAlerts?: number;
  lowAlerts?: number;
  resolvedAlerts?: number;
  pendingAlerts?: number;
  suspiciousLogins?: number;
  blockedIPs?: number;
  reportedContent?: number;
  spamDetected?: number;
  dataBreaches?: number;
  unusualActivity?: number;
}

interface SecurityMetricsGridProps {
  metrics: SecurityMetrics;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    metricsContainer: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    metricCard: {
      width: (SCREEN_WIDTH - theme.spacing['2xl'] - theme.spacing.sm) / 2,
      borderRadius: theme.radii.lg,
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
      marginStart: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    metricValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
    },
  });
};

export const SecurityMetricsGrid: React.FC<SecurityMetricsGridProps> = ({ metrics }) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const metricItems = [
    {
      key: 'critical',
      icon: 'alert-circle',
      color: theme.colors.danger,
      title: 'Critical',
      value: metrics.criticalAlerts ?? 0,
    },
    {
      key: 'high',
      icon: 'warning',
      color: theme.colors.warning,
      title: 'High',
      value: metrics.highAlerts ?? 0,
    },
    {
      key: 'medium',
      icon: 'information-circle',
      color: theme.colors.info,
      title: 'Medium',
      value: metrics.mediumAlerts ?? 0,
    },
    {
      key: 'resolved',
      icon: 'checkmark-circle',
      color: theme.colors.success,
      title: 'Resolved',
      value: metrics.resolvedAlerts ?? 0,
    },
  ];

  return (
    <View style={styles.metricsContainer}>
      <Text style={styles.sectionTitle}>Security Overview</Text>
      <View style={styles.metricsGrid}>
        {metricItems.map((item) => (
          <View key={item.key} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Ionicons name={item.icon as any} size={20} color={item.color} />
              <Text style={styles.metricTitle}>{item.title}</Text>
            </View>
            <Text style={[styles.metricValue, { color: item.color }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

