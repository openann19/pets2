/**
 * Filter Presets Configuration
 * Centralized filter presets for photo editing
 */
import type { FilterPreset } from './types';

export const FILTER_PRESETS: FilterPreset[] = [
  {
    name: 'Original',
    icon: 'ban-outline',
    adjustments: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      warmth: 0,
      blur: 0,
      sharpen: 0,
    },
  },
  {
    name: 'Vivid',
    icon: 'flash',
    adjustments: { brightness: 105, contrast: 110, saturation: 130 },
  },
  {
    name: 'Warm',
    icon: 'sunny',
    adjustments: { warmth: 30, brightness: 105, saturation: 110 },
  },
  {
    name: 'Cool',
    icon: 'snow',
    adjustments: { warmth: -20, saturation: 90, brightness: 100 },
  },
  {
    name: 'B/W',
    icon: 'contrast',
    adjustments: { saturation: 0, contrast: 120 },
  },
  {
    name: 'Vintage',
    icon: 'time',
    adjustments: { saturation: 80, warmth: 20, contrast: 90, brightness: 95 },
  },
  {
    name: 'Dramatic',
    icon: 'cloud',
    adjustments: { contrast: 140, saturation: 120, brightness: 90 },
  },
  {
    name: 'Soft',
    icon: 'rainy',
    adjustments: { contrast: 90, saturation: 95, blur: 5 },
  },
];

export const QUICK_ACTION_PRESETS: Record<string, Partial<import('./types').PhotoAdjustments>> = {
  portrait: { blur: 2, contrast: 110, saturation: 105 },
  vivid: { brightness: 115, contrast: 120, saturation: 135 },
  film: { contrast: 90, saturation: 95, warmth: 15 },
  dramatic: { contrast: 140, saturation: 120, brightness: 90 },
  dehaze: { brightness: 110, contrast: 105, sharpen: 30 },
  vignette: { contrast: 110, brightness: 95 },
};

