/**
 * Service Configuration Card Component
 * Displays a service configuration card in the list
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { ServiceConfig } from '../types';

interface ServiceConfigCardProps {
  service: ServiceConfig;
  onPress: (service: ServiceConfig) => void;
}

export function ServiceConfigCard({ service, onPress }: ServiceConfigCardProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.colors.surface }]}
      onPress={() => onPress(service)}
      accessibilityRole="button"
      accessibilityLabel={`Configure ${service.name}`}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: `${service.color}20`,
            },
          ]}
        >
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
      <View style={styles.footer}>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor: service.isConfigured
                ? theme.colors.success
                : theme.colors.warning,
            },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {service.isConfigured ? 'Configured' : 'Not Configured'}
          </Text>
        </View>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={theme.colors.onMuted}
        />
      </View>
    </TouchableOpacity>
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
      marginRight: theme.spacing.md,
    },
    info: {
      flex: 1,
    },
    name: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    description: {
      fontSize: theme.typography.body.size * 0.875,
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.sm,
    },
    statusBadgeText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
    },
  });

