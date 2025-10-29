/**
 * Quality Score
 * JPEG byte-size heuristic for sharpness detection
 * Sharper images compress worse → bigger file size at fixed dimensions/quality
 */

import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Returns byte length of JPEG at fixed quality/dimensions
 * Bigger size = sharper image (reliable proxy)
 *
 * @param uri - Image URI
 * @param sampleW - Sample width for encoding (default 720)
 * @param quality - JPEG quality 0..1 (default 0.72)
 * @returns Size in bytes
 */
export async function jpegByteSize(uri: string, sampleW = 720, quality = 0.72): Promise<number> {
  try {
    const { uri: tmp } = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: sampleW } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );

    const info = await FileSystem.getInfoAsync(tmp);

    // Best-effort cleanup (ignore errors)
    try {
      await FileSystem.deleteAsync(tmp, { idempotent: true });
    } catch {
      // Ignore cleanup errors
    }

    return info.exists && typeof (info as any).size === 'number' ? (info as any).size : 0;
  } catch (err) {
    const { logger } = await import('../services/logger');
    logger.warn('QualityScore: Failed to compute size', {
      error: err instanceof Error ? err : new Error(String(err)),
    });
    return 0;
  }
}

/**
 * Pick the sharpest URI among candidates using JPEG-size heuristic
 * Uses a fast, deterministic method that works well on mobile
 *
 * @param uris - Array of candidate URIs
 * @param sampleW - Sample width for encoding (default 720)
 * @param quality - JPEG quality 0..1 (default 0.72)
 * @returns URI of the sharpest image
 */
export async function pickSharpest(uris: string[], sampleW = 720, quality = 0.72): Promise<string> {
  if (uris.length === 0) {
    throw new Error('No URIs provided to pickSharpest');
  }

  if (uris.length === 1) {
    const uri = uris[0];
    if (!uri) {
      throw new Error('Empty URI provided');
    }
    return uri;
  }

  let bestUri = uris[0];
  if (!bestUri) {
    throw new Error('No valid URI found');
  }
  let bestSize = -1;

  for (const uri of uris) {
    if (!uri) continue;
    const size = await jpegByteSize(uri, sampleW, quality);

    if (size > bestSize) {
      bestSize = size;
      bestUri = uri;
    }
  }

  if (!bestUri) {
    throw new Error('Failed to determine best URI');
  }

  return bestUri;
}

/**
 * Compare two images and return the sharper one
 *
 * @param uri1 - First image URI
 * @param uri2 - Second image URI
 * @param sampleW - Sample width for encoding (default 720)
 * @param quality - JPEG quality 0..1 (default 0.72)
 * @returns URI of the sharper image
 */
export async function compareSharpness(
  uri1: string,
  uri2: string,
  sampleW = 720,
  quality = 0.72,
): Promise<string> {
  const [size1, size2] = await Promise.all([
    jpegByteSize(uri1, sampleW, quality),
    jpegByteSize(uri2, sampleW, quality),
  ]);

  return size1 > size2 ? uri1 : uri2;
}
