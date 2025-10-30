/**
 * Calling Telemetry Service
 * Comprehensive tracking of calling features and user behavior
 */

import { logger } from '../utils/logger';
import { useAuthStore } from '../stores/useAuthStore';

export interface CallingEvent {
  eventType: 'call_initiated' | 'call_answered' | 'call_ended' | 'call_failed' |
             'permission_requested' | 'permission_granted' | 'permission_denied' |
             'network_quality_changed' | 'device_check_completed' | 'video_toggle' |
             'mute_toggle' | 'camera_switch' | 'screen_share_started' | 'screen_share_ended';
  timestamp: number;
  userId: string;
  callId?: string;
  matchId?: string;
  callType?: 'voice' | 'video';
  duration?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export interface CallingMetrics {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  averageCallDuration: number;
  permissionDenialRate: number;
  networkQualityDistribution: Record<string, number>;
  deviceIssues: Record<string, number>;
  featureUsage: Record<string, number>;
}

class CallingTelemetryService {
  private events: CallingEvent[] = [];
  private readonly maxEvents = 1000;

  /**
   * Track a calling event
   */
  trackEvent(event: Omit<CallingEvent, 'timestamp' | 'userId'>): void {
    const { user } = useAuthStore.getState();
    const userId = user?._id || user?.id || 'anonymous';

    const fullEvent: CallingEvent = {
      ...event,
      timestamp: Date.now(),
      userId
    };

    this.events.push(fullEvent);

    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to analytics service
    logger.info('Calling event tracked', {
      eventType: event.eventType,
      userId,
      callId: event.callId,
      metadata: event.metadata
    });

    // Send to analytics backend (if available)
    this.sendToAnalytics(fullEvent);
  }

  /**
   * Track call initiation
   */
  trackCallInitiated(matchId: string, callType: 'voice' | 'video', callId: string): void {
    this.trackEvent({
      eventType: 'call_initiated',
      callId,
      matchId,
      callType,
      metadata: { initiator: 'caller' }
    });
  }

  /**
   * Track call answered
   */
  trackCallAnswered(callId: string, matchId: string, callType: 'voice' | 'video'): void {
    this.trackEvent({
      eventType: 'call_answered',
      callId,
      matchId,
      callType,
      metadata: { answerer: 'callee' }
    });
  }

  /**
   * Track call ended
   */
  trackCallEnded(callId: string, duration: number, reason?: string): void {
    this.trackEvent({
      eventType: 'call_ended',
      callId,
      duration,
      reason,
      metadata: { endReason: reason || 'normal' }
    });
  }

  /**
   * Track call failure
   */
  trackCallFailed(callId: string, reason: string, metadata?: Record<string, unknown>): void {
    this.trackEvent({
      eventType: 'call_failed',
      callId,
      reason,
      metadata
    });
  }

  /**
   * Track permission events
   */
  trackPermissionEvent(type: 'camera' | 'microphone', granted: boolean): void {
    this.trackEvent({
      eventType: granted ? 'permission_granted' : 'permission_denied',
      metadata: {
        permissionType: type,
        granted
      }
    });
  }

  /**
   * Track network quality changes
   */
  trackNetworkQuality(callId: string, quality: string, bitrate?: number): void {
    this.trackEvent({
      eventType: 'network_quality_changed',
      callId,
      metadata: {
        quality,
        bitrate
      }
    });
  }

  /**
   * Track device check completion
   */
  trackDeviceCheckCompleted(success: boolean, issues?: string[]): void {
    this.trackEvent({
      eventType: 'device_check_completed',
      metadata: {
        success,
        issues: issues || []
      }
    });
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: 'video_toggle' | 'mute_toggle' | 'camera_switch' | 'screen_share_started' | 'screen_share_ended', callId?: string): void {
    this.trackEvent({
      eventType: feature,
      callId,
      metadata: { feature }
    });
  }

  /**
   * Get calling metrics for analytics
   */
  getMetrics(timeRangeHours: number = 24): CallingMetrics {
    const cutoff = Date.now() - (timeRangeHours * 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp > cutoff);

    const totalCalls = recentEvents.filter(e => e.eventType === 'call_initiated').length;
    const successfulCalls = recentEvents.filter(e => e.eventType === 'call_ended' && !e.reason?.includes('failed')).length;
    const failedCalls = recentEvents.filter(e => e.eventType === 'call_failed').length;

    const callDurations = recentEvents
      .filter(e => e.eventType === 'call_ended' && e.duration)
      .map(e => e.duration!);

    const averageCallDuration = callDurations.length > 0
      ? callDurations.reduce((sum, d) => sum + d, 0) / callDurations.length
      : 0;

    const permissionEvents = recentEvents.filter(e => e.eventType === 'permission_denied');
    const permissionDenialRate = totalCalls > 0 ? (permissionEvents.length / totalCalls) * 100 : 0;

    const networkQualityEvents = recentEvents.filter(e => e.eventType === 'network_quality_changed');
    const networkQualityDistribution = networkQualityEvents.reduce((acc, e) => {
      const quality = (e.metadata?.quality as string) || 'unknown';
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const deviceIssues = recentEvents
      .filter(e => e.eventType === 'device_check_completed' && !e.metadata?.success)
      .reduce((acc, e) => {
        const issues = e.metadata?.issues as string[] || [];
        issues.forEach(issue => {
          acc[issue] = (acc[issue] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>);

    const featureUsage = recentEvents
      .filter(e => ['video_toggle', 'mute_toggle', 'camera_switch', 'screen_share_started', 'screen_share_ended'].includes(e.eventType))
      .reduce((acc, e) => {
        acc[e.eventType] = (acc[e.eventType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return {
      totalCalls,
      successfulCalls,
      failedCalls,
      averageCallDuration,
      permissionDenialRate,
      networkQualityDistribution,
      deviceIssues,
      featureUsage
    };
  }

  /**
   * Export events for debugging/admin purposes
   */
  exportEvents(hoursBack: number = 24): CallingEvent[] {
    const cutoff = Date.now() - (hoursBack * 60 * 60 * 1000);
    return this.events.filter(e => e.timestamp > cutoff);
  }

  /**
   * Send event to analytics backend
   */
  private async sendToAnalytics(event: CallingEvent): Promise<void> {
    try {
      // TODO: Implement actual analytics API call
      // const analyticsService = getAnalyticsService();
      // await analyticsService.trackEvent('calling', event);
    } catch (error) {
      logger.warn('Failed to send calling event to analytics', { error });
    }
  }
}

// Export singleton instance
export const callingTelemetry = new CallingTelemetryService();
