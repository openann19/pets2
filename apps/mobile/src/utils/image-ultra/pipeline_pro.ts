/**
 * Ultra Pro Pipeline
 * Integrates advanced features: glare recovery, clarity, vignette, auto-straighten, smart crop
 * Composes with existing tile-based upscale/denoise/sharpen/adaptive export pipeline
 */

import {
  processImagePipeline,
  loadImageToCanvas,
  type PipelineOptions,
} from "./pipeline";
import {
  toneMapHighlights,
  clarityLocalContrast,
  vignetteCorrect,
  applyNoisePreset,
} from "./filters_extras";
import { highlightClipFraction } from "./histogram";
import { estimateHorizonAngle, rotateCanvas } from "./horizon";
import { proposeTrioCrops, bestOf3 } from "./auto_crop";

export type ProOpts = {
  recoverHighlights?: { strength?: number; pivot?: number };
  clarity?: { radiusPx?: number; amount?: number };
  vignette?: { amount?: number; softness?: number }; // positive corrects, negative adds
  noisePreset?: "ios-night" | "android-mid";
  autoStraighten?: boolean;
  crop?: { ratio: "1:1" | "4:5" | "9:16" | "3:2"; bestOf3?: boolean };
  hdrWarnThreshold?: number; // default 0.03 (3%)
};

/**
 * Process image with ultra-pro features
 * Chains: auto-straighten → pro corrections → smart crop → export
 */
export async function processImageUltraPro(
  input: Blob,
  baseOpts: Parameters<typeof processImagePipeline>[1],
  pro: ProOpts
): Promise<{
  blob: Blob;
  report: any;
  canvas: HTMLCanvasElement;
}> {
  // 1) Base (tile upscale/denoise/sharpen/adaptive export)
  const baselineCanvas = await loadImageToCanvas(input);
  let work = baselineCanvas;

  // 2) Optional: auto-straighten
  let angleDeg: number | undefined;
  if (pro.autoStraighten) {
    const angle = estimateHorizonAngle(work);
    if (Math.abs(angle) > 0.3) {
      work = rotateCanvas(work, -angle);
      angleDeg = angle;
    }
  }

  // 3) Pro corrections
  if (pro.noisePreset) {
    applyNoisePreset(work, pro.noisePreset);
  }
  if (pro.recoverHighlights) {
    toneMapHighlights(
      work,
      pro.recoverHighlights.strength ?? 0.6,
      pro.recoverHighlights.pivot ?? 0.75
    );
  }
  if (pro.clarity) {
    clarityLocalContrast(
      work,
      pro.clarity.radiusPx ?? 12,
      pro.clarity.amount ?? 0.35
    );
  }
  if (pro.vignette) {
    vignetteCorrect(
      work,
      pro.vignette.amount ?? 0.25,
      pro.vignette.softness ?? 0.6
    );
  }

  // 4) HDR clipping warning
  const clipFrac = highlightClipFraction(work, 250);
  const hdrWarning = clipFrac >= (pro.hdrWarnThreshold ?? 0.03);

  // 5) Optional smart crop
  let cropRect: { x: number; y: number; w: number; h: number } | undefined;
  if (pro.crop) {
    const ratio = ratioToNumber(pro.crop.ratio);
    const trio = proposeTrioCrops(work, ratio, undefined);
    
    if (pro.crop.bestOf3) {
      const best = bestOf3(work, trio);
      cropRect = best.rect;
    } else {
      cropRect = trio.medium;
    }
    
    // Cut canvas to cropRect
    const out = document.createElement("canvas");
    out.width = Math.round(cropRect.w);
    out.height = Math.round(cropRect.h);
    out.getContext("2d")!.drawImage(
      work,
      cropRect.x,
      cropRect.y,
      cropRect.w,
      cropRect.h,
      0,
      0,
      out.width,
      out.height
    );
    work = out;
  }

  // 6) Final export through core pipeline (keeps adaptive SSIM etc.)
  const { blob, report } = await processImagePipeline(
    await canvasToBlob(work, "image/png"),
    {
      ...baseOpts,
      export: baseOpts.export, // adaptive/fixed as you passed in
    }
  );

  return {
    blob,
    report: {
      ...report,
      hdrWarning,
      autoStraightened: !!pro.autoStraighten,
      angleDeg,
      cropRect,
    },
    canvas: work,
  };
}

function ratioToNumber(r: "1:1" | "4:5" | "9:16" | "3:2"): number {
  if (r === "1:1") return 1;
  if (r === "4:5") return 4 / 5;
  if (r === "9:16") return 9 / 16;
  return 3 / 2;
}

function canvasToBlob(
  c: HTMLCanvasElement,
  type = "image/png",
  quality?: number
): Promise<Blob> {
  return new Promise<Blob>((r) => c.toBlob((b) => r(b!), type, quality));
}

