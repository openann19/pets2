/**
 * Call Telemetry Service
 *
 * Provides comprehensive call telemetry and monitoring including:
 * - Per-call statistics collection
 * - Performance metrics
 * - Quality indicators
 * - Error tracking
 * - Usage analytics
 */

import type { MediaStream } from 'react-native-webrtc';
import { logger } from '@pawfectmatch/core';

export interface CallTelemetryData {
  callId: string;
  matchId: string;
  callerId: string;
  receiverId: string;
  callType: 'voice' | 'video';
  startTime: number;
  endTime?: number;
  duration?: number;
  
  // Connection metrics
  connectionTime?: number;
  iceConnectionTime?: number;
  reconnectionCount: number;
  
  // Quality metrics
  averageBitrate: number;
  peakBitrate: number;
  minBitrate: number;
  packetLoss: number;
  averageRtt: number;
  peakRtt: number;
  jitter: number;
  
  // Audio metrics
  audioEnabled: boolean;
  audioMuteTime: number;
  audioQuality: 'poor' | 'fair' | 'good' | 'excellent';
  
  // Video metrics
  videoEnabled: boolean;
  videoQuality: '720p' | '480p' | '360p' | 'audio-only';
  videoResolutionTime: number;
  videoFreezeCount: number;
  
  // Device metrics
  deviceType: string;
  networkType: string;
  bluetoothUsed: boolean;
  speakerUsed: boolean;
  
  // Error metrics
  errorCount: number;
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
  
  // User interactions
  muteToggleCount: number;
  videoToggleCount: number;
  speakerToggleCount: number;
  cameraSwitchCount: number;
  
  // Outcome
  outcome: 'completed' | 'failed' | 'rejected' | 'missed' | 'interrupted';
  terminationReason?: string;
}

export interface CallTelemetryConfig {
  enableStatsCollection: boolean;
  enableQualityMonitoring: boolean;
  enableErrorTracking: boolean;
  enableUserInteractionTracking: boolean;
  statsCollectionInterval: number; // ms
  maxStoredCalls: number;
}

export class CallTelemetryService {
  private static instance: CallTelemetryService;
  private config: CallTelemetryConfig;
  private activeCalls: Map<string, CallTelemetryData> = new Map();
  private statsCollectionIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private isInitialized = false;

  static getInstance(): CallTelemetryService {
    if (!CallTelemetryService.instance) {
      CallTelemetryService.instance = new CallTelemetryService();
    }
    return CallTelemetryService.instance;
  }

  constructor(config: Partial<CallTelemetryConfig> = {}) {
    this.config = {
      enableStatsCollection: true,
      enableQualityMonitoring: true,
      enableErrorTracking: true,
      enableUserInteractionTracking: true,
      statsCollectionInterval: 5000, // 5 seconds
      maxStoredCalls: 100,
      ...config,
    };
  }

  /**
   * Initialize telemetry service
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      logger.info('Initializing call telemetry service', { config: this.config });
      
      // Load any stored telemetry data
      await this.loadStoredTelemetry();
      
      this.isInitialized = true;
      logger.info('Call telemetry service initialized successfully');
      return true;

    } catch (error) {
      logger.error('Failed to initialize call telemetry service', { error });
      return false;
    }
  }

  /**
   * Start tracking a new call
   */
  startCallTracking(callData: {
    callId: string;
    matchId: string;
    callerId: string;
    receiverId: string;
    callType: 'voice' | 'video';
  }): void {
    try {
      const telemetryData: CallTelemetryData = {
        ...callData,
        startTime: Date.now(),
        reconnectionCount: 0,
        averageBitrate: 0,
        peakBitrate: 0,
        minBitrate: 0,
        packetLoss: 0,
        averageRtt: 0,
        peakRtt: 0,
        jitter: 0,
        audioEnabled: true,
        audioMuteTime: 0,
        audioQuality: 'good',
        videoEnabled: callData.callType === 'video',
        videoQuality: callData.callType === 'video' ? '720p' : 'audio-only',
        videoResolutionTime: 0,
        videoFreezeCount: 0,
        deviceType: this.getDeviceType(),
        networkType: 'unknown',
        bluetoothUsed: false,
        speakerUsed: false,
        errorCount: 0,
        errors: [],
        muteToggleCount: 0,
        videoToggleCount: 0,
        speakerToggleCount: 0,
        cameraSwitchCount: 0,
        outcome: 'failed', // Will be updated on completion
      };

      this.activeCalls.set(callData.callId, telemetryData);

      // Start stats collection if enabled
      if (this.config.enableStatsCollection) {
        this.startStatsCollection(callData.callId);
      }

      logger.info('Started call tracking', { callId: callData.callId });

    } catch (error) {
      logger.error('Failed to start call tracking', { error });
    }
  }

