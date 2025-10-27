/**
 * Type definitions for React Native FormData
 */

/**
 * File-like object for React Native FormData
 */
export interface NativeFileFormDataPart {
  uri: string;
  name: string;
  type: string;
}

/**
 * Extended FormData with React Native support
 */
export interface NativeFormData extends FormData {
  append(name: string, value: string | Blob | NativeFileFormDataPart, fileName?: string): void;
}

