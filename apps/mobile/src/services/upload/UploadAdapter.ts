/**
 * Platform-agnostic UploadAdapter
 * Automatically imports the correct platform implementation
 */

import { Platform } from 'react-native';
import type { UploadAdapter } from './UploadAdapter.types';

// Platform-specific implementations
let uploadAdapter: UploadAdapter;

if (Platform.OS === 'web') {
  // Dynamic import for web implementation
  uploadAdapter = require('./UploadAdapter.web').uploadAdapter;
} else {
  // Native implementation for iOS/Android
  uploadAdapter = require('./UploadAdapter.native').uploadAdapter;
}

export { uploadAdapter };
export type { UploadAdapter, UploadPhotoInput, UploadVideoInput } from './UploadAdapter.types';
