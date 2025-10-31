/**
 * Capabilities hook - stub implementation
 * Returns device capabilities for gating heavy effects
 */
export function useCapabilities(): {
  highPerf: boolean;
  thermalsOk: boolean;
  skia: boolean;
  hasHaptic: boolean;
  hasAnimations: boolean;
  hasSound: boolean;
} {
  // Stub implementation - defaults to high performance
  // In production, this would detect device tier, thermal state, and Skia availability
  return {
    highPerf: true,
    thermalsOk: true,
    skia: false,
    hasHaptic: true,
    hasAnimations: true,
    hasSound: true,
  };
}
