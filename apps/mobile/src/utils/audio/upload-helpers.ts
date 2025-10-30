/**
 * Audio Upload Helpers
 * Cross-platform utilities for converting audio files to uploadable formats
 * 
 * @deprecated Use upload-adapters.ts for new code
 * This file is kept for backward compatibility
 */

import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

/**
 * Build a FormData Part from a file URI (React Native native)
 * For native uploads, we need to pass {uri, name, type} to FormData
 */
export async function toUploadPart(uri: string, name = 'voice.m4a', type = 'audio/m4a') {
  if (Platform.OS === 'web') {
    throw new Error('Use Blob on web');
  }

  return {
    uri,
    name,
    type,
  };
}

/**
 * Convert a file URI to a Blob
 * Mobile-safe: Creates a Blob polyfill for React Native using Uint8Array
 * Only needed for special cases where Blob is required on native platforms
 * Note: Uses web-only.d.ts type declarations for Blob compatibility
 * 
 * @deprecated Use upload-adapters.ts uriToBlob instead
 */
export async function blobFromUri(uri: string, mime = 'application/octet-stream'): Promise<Blob> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const byteCharacters = atobSafe(base64);
    const byteArrays = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    // Blob constructor is available via polyfill in React Native Metro bundler
    // Type is declared in web-only.d.ts for mobile compatibility
    return new Blob(byteArrays, { type: mime });
  } catch (error) {
    throw new Error(
      `Failed to convert URI to Blob: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Safe atob polyfill for environments where atob is not available
 */
function atobSafe(b64: string): string {
  if (typeof atob === 'function') {
    return atob(b64);
  }

  // Use Buffer polyfill if available (React Native Metro bundler provides this)
  try {
    const buffer = Buffer.from(b64, 'base64');
    return buffer.toString('binary');
  } catch {
    throw new Error('atob not available and Buffer polyfill not found');
  }
}

/**
 * Get the MIME type for an audio file based on its URI or platform
 */
export function getAudioMimeType(uri: string, platform: 'native' | 'web'): string {
  if (platform === 'native') {
    // Native recordings from expo-av are typically m4a
    if (uri.endsWith('.m4a') || uri.includes('m4a')) {
      return 'audio/m4a';
    }
    return 'audio/m4a';
  }

  // Web recordings from MediaRecorder are typically webm
  return 'audio/webm';
}

/**
 * Check if we should use FormData (native) or Blob (web) for upload
 */
export function shouldUseFormData(platform: 'native' | 'web'): boolean {
  return platform === 'native';
}
