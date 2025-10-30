import { Platform } from 'react-native';
import { mediaDevices } from 'react-native-webrtc';
import NetInfo from '@react-native-community/netinfo';
import { logger } from './logger';
import { checkMediaPermissions, PermissionDeniedError } from './mediaPermissions';

export interface DeviceCheckResult {
  camera: {
    available: boolean;
    permission: boolean;
    error?: string;
    devices?: MediaDeviceInfo[];
  };
  microphone: {
    available: boolean;
    permission: boolean;
    error?: string;
    devices?: MediaDeviceInfo[];
  };
  network: {
    connected: boolean;
    type: string;
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    bandwidth?: number;
    error?: string;
  };
  overall: {
    ready: boolean;
    warnings: string[];
    errors: string[];
  };
}

export interface PreCallCheckOptions {
  requireVideo: boolean;
  requireAudio: boolean;
  testMediaStream: boolean;
  networkSpeedTest: boolean;
}

class PreCallDeviceCheckService {
  private static instance: PreCallDeviceCheckService;

  public static getInstance(): PreCallDeviceCheckService {
    if (!PreCallDeviceCheckService.instance) {
      PreCallDeviceCheckService.instance = new PreCallDeviceCheckService();
    }
    return PreCallDeviceCheckService.instance;
  }

  /**
   * Comprehensive pre-call device check
   */
  async performDeviceCheck(options: PreCallCheckOptions): Promise<DeviceCheckResult> {
    logger.info('Starting pre-call device check', { options });

    const result: DeviceCheckResult = {
      camera: { available: false, permission: false },
      microphone: { available: false, permission: false },
      network: { connected: false, type: 'unknown', quality: 'poor' },
      overall: { ready: false, warnings: [], errors: [] }
    };

    try {
      // Check network connectivity first
      await this.checkNetworkConnectivity(result, options.networkSpeedTest);

      // Check media permissions
      await this.checkMediaDevices(result, options);

      // Test actual media stream if requested
      if (options.testMediaStream && result.camera.permission && result.microphone.permission) {
        await this.testMediaStream(result, options);
      }

      // Evaluate overall readiness
      this.evaluateOverallReadiness(result, options);

      logger.info('Pre-call device check completed', { result });
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during device check';
      logger.error('Pre-call device check failed', { error: errorMessage });
      
      result.overall.errors.push(errorMessage);
      result.overall.ready = false;
      
      return result;
    }
  }

