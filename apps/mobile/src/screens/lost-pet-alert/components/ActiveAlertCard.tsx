/**
 * Active Alert Card Component
 * Displays active lost pet alert information
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';
import { SightingsList } from './SightingsList';
import type { LostPetAlertWithSightings, LostPetSighting } from '../types';

interface ActiveAlertCardProps {
  alert: LostPetAlertWithSightings;
  petName?: string;
  petBreed?: string;
  petSpecies?: string;
  onReportSighting: () => void;
}

export const ActiveAlertCard: React.FC<ActiveAlertCardProps> = ({
  alert,
  petName,
  petBreed,
  petSpecies,
  onReportSighting,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        activeAlert: {
          margin: theme.spacing.md,
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          borderWidth: 2,
          borderColor: theme.colors.danger,
          backgroundColor: theme.colors.danger + '20',
        },
        alertHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          marginBottom: theme.spacing.md,
        },
        alertTitle: {
          fontSize: 16,
          fontWeight: '700' as const,
          color: theme.colors.danger,
        },
        sightingButton: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.primary,
        },
        sightingButtonText: {
          fontSize: 14,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
        alertDetails: {
          marginBottom: theme.spacing.md,
        },
        alertPet: {
          fontSize: 18,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        alertLocation: {
          fontSize: 14,
          marginBottom: 2,
          color: theme.colors.onMuted,
        },
        alertRadius: {
          fontSize: 14,
          marginBottom: 2,
          color: theme.colors.onMuted,
        },
        alertReward: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.success,
        },
        alertDescription: {
          fontSize: 14,
          lineHeight: 20,
          marginBottom: theme.spacing.md,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.activeAlert}>
      <View style={styles.alertHeader}>
        <Text style={styles.alertTitle}>🚨 ACTIVE EMERGENCY ALERT</Text>
        <TouchableOpacity style={styles.sightingButton} onPress={onReportSighting}>
          <Text style={styles.sightingButtonText}>Report Sighting</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.alertDetails}>
        <Text style={styles.alertPet}>
          🐕 {petName || 'Pet'} - {petBreed || petSpecies}
        </Text>
        <Text style={styles.alertLocation}>
          📍 Last seen: {alert.lastSeenLocation.address}
        </Text>
        <Text style={styles.alertRadius}>
          📡 Broadcasting to {alert.broadcastRadius || 5}km radius
        </Text>
        {alert.reward && (
          <Text style={styles.alertReward}>💰 Reward: ${alert.reward}</Text>
        )}
      </View>

      <Text style={styles.alertDescription}>{alert.description}</Text>

      {alert.sightings && alert.sightings.length > 0 && (
        <SightingsList sightings={alert.sightings} />
      )}
    </View>
  );
};

