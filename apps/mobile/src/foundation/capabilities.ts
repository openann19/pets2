/**
 * Capabilities hook - stub implementation
 */
export function useCapabilities(): {
  hasHaptic: boolean;
  hasAnimations: boolean;
  hasSound: boolean;
} {
  return {
    hasHaptic: true,
    hasAnimations: true,
    hasSound: true,
  };
}
