/**
 * Media Permission Utilities
 * Handles camera and microphone permission requests with graceful denial UX
 */

import { Alert, Linking } from 'react-native';
import { Camera } from 'expo-camera';
import { Audio } from 'expo-av';
import { logger } from './logger';

export interface PermissionResult {
  granted: boolean;
  denied: boolean;
  blocked: boolean;
  canAskAgain: boolean;
}

export interface MediaPermissionsResult {
  audio: PermissionResult;
  video: PermissionResult;
  allGranted: boolean;
}

export class PermissionDeniedError extends Error {
  constructor(
    public readonly type: 'audio' | 'video' | 'both',
    message: string,
  ) {
    super(message);
    this.name = 'PermissionDeniedError';
  }
}

/**
 * Check and request microphone permission
 */
export async function checkMicrophonePermission(): Promise<PermissionResult> {
  try {
    const { status } = await Audio.getPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true, denied: false, blocked: false, canAskAgain: true };
    }

    if (status === 'denied') {
      const canAskAgain = await Audio.requestPermissionsAsync().then(
        (r) => r.status !== 'denied',
      ).catch(() => false);
      
      return {
        granted: false,
        denied: true,
        blocked: !canAskAgain,
        canAskAgain,
      };
    }

    // Request permission
    const result = await Audio.requestPermissionsAsync();
    const granted = result.status === 'granted';
    
    return {
      granted,
      denied: !granted,
      blocked: result.status === 'denied',
      canAskAgain: result.canAskAgain ?? true,
    };
  } catch (error) {
    logger.error('Failed to check microphone permission', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return {
      granted: false,
      denied: true,
      blocked: true,
      canAskAgain: false,
    };
  }
}

/**
 * Check and request camera permission
 */
export async function checkCameraPermission(): Promise<PermissionResult> {
  try {
    const { status } = await Camera.getCameraPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true, denied: false, blocked: false, canAskAgain: true };
    }

    if (status === 'denied') {
      const canAskAgain = await Camera.requestCameraPermissionsAsync().then(
        (r) => r.status !== 'denied',
      ).catch(() => false);
      
      return {
        granted: false,
        denied: true,
        blocked: !canAskAgain,
        canAskAgain,
      };
    }

    // Request permission
    const result = await Camera.requestCameraPermissionsAsync();
    const granted = result.status === 'granted';
    
    return {
      granted,
      denied: !granted,
      blocked: result.status === 'denied',
      canAskAgain: result.canAskAgain ?? true,
    };
  } catch (error) {
    logger.error('Failed to check camera permission', {
      error: error instanceof Error ? error : new Error(String(error)),
    });
    return {
      granted: false,
      denied: true,
      blocked: true,
      canAskAgain: false,
    };
  }
}

/**
 * Check and request both audio and video permissions
 */
export async function checkMediaPermissions(
  requireVideo: boolean = true,
): Promise<MediaPermissionsResult> {
  const audioResult = await checkMicrophonePermission();
  const videoResult = requireVideo ? await checkCameraPermission() : {
    granted: true,
    denied: false,
    blocked: false,
    canAskAgain: true,
  };

  const allGranted = audioResult.granted && videoResult.granted;

  return {
    audio: audioResult,
    video: videoResult,
    allGranted,
  };
}

/**
 * Show graceful permission denial dialog with option to open settings
 */
export function showPermissionDeniedDialog(
  type: 'audio' | 'video' | 'both',
  onOpenSettings?: () => void,
): void {
  const messages = {
    audio: {
      title: 'Microphone Permission Required',
      message:
        'PawfectMatch needs access to your microphone to make voice and video calls. Please enable microphone access in Settings.',
    },
    video: {
      title: 'Camera Permission Required',
      message:
        'PawfectMatch needs access to your camera to make video calls. Please enable camera access in Settings.',
    },
    both: {
      title: 'Media Permissions Required',
      message:
        'PawfectMatch needs access to your microphone and camera to make calls. Please enable these permissions in Settings.',
    },
  };

  const { title, message } = messages[type];

  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (onOpenSettings) {
            onOpenSettings();
          } else {
            void Linking.openSettings();
          }
        },
      },
    ],
    { cancelable: true },
  );
}

/**
 * Open app settings (iOS/Android)
 */
export async function openAppSettings(): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL('app-settings:');
    if (canOpen) {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
    } catch (error) {
      logger.error('Failed to open app settings', {
        error: error instanceof Error ? error : new Error(String(error)),
      });
    // Fallback to platform-specific settings
    try {
      await Linking.openSettings();
    } catch (fallbackError) {
      logger.error('Failed to open settings fallback', {
        error: fallbackError instanceof Error ? fallbackError : new Error(String(fallbackError)),
      });
    }
  }
}

