import React from 'react';
import { BlurView } from 'expo-blur';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  timeRange?: 'all' | 'today' | 'this_week' | 'this_month' | 'last_hour';
}

interface MapFiltersModalProps {
  filters: MapFilters;
  activityTypes: ActivityType[];
  onToggleActivity: (activityId: string) => void;
  onSetFilters: (filters: MapFilters) => void;
}

const TIME_RANGE_OPTIONS: Array<{ value: MapFilters['timeRange']; label: string }> = [
  { value: 'last_hour', label: 'Last Hour' },
  { value: 'today', label: 'Today' },
  { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' },
  { value: 'all', label: 'All Time' },
];

export function MapFiltersModal({
  filters,
  activityTypes,
  onToggleActivity,
  onSetFilters,
}: MapFiltersModalProps): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const sliderPosition = React.useMemo(() => {
    const percentage = Math.min(100, Math.max(0, (filters.radius / 50) * 100));
    // Convert percentage to numeric value for React Native style
    return percentage; // Return as number for DimensionValue
  }, [filters.radius]);

  const handleTimeRangeChange = (timeRange: MapFilters['timeRange']) => {
    onSetFilters({
      ...filters,
      ...(timeRange !== undefined ? { timeRange } : {}),
    });
  };

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

        <Text style={styles.filterSectionTitle}>Time Range</Text>
        <View style={styles.timeRangeContainer}>
          {TIME_RANGE_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.timeRangeButton,
                filters.timeRange === option.value && styles.timeRangeButtonActive,
              ]}
              onPress={() => handleTimeRangeChange(option.value)}
            >
              <Text
                style={[
                  styles.timeRangeButtonText,
                  filters.timeRange === option.value && styles.timeRangeButtonTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

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
      padding: 20,
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 20,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onMuted,
      marginBottom: 12,
      marginTop: 16,
    },
    sliderContainer: {
      marginTop: 8,
    },
    sliderTrack: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: 2,
      position: 'relative',
    },
    sliderThumb: {
      width: 20,
      height: 20,
      backgroundColor: theme.colors.primary,
      borderRadius: 10,
      position: 'absolute',
      top: -8,
    },
    timeRangeContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
      marginBottom: 16,
    },
    timeRangeButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    timeRangeButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    timeRangeButtonText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    timeRangeButtonTextActive: {
      color: theme.colors.surface,
    },
  });
}
