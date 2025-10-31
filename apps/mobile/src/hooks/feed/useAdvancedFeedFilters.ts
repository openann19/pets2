/**
 * Advanced Feed Filters Hook
 * Phase 3: Advanced Features
 * 
 * Comprehensive filtering system with:
 * - Distance, breed, age, size, energy level filters
 * - Persistent filter storage
 * - Filter presets
 * - Filter validation
 * - Real-time filter updates
 */

import { useCallback, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';
import { usePersistedState } from '../utils/usePersistedState';

export type PetSize = 'small' | 'medium' | 'large' | 'xlarge';
export type EnergyLevel = 'low' | 'medium' | 'high' | 'very-high';
export type Gender = 'male' | 'female' | 'other';

export interface AdvancedFeedFilters {
  // Basic filters
  species?: string;
  breed?: string;
  gender?: Gender;
  
  // Age range
  minAge?: number;
  maxAge?: number;
  
  // Size filters
  sizes?: PetSize[];
  
  // Energy level
  energyLevels?: EnergyLevel[];
  
  // Distance (in miles/km)
  maxDistance?: number;
  
  // Location-based
  location?: {
    latitude: number;
    longitude: number;
    radius: number; // in km
  };
  
  // Additional filters
  familyFriendly?: boolean;
  goodWithKids?: boolean;
  goodWithDogs?: boolean;
  goodWithCats?: boolean;
  houseTrained?: boolean;
  spayedNeutered?: boolean;
  vaccinated?: boolean;
  
  // Search preferences
  mustHavePhotos?: boolean;
  verifiedOnly?: boolean;
}

export interface FilterPreset {
  id: string;
  name: string;
  filters: AdvancedFeedFilters;
  createdAt: number;
}

export interface UseAdvancedFeedFiltersOptions {
  /** Initial filters */
  initialFilters?: AdvancedFeedFilters;
  /** Enable persistence */
  persist?: boolean;
  /** Storage key for persistence */
  storageKey?: string;
  /** Callback when filters change */
  onFiltersChange?: (filters: AdvancedFeedFilters) => void;
}

export interface UseAdvancedFeedFiltersReturn {
  /** Current filters */
  filters: AdvancedFeedFilters;
  /** Update filters */
  setFilters: (filters: AdvancedFeedFilters | ((prev: AdvancedFeedFilters) => AdvancedFeedFilters)) => void;
  /** Reset to default filters */
  resetFilters: () => void;
  /** Update specific filter */
  updateFilter: <K extends keyof AdvancedFeedFilters>(
    key: K,
    value: AdvancedFeedFilters[K],
  ) => void;
  /** Get filter count (active filters) */
  getFilterCount: () => number;
  /** Check if filters are active */
  hasActiveFilters: () => boolean;
  /** Save current filters as preset */
  savePreset: (name: string) => Promise<void>;
  /** Load preset */
  loadPreset: (presetId: string) => Promise<void>;
  /** Get saved presets */
  getPresets: () => Promise<FilterPreset[]>;
  /** Delete preset */
  deletePreset: (presetId: string) => Promise<void>;
  /** Clear storage */
  clearStorage: () => Promise<void>;
}

const DEFAULT_FILTERS: AdvancedFeedFilters = {
  minAge: 0,
  maxAge: 20,
  maxDistance: 50,
  sizes: [],
  energyLevels: [],
};

const STORAGE_KEY_PREFIX = '@feed_filters:';
const PRESETS_STORAGE_KEY = '@feed_filter_presets:';

/**
 * Advanced Feed Filters Hook
 * 
 * Manages comprehensive feed filters with persistence
 */
export function useAdvancedFeedFilters(
  options: UseAdvancedFeedFiltersOptions = {},
): UseAdvancedFeedFiltersReturn {
  const {
    initialFilters = DEFAULT_FILTERS,
    persist = true,
    storageKey = `${STORAGE_KEY_PREFIX}default`,
    onFiltersChange,
  } = options;

  // Persisted state
  const {
    value: persistedFilters,
    setValue: setPersistedFilters,
    isLoading: isPersistedLoading,
  } = usePersistedState<AdvancedFeedFilters>({
    key: storageKey,
    initialValue: initialFilters,
    enabled: persist,
  });

  // Merge initial with persisted
  const filters = useMemo(
    () => ({
      ...DEFAULT_FILTERS,
      ...initialFilters,
      ...(persist && !isPersistedLoading ? persistedFilters : {}),
    }),
    [initialFilters, persistedFilters, persist, isPersistedLoading],
  );

  /**
   * Update filters
   */
  const setFilters = useCallback(
    (newFilters: AdvancedFeedFilters | ((prev: AdvancedFeedFilters) => AdvancedFeedFilters)) => {
      const updated = typeof newFilters === 'function' ? newFilters(filters) : newFilters;
      setPersistedFilters(updated);
      onFiltersChange?.(updated);
    },
    [filters, setPersistedFilters, onFiltersChange],
  );

  /**
   * Reset to default filters
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, [setFilters]);

  /**
   * Update specific filter
   */
  const updateFilter = useCallback(
    <K extends keyof AdvancedFeedFilters>(
      key: K,
      value: AdvancedFeedFilters[K],
    ) => {
      setFilters((prev) => ({
        ...prev,
        [key]: value,
      }));
    },
    [setFilters],
  );

  /**
   * Get active filter count
   */
  const getFilterCount = useCallback((): number => {
    let count = 0;

    // Count basic filters
    if (filters.species) count++;
    if (filters.breed) count++;
    if (filters.gender) count++;

    // Count age range (if not default)
    if (filters.minAge !== undefined && filters.minAge > 0) count++;
    if (filters.maxAge !== undefined && filters.maxAge < 20) count++;

    // Count sizes
    if (filters.sizes && filters.sizes.length > 0) count++;

    // Count energy levels
    if (filters.energyLevels && filters.energyLevels.length > 0) count++;

    // Count distance (if not default)
    if (filters.maxDistance !== undefined && filters.maxDistance < 50) count++;

    // Count location
    if (filters.location) count++;

    // Count boolean filters
    if (filters.familyFriendly) count++;
    if (filters.goodWithKids) count++;
    if (filters.goodWithDogs) count++;
    if (filters.goodWithCats) count++;
    if (filters.houseTrained) count++;
    if (filters.spayedNeutered) count++;
    if (filters.vaccinated) count++;

    // Count search preferences
    if (filters.mustHavePhotos) count++;
    if (filters.verifiedOnly) count++;

    return count;
  }, [filters]);

  /**
   * Check if filters are active
   */
  const hasActiveFilters = useCallback((): boolean => {
    return getFilterCount() > 0;
  }, [getFilterCount]);

  /**
   * Save current filters as preset
   */
  const savePreset = useCallback(
    async (name: string): Promise<void> => {
      try {
        const existingPresets = await getPresets();
        const newPreset: FilterPreset = {
          id: `preset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name,
          filters,
          createdAt: Date.now(),
        };

        const updatedPresets = [...existingPresets, newPreset];
        await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));

        logger.info('Filter preset saved', { presetId: newPreset.id, name });
      } catch (error) {
        logger.error('Failed to save filter preset', { error, name });
        throw error;
      }
    },
    [filters],
  );

  /**
   * Get saved presets
   */
  const getPresets = useCallback(async (): Promise<FilterPreset[]> => {
    try {
      const stored = await AsyncStorage.getItem(PRESETS_STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored) as FilterPreset[];
    } catch (error) {
      logger.error('Failed to load filter presets', { error });
      return [];
    }
  }, []);

  /**
   * Load preset
   */
  const loadPreset = useCallback(
    async (presetId: string): Promise<void> => {
      try {
        const presets = await getPresets();
        const preset = presets.find((p) => p.id === presetId);
        if (!preset) {
          throw new Error(`Preset not found: ${presetId}`);
        }
        setFilters(preset.filters);
        logger.info('Filter preset loaded', { presetId, name: preset.name });
      } catch (error) {
        logger.error('Failed to load filter preset', { error, presetId });
        throw error;
      }
    },
    [getPresets, setFilters],
  );

  /**
   * Delete preset
   */
  const deletePreset = useCallback(
    async (presetId: string): Promise<void> => {
      try {
        const presets = await getPresets();
        const updatedPresets = presets.filter((p) => p.id !== presetId);
        await AsyncStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(updatedPresets));
        logger.info('Filter preset deleted', { presetId });
      } catch (error) {
        logger.error('Failed to delete filter preset', { error, presetId });
        throw error;
      }
    },
    [getPresets],
  );

  /**
   * Clear storage
   */
  const clearStorage = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(storageKey);
      await AsyncStorage.removeItem(PRESETS_STORAGE_KEY);
      resetFilters();
      logger.info('Filter storage cleared');
    } catch (error) {
      logger.error('Failed to clear filter storage', { error });
      throw error;
    }
  }, [storageKey, resetFilters]);

  // Notify when filters change
  useEffect(() => {
    if (!isPersistedLoading) {
      onFiltersChange?.(filters);
    }
  }, [filters, isPersistedLoading, onFiltersChange]);

  return {
    filters,
    setFilters,
    resetFilters,
    updateFilter,
    getFilterCount,
    hasActiveFilters,
    savePreset,
    loadPreset,
    getPresets,
    deletePreset,
    clearStorage,
  };
}

