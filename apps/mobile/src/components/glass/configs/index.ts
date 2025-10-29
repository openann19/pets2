import { BLUR_CONFIGS, type BlurIntensity } from './blur';
import { TRANSPARENCY_CONFIGS, type TransparencyLevel } from './transparency';
import { BORDER_CONFIGS, type BorderStyle } from './borders';
import { SHADOW_CONFIGS, type ShadowStyle } from './shadows';

export { BLUR_CONFIGS, type BlurIntensity };
export { TRANSPARENCY_CONFIGS, type TransparencyLevel };
export { BORDER_CONFIGS, type BorderStyle };
export { SHADOW_CONFIGS, type ShadowStyle };

// Unified export
export const GLASS_CONFIGS = {
  blur: BLUR_CONFIGS,
  transparency: TRANSPARENCY_CONFIGS,
  borders: BORDER_CONFIGS,
  shadows: SHADOW_CONFIGS,
} as const;
