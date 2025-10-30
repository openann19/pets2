/**
 * Call System Integration Service
 *
 * Provides system-level calling integration including:
 * - CallKit integration for iOS
 * - ConnectionService for Android
 * - Push notifications for incoming calls
 * - System audio management
 * - Background call handling
 */

import { Platform, AppState, Alert } from 'react-native';
import InCallManager from 'react-native-incall-manager';
import { logger } from '@pawfectmatch/core';

// Types for call system integration
export interface CallSystemConfig {
  enableCallKit?: boolean;
  enableConnectionService?: boolean;
  enablePushNotifications?: boolean;
  enableBackgroundMode?: boolean;
}

export interface IncomingCallNotification {
  callId: string;
  callerName: string;
  callerAvatar?: string;
  callType: 'voice' | 'video';
  matchId: string;
}

export interface CallSystemEvent {
  type: 'callStarted' | 'callEnded' | 'callAnswered' | 'callRejected' | 'callMissed';
  callId: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class CallSystemIntegration {
  private static instance: CallSystemIntegration;
  private config: CallSystemConfig;
  private isInitialized = false;
  private activeCallId: string | null = null;
  private eventListeners: Array<(event: CallSystemEvent) => void> = [];

  static getInstance(): CallSystemIntegration {
    if (!CallSystemIntegration.instance) {
      CallSystemIntegration.instance = new CallSystemIntegration();
    }
    return CallSystemIntegration.instance;
  }

  constructor(config: CallSystemConfig = {}) {
    this.config = {
      enableCallKit: Platform.OS === 'ios',
      enableConnectionService: Platform.OS === 'android',
      enablePushNotifications: true,
      enableBackgroundMode: true,
      ...config,
    };
  }

  /**
   * Initialize call system integration
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      logger.info('Initializing call system integration', { config: this.config });

      // Initialize InCallManager
      await this.initializeInCallManager();

      // Initialize platform-specific services
      if (Platform.OS === 'ios' && this.config.enableCallKit) {
        await this.initializeCallKit();
      }

      if (Platform.OS === 'android' && this.config.enableConnectionService) {
        await this.initializeConnectionService();
      }

      // Initialize push notifications
      if (this.config.enablePushNotifications) {
        await this.initializePushNotifications();
      }

      // Setup background handling
      if (this.config.enableBackgroundMode) {
        this.setupBackgroundHandling();
      }

      this.isInitialized = true;
      logger.info('Call system integration initialized successfully');
      return true;

    } catch (error) {
      logger.error('Failed to initialize call system integration', { error });
      return false;
    }
  }

  /**
   * Initialize InCallManager for audio management
   */
  private async initializeInCallManager(): Promise<void> {
    try {
      // Configure InCallManager
      InCallManager.setKeepScreenOn(true);
      InCallManager.setForceSpeakerphoneOn(false);
      
      logger.info('InCallManager initialized');
    } catch (error) {
      logger.error('Failed to initialize InCallManager', { error });
      throw error;
    }
  }

  /**
   * Initialize CallKit for iOS
   */
  private async initializeCallKit(): Promise<void> {
    try {
      // CallKit would be initialized here with proper iOS native modules
      // For now, we'll simulate the initialization
      logger.info('CallKit initialized (iOS)');
    } catch (error) {
      logger.error('Failed to initialize CallKit', { error });
      throw error;
    }
  }

  /**
   * Initialize ConnectionService for Android
   */
  private async initializeConnectionService(): Promise<void> {
    try {
      // ConnectionService would be initialized here with proper Android native modules
      // For now, we'll simulate the initialization
      logger.info('ConnectionService initialized (Android)');
    } catch (error) {
      logger.error('Failed to initialize ConnectionService', { error });
      throw error;
    }
  }

  /**
   * Initialize push notifications for incoming calls
   */
  private async initializePushNotifications(): Promise<void> {
    try {
      // Push notification setup would go here
      // For now, we'll simulate the initialization
      logger.info('Push notifications initialized for calls');
    } catch (error) {
      logger.error('Failed to initialize push notifications', { error });
      throw error;
    }
  }

  /**
   * Setup background call handling
   */
  private setupBackgroundHandling(): void {
    AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && this.activeCallId) {
        logger.info('App went to background with active call', { callId: this.activeCallId });
        this.handleBackgroundCall();
      } else if (nextAppState === 'active' && this.activeCallId) {
        logger.info('App came to foreground with active call', { callId: this.activeCallId });
        this.handleForegroundCall();
      }
    });
  }

  /**
   * Report incoming call to system
   */
  async reportIncomingCall(callData: IncomingCallNotification): Promise<void> {
    try {
      logger.info('Reporting incoming call to system', { callId: callData.callId });

      if (Platform.OS === 'ios' && this.config.enableCallKit) {
        await this.reportIncomingCallToCallKit(callData);
      }

      if (Platform.OS === 'android' && this.config.enableConnectionService) {
        await this.reportIncomingCallToConnectionService(callData);
      }

      // Show system notification
      await this.showIncomingCallNotification(callData);

    } catch (error) {
      logger.error('Failed to report incoming call to system', { error });
    }
  }

  /**
   * Report outgoing call to system
   */
  async reportOutgoingCall(callId: string, callType: 'voice' | 'video'): Promise<void> {
    try {
      logger.info('Reporting outgoing call to system', { callId, callType });

      if (Platform.OS === 'ios' && this.config.enableCallKit) {
        await this.reportOutgoingCallToCallKit(callId, callType);
      }

      if (Platform.OS === 'android' && this.config.enableConnectionService) {
        await this.reportOutgoingCallToConnectionService(callId, callType);
      }

      this.activeCallId = callId;
      this.emitEvent('callStarted', callId);

    } catch (error) {
      logger.error('Failed to report outgoing call to system', { error });
    }
  }

  /**
   * Report call ended to system
   */
  async reportCallEnded(callId: string, reason: 'userEnded' | 'remoteEnded' | 'failed' | 'missed' = 'userEnded'): Promise<void> {
    try {
      logger.info('Reporting call ended to system', { callId, reason });

      if (Platform.OS === 'ios' && this.config.enableCallKit) {
        await this.reportCallEndedToCallKit(callId, reason);
      }

      if (Platform.OS === 'android' && this.config.enableConnectionService) {
        await this.reportCallEndedToConnectionService(callId, reason);
      }

      if (this.activeCallId === callId) {
        this.activeCallId = null;
      }

      this.emitEvent('callEnded', callId, { reason });

    } catch (error) {
      logger.error('Failed to report call ended to system', { error });
    }
  }

  /**
   * Handle audio focus changes
   */
  async handleAudioFocusLost(): Promise<void> {
    try {
      logger.info('Audio focus lost, muting call');
      
      // Auto-mute when audio focus is lost
      InCallManager.setMicrophoneMute(true);
      
      // Notify user
      Alert.alert(
        'Audio Focus Lost',
        'Call was muted due to another app playing audio. Tap to unmute.',
        [{ text: 'Unmute', onPress: () => this.handleAudioFocusRegained() }]
      );

    } catch (error) {
      logger.error('Failed to handle audio focus lost', { error });
    }
  }

  /**
   * Handle audio focus regained
   */
  async handleAudioFocusRegained(): Promise<void> {
    try {
      logger.info('Audio focus regained, unmuting call');
      InCallManager.setMicrophoneMute(false);
    } catch (error) {
      logger.error('Failed to handle audio focus regained', { error });
    }
  }

  /**
   * Handle device orientation changes
   */
  async handleOrientationChange(): Promise<void> {
    try {
      logger.info('Handling orientation change during call');
      
      // InCallManager handles orientation automatically
      // Additional logic can be added here if needed
      
    } catch (error) {
      logger.error('Failed to handle orientation change', { error });
    }
  }

  /**
   * Handle bluetooth connection changes
   */
  async handleBluetoothChange(isConnected: boolean): Promise<void> {
    try {
      logger.info('Bluetooth connection changed', { isConnected });
      
      if (isConnected) {
        // Route audio to bluetooth when available
        InCallManager.setForceSpeakerphoneOn(false);
      } else {
        // Fall back to speaker when bluetooth disconnected
        InCallManager.setForceSpeakerphoneOn(true);
      }
      
    } catch (error) {
      logger.error('Failed to handle bluetooth change', { error });
    }
  }

  /**
   * Handle handset to speaker transition
   */
  async handleHandsetToSpeaker(): Promise<void> {
    try {
      logger.info('Switching from handset to speaker');
      InCallManager.setForceSpeakerphoneOn(true);
    } catch (error) {
      logger.error('Failed to switch to speaker', { error });
    }
  }

  /**
   * Handle speaker to handset transition
   */
  async handleSpeakerToHandset(): Promise<void> {
    try {
      logger.info('Switching from speaker to handset');
      InCallManager.setForceSpeakerphoneOn(false);
    } catch (error) {
      logger.error('Failed to switch to handset', { error });
    }
  }

  // Private platform-specific methods
  private async reportIncomingCallToCallKit(callData: IncomingCallNotification): Promise<void> {
    // CallKit integration would go here
    logger.info('Reporting incoming call to CallKit', { callId: callData.callId });
  }

  private async reportIncomingCallToConnectionService(callData: IncomingCallNotification): Promise<void> {
    // ConnectionService integration would go here
    logger.info('Reporting incoming call to ConnectionService', { callId: callData.callId });
  }

  private async reportOutgoingCallToCallKit(callId: string, callType: 'voice' | 'video'): Promise<void> {
    // CallKit integration would go here
    logger.info('Reporting outgoing call to CallKit', { callId, callType });
  }

  private async reportOutgoingCallToConnectionService(callId: string, callType: 'voice' | 'video'): Promise<void> {
    // ConnectionService integration would go here
    logger.info('Reporting outgoing call to ConnectionService', { callId, callType });
  }

  private async reportCallEndedToCallKit(callId: string, reason: string): Promise<void> {
    // CallKit integration would go here
    logger.info('Reporting call ended to CallKit', { callId, reason });
  }

  private async reportCallEndedToConnectionService(callId: string, reason: string): Promise<void> {
    // ConnectionService integration would go here
    logger.info('Reporting call ended to ConnectionService', { callId, reason });
  }

  private async showIncomingCallNotification(callData: IncomingCallNotification): Promise<void> {
    // System notification would go here
    logger.info('Showing incoming call notification', { callId: callData.callId });
  }

  private handleBackgroundCall(): void {
    // Handle background call logic
    logger.info('Handling background call');
  }

  private handleForegroundCall(): void {
    // Handle foreground call logic
    logger.info('Handling foreground call');
  }

  private emitEvent(type: CallSystemEvent['type'], callId: string, metadata?: Record<string, unknown>): void {
    const event: CallSystemEvent = {
      type,
      callId,
      timestamp: Date.now(),
      metadata,
    };

    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        logger.error('Error in call system event listener', { error });
      }
    });
  }

  /**
   * Add event listener
   */
  addEventListener(listener: (event: CallSystemEvent) => void): void {
    this.eventListeners.push(listener);
  }

  /**
   * Remove event listener
   */
  removeEventListener(listener: (event: CallSystemEvent) => void): void {
    const index = this.eventListeners.indexOf(listener);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): CallSystemConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<CallSystemConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Call system configuration updated', { config: this.config });
  }

  /**
   * Check if system is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get active call ID
   */
  getActiveCallId(): string | null {
    return this.activeCallId;
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    try {
      logger.info('Cleaning up call system integration');
      
      this.eventListeners = [];
      this.activeCallId = null;
      this.isInitialized = false;

      // Stop InCallManager
      InCallManager.stop();
      
    } catch (error) {
      logger.error('Error during cleanup', { error });
    }
  }
}

export const callSystemIntegration = CallSystemIntegration.getInstance();
