/**
 * Hook for managing photo filter presets
 * Handles filter selection, application, and state management
 */

import { useCallback, useState } from 'react';
import * as Haptics from 'expo-haptics';

export interface PhotoAdjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  blur: number;
  sharpen: number;
}

export interface FilterPreset {
  name: string;
  icon: string;
  adjustments: Partial<PhotoAdjustments>;
}

export interface UsePhotoFiltersOptions {
  onApplyFilter: (adjustments: Partial<PhotoAdjustments>) => void;
  presets?: FilterPreset[];
}

export interface UsePhotoFiltersReturn {
  selectedPreset: string | null;
  applyPreset: (preset: FilterPreset) => void;
  presets: FilterPreset[];
}

const DEFAULT_PRESETS: FilterPreset[] = [
  { name: 'Original', icon: 'ban-outline', adjustments: { brightness: 100, contrast: 100, saturation: 100, warmth: 0, blur: 0, sharpen: 0 } },
  { name: 'Vivid', icon: 'flash', adjustments: { brightness: 105, contrast: 110, saturation: 130 } },
  { name: 'Warm', icon: 'sunny', adjustments: { warmth: 30, brightness: 105, saturation: 110 } },
  { name: 'Cool', icon: 'snow', adjustments: { warmth: -20, saturation: 90, brightness: 100 } },
  { name: 'B/W', icon: 'contrast', adjustments: { saturation: 0, contrast: 120 } },
  { name: 'Vintage', icon: 'time', adjustments: { saturation: 80, warmth: 20, contrast: 90, brightness: 95 } },
  { name: 'Dramatic', icon: 'cloud', adjustments: { contrast: 140, saturation: 120, brightness: 90 } },
  { name: 'Soft', icon: 'rainy', adjustments: { contrast: 90, saturation: 95, blur: 5 } },
];

export function usePhotoFilters({
  onApplyFilter,
  presets = DEFAULT_PRESETS,
}: UsePhotoFiltersOptions): UsePhotoFiltersReturn {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const applyPreset = useCallback(
    (preset: FilterPreset) => {
      onApplyFilter(preset.adjustments);
      setSelectedPreset(preset.name);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [onApplyFilter],
  );

  return {
    selectedPreset,
    applyPreset,
    presets,
  };
}

