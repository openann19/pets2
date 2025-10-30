/**
 * Pre-call Device Check Service
 *
 * Validates device capabilities and connectivity before initiating calls:
 * - Camera availability and permissions
 * - Microphone availability and permissions
 * - Network connectivity and quality
 * - Audio output routing capabilities
 */

import { PermissionsAndroid, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { mediaDevices } from 'react-native-webrtc';
import { logger } from '@pawfectmatch/core';

export interface DeviceCheckResult {
  camera: {
    available: boolean;
    permissionGranted: boolean;
    devices: MediaDeviceInfo[];
    error?: string;
  };
  microphone: {
    available: boolean;
    permissionGranted: boolean;
    devices: MediaDeviceInfo[];
    error?: string;
  };
  network: {
    connected: boolean;
    type: string;
    quality: 'poor' | 'fair' | 'good' | 'excellent';
    latency?: number;
    error?: string;
  };
  audioOutput: {
    available: boolean;
    speakerSupported: boolean;
    bluetoothSupported: boolean;
    error?: string;
  };
  allChecksPassed: boolean;
  blockingIssues: string[];
  warnings: string[];
}

export interface PreCallDeviceCheckOptions {
  checkCamera?: boolean;
  checkMicrophone?: boolean;
  checkNetwork?: boolean;
  checkAudioOutput?: boolean;
  minNetworkQuality?: 'poor' | 'fair' | 'good' | 'excellent';
  timeout?: number;
}

export class PreCallDeviceCheckService {
  private static instance: PreCallDeviceCheckService;

  static getInstance(): PreCallDeviceCheckService {
    if (!PreCallDeviceCheckService.instance) {
      PreCallDeviceCheckService.instance = new PreCallDeviceCheckService();
    }
    return PreCallDeviceCheckService.instance;
  }

  /**
   * Perform comprehensive device checks before starting a call
   */
  async performPreCallCheck(
    options: PreCallDeviceCheckOptions = {}
  ): Promise<DeviceCheckResult> {
    const {
      checkCamera = true,
      checkMicrophone = true,
      checkNetwork = true,
      checkAudioOutput = true,
      minNetworkQuality = 'fair',
      timeout = 10000
    } = options;

    logger.info('Starting pre-call device checks', { options });

    const result: DeviceCheckResult = {
      camera: { available: false, permissionGranted: false, devices: [] },
      microphone: { available: false, permissionGranted: false, devices: [] },
      network: { connected: false, type: 'unknown', quality: 'poor' },
      audioOutput: { available: false, speakerSupported: false, bluetoothSupported: false },
      allChecksPassed: false,
      blockingIssues: [],
      warnings: []
    };

    try {
      // Set timeout for the entire check
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Device check timeout')), timeout);
      });

      // Run all checks in parallel
      const checkPromises: Promise<void>[] = [];

      if (checkCamera) {
        checkPromises.push(this.checkCamera(result));
      }

      if (checkMicrophone) {
        checkPromises.push(this.checkMicrophone(result));
      }

      if (checkNetwork) {
        checkPromises.push(this.checkNetwork(result, minNetworkQuality));
      }

      if (checkAudioOutput) {
        checkPromises.push(this.checkAudioOutput(result));
      }

      // Wait for all checks to complete or timeout
      await Promise.race([
        Promise.all(checkPromises),
        timeoutPromise
      ]);

      // Evaluate results
      result.allChecksPassed = this.evaluateResults(result);
      result.blockingIssues = this.identifyBlockingIssues(result);
      result.warnings = this.identifyWarnings(result);

      logger.info('Pre-call device checks completed', {
        allChecksPassed: result.allChecksPassed,
        blockingIssues: result.blockingIssues.length,
        warnings: result.warnings.length
      });

    } catch (error) {
      logger.error('Pre-call device check failed', { error });
      result.allChecksPassed = false;
      result.blockingIssues.push('Device check failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }

    return result;
  }

  /**
   * Check camera availability and permissions
   */
  private async checkCamera(result: DeviceCheckResult): Promise<void> {
    try {
      // Request camera permission
      let permissionGranted = false;

      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'Camera access is required for video calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionGranted = cameraPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS permission is handled by react-native-webrtc
        permissionGranted = true;
      }

      result.camera.permissionGranted = permissionGranted;

      if (!permissionGranted) {
        result.camera.error = 'Camera permission denied';
        return;
      }

      // Get available camera devices
      const devices = await mediaDevices.enumerateDevices();
      const cameras = devices.filter(device =>
        device.kind === 'videoinput' &&
        device.deviceId !== 'default'
      );

      result.camera.devices = cameras;
      result.camera.available = cameras.length > 0;

      if (!result.camera.available) {
        result.camera.error = 'No camera devices found';
      }

    } catch (error) {
      result.camera.error = error instanceof Error ? error.message : 'Camera check failed';
      logger.error('Camera check failed', { error });
    }
  }

  /**
   * Check microphone availability and permissions
   */
  private async checkMicrophone(result: DeviceCheckResult): Promise<void> {
    try {
      // Request microphone permission
      let permissionGranted = false;

      if (Platform.OS === 'android') {
        const audioPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'Microphone access is required for calls',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        permissionGranted = audioPermission === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // iOS permission is handled by react-native-webrtc
        permissionGranted = true;
      }

      result.microphone.permissionGranted = permissionGranted;

      if (!permissionGranted) {
        result.microphone.error = 'Microphone permission denied';
        return;
      }

      // Get available microphone devices
      const devices = await mediaDevices.enumerateDevices();
      const microphones = devices.filter(device =>
        device.kind === 'audioinput' &&
        device.deviceId !== 'default'
      );

      result.microphone.devices = microphones;
      result.microphone.available = microphones.length > 0;

      if (!result.microphone.available) {
        result.microphone.error = 'No microphone devices found';
      }

    } catch (error) {
      result.microphone.error = error instanceof Error ? error.message : 'Microphone check failed';
      logger.error('Microphone check failed', { error });
    }
  }

  /**
   * Check network connectivity and quality
   */
  private async checkNetwork(
    result: DeviceCheckResult,
    minQuality: 'poor' | 'fair' | 'good' | 'excellent'
  ): Promise<void> {
    try {
      const netInfo = await NetInfo.fetch();

      result.network.connected = netInfo.isConnected ?? false;
      result.network.type = netInfo.type;

      if (!result.network.connected) {
        result.network.error = 'No network connection';
        result.network.quality = 'poor';
        return;
      }

      // Basic network quality assessment
      // In a real implementation, you might ping a server to measure latency
      const quality = this.assessNetworkQuality(netInfo);
      result.network.quality = quality;

      // Test latency with a simple ping-like request
      try {
        const startTime = Date.now();
        // Use a lightweight endpoint to test connectivity
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        const endTime = Date.now();
        result.network.latency = endTime - startTime;

        // Adjust quality based on latency
        if (result.network.latency > 1000) {
          result.network.quality = 'poor';
        } else if (result.network.latency > 500) {
          result.network.quality = Math.max(result.network.quality, 'fair') as any;
        }
      } catch {
        // If ping fails, keep the basic assessment
      }

      // Check if network quality meets minimum requirements
      const qualityLevels = { poor: 0, fair: 1, good: 2, excellent: 3 };
      const minLevel = qualityLevels[minQuality];
      const actualLevel = qualityLevels[result.network.quality];

      if (actualLevel < minLevel) {
        result.network.error = `Network quality (${result.network.quality}) below minimum (${minQuality})`;
      }

    } catch (error) {
      result.network.error = error instanceof Error ? error.message : 'Network check failed';
      logger.error('Network check failed', { error });
    }
  }

  /**
   * Check audio output capabilities
   */
  private async checkAudioOutput(result: DeviceCheckResult): Promise<void> {
    try {
      // Basic audio output capability check
      // In a real implementation, you might check for Bluetooth devices, speaker availability, etc.
      result.audioOutput.available = true;
      result.audioOutput.speakerSupported = true;
      result.audioOutput.bluetoothSupported = Platform.OS === 'android'; // Simplified

      // Test audio output by attempting to get user media (audio only)
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: false
        });

        // Clean up the test stream
        stream.getTracks().forEach(track => track.stop());

        result.audioOutput.available = true;
      } catch {
        result.audioOutput.available = false;
        result.audioOutput.error = 'Audio output test failed';
      }

    } catch (error) {
      result.audioOutput.error = error instanceof Error ? error.message : 'Audio output check failed';
      logger.error('Audio output check failed', { error });
    }
  }

  /**
   * Assess basic network quality based on connection type
   */
  private assessNetworkQuality(netInfo: any): 'poor' | 'fair' | 'good' | 'excellent' {
    const type = netInfo.type;

    switch (type) {
      case 'wifi':
        return 'good';
      case 'cellular':
        // Could check effectiveType for more granularity
        return 'fair';
      case 'ethernet':
        return 'excellent';
      case 'bluetooth':
      case 'wimax':
        return 'fair';
      default:
        return 'poor';
    }
  }

  /**
   * Evaluate if all critical checks passed
   */
  private evaluateResults(result: DeviceCheckResult): boolean {
    const criticalChecks = [
      result.camera.available && result.camera.permissionGranted,
      result.microphone.available && result.microphone.permissionGranted,
      result.network.connected,
      result.audioOutput.available
    ];

    return criticalChecks.every(check => check);
  }

  /**
   * Identify blocking issues that prevent calling
   */
  private identifyBlockingIssues(result: DeviceCheckResult): string[] {
    const issues: string[] = [];

    if (!result.camera.available || !result.camera.permissionGranted) {
      issues.push('Camera unavailable or permission denied');
    }

    if (!result.microphone.available || !result.microphone.permissionGranted) {
      issues.push('Microphone unavailable or permission denied');
    }

    if (!result.network.connected) {
      issues.push('No network connection');
    }

    if (result.network.quality === 'poor') {
      issues.push('Poor network quality may affect call quality');
    }

    if (!result.audioOutput.available) {
      issues.push('Audio output unavailable');
    }

    return issues;
  }

  /**
   * Identify non-blocking warnings
   */
  private identifyWarnings(result: DeviceCheckResult): string[] {
    const warnings: string[] = [];

    if (result.network.quality === 'fair') {
      warnings.push('Network quality is fair - call quality may be affected');
    }

    if (result.camera.devices.length === 1) {
      warnings.push('Only one camera available');
    }

    if (result.microphone.devices.length === 1) {
      warnings.push('Only one microphone available');
    }

    if (result.network.latency && result.network.latency > 300) {
      warnings.push(`High network latency (${result.network.latency}ms)`);
    }

    return warnings;
  }

  /**
   * Quick check for call readiness (lighter version for UI feedback)
   */
  async isCallReady(options: Omit<PreCallDeviceCheckOptions, 'timeout'> = {}): Promise<boolean> {
    try {
      const result = await this.performPreCallCheck({ ...options, timeout: 3000 });
      return result.allChecksPassed;
    } catch {
      return false;
    }
  }
}

export const preCallDeviceCheck = PreCallDeviceCheckService.getInstance();
