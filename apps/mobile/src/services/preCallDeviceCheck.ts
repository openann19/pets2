/**
 * Pre-call Device Check Service
 * Validates camera, microphone, and network before calls
 */

import { Camera, Microphone } from 'expo-av';
import NetInfo from '@react-native-community/netinfo';
import * as Device from 'expo-device';
import { logger } from '../utils/logger';

export interface DeviceCheckResult {
  camera: {
    granted: boolean;
    available: boolean;
    error?: string;
  };
  microphone: {
    granted: boolean;
    available: boolean;
    error?: string;
  };
  network: {
    connected: boolean;
    quality: 'poor' | 'ok' | 'good';
    type: string;
    error?: string;
  };
  device: {
    isSupported: boolean;
    minVersionSupported: boolean;
    error?: string;
  };
  overall: boolean;
}

export class PreCallDeviceCheck {
  /**
   * Run complete device check before call initiation
   */
  static async checkDevices(callType: 'voice' | 'video'): Promise<DeviceCheckResult> {
    logger.info('Starting pre-call device check', { callType });

    const [camera, microphone, network, device] = await Promise.all([
      this.checkCamera(callType),
      this.checkMicrophone(),
      this.checkNetwork(),
      this.checkDeviceCompatibility(callType)
    ]);

    const overall = camera.available && microphone.available &&
                   network.connected && device.isSupported;

    const result: DeviceCheckResult = {
      camera,
      microphone,
      network,
      device,
      overall
    };

    logger.info('Pre-call device check completed', {
      callType,
      overall,
      camera: camera.available,
      microphone: microphone.available,
      network: network.quality
    });

    return result;
  }

  /**
   * Check camera permissions and availability
   */
  private static async checkCamera(callType: 'voice' | 'video'): Promise<DeviceCheckResult['camera']> {
    if (callType === 'voice') {
      return { granted: true, available: true };
    }

    try {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const granted = status === 'granted';

      return {
        granted,
        available: granted,
        error: granted ? undefined : 'Camera permission denied'
      };
    } catch (error) {
      logger.error('Camera check failed', { error });
      return {
        granted: false,
        available: false,
        error: 'Camera unavailable'
      };
    }
  }

  /**
   * Check microphone permissions and availability
   */
  private static async checkMicrophone(): Promise<DeviceCheckResult['microphone']> {
    try {
      const { status } = await Microphone.requestPermissionsAsync();
      const granted = status === 'granted';

      return {
        granted,
        available: granted,
        error: granted ? undefined : 'Microphone permission denied'
      };
    } catch (error) {
      logger.error('Microphone check failed', { error });
      return {
        granted: false,
        available: false,
        error: 'Microphone unavailable'
      };
    }
  }

  /**
   * Check network connectivity and quality
   */
  private static async checkNetwork(): Promise<DeviceCheckResult['network']> {
    try {
      const netInfo = await NetInfo.fetch();

      const connected = netInfo.isConnected ?? false;
      const type = netInfo.type ?? 'unknown';

      let quality: 'poor' | 'ok' | 'good' = 'poor';

      if (connected) {
        // Simple quality assessment based on connection type
        if (type === 'wifi') {
          quality = 'good';
        } else if (type === 'cellular') {
          quality = 'ok';
        }
      }

      return {
        connected,
        quality,
        type,
        error: connected ? undefined : 'No network connection'
      };
    } catch (error) {
      logger.error('Network check failed', { error });
      return {
        connected: false,
        quality: 'poor',
        type: 'unknown',
        error: 'Network check failed'
      };
    }
  }

  /**
   * Check device compatibility for calling
   */
  private static async checkDeviceCompatibility(callType: 'voice' | 'video'): Promise<DeviceCheckResult['device']> {
    const deviceType = Device.DeviceType[Device.deviceType ?? 0];
    const osVersion = Device.osVersion ?? '0';

    // Check minimum iOS/Android versions
    const minIOS = 13;
    const minAndroid = 8;

    let isSupported = true;
    let minVersionSupported = true;

    if (Device.osName === 'iOS') {
      const majorVersion = parseInt(osVersion.split('.')[0]);
      minVersionSupported = majorVersion >= minIOS;
      isSupported = minVersionSupported;
    } else if (Device.osName === 'Android') {
      const majorVersion = parseInt(osVersion.split('.')[0]);
      minVersionSupported = majorVersion >= minAndroid;
      isSupported = minVersionSupported;
    }

    return {
      isSupported,
      minVersionSupported,
      error: isSupported ? undefined : `Device OS version too old (min: iOS ${minIOS}, Android ${minAndroid})`
    };
  }
}
