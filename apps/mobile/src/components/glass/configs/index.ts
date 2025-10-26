export { BLUR_CONFIGS, type BlurIntensity } from "./blur";
export { TRANSPARENCY_CONFIGS, type TransparencyLevel } from "./transparency";
export { BORDER_CONFIGS, type BorderStyle } from "./borders";
export { SHADOW_CONFIGS, type ShadowStyle } from "./shadows";

// Unified export
export const GLASS_CONFIGS = {
  blur: BLUR_CONFIGS,
  transparency: TRANSPARENCY_CONFIGS,
  borders: BORDER_CONFIGS,
  shadows: SHADOW_CONFIGS,
} as const;

