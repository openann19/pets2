/**
 * 🎯 TELEMETRY SYSTEM FOR ANIMATIONS
 * 
 * Tracks animation performance and user experience metrics:
 * - animation_start, animation_end, cancelled
 * - frameDrops, qualityTier
 * - Weekly dashboard data
 */

import { Platform } from 'react-native';

export type AnimationEventType = 
  | 'animation_start'
  | 'animation_end'
  | 'animation_cancelled'
  | 'frame_drop'
  | 'animation_error';

export type QualityTier = 'high' | 'medium' | 'low';

export interface AnimationEvent {
  type: AnimationEventType;
  animationId: string;
  componentName?: string;
  duration?: number;
  cancelled?: boolean;
  frameDrops?: number;
  qualityTier?: QualityTier;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

class AnimationTelemetry {
  private events: AnimationEvent[] = [];
  private enabled: boolean = __DEV__ || process.env.EXPO_PUBLIC_ENABLE_TELEMETRY === 'true';
  private maxEvents: number = 1000; // Keep last 1000 events
  
  /**
   * Log animation start
   */
  logAnimationStart(
    animationId: string,
    componentName?: string,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.enabled) return;
    
    const event: AnimationEvent = {
      type: 'animation_start',
      animationId,
      componentName,
      timestamp: Date.now(),
      metadata,
    };
    
    this.addEvent(event);
  }
  
  /**
   * Log animation end
   */
  logAnimationEnd(
    animationId: string,
    duration: number,
    cancelled: boolean = false,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.enabled) return;
    
    const event: AnimationEvent = {
      type: cancelled ? 'animation_cancelled' : 'animation_end',
      animationId,
      duration,
      cancelled,
      timestamp: Date.now(),
      metadata,
    };
    
