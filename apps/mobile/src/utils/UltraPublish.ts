/**
 * Ultra Publish Pipeline
 * Exports multiple crop variants (tight/medium/loose) across ratios with super-resolution
 * Now with tile-based upscaling, unsharp mask, and automatic quality selection
 */

import { AutoCropEngine, type AutoCropResult } from "./AutoCropEngine";
import { QualityTargets, DEFAULT_RATIOS, type KnownRatio } from "./QualityTargets";
import { SuperRes } from "./SuperRes";
import { tileUpscaleAuto } from "./TiledUpscaler";
import { unsharpMask, type UnsharpOpts } from "./Unsharp";
import { pickSharpest } from "./QualityScore";
import * as ImageManipulator from "expo-image-manipulator";

type Rect = { x: number; y: number; width: number; height: number };
type TrioKind = "tight" | "medium" | "loose";

export type UltraVariant = {
  ratio: KnownRatio;
  kind: TrioKind;
  crop: Rect;
  outUri: string;
  method: "eyes" | "face" | "fallback";
  targetW: number;
  targetH: number;
  size: { w: number; h: number };
  progress?: number;
};

export interface UltraOptions {
  /** Post-upscale unsharp mask settings */
  sharpen?: UnsharpOpts;
  /** Use tile-based upscaler if available (default: false, uses SuperRes) */
  tiled?: boolean;
  /** For each ratio, pick the sharpest among tight/medium/loose and return only the winner */
  autoPickBestPerRatio?: boolean;
  /** JPEG quality (0..1) for final save (default: 1) */
  quality?: number;
}

// Padding percentages for trio variants
const PAD = { tight: 0.06, medium: 0.12, loose: 0.2 };

// This function was removed and replaced with generateTrioCrops which has cleaner implementation

/**
 * Internal helper to compute crop for ratio (if exposed by AutoCropEngine)
 * This reuses the logic from AutoCropEngine but with custom padding
 */
function computeCropForRatio(
  focus: Rect,
  imgW: number,
  imgH: number,
  ratio: string,
  padPct: number
): Rect {
  const ratioToNumber = (r: string): number => {
    if (r === "FREE") return NaN;
    const parts = r.split(":");
    if (parts.length !== 2) return NaN;
    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!a || !b || isNaN(a) || isNaN(b)) return NaN;
    return a / b;
  };

  const padRect = (r: Rect, imgWidth: number, imgHeight: number, pad: number): Rect => {
    const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
    const padX = r.width * pad;
    const padY = r.height * pad;
    const x = clamp(r.x - padX, 0, imgWidth);
    const y = clamp(r.y - padY, 0, imgHeight);
    const width = clamp(r.width + padX * 2, 1, imgWidth - x);
    const height = clamp(r.height + padY * 2, 1, imgHeight - y);
    return { x, y, width, height };
  };

  const ar = ratioToNumber(ratio);
  const padded = padRect(focus, imgW, imgH, padPct);
  const cx = padded.x + padded.width / 2;
  const cy = padded.y + padded.height / 2;

  let width: number;
  let height: number;
  const focusAR = padded.width / padded.height;

  if (isNaN(ar)) {
    width = padded.width;
    height = padded.height;
  } else if (focusAR >= ar) {
    width = padded.width;
    height = width / ar;
  } else {
    height = padded.height;
    width = height * ar;
  }

  width = Math.min(width, imgW);
  height = Math.min(height, imgH);

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
  let x = cx - width / 2;
  let y = cy - height / 2;

  x = clamp(x, 0, imgW - width);
  y = clamp(y, 0, imgH - height);

  return { x, y, width, height };
}

/**
 * Generate trio crops (tight/medium/loose) for a given ratio and focus
 */
export async function generateTrioCrops(
  uri: string,
  ratio: KnownRatio,
  detection: AutoCropResult
): Promise<Array<{ kind: TrioKind; crop: Rect }>> {
  const { focus, size } = detection;

  // Build trio crops with varied padding
  const crops: Array<{ kind: TrioKind; crop: Rect }> = [];
  
  for (const kind of ["tight", "medium", "loose"] as TrioKind[]) {
    const padPct = PAD[kind];
    const crop = computeCropForRatio(focus, size.w, size.h, ratio, padPct);
    crops.push({ kind, crop });
  }

  return crops;
}

/**
 * Export ultra variants for multiple ratios
 * Produces 3 crops (tight/medium/loose) for each ratio, upscaled to target resolution
 * Now supports tile-based upscaling, unsharp mask, and automatic quality selection
 * 
 * @param uri - Source image URI
 * @param ratios - Aspect ratios to generate (defaults to DEFAULT_RATIOS)
 * @param options - Additional options including sharpen, tiled, autoPickBestPerRatio
 * @returns Array of UltraVariant objects
 */
