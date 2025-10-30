import React from 'react';
import { InteractionManager, Platform } from 'react-native';
import { logger } from '@pawfectmatch/core';

// Declare global __DEV__ variable
declare const __DEV__: boolean;

/**
 * Performance Monitoring Utility
 * Implements P-08: Measure JS FPS with react-native-performance overlay
 * Features:
 * - FPS monitoring and reporting
 * - Memory usage tracking
 * - Interaction timing measurements
 * - Performance metrics collection
 * - Development-only monitoring
 */

export interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  interactionTime: number;
  timestamp: number;
  gestureResponseTime?: number;
  animationFrameTime?: number;
  componentRenderTime?: number;
}

interface InteractionTiming {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

class PerformanceMonitor {
  private isEnabled: boolean = __DEV__;
  private lastFrameTime: number = 0;
  private frameCount: number = 0;
  private currentFPS: number = 60;
  private interactions: Map<string, InteractionTiming> = new Map();
  private metricsHistory: PerformanceMetrics[] = [];
  private maxHistorySize: number = 100;

  constructor() {
    if (this.isEnabled) {
      this.startFPSMonitoring();
    }
  }

  /**
   * Enable or disable performance monitoring
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled && __DEV__;

    if (this.isEnabled) {
      this.startFPSMonitoring();
    }
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    if (!this.isEnabled) return;

    const measureFPS = () => {
      const now = Date.now();

      if (this.lastFrameTime > 0) {
        const deltaTime = now - this.lastFrameTime;
        this.frameCount++;

        // Calculate FPS every second
        if (deltaTime >= 1000) {
          this.currentFPS = Math.round((this.frameCount * 1000) / deltaTime);
          this.frameCount = 0;
          this.lastFrameTime = now;

          // Log low FPS warnings
          if (this.currentFPS < 30) {
            logger.warn('Low FPS detected', { fps: this.currentFPS });
          }

          this.recordMetrics();
        }
      } else {
        this.lastFrameTime = now;
      }

      requestAnimationFrame(measureFPS);
    };

    requestAnimationFrame(measureFPS);
  }

  /**
   * Get current FPS
   */
  public getCurrentFPS(): number {
    return this.currentFPS;
  }

  /**
   * Start timing an interaction
   */
  public startInteraction(name: string): void {
    if (!this.isEnabled) return;

    const interaction: InteractionTiming = {
      name,
      startTime: Date.now(),
    };

    this.interactions.set(name, interaction);
  }

  /**
   * End timing an interaction
   */
  public endInteraction(name: string): number | null {
    if (!this.isEnabled) return null;

    const interaction = this.interactions.get(name);
    if (interaction === undefined) {
      logger.warn('Interaction was not started', { interactionName: name });
      return null;
    }

    const endTime = Date.now();
    const duration = endTime - interaction.startTime;

    interaction.endTime = endTime;
    interaction.duration = duration;

    // Log slow interactions
    if (duration > 100) {
      logger.warn('Slow interaction detected', {
        interactionName: name,
        duration,
      });
    }

    this.interactions.delete(name);
    return duration;
  }

  /**
   * Measure interaction with automatic timing
   */
  public async measureInteraction<T>(name: string, fn: () => Promise<T> | T): Promise<T> {
    if (!this.isEnabled) {
      return await fn();
    }

    this.startInteraction(name);

    try {
      const result = await fn();
      return result;
    } finally {
      this.endInteraction(name);
    }
  }

  /**
   * Get memory usage (approximate)
   */
  private getMemoryUsage(): number {
    // Note: React Native doesn't provide direct memory access
    // This is a placeholder for native module implementation
    if (Platform.OS === 'ios') {
      // On iOS, you could use a native module to get memory info
      return 0;
    } else {
      // On Android, you could use a native module to get memory info
      return 0;
    }
  }

  /**
   * Record current performance metrics
   */
  private recordMetrics(): void {
    if (!this.isEnabled) return;

    const metrics: PerformanceMetrics = {
      fps: this.currentFPS,
      memoryUsage: this.getMemoryUsage(),
      interactionTime: this.getAverageInteractionTime(),
      timestamp: Date.now(),
    };

    this.metricsHistory.push(metrics);

    // Keep history size manageable
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.shift();
    }
  }

