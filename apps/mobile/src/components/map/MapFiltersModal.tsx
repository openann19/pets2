import React from 'react';
import { BlurView } from 'expo-blur';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActivityTypeSelector } from './ActivityTypeSelector';
import type { ActivityType } from './ActivityTypeSelector';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface MapFilters {
  showMyPets: boolean;
  showMatches: boolean;
  showNearby: boolean;
  activityTypes: string[];
  radius: number;
}

interface MapFiltersModalProps {
  filters: MapFilters;
  activityTypes: ActivityType[];
  onToggleActivity: (activityId: string) => void;
  onSetFilters: (filters: MapFilters) => void;
}

export function MapFiltersModal({
  filters,
  activityTypes,
  onToggleActivity,
  onSetFilters: _onSetFilters,
}: MapFiltersModalProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const sliderPosition = React.useMemo(() => {
    const percentage = Math.min(100, Math.max(0, (filters.radius / 50) * 100));
    // Convert percentage to numeric value for React Native style
    return percentage; // Return as number for DimensionValue
  }, [filters.radius]);

  return (
    <BlurView
      testID="filters-modal"
      style={styles.filterBlur}
      intensity={50}
      tint="light"
    >
      <ScrollView style={styles.filterContent}>
        <Text style={styles.filterTitle}>Map Filters</Text>

        <ActivityTypeSelector
          activityTypes={activityTypes}
          selectedActivities={filters.activityTypes}
          onToggleActivity={onToggleActivity}
        />

        <Text style={styles.filterSectionTitle}>Search Radius: {filters.radius} km</Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderThumb, { left: `${sliderPosition}%` }]} />
          </View>
        </View>
      </ScrollView>
    </BlurView>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    filterBlur: {
      flex: 1,
    },
    filterContent: {
      padding: theme.spacing.lg + theme.spacing.xs,
    },
    filterTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.lg + theme.spacing.xs,
    },
    filterSectionTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.md,
      marginTop: theme.spacing.lg,
    },
    sliderContainer: {
      marginTop: theme.spacing.sm,
    },
    sliderTrack: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.xs,
      position: 'relative',
    },
    sliderThumb: {
      width: 20,
      height: 20,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.full,
      position: 'absolute',
      top: -8,
    },
  });
}
