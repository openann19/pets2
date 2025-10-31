/**
 * 🎯 PERFORMANCE VALIDATION UTILITIES
 * 
 * Tools for validating motion system performance
 * - Frame time monitoring
 * - Bundle size tracking
 * - Memory profiling
 * - Performance budgets
 */

/**
 * Performance budget configuration
 */
export interface PerformanceBudget {
  /** Maximum frame time in milliseconds (16.67ms = 60fps) */
  maxFrameTime: number;
  /** Maximum bundle size increase in KB */
  maxBundleIncrease: number;
  /** Maximum memory usage in MB */
  maxMemoryUsage: number;
  /** Maximum animation duration in ms */
  maxAnimationDuration: number;
}

/**
 * Default performance budgets
 */
export const PERFORMANCE_BUDGETS: PerformanceBudget = {
  maxFrameTime: 16.67, // 60fps
  maxBundleIncrease: 200, // KB
  maxMemoryUsage: 100, // MB
  maxAnimationDuration: 500, // ms
};

/**
 * Frame time measurement
 */
export interface FrameMetrics {
  frameTime: number;
  timestamp: number;
  droppedFrames: number;
}

/**
 * Performance metrics collector
 */
export class PerformanceMetricsCollector {
  private frameTimes: number[] = [];
  private droppedFrames = 0;
  private startTime = 0;
  private lastFrameTime = 0;

  /**
   * Start collecting metrics
   */
  start(): void {
    this.frameTimes = [];
    this.droppedFrames = 0;
    this.startTime = performance.now();
    this.lastFrameTime = this.startTime;
  }

  /**
   * Record a frame
   */
  recordFrame(): void {
    const now = performance.now();
    const frameTime = now - this.lastFrameTime;
    this.frameTimes.push(frameTime);

    // Detect dropped frames (>20ms = likely dropped)
    if (frameTime > 20) {
      this.droppedFrames++;
    }

    this.lastFrameTime = now;
  }

  /**
   * Stop collecting and get results
   */
  stop(): {
    averageFrameTime: number;
    maxFrameTime: number;
    minFrameTime: number;
    droppedFrames: number;
    fps: number;
  } {
    if (this.frameTimes.length === 0) {
      return {
        averageFrameTime: 0,
        maxFrameTime: 0,
        minFrameTime: 0,
        droppedFrames: 0,
        fps: 0,
      };
    }

    const averageFrameTime =
      this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
    const maxFrameTime = Math.max(...this.frameTimes);
    const minFrameTime = Math.min(...this.frameTimes);
    const fps = 1000 / averageFrameTime;

    return {
      averageFrameTime,
      maxFrameTime,
      minFrameTime,
      droppedFrames: this.droppedFrames,
      fps,
    };
  }

  /**
   * Check if metrics meet budget
   */
  meetsBudget(budget: PerformanceBudget = PERFORMANCE_BUDGETS): boolean {
    const metrics = this.stop();
    return (
      metrics.averageFrameTime <= budget.maxFrameTime &&
      metrics.maxFrameTime <= budget.maxFrameTime * 2 && // Allow occasional spikes
      metrics.droppedFrames / this.frameTimes.length < 0.05 // <5% dropped frames
    );
  }
}

/**
 * Hook for performance monitoring
 * Note: Import from '@/hooks/performance/usePerformanceMonitor' for React hook
 */

/**
 * Bundle size validator
 */
export function validateBundleSize(
  currentSize: number,
  previousSize: number,
  budget: PerformanceBudget = PERFORMANCE_BUDGETS
): {
  valid: boolean;
  increase: number;
  percentage: number;
  message: string;
} {
  const increase = currentSize - previousSize;
  const percentage = previousSize > 0 ? (increase / previousSize) * 100 : 0;
  const valid = increase <= budget.maxBundleIncrease;

  return {
    valid,
    increase,
    percentage,
    message: valid
      ? `Bundle size increase acceptable: ${increase.toFixed(2)}KB (${percentage.toFixed(2)}%)`
      : `Bundle size increase exceeds budget: ${increase.toFixed(2)}KB (${percentage.toFixed(2)}%)`,
  };
}

/**
 * Memory usage validator
 */
export function validateMemoryUsage(
  currentUsage: number,
  budget: PerformanceBudget = PERFORMANCE_BUDGETS
): {
  valid: boolean;
  usage: number;
  message: string;
} {
  const valid = currentUsage <= budget.maxMemoryUsage;

  return {
    valid,
    usage: currentUsage,
    message: valid
      ? `Memory usage acceptable: ${currentUsage.toFixed(2)}MB`
      : `Memory usage exceeds budget: ${currentUsage.toFixed(2)}MB`,
  };
}

/**
 * Animation duration validator
 */
export function validateAnimationDuration(
  duration: number,
  budget: PerformanceBudget = PERFORMANCE_BUDGETS
): {
  valid: boolean;
  duration: number;
  message: string;
} {
  const valid = duration <= budget.maxAnimationDuration;

  return {
    valid,
    duration,
    message: valid
      ? `Animation duration acceptable: ${duration}ms`
      : `Animation duration exceeds budget: ${duration}ms`,
  };
}

/**
 * Comprehensive performance report
 */
export interface PerformanceReport {
  frameMetrics: {
    averageFrameTime: number;
    maxFrameTime: number;
    droppedFrames: number;
    fps: number;
  };
  bundleSize: {
    current: number;
    previous: number;
    increase: number;
    valid: boolean;
  };
  memoryUsage: {
    current: number;
    valid: boolean;
  };
  animations: {
    durations: number[];
    valid: boolean;
  };
  overall: {
    valid: boolean;
    score: number; // 0-100
  };
}

/**
 * Generate comprehensive performance report
 */
export function generatePerformanceReport(
  collector: PerformanceMetricsCollector,
  bundleSize: { current: number; previous: number },
  memoryUsage: number,
  animationDurations: number[],
  budget: PerformanceBudget = PERFORMANCE_BUDGETS
): PerformanceReport {
  const frameMetrics = collector.stop();
  const bundleValidation = validateBundleSize(bundleSize.current, bundleSize.previous, budget);
  const memoryValidation = validateMemoryUsage(memoryUsage, budget);
  const animationValidations = animationDurations.map((duration) =>
    validateAnimationDuration(duration, budget)
  );

  const animationsValid = animationValidations.every((v) => v.valid);

  // Calculate overall score (0-100)
  let score = 100;
  if (frameMetrics.averageFrameTime > budget.maxFrameTime) score -= 30;
  if (frameMetrics.droppedFrames / frameMetrics.frameTimes.length > 0.05) score -= 20;
  if (!bundleValidation.valid) score -= 20;
  if (!memoryValidation.valid) score -= 15;
  if (!animationsValid) score -= 15;

  const overallValid = score >= 70;

  return {
    frameMetrics,
    bundleSize: {
      current: bundleSize.current,
      previous: bundleSize.previous,
      increase: bundleValidation.increase,
      valid: bundleValidation.valid,
    },
    memoryUsage: {
      current: memoryUsage,
      valid: memoryValidation.valid,
    },
    animations: {
      durations: animationDurations,
      valid: animationsValid,
    },
    overall: {
      valid: overallValid,
      score: Math.max(0, score),
    },
  };
}

export default {
  PerformanceMetricsCollector,
  usePerformanceMonitor,
  validateBundleSize,
  validateMemoryUsage,
  validateAnimationDuration,
  generatePerformanceReport,
  PERFORMANCE_BUDGETS,
};

