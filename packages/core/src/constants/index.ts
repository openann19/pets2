export const HAPTICS = {
  LIGHT_IMPACT: 'light-impact',
  MEDIUM_IMPACT: 'medium-impact',
  HEAVY_IMPACT: 'heavy-impact',
  SUCCESS: 'success-notification',
  WARNING: 'warning-notification',
  ERROR: 'error-notification',
} as const;

export const HAPTIC_SETTINGS = {
  ENABLED: 'haptic.enabled',
  INTENSITY: 'haptic.intensity',
  DURATION: 'haptic.duration',
  CUSTOM_ELEMENT: 'haptic.customElement',
} as const;

export const SETTINGS = {
  HAPTICS: HAPTIC_SETTINGS,
  // Add other settings categories here
} as const;
