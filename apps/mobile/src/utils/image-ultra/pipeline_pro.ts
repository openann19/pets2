/**
 * Platform-agnostic pipeline_pro exports
 * Automatically resolves to platform-specific implementation
 */

import { Platform } from 'react-native';

export type ProOpts = {
  recoverHighlights?: { strength?: number; pivot?: number };
  clarity?: { radiusPx?: number; amount?: number };
  vignette?: { amount?: number; softness?: number };
  noisePreset?: 'ios-night' | 'android-mid';
  autoStraighten?: boolean;
  crop?: { ratio: '1:1' | '4:5' | '9:16' | '3:2'; bestOf3?: boolean };
  hdrWarnThreshold?: number;
};

// Platform-specific implementations
let processImageUltraPro: (
  input: Blob,
  baseOpts: unknown,
  pro: ProOpts,
) => Promise<{
  blob: Blob;
  report: any;
  canvas: HTMLCanvasElement | undefined;
}>;

if (Platform.OS === 'web') {
  processImageUltraPro = require('./pipeline_pro.web').processImageUltraPro;
} else {
  processImageUltraPro = require('./pipeline_pro.native').processImageUltraPro;
}

export { processImageUltraPro };

