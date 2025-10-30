/**
 * Analytics Tracking for Hooks
 * Tracks hook usage patterns for performance monitoring and debugging
 */

import { logger } from '@pawfectmatch/core';

interface HookUsageEvent {
  hookName: string;
  screenName: string;
  action?: string;
  duration?: number;
  error?: string;
  metadata?: Record<string, unknown>;
  timestamp?: number;
}

class HookAnalytics {
  private events: HookUsageEvent[] = [];
  private readonly MAX_EVENTS = 100;

  track(event: HookUsageEvent): void {
    this.events.push({
      ...event,
      timestamp: Date.now(),
    });

    // Keep only last N events
    if (this.events.length > this.MAX_EVENTS) {
      this.events = this.events.slice(-this.MAX_EVENTS);
    }

    // Log to analytics service
    logger.info('Hook Usage', {
      hook: event.hookName,
      screen: event.screenName,
      action: event.action,
      duration: event.duration,
      error: event.error,
      ...event.metadata,
    });
  }

  trackPerformance(hookName: string, screenName: string, duration: number): void {
    this.track({
      hookName,
      screenName,
      action: 'performance',
      duration,
    });
  }

  trackError(hookName: string, screenName: string, error: string): void {
    this.track({
      hookName,
      screenName,
      action: 'error',
      error,
    });
  }

  trackAction(hookName: string, screenName: string, action: string): void {
    this.track({
      hookName,
      screenName,
      action,
    });
  }

  getEvents(): HookUsageEvent[] {
    return [...this.events];
  }

  clearEvents(): void {
    this.events = [];
  }
}

export const hookAnalytics = new HookAnalytics();

/**
 * Hook wrapper that tracks usage and performance
 */
export function withAnalytics<T extends (...args: any[]) => any>(
  hook: T,
  hookName: string,
  screenName: string,
): T {
  return ((...args: Parameters<T>) => {
    const startTime = performance.now();

    try {
      const result = hook(...args);
      const duration = performance.now() - startTime;

      if (result && typeof result === 'object') {
        // Track hook initialization
        hookAnalytics.trackPerformance(hookName, screenName, duration);

        // Wrap methods with analytics
        const wrappedResult = { ...result };

        for (const key in wrappedResult) {
          if (typeof wrappedResult[key] === 'function') {
            const originalMethod = wrappedResult[key];
            wrappedResult[key] = (...methodArgs: any[]) => {
              hookAnalytics.trackAction(hookName, screenName, `${hookName}.${key}`);

              try {
                return originalMethod(...methodArgs);
              } catch (error) {
                hookAnalytics.trackError(
                  hookName,
                  screenName,
                  error instanceof Error ? error.message : String(error),
                );
                throw error;
              }
            };
          }
        }

        return wrappedResult;
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      hookAnalytics.trackError(
        hookName,
        screenName,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }) as T;
}
