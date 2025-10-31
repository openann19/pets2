/**
 * 🎯 FOUNDATION: FEATURE FLAG HOOK
 * 
 * Tiny hook for accessing individual flags
 */

import { useFlags } from './FeatureFlagsProvider';

/**
 * Get a single feature flag value
 * 
 * @example
 * ```tsx
 * const enabled = useFlag('effects.galaxy.enabled');
 * ```
 */
export function useFlag<K extends keyof ReturnType<typeof useFlags>>(key: K): ReturnType<typeof useFlags>[K] {
  const f = useFlags();
  return f[key];
}

