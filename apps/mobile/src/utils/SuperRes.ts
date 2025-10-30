/**
 * Super-Resolution Pipeline with Pluggable Adapters
 * Supports multiple backends with graceful fallback to bicubic
 */

import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { tileUpscaleAuto } from './TiledUpscaler';
import { unsharpMask } from './Unsharp';
import { logger } from '../services/logger';

export interface SuperResAdapter {
  name: string;
  available(): Promise<boolean>;
  upscale(uri: string, targetW: number, targetH: number, opts?: SuperResOptions): Promise<string>;
}

export interface SuperResOptions {
  /** Apply unsharp mask after upscale (default: true) */
  sharpen?: boolean;
  /** Use tile-based upscaling for large images (default: true for 4K+) */
  useTiles?: boolean;
  /** Apply quality scoring to pick sharpest result */
  pickBest?: boolean;
}

/**
 * Fallback bicubic upscaler (always available via ImageManipulator)
 * This uses expo-image-manipulator's resize which implements decent bicubic interpolation
 */
const BicubicAdapter: SuperResAdapter = {
  name: 'bicubic',
  async available() {
    return true;
  },
  async upscale(uri, targetW, targetH, opts = {}) {
    const { sharpen = true, useTiles, pickBest = false } = opts;

    // Use tile-based upscaling for large images (4K+)
    const shouldUseTiles = useTiles ?? (targetW >= 1920 || targetH >= 1920);

    let result: string;
    if (shouldUseTiles) {
      result = await tileUpscaleAuto(uri, {
        targetW: Math.round(targetW),
        targetH: Math.round(targetH),
        tile: 1024,
        overlap: 12,
        quality: 1,
        format: 'jpg',
      });
    } else {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: Math.round(targetW), height: Math.round(targetH) } }],
        { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
      );
      result = manipResult.uri;
    }

    // Apply unsharp mask if requested
    if (sharpen) {
      try {
        result = await unsharpMask(result, {
          amount: 0.6,
          radius: 1.2,
          threshold: 0.02,
          quality: 1,
          format: 'jpg',
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        const { logger } = await import('../services/logger');
        logger.warn('SuperRes: Unsharp mask failed', { error: err });
      }
    }

    return result;
  },
};

/**
 * Optional: Server ESRGAN / Real-ESRGAN (HTTP)
 * This adapter calls your backend API for AI-powered upscaling
 * Toggle available() return value when backend is ready
 */
const ServerAdapter: SuperResAdapter = {
  name: 'server-esrgan',
  async available() {
    // Flip to true when your backend upscaler endpoint is ready
    // You can also check environment variables, feature flags, etc.
    if (__DEV__) {
      return false; // Disable in dev until backend is ready
    }
    return false; // Set to true when production endpoint is ready
  },
  async upscale(uri, targetW, targetH, opts = {}) {
    // TODO: Replace with your actual backend endpoint
    // Example implementation:
    // const formData = new FormData();
    // formData.append('image', { uri, name: 'image.jpg', type: 'image/jpeg' });
    // formData.append('targetW', targetW.toString());
    // formData.append('targetH', targetH.toString());
    //
    // const res = await fetch('https://your-backend.com/api/upscale', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${await getAuthToken()}`,
    //   },
    //   body: formData,
    // });
    //
    // if (!res.ok) throw new Error(`Upscale failed: ${res.statusText}`);
    // const { upscaledUrl } = await res.json();
    // return upscaledUrl;

    // Fallback (should never be called if available=false)
    return uri;
  },
};

/**
 * Optional: On-device TFLite adapter
 * This would use TensorFlow Lite mobile models for AI upscaling on device
 * Requires react-native-tflite or similar bridge
 */
const LocalTFLiteAdapter: SuperResAdapter = {
  name: 'tflite-esrgan',
  async available() {
    // Set to true when TFLite bridge is integrated
    try {
      // Example check:
      // const TFModule = require('react-native-tflite');
      // return TFModule.isReady();
      return false;
    } catch {
      return false;
    }
  },
  async upscale(uri, targetW, targetH, opts = {}) {
    // Example implementation:
    // const TFModule = require('react-native-tflite');
    // const input = await ImageManipulator.manipulateAsync(uri, [], { format: ImageManipulator.SaveFormat.PNG });
    // const output = await TFModule.upscale(input.uri, targetW, targetH);
    // return output.uri;

    // Fallback
    return uri;
  },
};

// Priority order: try TFLite first (fastest), then server (highest quality), then bicubic (always works)
const ADAPTERS: SuperResAdapter[] = [LocalTFLiteAdapter, ServerAdapter, BicubicAdapter];

export const SuperRes = {
  /**
   * Upscale image to target dimensions using the best available backend
   * Always resolves (Bicubic adapter is always available as fallback)
   * @param uri - Source image URI
   * @param targetW - Target width in pixels
   * @param targetH - Target height in pixels
   * @param opts - Super-resolution options
   * @returns URI of upscaled image
   */
  async upscale(
    uri: string,
    targetW: number,
    targetH: number,
    opts?: SuperResOptions,
  ): Promise<string> {
    for (const adapter of ADAPTERS) {
      if (await adapter.available()) {
        try {
          const { logger } = await import('../services/logger');
          logger.info('SuperRes: Using adapter for upscaling', {
            adapter: adapter.name,
            dimensions: `${targetW}x${targetH}`,
          });
          const result = await adapter.upscale(uri, targetW, targetH, opts);
          return result;
        } catch (error: unknown) {
          const err = error instanceof Error ? error : new Error(String(error));
          const { logger } = await import('../services/logger');
          logger.warn(`SuperRes: ${adapter.name} failed, trying fallback`, { error: err });
          // Continue to next adapter on error
        }
      }
    }

    // This should never be reached since BicubicAdapter is always available
    logger.error('[SuperRes] All adapters failed, returning original URI');
    return uri;
  },

  /**
   * Get list of all adapters (for debugging/monitoring)
   */
  adapters: ADAPTERS,

  /**
   * Check which adapter would be used for next upscale
   * Useful for UI indicators
   */
  async getActiveAdapter(): Promise<string> {
    for (const adapter of ADAPTERS) {
      if (await adapter.available()) {
        return adapter.name;
      }
    }
    return 'none';
  },
};