export async function exportUltraVariants(
  uri: string,
  ratios: KnownRatio[] = DEFAULT_RATIOS,
  options: UltraOptions & {
    onProgress?: (progress: number, variant: UltraVariant | null) => void;
    maxConcurrency?: number;
  } = {}
): Promise<UltraVariant[]> {
  const {
    onProgress,
    maxConcurrency = 1,
    sharpen,
    tiled = false,
    autoPickBestPerRatio = false,
    quality = 1,
  } = options;

  // Detect focus once for all ratios
  const detection = await AutoCropEngine.detect(uri, { eyeWeight: 0.6, padPct: 0.16 });
  if (!detection) {
    throw new Error("Failed to detect subject focus");
  }

  const allVariants: UltraVariant[] = [];
  let completed = 0;
  const total = ratios.length * 3; // 3 variants per ratio

  // Process ratios sequentially to avoid overwhelming memory
  for (const ratio of ratios) {
    const target = QualityTargets[ratio];
    
    // Generate trio crops for this ratio
    const trios = await generateTrioCrops(uri, ratio, detection);
    
    // Collect candidates for this ratio if auto-picking
    const candidates: UltraVariant[] = [];
    
    // Process each trio variant
    for (const trio of trios) {
      try {
        // Apply crop
        const croppedUri = await AutoCropEngine.applyCrop(uri, trio.crop, quality);
        
        // Upscale to target resolution
        let upscaledUri: string;
        
        if (tiled) {
          // Use tile-based upscaler for large images
          upscaledUri = await tileUpscaleAuto(croppedUri, {
            targetW: target.minW,
            targetH: target.minH,
            quality,
          });
        } else {
          // Use SuperRes pipeline (supports multiple backends)
          upscaledUri = await SuperRes.upscale(croppedUri, target.minW, target.minH);
        }
        
        // Apply unsharp mask if requested
        const finalUri = sharpen
          ? await unsharpMask(upscaledUri, { ...sharpen, quality, format: "jpg" })
          : upscaledUri;
        
        const variant: UltraVariant = {
          ratio,
          kind: trio.kind,
          crop: trio.crop,
          outUri: finalUri,
          method: detection.method,
          targetW: target.minW,
          targetH: target.minH,
          size: detection.size,
        };
        
        if (autoPickBestPerRatio) {
          candidates.push(variant);
        } else {
          allVariants.push(variant);
        }
        
        completed++;
        onProgress?.(completed / total, variant);
        onProgress?.(completed / total, null);
      } catch (error) {
        console.error(`Failed to generate ${ratio} ${trio.kind} variant:`, error);
        // Continue with next variant
        completed++;
        onProgress?.(completed / total, null);
      }
    }
    
    // Auto-pick the sharpest if enabled
    if (autoPickBestPerRatio && candidates.length > 0) {
      try {
        const winner = await pickSharpest(
          candidates.map((c) => c.outUri),
          720,
          0.72
        );
        const best = candidates.find((c) => c.outUri === winner);
        
        if (best) {
          allVariants.push(best);
        }
      } catch (error) {
        console.error(`Failed to pick sharpest for ${ratio}:`, error);
        // Fallback: push first candidate
        const fallback = candidates[0];
        if (fallback) {
          allVariants.push(fallback);
        }
      }
    }
  }

  return allVariants;
}

/**
 * Get preview URIs for ultra variants (small thumbnails)
 * Useful for UI preview before full export
 */
export async function previewUltraVariants(
  uri: string,
  ratios: KnownRatio[] = DEFAULT_RATIOS
): Promise<Array<{ variant: UltraVariant; thumbUri: string }>> {
  const variants = await exportUltraVariants(uri, ratios, { onProgress: () => {} });
  
  // Generate thumbnails (small previews)
  const withThumbs: Array<{ variant: UltraVariant; thumbUri: string }> = [];
  
  for (const variant of variants) {
    try {
      // Create small thumbnail for preview
      const { manipulateAsync } = await import("expo-image-manipulator");
      const { SaveFormat } = await import("expo-image-manipulator");
      
      const thumb = await manipulateAsync(
        variant.outUri,
        [{ resize: { width: 240, height: 240 } }],
        { compress: 0.9, format: SaveFormat.JPEG }
      );
      
      withThumbs.push({ variant, thumbUri: thumb.uri });
    } catch (error) {
      console.error("Failed to generate thumbnail:", error);
      withThumbs.push({ variant, thumbUri: variant.outUri });
    }
  }
  
  return withThumbs;
}