  /**
   * Check network connectivity and quality
   */
  private async checkNetworkConnectivity(result: DeviceCheckResult, speedTest: boolean): Promise<void> {
    try {
      const netInfo = await NetInfo.fetch();
      
      result.network.connected = netInfo.isConnected ?? false;
      result.network.type = netInfo.type;

      if (!result.network.connected) {
        result.network.error = 'No network connection available';
        result.overall.errors.push('Network connection required for calls');
        return;
      }

      // Evaluate network quality based on connection type
      switch (netInfo.type) {
        case 'wifi':
          result.network.quality = 'excellent';
          break;
        case 'cellular':
          // Check cellular generation if available
          if (netInfo.details && 'cellularGeneration' in netInfo.details) {
            const generation = netInfo.details.cellularGeneration;
            if (generation === '4g' || generation === '5g') {
              result.network.quality = 'good';
            } else if (generation === '3g') {
              result.network.quality = 'fair';
            } else {
              result.network.quality = 'poor';
              result.overall.warnings.push('Slow network connection may affect call quality');
            }
          } else {
            result.network.quality = 'good'; // Assume modern cellular
          }
          break;
        case 'ethernet':
          result.network.quality = 'excellent';
          break;
        default:
          result.network.quality = 'fair';
          result.overall.warnings.push('Unknown network type may affect call quality');
      }

      // Perform speed test if requested
      if (speedTest && result.network.connected) {
        await this.performNetworkSpeedTest(result);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network check failed';
      result.network.error = errorMessage;
      result.overall.warnings.push('Unable to verify network quality');
      logger.warn('Network connectivity check failed', { error: errorMessage });
    }
  }

  /**
   * Simple network speed test using a small image download
   */
  private async performNetworkSpeedTest(result: DeviceCheckResult): Promise<void> {
    try {
      const testUrl = 'https://httpbin.org/bytes/1024'; // 1KB test file
      const startTime = Date.now();
      
      const response = await fetch(testUrl, {
        method: 'GET',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        const bytes = 1024;
        const kbps = (bytes * 8) / (duration / 1000) / 1000; // Convert to kbps
        
        result.network.bandwidth = kbps;
        
        // Adjust quality based on measured speed
        if (kbps > 1000) { // > 1 Mbps
          result.network.quality = 'excellent';
        } else if (kbps > 500) { // > 500 kbps
          result.network.quality = 'good';
        } else if (kbps > 200) { // > 200 kbps
          result.network.quality = 'fair';
        } else {
          result.network.quality = 'poor';
          result.overall.warnings.push('Slow network speed detected - consider using audio-only mode');
        }
        
        logger.info('Network speed test completed', { kbps, quality: result.network.quality });
      }
    } catch (error) {
      logger.warn('Network speed test failed', { error });
      // Don't fail the overall check for speed test failure
    }
  }

  /**
   * Check media device availability and permissions
   */
  private async checkMediaDevices(result: DeviceCheckResult, options: PreCallCheckOptions): Promise<void> {
    try {
      // Check permissions first
      const permissions = await checkMediaPermissions(options.requireVideo);
      
      result.microphone.permission = permissions.audio.granted;
      result.camera.permission = permissions.video.granted;

      if (!result.microphone.permission && options.requireAudio) {
        result.microphone.error = 'Microphone permission denied';
        result.overall.errors.push('Microphone access is required for calls');
      }

      if (!result.camera.permission && options.requireVideo) {
        result.camera.error = 'Camera permission denied';
        result.overall.errors.push('Camera access is required for video calls');
      }

      // Enumerate media devices if permissions are granted
      if (result.microphone.permission || result.camera.permission) {
        await this.enumerateMediaDevices(result);
      }

    } catch (error) {
      if (error instanceof PermissionDeniedError) {
        if (error.type === 'audio' || error.type === 'both') {
          result.microphone.error = error.message;
          result.overall.errors.push('Microphone permission denied');
        }
        if (error.type === 'video' || error.type === 'both') {
          result.camera.error = error.message;
          result.overall.errors.push('Camera permission denied');
        }
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Media device check failed';
        result.overall.errors.push(errorMessage);
        logger.error('Media device check failed', { error: errorMessage });
      }
    }
  }

  /**
   * Enumerate available media devices
   */
  private async enumerateMediaDevices(result: DeviceCheckResult): Promise<void> {
    try {
      const devices = await mediaDevices.enumerateDevices();
      
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      const videoInputs = devices.filter(device => device.kind === 'videoinput');

      result.microphone.available = audioInputs.length > 0;
      result.microphone.devices = audioInputs;

      result.camera.available = videoInputs.length > 0;
      result.camera.devices = videoInputs;

      if (!result.microphone.available) {
        result.microphone.error = 'No microphone devices found';
        result.overall.warnings.push('No microphone detected');
      }

      if (!result.camera.available) {
        result.camera.error = 'No camera devices found';
        result.overall.warnings.push('No camera detected');
      }

      logger.info('Media devices enumerated', {
        audioInputs: audioInputs.length,
        videoInputs: videoInputs.length
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Device enumeration failed';
      logger.warn('Failed to enumerate media devices', { error: errorMessage });
      result.overall.warnings.push('Unable to detect media devices');
    }
  }

  /**
   * Test actual media stream creation
   */
  private async testMediaStream(result: DeviceCheckResult, options: PreCallCheckOptions): Promise<void> {
    let testStream: MediaStream | null = null;

    try {
      const constraints = {
        audio: options.requireAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } : false,
        video: options.requireVideo ? {
          width: { min: 320, ideal: 640 },
          height: { min: 240, ideal: 480 },
          frameRate: { min: 15, ideal: 30 },
        } : false,
      };

      // Type assertion for react-native-webrtc compatibility
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      testStream = await mediaDevices.getUserMedia(constraints as any);

      // Verify audio tracks
      if (options.requireAudio) {
        const audioTracks = testStream.getAudioTracks();
        if (audioTracks.length === 0) {
          result.microphone.error = 'Failed to access microphone';
          result.overall.errors.push('Microphone test failed');
        } else {
          result.microphone.available = true;
          logger.info('Audio stream test successful', { tracks: audioTracks.length });
        }
      }

      // Verify video tracks
      if (options.requireVideo) {
        const videoTracks = testStream.getVideoTracks();
        if (videoTracks.length === 0) {
          result.camera.error = 'Failed to access camera';
          result.overall.errors.push('Camera test failed');
        } else {
          result.camera.available = true;
          logger.info('Video stream test successful', { tracks: videoTracks.length });
        }
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Media stream test failed';
      logger.error('Media stream test failed', { error: errorMessage });
      
      if (options.requireAudio) {
        result.microphone.error = 'Failed to create audio stream';
        result.overall.errors.push('Audio stream test failed');
      }
      
      if (options.requireVideo) {
        result.camera.error = 'Failed to create video stream';
        result.overall.errors.push('Video stream test failed');
      }
    } finally {
      // Clean up test stream
      if (testStream) {
        testStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    }
  }

  /**
   * Evaluate overall readiness based on requirements and results
   */
  private evaluateOverallReadiness(result: DeviceCheckResult, options: PreCallCheckOptions): void {
    const { camera, microphone, network, overall } = result;

    // Network is always required
    if (!network.connected) {
      overall.ready = false;
      return;
    }

    // Check required audio
    if (options.requireAudio && (!microphone.permission || !microphone.available)) {
      overall.ready = false;
      return;
    }

    // Check required video
    if (options.requireVideo && (!camera.permission || !camera.available)) {
      overall.ready = false;
      return;
    }

    // Add quality warnings
    if (network.quality === 'poor') {
      overall.warnings.push('Poor network quality may cause call issues');
    }

    if (network.quality === 'fair' && options.requireVideo) {
      overall.warnings.push('Consider using audio-only mode for better quality');
    }

    // Device-specific warnings
    if (Platform.OS === 'android' && camera.devices && camera.devices.length > 1) {
      overall.warnings.push('Multiple cameras detected - you can switch during the call');
    }

    // Overall readiness
    overall.ready = overall.errors.length === 0;
    
    logger.info('Overall readiness evaluated', {
      ready: overall.ready,
      errors: overall.errors.length,
      warnings: overall.warnings.length
    });
  }

  /**
   * Quick network connectivity check
   */
  async quickNetworkCheck(): Promise<boolean> {
    try {
      const netInfo = await NetInfo.fetch();
      return netInfo.isConnected ?? false;
    } catch {
      return false;
    }
  }

  /**
   * Quick permissions check
   */
  async quickPermissionsCheck(requireVideo: boolean): Promise<{ audio: boolean; video: boolean }> {
    try {
      const permissions = await checkMediaPermissions(requireVideo);
      return {
        audio: permissions.audio.granted,
        video: permissions.video.granted
      };
    } catch {
      return { audio: false, video: false };
    }
  }
}

export default PreCallDeviceCheckService.getInstance();
