import { Platform } from 'react-native';
import { logger } from './logger';
import type { NetworkStats, CallData } from './WebRTCService';

export interface CallTelemetryEvent {
  eventType:
    | 'call_initiated'
    | 'call_answered'
    | 'call_rejected'
    | 'call_ended'
    | 'call_failed'
    | 'network_quality_changed'
    | 'device_check_completed'
    | 'permission_denied'
    | 'reconnection_attempt'
    | 'video_quality_changed';
  timestamp: number;
  sessionId: string;
  callId?: string;
  userId?: string;
  data: Record<string, unknown>;
}

export interface CallSessionMetrics {
  sessionId: string;
  callId?: string;
  callType: 'voice' | 'video';
  duration: number;
  startTime: number;
  endTime?: number;
  endReason: 'completed' | 'rejected' | 'failed' | 'network_error' | 'permission_error';

  // Network metrics
  networkStats: {
    initialQuality: string;
    finalQuality: string;
    qualityChanges: number;
    avgBitrate: number;
    avgPacketLoss: number;
    avgRtt: number;
    reconnectionAttempts: number;
  };

  // Device metrics
  deviceInfo: {
    platform: string;
    osVersion: string;
    deviceModel?: string;
    hasCamera: boolean;
    hasMicrophone: boolean;
    networkType: string;
  };

  // Quality metrics
  qualityMetrics: {
    videoQualityChanges: number;
    audioIssues: number;
    videoIssues: number;
    userReportedIssues: string[];
  };

  // Performance metrics
  performance: {
    setupTime: number; // Time from initiation to connection
    firstMediaTime: number; // Time to first media packet
    iceConnectionTime: number; // Time to establish ICE connection
  };
}

export interface DeviceCheckTelemetry {
  timestamp: number;
  sessionId: string;
  checkDuration: number;
  results: {
    networkReady: boolean;
    cameraReady: boolean;
    microphoneReady: boolean;
    overallReady: boolean;
    warnings: string[];
    errors: string[];
  };
  networkDetails: {
    type: string;
    quality: string;
    bandwidth?: number;
    speedTestCompleted: boolean;
  };
}

class CallTelemetryService {
  private static instance: CallTelemetryService;
  private events: CallTelemetryEvent[] = [];
  private activeSessions: Map<string, CallSessionMetrics> = new Map();
  private sessionStartTimes: Map<string, number> = new Map();

  public static getInstance(): CallTelemetryService {
    if (!CallTelemetryService.instance) {
      CallTelemetryService.instance = new CallTelemetryService();
    }
    return CallTelemetryService.instance;
  }

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  /**
   * Start tracking a new call session
   */
  startCallSession(sessionId: string, callData: CallData): void {
    const startTime = Date.now();
    this.sessionStartTimes.set(sessionId, startTime);

    const session: CallSessionMetrics = {
      sessionId,
      callId: callData.callId,
      callType: callData.callType,
      duration: 0,
      startTime,
      endReason: 'completed',

      networkStats: {
        initialQuality: 'unknown',
        finalQuality: 'unknown',
        qualityChanges: 0,
        avgBitrate: 0,
        avgPacketLoss: 0,
        avgRtt: 0,
        reconnectionAttempts: 0,
      },

      deviceInfo: {
        platform: Platform.OS,
        osVersion: Platform.Version.toString(),
        hasCamera: false,
        hasMicrophone: false,
        networkType: 'unknown',
      },

      qualityMetrics: {
        videoQualityChanges: 0,
        audioIssues: 0,
        videoIssues: 0,
        userReportedIssues: [],
      },

      performance: {
        setupTime: 0,
        firstMediaTime: 0,
        iceConnectionTime: 0,
      },
    };

    this.activeSessions.set(sessionId, session);

    this.trackEvent({
      eventType: 'call_initiated',
      timestamp: startTime,
      sessionId,
      callId: callData.callId,
      userId: callData.callerId,
      data: {
        callType: callData.callType,
        matchId: callData.matchId,
        platform: Platform.OS,
      },
    });

    logger.info('Call session started', { sessionId, callId: callData.callId });
  }

