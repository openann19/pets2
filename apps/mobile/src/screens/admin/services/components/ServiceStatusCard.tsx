/**
 * Service Status Card Component
 * Displays a single service status card
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { ServiceStatus } from '../types';

interface ServiceStatusCardProps {
  service: ServiceStatus;
  getStatusColor: (status: ServiceStatus['status']) => string;
  getStatusIcon: (status: ServiceStatus['status']) => string;
}

export function ServiceStatusCard({
  service,
  getStatusColor,
  getStatusIcon,
}: ServiceStatusCardProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const statusColor = getStatusColor(service.status);
  const statusIcon = getStatusIcon(service.status);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: alpha(service.color, 0.125) }]}>
          <Ionicons
            name={service.icon as any}
            size={24}
            color={service.color}
          />
        </View>
        <View style={styles.info}>
          <Text style={[styles.name, { color: theme.colors.onSurface }]}>
            {service.name}
          </Text>
          <Text style={[styles.description, { color: theme.colors.onMuted }]}>
            {service.description}
          </Text>
        </View>
      </View>

      <View style={styles.statusRow}>
        <View style={styles.statusBadge}>
          <Ionicons
            name={statusIcon as any}
            size={16}
            color={statusColor}
          />
          <Text style={[styles.statusText, { color: statusColor }]}>
            {service.status.toUpperCase()}
          </Text>
        </View>
        <Text style={[styles.responseTime, { color: theme.colors.onMuted }]}>
          {service.responseTime}ms
        </Text>
      </View>

      {service.endpoint && (
        <Text
          style={[styles.endpoint, { color: theme.colors.onMuted }]}
          numberOfLines={1}
        >
          {service.endpoint}
        </Text>
      )}
      <Text style={[styles.lastChecked, { color: theme.colors.onMuted }]}>
        Last checked: {new Date(service.lastChecked).toLocaleTimeString()}
      </Text>
    </View>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    description: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs + theme.spacing.xs / 2,
    },
    statusText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
    responseTime: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
      color: theme.colors.onMuted,
    },
    endpoint: {
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs,
      fontFamily: 'monospace',
      color: theme.colors.onMuted,
    },
    lastChecked: {
      fontSize: theme.typography.body.size * 0.6875,
      marginTop: theme.spacing.sm,
      color: theme.colors.onMuted,
    },
  });

