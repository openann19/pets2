import React from "react";
import { BlurView } from "expo-blur";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ActivityTypeSelector } from "./ActivityTypeSelector";
import type { ActivityType } from "./ActivityTypeSelector";
import { Theme } from '../../theme/unified-theme';

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
  onSetFilters,
}: MapFiltersModalProps): React.JSX.Element {
  const sliderPosition = React.useMemo(() => {
    const percentage = Math.min(100, Math.max(0, (filters.radius / 50) * 100));
    // Convert percentage to numeric value for React Native style
    return percentage; // Return as number for DimensionValue
  }, [filters.radius]);

  return (
    <BlurView testID="filters-modal" style={styles.filterBlur} intensity={50} tint="light">
      <ScrollView style={styles.filterContent}>
        <Text style={styles.filterTitle}>Map Filters</Text>

        <ActivityTypeSelector
          activityTypes={activityTypes}
          selectedActivities={filters.activityTypes}
          onToggleActivity={onToggleActivity}
        />

        <Text style={styles.filterSectionTitle}>
          Search Radius: {filters.radius} km
        </Text>
        <View style={styles.sliderContainer}>
          <View style={styles.sliderTrack}>
            <View
              style={[
                styles.sliderThumb,
                { left: `${sliderPosition}%` },
              ]}
            />
          </View>
        </View>
      </ScrollView>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  filterBlur: {
    flex: 1,
  },
  filterContent: {
    padding: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 20,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[700]",
    marginBottom: 12,
    marginTop: 16,
  },
  sliderContainer: {
    marginTop: 8,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: "Theme.colors.neutral[200]",
    borderRadius: 2,
    position: "relative",
  },
  sliderThumb: {
    width: 20,
    height: 20,
    backgroundColor: "Theme.colors.primary[500]",
    borderRadius: 10,
    position: "absolute",
    top: -8,
  },
});
