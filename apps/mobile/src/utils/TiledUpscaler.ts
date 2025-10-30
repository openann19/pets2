/**
 * Tiled Upscaler
 * Memory-safe upscaler that draws in tiles to avoid OOM on large images (4K+).
 * Uses @shopify/react-native-skia if available, otherwise falls back to ImageManipulator.
 */

import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

/**
 * Lazy load Skia to avoid bundling if not installed
 * @shopify/react-native-skia is optional - module may not be present
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function loadSkia(): Promise<any> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-explicit-any
    return require('@shopify/react-native-skia');
  } catch {
    return null;
  }
}

export interface TileUpscaleOpts {
  /** Scale factor or exact width/height; at least one must be provided */
  scale?: number;
  targetW?: number;
  targetH?: number;
  /** Tile size (source pixels) */
  tile?: number;
  /** Overlap to prevent seams when sampling */
  overlap?: number;
  /** Output JPEG quality 0..1 */
  quality?: number;
  /** Output format */
  format?: 'jpg' | 'png' | 'webp';
}

/**
 * Compute target dimensions from various options
 */
function computeTargetDimensions(
  srcW: number,
  srcH: number,
  opts: TileUpscaleOpts,
): { outW: number; outH: number } {
  const { scale, targetW, targetH } = opts;

  if (targetW && targetH) {
    return { outW: targetW, outH: targetH };
  }

  if (scale !== undefined && !targetW && !targetH) {
    return {
      outW: Math.round(srcW * scale),
      outH: Math.round(srcH * scale),
    };
  }

  if (targetW && !targetH) {
    const r = targetW / srcW;
    return {
      outW: targetW,
      outH: Math.round(srcH * r),
    };
  }

  if (!targetW && targetH) {
    const r = targetH / srcH;
    return {
      outW: Math.round(srcW * r),
      outH: targetH,
    };
  }

  // Fallback to original size
  return { outW: srcW, outH: srcH };
}

/**
 * Tile-based upscaler for large images
 * Processes the image in chunks to avoid memory issues
 *
 * @param uri - Source image URI
 * @param srcW - Source image width
 * @param srcH - Source image height
 * @param opts - Upscaling options
 * @returns URI of upscaled image
 */
export async function tileUpscale(
  uri: string,
  srcW: number,
  srcH: number,
  opts: TileUpscaleOpts = {},
): Promise<string> {
  const Skia = await loadSkia();
  const { tile = 1024, overlap = 12, quality = 1, format = 'jpg', ...rest } = opts;

  const { outW, outH } = computeTargetDimensions(srcW, srcH, rest);

  // Fallback if Skia is not available
  if (!Skia) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: Math.round(outW), height: Math.round(outH) } }],
      {
        compress: quality,
        format:
          format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  }

  const { Skia: S } = Skia;

  // Load image bytes
  const data = await S.Data.fromURI(uri);
  const img = S.Image.MakeImageFromEncoded(data);

  if (!img) {
    // Fallback on load failure
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: Math.round(outW), height: Math.round(outH) } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  }

  // Create output surface
  const surface = S.Surface.MakeSurface(Math.round(outW), Math.round(outH));

  if (!surface) {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: Math.round(outW), height: Math.round(outH) } }],
      {
        compress: quality,
        format: ImageManipulator.SaveFormat.JPEG,
      },
    );
    return result.uri;
  }

  const canvas = surface.getCanvas();
  const paint = S.Paint();
  paint.setFilterQuality('high');

  // Draw tiles with overlap to prevent seams
  const sxStep = tile - overlap;
  const syStep = tile - overlap;

  for (let sy = 0; sy < srcH; sy += syStep) {
    for (let sx = 0; sx < srcW; sx += sxStep) {
      const sw = Math.min(tile, srcW - sx);
      const sh = Math.min(tile, srcH - sy);

      const dx = Math.round((sx / srcW) * outW);
      const dy = Math.round((sy / srcH) * outH);
      const dw = Math.round((sw / srcW) * outW);
      const dh = Math.round((sh / srcH) * outH);

      const srcRect = S.XYWHRect(sx, sy, sw, sh);
      const dstRect = S.XYWHRect(dx, dy, dw, dh);
      canvas.drawImageRect(img, srcRect, dstRect, paint);
    }
  }

  const snapshot = surface.makeImageSnapshot();
  const base64 =
    format === 'png'
      ? snapshot.encodeToBase64()
      : snapshot.encodeToBase64(S.ImageFormat.JPEG, Math.round(quality * 100));

  const outPath = `${FileSystem.cacheDirectory}up_${Date.now()}.${format}`;
  await FileSystem.writeAsStringAsync(outPath, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return outPath;
}

/**
 * Simplified upscale without requiring source dimensions
 * Automatically detects source size using RNImage
 */
export async function tileUpscaleAuto(uri: string, opts: TileUpscaleOpts = {}): Promise<string> {
  // Get source dimensions
  const { Image } = await import('react-native');

  return new Promise((resolve, reject) => {
    Image.getSize(
      uri,
      (width, height) => {
        tileUpscale(uri, width, height, opts).then(resolve).catch(reject);
      },
      (error) => {
        reject(error);
      },
    );
  });
}
