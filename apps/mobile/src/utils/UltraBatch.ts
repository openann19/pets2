/**
 * Ultra Batch Export
 * Fire-and-forget batch export for multiple images
 */

import { exportUltraVariants } from './UltraPublish';
import type { UltraVariant } from './UltraPublish';
import type { KnownRatio } from './QualityTargets';

export interface UltraOptions {
  /** Post-upscale unsharp mask */
  sharpen?: { amount?: number; radius?: number; threshold?: number };
  /** Use tile-based upscaler if available */
  tiled?: boolean;
  /** For each ratio, pick the sharpest among tight/medium/loose */
  autoPickBestPerRatio?: boolean;
  /** JPEG quality (0..1) for final save */
  quality?: number;
}

export interface BatchResult {
  source: string;
  outputs: UltraVariant[];
  error?: string;
  duration?: number;
}

/**
 * Batch export ultra variants for multiple images
 * Processes images sequentially to avoid memory pressure
 *
 * @param uris - Array of source image URIs
 * @param ratios - Aspect ratios to generate
 * @param options - Export options
 * @returns Array of batch results
 */
export async function exportUltraBatch(
  uris: string[],
  ratios: KnownRatio[] = ['1:1', '4:5', '9:16'],
  options: UltraOptions = {},
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];

  for (const uri of uris) {
    const startTime = Date.now();

    try {
      const outputs = await exportUltraVariants(uri, ratios, options);
      const duration = Date.now() - startTime;

      results.push({
        source: uri,
        outputs,
        duration,
      });
    } catch (e: any) {
      const duration = Date.now() - startTime;

      results.push({
        source: uri,
        outputs: [],
        error: e?.message ? String(e.message) : String(e ?? 'Unknown error'),
        duration,
      });
    }
  }

  return results;
}

/**
 * Export with progress callback
 * Useful for UI progress indicators during batch operations
 *
 * @param uris - Array of source image URIs
 * @param ratios - Aspect ratios to generate
 * @param options - Export options
 * @param onProgress - Progress callback (current, total, current image)
 * @returns Array of batch results
 */
export async function exportUltraBatchWithProgress(
  uris: string[],
  ratios: KnownRatio[] = ['1:1', '4:5', '9:16'],
  options: UltraOptions = {},
  onProgress?: (current: number, total: number, uri: string) => void,
): Promise<BatchResult[]> {
  const results: BatchResult[] = [];
  const total = uris.length;

  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    if (!uri) continue;
    onProgress?.(i, total, uri);

    const startTime = Date.now();

    try {
      const outputs = await exportUltraVariants(uri, ratios, options);
      const duration = Date.now() - startTime;

      results.push({
        source: uri,
        outputs,
        duration,
      });
    } catch (e: any) {
      const duration = Date.now() - startTime;

      results.push({
        source: uri,
        outputs: [],
        error: e?.message ? String(e.message) : String(e ?? 'Unknown error'),
        duration,
      });
    }
  }

  onProgress?.(total, total, '');
  return results;
}
