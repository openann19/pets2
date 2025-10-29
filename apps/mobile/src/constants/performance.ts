import { Dimensions } from "react-native";

/**
 * Centralized performance-oriented constants used across motion and list rendering.
 * Keeping these in one place guarantees consistency and makes it trivial to tune
 * thresholds when perf regressions are detected in CI.
 */

const { width: DEVICE_WIDTH } = Dimensions.get("window");

export const SPRING_CONFIG = Object.freeze({
  damping: 18,
  stiffness: 220,
  mass: 0.82,
  overshootClamping: false,
  restDisplacementThreshold: 0.01,
  restSpeedThreshold: 0.01,
});

export const SWIPE_DECK_LAYOUT = Object.freeze({
  cardWidth: Math.min(DEVICE_WIDTH * 0.88, 360),
  cardHeightRatio: 1.32,
  stackOffset: 12,
});

export const LIST_VIRTUALIZATION_CONFIG = Object.freeze({
  windowSize: 7,
  maxToRenderPerBatch: 8,
  updateCellsBatchingPeriod: 16,
  initialNumToRender: 2,
  removeClippedSubviews: true,
  prefetchDistance: 2,
});

export const IMAGE_PREFETCH_CONFIG = Object.freeze({
  ahead: 2,
  timeoutMs: 1800,
});

export type ListVirtualizationConfig = typeof LIST_VIRTUALIZATION_CONFIG;