    this.addEvent(event);
  }
  
  /**
   * Log frame drops
   */
  logFrameDrops(
    animationId: string,
    frameDrops: number,
    qualityTier: QualityTier,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.enabled) return;
    
    const event: AnimationEvent = {
      type: 'frame_drop',
      animationId,
      frameDrops,
      qualityTier,
      timestamp: Date.now(),
      metadata,
    };
    
    this.addEvent(event);
    
    // In production, send to analytics service
    if (!__DEV__ && frameDrops > 5) {
      this.sendToAnalytics(event);
    }
  }
  
  /**
   * Log animation error
   */
  logAnimationError(
    animationId: string,
    error: Error,
    metadata?: Record<string, unknown>,
  ): void {
    if (!this.enabled) return;
    
    const event: AnimationEvent = {
      type: 'animation_error',
      animationId,
      timestamp: Date.now(),
      metadata: {
        ...metadata,
        error: {
          message: error.message,
          stack: error.stack,
        },
      },
    };
    
    this.addEvent(event);
    
    // Always send errors to analytics
    if (!__DEV__) {
      this.sendToAnalytics(event);
    }
  }
  
  /**
   * Get animation metrics for dashboard
   */
  getMetrics(timeWindowMs: number = 7 * 24 * 60 * 60 * 1000): {
    totalAnimations: number;
    cancelledRate: number;
    averageDuration: number;
    frameDropRate: number;
    qualityTierDistribution: Record<QualityTier, number>;
    p99FrameTime: number;
  } {
    const windowStart = Date.now() - timeWindowMs;
    const recentEvents = this.events.filter(e => e.timestamp >= windowStart);
    
    const starts = recentEvents.filter(e => e.type === 'animation_start');
    const ends = recentEvents.filter(e => e.type === 'animation_end');
    const cancelled = recentEvents.filter(e => e.type === 'animation_cancelled');
    const frameDrops = recentEvents.filter(e => e.type === 'frame_drop');
    
    const totalAnimations = starts.length;
    const cancelledRate = totalAnimations > 0 ? cancelled.length / totalAnimations : 0;
    const averageDuration = ends.length > 0
      ? ends.reduce((sum, e) => sum + (e.duration || 0), 0) / ends.length
      : 0;
    
    const frameDropRate = totalAnimations > 0 ? frameDrops.length / totalAnimations : 0;
    
    const qualityTierDistribution: Record<QualityTier, number> = {
      high: frameDrops.filter(e => e.qualityTier === 'high').length,
      medium: frameDrops.filter(e => e.qualityTier === 'medium').length,
      low: frameDrops.filter(e => e.qualityTier === 'low').length,
    };
    
    const durations = ends.map(e => e.duration || 0).sort((a, b) => a - b);
    const p99Index = Math.floor(durations.length * 0.99);
    const p99FrameTime = durations[p99Index] || 0;
    
    return {
      totalAnimations,
      cancelledRate,
      averageDuration,
      frameDropRate,
      qualityTierDistribution,
      p99FrameTime,
    };
  }
  
  /**
   * Get time-to-interactive for specific flow
   */
  getTimeToInteractive(flowName: string): number | null {
    const flowEvents = this.events.filter(
      e => e.metadata?.flowName === flowName && e.type === 'animation_end'
    );
    
    if (flowEvents.length === 0) return null;
    
    const durations = flowEvents.map(e => e.duration || 0);
    return durations.reduce((sum, d) => sum + d, 0) / durations.length;
  }
  
  /**
   * Export events for dashboard
   */
  exportEvents(): AnimationEvent[] {
    return [...this.events];
  }
  
  /**
   * Clear events (for testing or memory management)
   */
  clearEvents(): void {
    this.events = [];
  }
  
  /**
   * Enable/disable telemetry
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
  
  private addEvent(event: AnimationEvent): void {
    this.events.push(event);
    
    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }
  
  private sendToAnalytics(event: AnimationEvent): void {
    // Production analytics integration - send to monitoring service
    try {
      const analyticsService = this.getAnalyticsService();
      if (analyticsService) {
        analyticsService.track('animation_performance', {
          event_type: event.type,
          animation_id: event.animationId,
          component_name: event.componentName,
          duration: event.duration,
          frame_drops: event.frameDrops,
          quality_tier: event.qualityTier,
          timestamp: event.timestamp,
          metadata: event.metadata,
        });
      }
    } catch (error) {
      // Fallback: Send to backend analytics endpoint
      try {
        const { request } = require('../services/api');
        request('/analytics/events', {
          method: 'POST',
          body: {
            event: 'animation_event',
            properties: {
              type: event.type,
              animationId: event.animationId,
              componentName: event.componentName,
              duration: event.duration,
              frameDrops: event.frameDrops,
              qualityTier: event.qualityTier,
              ...event.metadata,
            },
            timestamp: event.timestamp,
          },
        }).catch(() => {
          // Silently fail if analytics unavailable
        });
      } catch {
        // Silently fail if all analytics methods unavailable
      }
    }
  }

  private getAnalyticsService(): any {
    // In production, integrate with analytics service (Sentry, Mixpanel, etc.)
    // For now, return null - add real service integration here
    try {
      // Example: return require('@sentry/react-native');
      // Example: return require('mixpanel-react-native');
      return null;
    } catch {
      return null;
    }
  }
}

// Singleton instance
export const animationTelemetry = new AnimationTelemetry();

/**
 * Hook to track animation lifecycle
 */
export function useAnimationTelemetry(animationId: string, componentName?: string) {
  const start = () => {
    animationTelemetry.logAnimationStart(animationId, componentName);
  };
  
  const end = (duration: number, cancelled: boolean = false) => {
    animationTelemetry.logAnimationEnd(animationId, duration, cancelled);
  };
  
  const logFrameDrops = (frameDrops: number, qualityTier: QualityTier) => {
    animationTelemetry.logFrameDrops(animationId, frameDrops, qualityTier);
  };
  
  const logError = (error: Error) => {
    animationTelemetry.logAnimationError(animationId, error);
  };
  
  return {
    start,
    end,
    logFrameDrops,
    logError,
  };
}

export default animationTelemetry;

