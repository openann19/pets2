/**
 * Incidents Tab Component
 * Displays recent safety incidents and statistics
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { Incident } from '../types';

interface IncidentsTabProps {
  incidents: Incident[];
  onViewAll?: () => void;
}

export const IncidentsTab: React.FC<IncidentsTabProps> = ({ incidents, onViewAll }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabContent: {
          padding: theme.spacing.md,
        },
        sectionHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.sm,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        sectionDescription: {
          fontSize: 14,
          marginBottom: theme.spacing.md,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
        viewAllButton: {
          paddingVertical: theme.spacing.xs,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        viewAllText: {
          fontSize: 14,
          fontWeight: '500' as const,
          color: theme.colors.primary,
        },
        incidentCard: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        incidentHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.sm,
        },
        incidentType: {
          fontSize: 16,
          fontWeight: '600' as const,
          flex: 1,
          color: theme.colors.onSurface,
        },
        statusBadge: {
          paddingHorizontal: theme.spacing.sm,
          paddingVertical: theme.spacing.xs,
          borderRadius: theme.radii.md,
        },
        statusText: {
          fontSize: 12,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
        incidentDetails: {
          gap: theme.spacing.xs,
        },
        incidentLocation: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        incidentDate: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        safetyStats: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        statsTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        statsGrid: {
          flexDirection: 'row' as const,
          justifyContent: 'space-around' as const,
        },
        statItem: {
          alignItems: 'center' as const,
        },
        statValue: {
          fontSize: 20,
          fontWeight: '700' as const,
        },
        statLabel: {
          fontSize: 12,
          marginTop: 2,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return theme.colors.success;
      case 'investigating':
        return theme.colors.warning;
      default:
        return theme.colors.danger;
    }
  };

  return (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Safety Reports</Text>
        {onViewAll && (
          <TouchableOpacity style={styles.viewAllButton} onPress={onViewAll}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionDescription}>
        Community-reported incidents and their resolution status.
      </Text>

      {incidents.map((incident) => (
        <View key={incident.id} style={styles.incidentCard}>
          <View style={styles.incidentHeader}>
            <Text style={styles.incidentType}>{incident.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(incident.status) }]}>
              <Text style={styles.statusText}>{incident.status}</Text>
            </View>
          </View>

          <View style={styles.incidentDetails}>
            <Text style={styles.incidentLocation}>📍 {incident.location}</Text>
            <Text style={styles.incidentDate}>
              📅 {new Date(incident.reportedAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}

      <View style={styles.safetyStats}>
        <Text style={styles.statsTitle}>Community Safety Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>98.5%</Text>
            <Text style={styles.statLabel}>Resolved</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>1.2%</Text>
            <Text style={styles.statLabel}>Escalated</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.primary }]}>24h</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

