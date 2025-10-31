/**
 * Photo Editor Types
 * Shared types for photo editing functionality
 */
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

