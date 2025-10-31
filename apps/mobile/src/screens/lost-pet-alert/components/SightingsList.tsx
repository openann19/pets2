/**
 * Sightings List Component
 * Displays list of pet sightings
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { LostPetSighting } from '../types';

interface SightingsListProps {
  sightings: LostPetSighting[];
  maxItems?: number;
}

export const SightingsList: React.FC<SightingsListProps> = ({ sightings, maxItems = 3 }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        sightingsSection: {
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          paddingTop: theme.spacing.md,
        },
        sightingsTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        sightingItem: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.md,
          marginBottom: theme.spacing.sm,
          backgroundColor: theme.colors.surface,
        },
        sightingLocation: {
          fontSize: 14,
          fontWeight: '500' as const,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        sightingDescription: {
          fontSize: 14,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onMuted,
        },
        sightingDate: {
          fontSize: 12,
          color: theme.colors.onMuted,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.sightingsSection}>
      <Text style={styles.sightingsTitle}>Recent Sightings ({sightings.length})</Text>
      {sightings.slice(0, maxItems).map((sighting, index) => (
        <View key={index} style={styles.sightingItem}>
          <Text style={styles.sightingLocation}>📍 {sighting.location.address}</Text>
          <Text style={styles.sightingDescription}>{sighting.description}</Text>
          <Text style={styles.sightingDate}>
            📅 {new Date(sighting.reportedAt).toLocaleDateString()}
          </Text>
        </View>
      ))}
    </View>
  );
};