  /**
   * Update call connection metrics
   */
  updateConnectionMetrics(callId: string, metrics: {
    connectionTime?: number;
    iceConnectionTime?: number;
    networkType?: string;
  }): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry) {
        return;
      }

      if (metrics.connectionTime !== undefined) {
        telemetry.connectionTime = metrics.connectionTime;
      }

      if (metrics.iceConnectionTime !== undefined) {
        telemetry.iceConnectionTime = metrics.iceConnectionTime;
      }

      if (metrics.networkType !== undefined) {
        telemetry.networkType = metrics.networkType;
      }

      logger.debug('Updated connection metrics', { callId, metrics });

    } catch (error) {
      logger.error('Failed to update connection metrics', { error });
    }
  }

  /**
   * Update quality metrics from WebRTC stats
   */
  updateQualityMetrics(callId: string, stats: {
    bitrate?: number;
    packetLoss?: number;
    rtt?: number;
    jitter?: number;
  }): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry || !this.config.enableQualityMonitoring) {
        return;
      }

      if (stats.bitrate !== undefined) {
        telemetry.averageBitrate = (telemetry.averageBitrate + stats.bitrate) / 2;
        telemetry.peakBitrate = Math.max(telemetry.peakBitrate, stats.bitrate);
        telemetry.minBitrate = telemetry.minBitrate === 0 ? stats.bitrate : Math.min(telemetry.minBitrate, stats.bitrate);
      }

      if (stats.packetLoss !== undefined) {
        telemetry.packetLoss = (telemetry.packetLoss + stats.packetLoss) / 2;
      }

      if (stats.rtt !== undefined) {
        telemetry.averageRtt = (telemetry.averageRtt + stats.rtt) / 2;
        telemetry.peakRtt = Math.max(telemetry.peakRtt, stats.rtt);
      }

      if (stats.jitter !== undefined) {
        telemetry.jitter = (telemetry.jitter + stats.jitter) / 2;
      }

      // Update quality rating based on metrics
      telemetry.audioQuality = this.calculateAudioQuality(telemetry);

      logger.debug('Updated quality metrics', { callId, stats });

    } catch (error) {
      logger.error('Failed to update quality metrics', { error });
    }
  }

  /**
   * Track user interaction
   */
  trackUserInteraction(callId: string, interaction: {
    type: 'mute' | 'video' | 'speaker' | 'camera_switch';
    state?: boolean;
  }): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry || !this.config.enableUserInteractionTracking) {
        return;
      }

      switch (interaction.type) {
        case 'mute':
          telemetry.muteToggleCount++;
          if (interaction.state === false) {
            telemetry.audioMuteTime += Date.now() - (telemetry.endTime || Date.now());
          }
          break;
        case 'video':
          telemetry.videoToggleCount++;
          if (interaction.state !== undefined) {
            telemetry.videoEnabled = interaction.state;
            if (interaction.state) {
              telemetry.videoResolutionTime = Date.now();
            }
          }
          break;
        case 'speaker':
          telemetry.speakerToggleCount++;
          telemetry.speakerUsed = true;
          break;
        case 'camera_switch':
          telemetry.cameraSwitchCount++;
          break;
      }

      logger.debug('Tracked user interaction', { callId, interaction });

    } catch (error) {
      logger.error('Failed to track user interaction', { error });
    }
  }

  /**
   * Track call error
   */
  trackCallError(callId: string, error: {
    type: string;
    message: string;
  }): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry || !this.config.enableErrorTracking) {
        return;
      }

      telemetry.errorCount++;
      telemetry.errors.push({
        ...error,
        timestamp: Date.now(),
      });

      logger.debug('Tracked call error', { callId, error });

    } catch (error) {
      logger.error('Failed to track call error', { error });
    }
  }

  /**
   * Track reconnection
   */
  trackReconnection(callId: string): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry) {
        return;
      }

      telemetry.reconnectionCount++;
      logger.debug('Tracked reconnection', { callId });

    } catch (error) {
      logger.error('Failed to track reconnection', { error });
    }
  }

  /**
   * Track video freeze
   */
  trackVideoFreeze(callId: string): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry) {
        return;
      }

      telemetry.videoFreezeCount++;
      logger.debug('Tracked video freeze', { callId });

    } catch (error) {
      logger.error('Failed to track video freeze', { error });
    }
  }

  /**
   * End call tracking
   */
  endCallTracking(callId: string, outcome: CallTelemetryData['outcome'], terminationReason?: string): void {
    try {
      const telemetry = this.activeCalls.get(callId);
      if (!telemetry) {
        return;
      }

      telemetry.endTime = Date.now();
      telemetry.duration = telemetry.endTime - telemetry.startTime;
      telemetry.outcome = outcome;
      telemetry.terminationReason = terminationReason;

      // Stop stats collection
      this.stopStatsCollection(callId);

      // Save telemetry data
      this.saveTelemetryData(telemetry);

      // Remove from active calls
      this.activeCalls.delete(callId);

      logger.info('Ended call tracking', { callId, outcome, duration: telemetry.duration });

    } catch (error) {
      logger.error('Failed to end call tracking', { error });
    }
  }

  /**
   * Get telemetry for active call
   */
  getActiveCallTelemetry(callId: string): CallTelemetryData | null {
    return this.activeCalls.get(callId) || null;
  }

  /**
   * Get all active calls telemetry
   */
  getAllActiveCallsTelemetry(): CallTelemetryData[] {
    return Array.from(this.activeCalls.values());
  }

  /**
   * Get historical telemetry data
   */
  async getHistoricalTelemetry(limit?: number): Promise<CallTelemetryData[]> {
    try {
      // This would load from storage/database
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get historical telemetry', { error });
      return [];
    }
  }

  /**
   * Get telemetry summary
   */
  getTelemetrySummary(telemetry: CallTelemetryData): {
    connectionQuality: string;
    userEngagement: string;
    technicalIssues: string;
  } {
    const connectionQuality = this.getConnectionQuality(telemetry);
    const userEngagement = this.getUserEngagement(telemetry);
    const technicalIssues = this.getTechnicalIssues(telemetry);

    return {
      connectionQuality,
      userEngagement,
      technicalIssues,
    };
  }

  // Private methods
  private startStatsCollection(callId: string): void {
    const interval = setInterval(() => {
      // This would collect WebRTC stats periodically
      // For now, we'll just log that it's running
      logger.debug('Collecting stats for call', { callId });
    }, this.config.statsCollectionInterval);

    this.statsCollectionIntervals.set(callId, interval);
  }

  private stopStatsCollection(callId: string): void {
    const interval = this.statsCollectionIntervals.get(callId);
    if (interval) {
      clearInterval(interval);
      this.statsCollectionIntervals.delete(callId);
    }
  }

  private calculateAudioQuality(telemetry: CallTelemetryData): 'poor' | 'fair' | 'good' | 'excellent' {
    if (telemetry.packetLoss > 10 || telemetry.averageRtt > 500) {
      return 'poor';
    } else if (telemetry.packetLoss > 5 || telemetry.averageRtt > 300) {
      return 'fair';
    } else if (telemetry.packetLoss > 2 || telemetry.averageRtt > 150) {
      return 'good';
    } else {
      return 'excellent';
    }
  }

  private getConnectionQuality(telemetry: CallTelemetryData): string {
    if (telemetry.outcome === 'completed' && telemetry.audioQuality === 'excellent') {
      return 'Excellent';
    } else if (telemetry.outcome === 'completed' && telemetry.audioQuality === 'good') {
      return 'Good';
    } else if (telemetry.outcome === 'completed') {
      return 'Fair';
    } else {
      return 'Poor';
    }
  }

  private getUserEngagement(telemetry: CallTelemetryData): string {
    const totalInteractions = telemetry.muteToggleCount + 
                            telemetry.videoToggleCount + 
                            telemetry.speakerToggleCount + 
                            telemetry.cameraSwitchCount;

    if (totalInteractions > 10) {
      return 'High';
    } else if (totalInteractions > 5) {
      return 'Medium';
    } else {
      return 'Low';
    }
  }

  private getTechnicalIssues(telemetry: CallTelemetryData): string {
    const totalIssues = telemetry.errorCount + 
                       telemetry.reconnectionCount + 
                       telemetry.videoFreezeCount;

    if (totalIssues > 5) {
      return 'Many Issues';
    } else if (totalIssues > 2) {
      return 'Some Issues';
    } else if (totalIssues > 0) {
      return 'Few Issues';
    } else {
      return 'No Issues';
    }
  }

  private getDeviceType(): string {
    // This would detect actual device type
    return 'mobile';
  }

  private async saveTelemetryData(telemetry: CallTelemetryData): Promise<void> {
    try {
      // This would save to storage/database
      logger.info('Saving telemetry data', { callId: telemetry.callId, outcome: telemetry.outcome });
    } catch (error) {
      logger.error('Failed to save telemetry data', { error });
    }
  }

  private async loadStoredTelemetry(): Promise<void> {
    try {
      // This would load from storage/database
      logger.info('Loading stored telemetry data');
    } catch (error) {
      logger.error('Failed to load stored telemetry', { error });
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    try {
      logger.info('Cleaning up call telemetry service');

      // Stop all stats collection intervals
      this.statsCollectionIntervals.forEach(interval => clearInterval(interval));
      this.statsCollectionIntervals.clear();

      // Clear active calls
      this.activeCalls.clear();

      this.isInitialized = false;

    } catch (error) {
      logger.error('Error during cleanup', { error });
    }
  }
}

export const callTelemetry = CallTelemetryService.getInstance();