  /**
   * Get average interaction time from recent interactions
   */
  private getAverageInteractionTime(): number {
    const recentInteractions = Array.from(this.interactions.values())
      .filter((interaction) => interaction.duration !== undefined)
      .slice(-10); // Last 10 interactions

    if (recentInteractions.length === 0) return 0;

    const totalTime = recentInteractions.reduce(
      (sum, interaction) => sum + (interaction.duration !== undefined ? interaction.duration : 0),
      0,
    );

    return totalTime / recentInteractions.length;
  }

  /**
   * Get performance metrics history
   */
  public getMetricsHistory(): PerformanceMetrics[] {
    return [...this.metricsHistory];
  }

  /**
   * Get current performance summary
   */
  public getPerformanceSummary(): {
    currentFPS: number;
    averageFPS: number;
    minFPS: number;
    maxFPS: number;
    memoryUsage: number;
    activeInteractions: number;
  } {
    const fpsValues = this.metricsHistory.map((m) => m.fps);

    return {
      currentFPS: this.currentFPS,
      averageFPS:
        fpsValues.length > 0
          ? Math.round(fpsValues.reduce((a, b) => a + b, 0) / fpsValues.length)
          : 0,
      minFPS: fpsValues.length > 0 ? Math.min(...fpsValues) : 0,
      maxFPS: fpsValues.length > 0 ? Math.max(...fpsValues) : 0,
      memoryUsage: this.getMemoryUsage(),
      activeInteractions: this.interactions.size,
    };
  }

  /**
   * Log performance summary to console
   */
  public logPerformanceSummary(): void {
    if (!this.isEnabled) return;

    const summary = this.getPerformanceSummary();
    logger.warn('Performance Summary', summary);
  }

  /**
   * Clear metrics history
   */
  public clearHistory(): void {
    this.metricsHistory = [];
    this.interactions.clear();
  }

  /**
   * Wait for interactions to complete
   */
  public waitForInteractions(): Promise<void> {
    return new Promise((resolve) => {
      InteractionManager.runAfterInteractions(resolve);
    });
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React Hook for performance monitoring
 */
export const usePerformanceMonitor = () => {
  const startInteraction = (name: string) => {
    performanceMonitor.startInteraction(name);
  };
  const endInteraction = (name: string) => {
    return performanceMonitor.endInteraction(name);
  };
  const measureInteraction = <T>(name: string, fn: () => Promise<T> | T) =>
    performanceMonitor.measureInteraction(name, fn);
  const getCurrentFPS = () => performanceMonitor.getCurrentFPS();
  const getPerformanceSummary = () => performanceMonitor.getPerformanceSummary();

  return {
    startInteraction,
    endInteraction,
    measureInteraction,
    getCurrentFPS,
    getPerformanceSummary,
  };
};

/**
 * Performance monitoring decorator for class methods
 */
export const withPerformanceMonitoring = (_name: string) => {
  return (target: Record<string, unknown>, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value as (...args: unknown[]) => unknown;

    descriptor.value = async function (...args: unknown[]): Promise<unknown> {
      return performanceMonitor.measureInteraction(
        `${target.constructor.name}.${propertyKey}`,
        () => originalMethod.apply(this, args),
      );
    };

    return descriptor;
  };
};

/**
 * Performance monitoring HOC for React components
 */
export const withComponentPerformanceMonitoring = <P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string,
): React.FC<P> => {
  const WrappedComponent: React.FC<P> = (props) => {
    const name = componentName ?? Component.displayName ?? Component.name;

    React.useEffect(() => {
      performanceMonitor.startInteraction(`${name}.mount`);

      return () => {
        performanceMonitor.endInteraction(`${name}.mount`);
      };
    }, [name]);

    return React.createElement(Component, props);
  };

  WrappedComponent.displayName = `withPerformanceMonitoring(${Component.displayName !== undefined && Component.displayName !== '' ? Component.displayName : Component.name})`;

  return WrappedComponent;
};

export default performanceMonitor;
