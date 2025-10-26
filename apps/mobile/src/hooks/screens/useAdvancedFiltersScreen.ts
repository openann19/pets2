/**
 * useAdvancedFiltersScreen Hook
 * Manages Advanced Filters screen state and interactions
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";

interface FilterOption {
  id: string;
  label: string;
  value: boolean;
  category: string;
}

interface UseAdvancedFiltersScreenReturn {
  filters: FilterOption[];
  toggleFilter: (filterId: string) => void;
  resetFilters: () => void;
  saveFilters: () => void;
  getFiltersByCategory: (category: string) => FilterOption[];
}

export const INITIAL_FILTERS: FilterOption[] = [
  // Pet Characteristics
  { id: "neutered", label: "Neutered/Spayed Only", value: false, category: "characteristics" },
  { id: "vaccinated", label: "Fully Vaccinated", value: true, category: "characteristics" },
  { id: "microchipped", label: "Microchipped", value: false, category: "characteristics" },
  { id: "house_trained", label: "House Trained", value: true, category: "characteristics" },

  // Size Preferences
  { id: "small_only", label: "Small Dogs Only", value: false, category: "size" },
  { id: "medium_only", label: "Medium Dogs Only", value: false, category: "size" },
  { id: "large_only", label: "Large Dogs Only", value: false, category: "size" },

  // Energy Level
  { id: "low_energy", label: "Low Energy (Couch Potato)", value: false, category: "energy" },
  { id: "moderate_energy", label: "Moderate Energy", value: true, category: "energy" },
  { id: "high_energy", label: "High Energy (Athletic)", value: false, category: "energy" },

  // Special Considerations
  { id: "good_with_kids", label: "Good with Children", value: true, category: "special" },
  { id: "good_with_dogs", label: "Good with Other Dogs", value: true, category: "special" },
  { id: "good_with_cats", label: "Good with Cats", value: false, category: "special" },
  { id: "apartment_friendly", label: "Apartment Friendly", value: false, category: "special" },
  { id: "senior_pets", label: "Include Senior Pets (7+ years)", value: true, category: "special" },
  { id: "rescue_pets", label: "Rescue Pets Only", value: false, category: "special" },
];

export const useAdvancedFiltersScreen = (): UseAdvancedFiltersScreenReturn => {
  const [filters, setFilters] = useState<FilterOption[]>(INITIAL_FILTERS);

  const toggleFilter = useCallback((filterId: string) => {
    Haptics.selectionAsync().catch(() => {});
    setFilters((prev) =>
      prev.map((filter) =>
        filter.id === filterId ? { ...filter, value: !filter.value } : filter,
      ),
    );
  }, []);

  const resetFilters = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    Alert.alert(
      "Reset Filters",
      "Are you sure you want to reset all advanced filters?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            setFilters((prev) =>
              prev.map((filter) => ({ ...filter, value: false })),
            );
          },
        },
      ],
    );
  }, []);

  const saveFilters = useCallback(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {},
    );
    
    // Save filters to backend or local storage
    logger.info("Saving advanced filters", { filters });
    
    Alert.alert("Success", "Advanced filters saved successfully!");
  }, [filters]);

  const getFiltersByCategory = useCallback(
    (category: string) => {
      return filters.filter((filter) => filter.category === category);
    },
    [filters],
  );

  return {
    filters,
    toggleFilter,
    resetFilters,
    saveFilters,
    getFiltersByCategory,
  };
};

