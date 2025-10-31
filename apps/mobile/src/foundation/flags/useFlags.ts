/**
 * 🎯 FOUNDATION: FEATURE FLAGS HOOK
 * 
 * Provides access to feature flags with runtime configuration support
 */

import { DEFAULT_UI_FLAGS, type UIFlags } from '@/config/flags';

/**
 * Hook to access UI feature flags
 * Can be extended to support remote config in the future
 * 
 * @example
 * ```tsx
 * const flags = useFlags();
 * if (flags['ui.backdropBlur']) {
 *   // Show backdrop blur
 * }
 * ```
 */
export function useFlags(): UIFlags {
  // For now, return static defaults
  // Can be extended to use remote config, async storage, etc.
  return DEFAULT_UI_FLAGS;
}

