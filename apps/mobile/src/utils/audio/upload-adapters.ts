/**
 * Upload Adapters
 * Platform-specific adapters for uploading audio files
 * - Native: Uses FormData with {uri, name, type}
 * - Web: Uses Blob
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

export interface UploadPayload {
  // Native: FormData with {uri, name, type}
  // Web: Blob
  data: FormData | Blob;
  contentType: string;
}

/**
 * Create upload payload for native platform using FormData
 */
export async function createNativeUploadPayload(
  uri: string,
  name = 'audio.m4a',
  type = 'audio/m4a',
): Promise<UploadPayload> {
  if (Platform.OS === 'web') {
    throw new Error('Use createWebUploadPayload for web platform');
  }

  const formData = new FormData();
  formData.append('file', {
    uri,
    name,
    type,
  } as unknown as Blob);

  return {
    data: formData,
    contentType: type,
  };
}

/**
 * Create upload payload for web platform using Blob
 */
export async function createWebUploadPayload(
  blob: Blob,
  _name = 'audio.webm',
): Promise<UploadPayload> {
  if (Platform.OS !== 'web') {
    throw new Error('Use createNativeUploadPayload for native platform');
  }

  return {
    data: blob,
    contentType: blob.type || 'audio/webm',
  };
}

/**
 * Convert native URI to web Blob for cross-platform compatibility
 * Only use when you need Blob on native (rare cases)
 */
export async function uriToBlob(uri: string, mime = 'application/octet-stream'): Promise<Blob> {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const byteCharacters = atobSafe(base64);
    const byteArrays: Uint8Array[] = [];
    const sliceSize = 1024;

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      const slice = byteCharacters.slice(offset, offset + sliceSize);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      byteArrays.push(new Uint8Array(byteNumbers));
    }

    return new Blob(byteArrays, { type: mime });
  } catch (error) {
    throw new Error(
      `Failed to convert URI to Blob: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

/**
 * Safe atob polyfill
 */
function atobSafe(b64: string): string {
  if (typeof atob === 'function') {
    return atob(b64);
  }

  try {
    const buffer = Buffer.from(b64, 'base64');
    return buffer.toString('binary');
  } catch {
    throw new Error('atob not available and Buffer polyfill not found');
  }
}

/**
 * Platform-aware upload payload creator
 * Automatically selects native FormData or web Blob based on platform
 */
export async function createUploadPayload(
  uriOrBlob: string | Blob,
  options: {
    name?: string;
    type?: string;
  } = {},
): Promise<UploadPayload> {
  if (Platform.OS === 'web') {
    if (typeof uriOrBlob === 'string') {
      throw new Error('Cannot convert URI to Blob on web. Provide Blob directly.');
    }
    return createWebUploadPayload(uriOrBlob, options.name);
  } else {
    if (uriOrBlob instanceof Blob) {
      throw new Error('Blob not supported on native. Provide URI string.');
    }
    return createNativeUploadPayload(uriOrBlob, options.name, options.type);
  }
}

