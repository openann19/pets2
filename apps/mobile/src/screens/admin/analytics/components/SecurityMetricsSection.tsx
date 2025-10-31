/**
 * Security Metrics Section Component
 * Displays security overview metrics
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    securityGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    securityCard: {
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
    securityHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.xs,
    },
    securityLabel: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      marginTop: theme.spacing.xs,
      marginBottom: theme.spacing.xs,
      textAlign: 'center',
    },
    securityValue: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
    },
  });
}

interface SecurityData {
  suspiciousLogins: number;
  blockedIPs: number;
  reportedContent: number;
  bannedUsers: number;
}

interface SecurityMetricsSectionProps {
  security: SecurityData;
}

export const SecurityMetricsSection: React.FC<SecurityMetricsSectionProps> = ({ security }) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.securityGrid}>
      <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
        <View style={styles.securityHeader}>
          <Ionicons
            name="warning"
            size={20}
            color={colors.warning}
          />
          <Text style={[styles.securityLabel, { color: colors.onMuted }]}>Suspicious Logins</Text>
        </View>
        <Text style={[styles.securityValue, { color: colors.onSurface }]}>
          {security.suspiciousLogins}
        </Text>
      </View>

      <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
        <View style={styles.securityHeader}>
          <Ionicons
            name="shield"
            size={20}
            color={colors.danger}
          />
          <Text style={[styles.securityLabel, { color: colors.onMuted }]}>Blocked IPs</Text>
        </View>
        <Text style={[styles.securityValue, { color: colors.onSurface }]}>
          {security.blockedIPs}
        </Text>
      </View>

      <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
        <View style={styles.securityHeader}>
          <Ionicons
            name="flag"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.securityLabel, { color: colors.onMuted }]}>Reported Content</Text>
        </View>
        <Text style={[styles.securityValue, { color: colors.onSurface }]}>
          {security.reportedContent}
        </Text>
      </View>

      <View style={[styles.securityCard, { backgroundColor: colors.surface }]}>
        <View style={styles.securityHeader}>
          <Ionicons
            name="alert"
            size={20}
            color={colors.danger}
          />
          <Text style={[styles.securityLabel, { color: colors.onMuted }]}>Banned Users</Text>
        </View>
        <Text style={[styles.securityValue, { color: colors.onSurface }]}>
          {security.bannedUsers}
        </Text>
      </View>
    </View>
  );
};
