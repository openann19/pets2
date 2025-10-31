/**
 * Security Metrics Section Component
 * Displays security metrics overview
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { SecurityMetrics } from '../types';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    metricsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    metricCard: {
      width: '48%',
      borderRadius: 12,
      padding: 16,
      shadowColor: theme.colors.onSurface,
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
    metricLabel: {
      fontSize: 12,
      fontWeight: '500',
      marginLeft: 8,
    },
    metricValue: {
      fontSize: 24,
      fontWeight: 'bold',
    },
  });
}

interface SecurityMetricsSectionProps {
  metrics: SecurityMetrics;
}

export const SecurityMetricsSection: React.FC<SecurityMetricsSectionProps> = ({ metrics }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.metricsGrid}>
      {/* Total Alerts */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="warning"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Total Alerts</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>{metrics.totalAlerts}</Text>
      </View>

      {/* Critical */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="alert-circle"
            size={20}
            color={colors.danger}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Critical</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.danger }]}>{metrics.criticalAlerts}</Text>
      </View>

      {/* High */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="warning"
            size={20}
            color={colors.warning}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>High</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.warning }]}>{metrics.highAlerts}</Text>
      </View>

      {/* Pending */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="time"
            size={20}
            color={colors.onMuted}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Pending</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>
          {metrics.pendingAlerts}
        </Text>
      </View>

      {/* Suspicious Logins */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="shield"
            size={20}
            color={colors.danger}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Suspicious Logins</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>
          {metrics.suspiciousLogins}
        </Text>
      </View>

      {/* Blocked IPs */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="ban"
            size={20}
            color={colors.danger}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Blocked IPs</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>{metrics.blockedIPs}</Text>
      </View>

      {/* Reported Content */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="flag"
            size={20}
            color={colors.onMuted}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Reported Content</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>
          {metrics.reportedContent}
        </Text>
      </View>

      {/* Resolved */}
      <View style={[styles.metricCard, { backgroundColor: colors.surface }]}>
        <View style={styles.metricHeader}>
          <Ionicons
            name="checkmark-circle"
            size={20}
            color={colors.success}
          />
          <Text style={[styles.metricLabel, { color: colors.onMuted }]}>Resolved</Text>
        </View>
        <Text style={[styles.metricValue, { color: colors.onSurface }]}>
          {metrics.resolvedAlerts}
        </Text>
      </View>
    </View>
  );
};
