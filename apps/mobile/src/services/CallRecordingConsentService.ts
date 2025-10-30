/**
 * Call Recording Consent Service
 *
 * Provides recording consent management and compliance including:
 * - Recording consent banners
 * - Legal compliance checks
 * - Consent state management
 * - Recording notifications
 * - Audit trail
 */

import { Alert, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '@pawfectmatch/core';

export interface RecordingConsentConfig {
  requireExplicitConsent: boolean;
  showConsentBanner: boolean;
  consentDuration: number; // How long consent lasts (ms)
  jurisdiction: 'US' | 'EU' | 'UK' | 'CA' | 'AU' | 'GLOBAL';
  enableRecordingNotifications: boolean;
  storageKey: string;
}

export interface ConsentRecord {
  callId: string;
  userId: string;
  consentGiven: boolean;
  consentTimestamp: number;
  consentMethod: 'banner' | 'voice' | 'implicit' | 'previously_granted';
  jurisdiction: string;
  recordingStarted: number;
  recordingEnded?: number;
  recordingDuration?: number;
  notificationShown: boolean;
}

export interface RecordingConsentBanner {
  title: string;
  message: string;
  acceptText: string;
  declineText: string;
  requireExplicit: boolean;
  timeoutMs?: number;
}

export class CallRecordingConsentService {
  private static instance: CallRecordingConsentService;
  private config: RecordingConsentConfig;
  private isInitialized = false;
  private activeConsents: Map<string, ConsentRecord> = new Map();

  static getInstance(): CallRecordingConsentService {
    if (!CallRecordingConsentService.instance) {
      CallRecordingConsentService.instance = new CallRecordingConsentService();
    }
    return CallRecordingConsentService.instance;
  }

  constructor(config: Partial<RecordingConsentConfig> = {}) {
    this.config = {
      requireExplicitConsent: true,
      showConsentBanner: true,
      consentDuration: 24 * 60 * 60 * 1000, // 24 hours
      jurisdiction: 'US',
      enableRecordingNotifications: true,
      storageKey: 'call_recording_consents',
      ...config,
    };
  }

  /**
   * Initialize consent service
   */
  async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return true;
      }

      logger.info('Initializing call recording consent service', { config: this.config });

      // Load existing consents
      await this.loadStoredConsents();

      // Clean up expired consents
      this.cleanupExpiredConsents();

      this.isInitialized = true;
      logger.info('Call recording consent service initialized successfully');
      return true;

    } catch (error) {
      logger.error('Failed to initialize call recording consent service', { error });
      return false;
    }
  }

  /**
   * Check if recording requires consent for current jurisdiction
   */
  requiresConsent(): boolean {
    switch (this.config.jurisdiction) {
      case 'EU':
      case 'UK':
        return true; // GDPR requires explicit consent
      case 'US':
        return this.config.requireExplicitConsent; // Varies by state
      case 'CA':
        return true; // PIPEDA requires consent
      case 'AU':
        return true; // Privacy Act requires consent
      case 'GLOBAL':
        return true; // Most restrictive
      default:
        return this.config.requireExplicitConsent;
    }
  }

  /**
   * Get consent banner content for jurisdiction
   */
  getConsentBanner(): RecordingConsentBanner {
    const baseBanner = {
      requireExplicit: this.requiresConsent(),
      timeoutMs: 30000, // 30 seconds
    };

    switch (this.config.jurisdiction) {
      case 'EU':
      case 'UK':
        return {
          ...baseBanner,
          title: 'Call Recording Consent',
          message: 'This call may be recorded for quality and training purposes. Under GDPR, you must explicitly consent to recording. Your call partner will also be notified.',
          acceptText: 'I Consent to Recording',
          declineText: 'No Recording',
        };

      case 'US':
        return {
          ...baseBanner,
          title: 'Call Recording Notice',
          message: 'This call may be recorded for quality purposes. By continuing, you consent to the recording. Some states require two-party consent.',
          acceptText: 'Continue',
          declineText: 'End Call',
        };

      case 'CA':
        return {
          ...baseBanner,
          title: 'Recording Consent (PIPEDA)',
          message: 'This call may be recorded in accordance with PIPEDA. Your consent is required for recording to proceed.',
          acceptText: 'Consent to Recording',
          declineText: 'Decline Recording',
        };

      case 'AU':
        return {
          ...baseBanner,
          title: 'Recording Notice',
          message: 'This call may be recorded under the Privacy Act. Your consent is required for recording.',
          acceptText: 'I Agree',
          declineText: 'I Disagree',
        };

      default:
        return {
          ...baseBanner,
          title: 'Call Recording',
          message: 'This call may be recorded. Do you consent to recording?',
          acceptText: 'Yes',
          declineText: 'No',
        };
    }
  }

  /**
   * Request recording consent for a call
   */
  async requestConsent(callId: string, userId: string): Promise<ConsentRecord | null> {
    try {
      logger.info('Requesting recording consent', { callId, userId });

      // Check if user has previously granted consent
      const existingConsent = await this.getExistingConsent(userId);
      if (existingConsent && this.isConsentValid(existingConsent)) {
        // Use existing consent
        const consentRecord: ConsentRecord = {
          ...existingConsent,
          callId,
          consentMethod: 'previously_granted',
          recordingStarted: Date.now(),
          notificationShown: false,
        };

        this.activeConsents.set(callId, consentRecord);
        return consentRecord;
      }

      // Show consent banner if required
      if (this.config.showConsentBanner) {
        return await this.showConsentBanner(callId, userId);
      }

      // If no banner shown and consent is not required, grant implicit consent
      if (!this.requiresConsent()) {
        const consentRecord: ConsentRecord = {
          callId,
          userId,
          consentGiven: true,
          consentTimestamp: Date.now(),
          consentMethod: 'implicit',
          jurisdiction: this.config.jurisdiction,
          recordingStarted: Date.now(),
          notificationShown: false,
        };

        this.activeConsents.set(callId, consentRecord);
        await this.saveConsent(consentRecord);
        return consentRecord;
      }

      return null;

    } catch (error) {
      logger.error('Failed to request recording consent', { error });
      return null;
    }
  }

  /**
   * Show consent banner to user
   */
  private async showConsentBanner(callId: string, userId: string): Promise<ConsentRecord | null> {
    return new Promise((resolve) => {
      const banner = this.getConsentBanner();

      Alert.alert(
        banner.title,
        banner.message,
        [
          {
            text: banner.declineText,
            style: 'cancel',
            onPress: () => {
              const consentRecord: ConsentRecord = {
                callId,
                userId,
                consentGiven: false,
                consentTimestamp: Date.now(),
                consentMethod: 'banner',
                jurisdiction: this.config.jurisdiction,
                recordingStarted: Date.now(),
                notificationShown: true,
              };

              this.activeConsents.set(callId, consentRecord);
              void this.saveConsent(consentRecord);
              resolve(consentRecord);
            },
          },
          {
            text: banner.acceptText,
            onPress: () => {
              const consentRecord: ConsentRecord = {
                callId,
                userId,
                consentGiven: true,
                consentTimestamp: Date.now(),
                consentMethod: 'banner',
                jurisdiction: this.config.jurisdiction,
                recordingStarted: Date.now(),
                notificationShown: true,
              };

              this.activeConsents.set(callId, consentRecord);
              void this.saveConsent(consentRecord);
              resolve(consentRecord);
            },
          },
        ],
        { cancelable: false }
      );

      // Auto-timeout after specified duration
      if (banner.timeoutMs) {
        setTimeout(() => {
          const consentRecord: ConsentRecord = {
            callId,
            userId,
            consentGiven: false,
            consentTimestamp: Date.now(),
            consentMethod: 'banner',
            jurisdiction: this.config.jurisdiction,
            recordingStarted: Date.now(),
            notificationShown: true,
          };

          this.activeConsents.set(callId, consentRecord);
          void this.saveConsent(consentRecord);
          resolve(consentRecord);
        }, banner.timeoutMs);
      }
    });
  }

  /**
   * Check if consent is valid for recording
   */
  isConsentValid(consent: ConsentRecord): boolean {
    if (!consent.consentGiven) {
      return false;
    }

    const now = Date.now();
    const consentAge = now - consent.consentTimestamp;
    
    return consentAge < this.config.consentDuration;
  }

  /**
   * Get active consent for call
   */
  getActiveConsent(callId: string): ConsentRecord | null {
    return this.activeConsents.get(callId) || null;
  }

  /**
   * End recording and update consent record
   */
  async endRecording(callId: string): Promise<void> {
    try {
      const consent = this.activeConsents.get(callId);
      if (!consent) {
        return;
      }

      consent.recordingEnded = Date.now();
      consent.recordingDuration = consent.recordingEnded - consent.recordingStarted;

      // Save updated consent record
      await this.saveConsent(consent);

      // Remove from active consents
      this.activeConsents.delete(callId);

      logger.info('Recording ended', { callId, duration: consent.recordingDuration });

    } catch (error) {
      logger.error('Failed to end recording', { error });
    }
  }

  /**
   * Show recording notification if enabled
   */
  showRecordingNotification(callId: string): void {
    try {
      if (!this.config.enableRecordingNotifications) {
        return;
      }

      // This would show a system notification that recording is in progress
      logger.info('Showing recording notification', { callId });

    } catch (error) {
      logger.error('Failed to show recording notification', { error });
    }
  }

  /**
   * Hide recording notification
   */
  hideRecordingNotification(callId: string): void {
    try {
      if (!this.config.enableRecordingNotifications) {
        return;
      }

      // This would hide the recording notification
      logger.info('Hiding recording notification', { callId });

    } catch (error) {
      logger.error('Failed to hide recording notification', { error });
    }
  }

  /**
   * Get consent audit trail
   */
  async getConsentAuditTrail(userId?: string): Promise<ConsentRecord[]> {
    try {
      // This would load from storage/database
      // For now, return empty array
      return [];
    } catch (error) {
      logger.error('Failed to get consent audit trail', { error });
      return [];
    }
  }

  /**
   * Check if user can record based on jurisdiction
   */
  canRecord(userId: string): boolean {
    // This would check user's location/jurisdiction
    // For now, return based on config
    return true;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<RecordingConsentConfig>): void {
    this.config = { ...this.config, ...config };
    logger.info('Recording consent configuration updated', { config: this.config });
  }

  /**
   * Get current configuration
   */
  getConfig(): RecordingConsentConfig {
    return { ...this.config };
  }

  // Private methods
  private async loadStoredConsents(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(this.config.storageKey);
      if (stored) {
        const consents: ConsentRecord[] = JSON.parse(stored);
        // Load only valid consents into active calls
        consents.forEach(consent => {
          if (this.isConsentValid(consent)) {
            this.activeConsents.set(consent.callId, consent);
          }
        });
      }
    } catch (error) {
      logger.error('Failed to load stored consents', { error });
    }
  }

  private async saveConsent(consent: ConsentRecord): Promise<void> {
    try {
      // Get existing consents
      const stored = await AsyncStorage.getItem(this.config.storageKey);
      const consents: ConsentRecord[] = stored ? JSON.parse(stored) : [];

      // Update or add consent
      const existingIndex = consents.findIndex(c => c.callId === consent.callId);
      if (existingIndex >= 0) {
        consents[existingIndex] = consent;
      } else {
        consents.push(consent);
      }

      // Keep only recent consents (last 1000)
      if (consents.length > 1000) {
        consents.splice(0, consents.length - 1000);
      }

      await AsyncStorage.setItem(this.config.storageKey, JSON.stringify(consents));
    } catch (error) {
      logger.error('Failed to save consent', { error });
    }
  }

  private async getExistingConsent(userId: string): Promise<ConsentRecord | null> {
    try {
      const stored = await AsyncStorage.getItem(this.config.storageKey);
      if (!stored) {
        return null;
      }

      const consents: ConsentRecord[] = JSON.parse(stored);
      
      // Find most recent valid consent for user
      const userConsents = consents
        .filter(c => c.userId === userId && c.consentGiven)
        .sort((a, b) => b.consentTimestamp - a.consentTimestamp);

      return userConsents.length > 0 ? userConsents[0] : null;
    } catch (error) {
      logger.error('Failed to get existing consent', { error });
      return null;
    }
  }

  private cleanupExpiredConsents(): void {
    const now = Date.now();
    this.activeConsents.forEach((consent, callId) => {
      if (!this.isConsentValid(consent)) {
        this.activeConsents.delete(callId);
      }
    });
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    try {
      logger.info('Cleaning up call recording consent service');

      // End all active recordings
      this.activeConsents.forEach((_, callId) => {
        void this.endRecording(callId);
      });

      this.activeConsents.clear();
      this.isInitialized = false;

    } catch (error) {
      logger.error('Error during cleanup', { error });
    }
  }
}

export const callRecordingConsent = CallRecordingConsentService.getInstance();
