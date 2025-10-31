/**
 * 🎯 FOUNDATION: FEATURE FLAGS
 * 
 * Feature flag definitions and defaults
 */

export type Flags = {
  'effects.enabled': boolean;           // global kill switch
  'effects.galaxy.enabled': boolean;
  'effects.portal.enabled': boolean;
  'effects.morph.enabled': boolean;
  'effects.galaxy.maxCount': number;    // server-tunable cap
  'effects.safeMode': boolean;          // forces minimal visuals (e.g., Play Pre-launch)
};

export const DEFAULT_FLAGS: Flags = {
  'effects.enabled': true,
  'effects.galaxy.enabled': true,
  'effects.portal.enabled': true,
  'effects.morph.enabled': true,
  'effects.galaxy.maxCount': 60000,
  'effects.safeMode': false,
};