  /**
   * End a call session
   */
  endCallSession(sessionId: string, endReason: CallSessionMetrics['endReason']): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) {
      logger.warn('Attempted to end unknown session', { sessionId });
      return;
    }

    const endTime = Date.now();
    session.endTime = endTime;
    session.duration = endTime - session.startTime;
    session.endReason = endReason;

    this.trackEvent({
      eventType: 'call_ended',
      timestamp: endTime,
      sessionId,
      callId: session.callId,
      data: {
        duration: session.duration,
        endReason,
        networkStats: session.networkStats,
        qualityMetrics: session.qualityMetrics,
      },
    });

    // Log session summary
    logger.info('Call session ended', {
      sessionId,
      duration: session.duration,
      endReason,
      networkQualityChanges: session.networkStats.qualityChanges,
      reconnectionAttempts: session.networkStats.reconnectionAttempts,
    });

    // Keep session for analytics but mark as completed
    this.activeSessions.delete(sessionId);
  }

  /**
   * Track network quality changes
   */
  trackNetworkQualityChange(sessionId: string, networkStats: NetworkStats): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    // Update session metrics
    if (session.networkStats.initialQuality === 'unknown') {
      session.networkStats.initialQuality = networkStats.quality;
    }
    session.networkStats.finalQuality = networkStats.quality;
    session.networkStats.qualityChanges++;

    // Running averages (simplified)
    session.networkStats.avgBitrate = (session.networkStats.avgBitrate + networkStats.bitrate) / 2;
    session.networkStats.avgPacketLoss =
      (session.networkStats.avgPacketLoss + networkStats.packetLoss) / 2;
    session.networkStats.avgRtt = (session.networkStats.avgRtt + networkStats.rtt) / 2;

    this.trackEvent({
      eventType: 'network_quality_changed',
      timestamp: Date.now(),
      sessionId,
      callId: session.callId,
      data: {
        quality: networkStats.quality,
        bitrate: networkStats.bitrate,
        packetLoss: networkStats.packetLoss,
        rtt: networkStats.rtt,
        jitter: networkStats.jitter,
      },
    });
  }

  /**
   * Track video quality changes
   */
  trackVideoQualityChange(
    sessionId: string,
    newQuality: '720p' | '480p' | 'audio-only',
    reason: string,
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.qualityMetrics.videoQualityChanges++;

    this.trackEvent({
      eventType: 'video_quality_changed',
      timestamp: Date.now(),
      sessionId,
      callId: session.callId,
      data: {
        newQuality,
        reason,
        changeCount: session.qualityMetrics.videoQualityChanges,
      },
    });
  }

  /**
   * Track reconnection attempts
   */
  trackReconnectionAttempt(sessionId: string, attempt: number, reason: string): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    session.networkStats.reconnectionAttempts = attempt;

    this.trackEvent({
      eventType: 'reconnection_attempt',
      timestamp: Date.now(),
      sessionId,
      callId: session.callId,
      data: {
        attempt,
        reason,
        totalAttempts: session.networkStats.reconnectionAttempts,
      },
    });
  }

  /**
   * Track device check completion
   */
  trackDeviceCheck(sessionId: string, telemetry: DeviceCheckTelemetry): void {
    this.trackEvent({
      eventType: 'device_check_completed',
      timestamp: telemetry.timestamp,
      sessionId,
      data: {
        duration: telemetry.checkDuration,
        results: telemetry.results,
        networkDetails: telemetry.networkDetails,
      },
    });

    // Update session device info if session exists
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.deviceInfo.hasCamera = telemetry.results.cameraReady;
      session.deviceInfo.hasMicrophone = telemetry.results.microphoneReady;
      session.deviceInfo.networkType = telemetry.networkDetails.type;
    }
  }

  /**
   * Track permission denial
   */
  trackPermissionDenied(
    sessionId: string,
    permissionType: 'audio' | 'video' | 'both',
    reason: string,
  ): void {
    this.trackEvent({
      eventType: 'permission_denied',
      timestamp: Date.now(),
      sessionId,
      data: {
        permissionType,
        reason,
        platform: Platform.OS,
      },
    });
  }

  /**
   * Track call failure
   */
  trackCallFailure(
    sessionId: string,
    error: string,
    stage: 'setup' | 'connection' | 'media' | 'network',
  ): void {
    const session = this.activeSessions.get(sessionId);

    this.trackEvent({
      eventType: 'call_failed',
      timestamp: Date.now(),
      sessionId,
      callId: session?.callId,
      data: {
        error,
        stage,
        platform: Platform.OS,
        duration: session ? Date.now() - session.startTime : 0,
      },
    });

    // End session with failure reason
    if (session) {
      this.endCallSession(sessionId, 'failed');
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetric(
    sessionId: string,
    metric: 'setup' | 'first_media' | 'ice_connection',
    duration: number,
  ): void {
    const session = this.activeSessions.get(sessionId);
    if (!session) return;

    switch (metric) {
      case 'setup':
        session.performance.setupTime = duration;
        break;
      case 'first_media':
        session.performance.firstMediaTime = duration;
        break;
      case 'ice_connection':
        session.performance.iceConnectionTime = duration;
        break;
    }

    logger.info('Performance metric tracked', { sessionId, metric, duration });
  }

  /**
   * Track a generic event
   */
  private trackEvent(event: CallTelemetryEvent): void {
    this.events.push(event);

    // Keep only last 1000 events to prevent memory issues
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000);
    }

    // Log important events
    if (['call_failed', 'permission_denied', 'call_ended'].includes(event.eventType)) {
      logger.info('Call telemetry event', {
        type: event.eventType,
        sessionId: event.sessionId,
        data: event.data,
      });
    }
  }

  /**
   * Get session metrics for analytics
   */
  getSessionMetrics(sessionId: string): CallSessionMetrics | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * Get all events for a session
   */
  getSessionEvents(sessionId: string): CallTelemetryEvent[] {
    return this.events.filter((event) => event.sessionId === sessionId);
  }

  /**
   * Export telemetry data for analytics
   */
  exportTelemetryData(): {
    events: CallTelemetryEvent[];
    activeSessions: CallSessionMetrics[];
    summary: {
      totalSessions: number;
      totalEvents: number;
      avgCallDuration: number;
      successRate: number;
      commonFailureReasons: Record<string, number>;
    };
  } {
    const activeSessions = Array.from(this.activeSessions.values());
    const completedCalls = this.events.filter((e) => e.eventType === 'call_ended');
    const failedCalls = this.events.filter((e) => e.eventType === 'call_failed');

    const totalCalls = completedCalls.length + failedCalls.length;
    const successRate = totalCalls > 0 ? (completedCalls.length / totalCalls) * 100 : 0;

    const avgDuration =
      completedCalls.length > 0
        ? completedCalls.reduce((sum, event) => sum + ((event.data.duration as number) || 0), 0) /
          completedCalls.length
        : 0;

    // Count failure reasons
    const failureReasons: Record<string, number> = {};
    failedCalls.forEach((event) => {
      const reason = (event.data.error as string) || 'unknown';
      failureReasons[reason] = (failureReasons[reason] || 0) + 1;
    });

    return {
      events: this.events,
      activeSessions,
      summary: {
        totalSessions: this.events.filter((e) => e.eventType === 'call_initiated').length,
        totalEvents: this.events.length,
        avgCallDuration: avgDuration,
        successRate,
        commonFailureReasons: failureReasons,
      },
    };
  }

  /**
   * Clear old telemetry data
   */
  clearOldData(olderThanHours: number = 24): void {
    const cutoffTime = Date.now() - olderThanHours * 60 * 60 * 1000;

    this.events = this.events.filter((event) => event.timestamp > cutoffTime);

    logger.info('Cleared old telemetry data', {
      cutoffTime: new Date(cutoffTime).toISOString(),
      remainingEvents: this.events.length,
    });
  }
}

export default CallTelemetryService.getInstance();
