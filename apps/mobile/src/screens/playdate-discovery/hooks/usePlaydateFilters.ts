/**
 * Playdate Discovery Filters Hook
 * Manages filter state and logic
 */
import { useState, useCallback, useMemo } from 'react';
import type { PlaydateFilters } from '../types';

export interface UsePlaydateFiltersOptions {
  initialFilters?: Partial<PlaydateFilters>;
}

export interface UsePlaydateFiltersReturn {
  filters: PlaydateFilters;
  updateFilter: (filterType: keyof PlaydateFilters, value: any) => void;
  resetFilters: () => void;
  playStyles: string[];
  energyLevels: number[];
  sizeOptions: readonly ['small', 'medium', 'large'];
}

const DEFAULT_FILTERS: PlaydateFilters = {
  distance: 5,
  playStyles: [],
  energy: undefined,
  size: undefined,
};

export function usePlaydateFilters(
  options: UsePlaydateFiltersOptions = {},
): UsePlaydateFiltersReturn {
  const [filters, setFilters] = useState<PlaydateFilters>({
    ...DEFAULT_FILTERS,
    ...options.initialFilters,
  });

  const playStyles = useMemo(() => ['chase', 'tug', 'fetch', 'wrestle', 'water'], []);
  const energyLevels = useMemo(() => [1, 2, 3, 4, 5], []);
  const sizeOptions = useMemo(() => ['small', 'medium', 'large'] as const, []);

  const updateFilter = useCallback((filterType: keyof PlaydateFilters, value: any) => {
    setFilters((prev) => {
      if (filterType === 'playStyles') {
        const currentStyles = prev.playStyles;
        const newStyles = currentStyles.includes(value)
          ? currentStyles.filter((s) => s !== value)
          : [...currentStyles, value];
        return { ...prev, playStyles: newStyles };
      }

      if (filterType === 'energy') {
        return { ...prev, energy: prev.energy === value ? undefined : value };
      }

      if (filterType === 'size') {
        return { ...prev, size: prev.size === value ? undefined : value };
      }

      if (filterType === 'distance') {
        return { ...prev, distance: value };
      }

      return prev;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  return {
    filters,
    updateFilter,
    resetFilters,
    playStyles,
    energyLevels,
    sizeOptions,
  };
}

