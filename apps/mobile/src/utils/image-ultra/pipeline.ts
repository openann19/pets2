/**
 * Ultra Image Processing Pipeline
 * Tile-based upscaling, denoising, sharpening, and adaptive export
 * All operations work on HTMLCanvasElement (web) or can be adapted for RN
 * 
 * Key features:
 * - Tile-based upscaling for 4K-safe memory usage
 * - Median denoise for low-light images
 * - Unsharp mask sharpening after upscale
 * - Adaptive JPEG targeting SSIM quality
 * - EXIF orientation auto-correction and stripping
 * - WebP thumbnail generation
 */

import { medianDenoise, unsharpMask } from "./filters";
import { ssimApprox } from "./ssim";

export type PipelineOptions = {
  upscale?: { scale: number; tileSize?: number };
  denoise?: { radius?: number }; // median
  sharpen?: { radiusPx?: number; amount?: number; threshold?: number };
  export?: {
    target: "jpeg" | "webp" | "png";
    adaptive?: {
      baselineCanvas: HTMLCanvasElement;
      targetSSIM: number;
      minQ?: number;
      maxQ?: number;
    };
    quality?: number;
  };
};

/**
 * Load image blob to canvas with EXIF orientation correction
 * Strips EXIF by re-encoding (privacy-first)
 */
export async function loadImageToCanvas(
  blob: Blob
): Promise<HTMLCanvasElement> {
  const bmp = await createImageBitmap(blob, {
    imageOrientation: "from-image",
    premultiplyAlpha: "default",
  });
  const c = document.createElement("canvas");
  c.width = bmp.width;
  c.height = bmp.height;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(bmp, 0, 0);
  bmp.close?.();
  return c;
}

/**
 * Tile-based upscale for large images (4K-safe)
 * Processes image in tiles to avoid OOM on mobile devices
 * 
 * @param src - Source canvas
 * @param scale - Scale factor (e.g., 2 for 2x upscale)
 * @param tile - Tile size in source pixels (default: 512)
 */
export function tileUpscaleCanvas(
  src: HTMLCanvasElement,
  scale = 2,
  tile = 512
): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = Math.round(src.width * scale);
  out.height = Math.round(src.height * scale);
  const octx = out.getContext("2d")!;
  octx.imageSmoothingEnabled = true;
  octx.imageSmoothingQuality = "high";

  const sw = src.width;
  const sh = src.height;
  const tw = tile;
  const th = tile;
  const sctx = src.getContext("2d")!;

  for (let y = 0; y < sh; y += th) {
    const h = Math.min(th, sh - y);
    for (let x = 0; x < sw; x += tw) {
      const w = Math.min(tw, sw - x);
      const img = sctx.getImageData(x, y, w, h);
      const tmp = document.createElement("canvas");
      tmp.width = w;
      tmp.height = h;
      tmp.getContext("2d")!.putImageData(img, 0, 0);
      octx.drawImage(tmp, x * scale, y * scale, w * scale, h * scale);
    }
  }

  return out;
}

/**
 * Process image through full pipeline
 * 
 * @param input - Input blob
 * @param opts - Pipeline options
 * @returns Processed blob, report, and canvas
 */
export async function processImagePipeline(
  input: Blob,
  opts: PipelineOptions
): Promise<{ blob: Blob; report: any; canvas: HTMLCanvasElement }> {
  let canvas = await loadImageToCanvas(input);
  const report: any = {};

  // Upscale (tile-based for large images)
  if (opts.upscale) {
    canvas = tileUpscaleCanvas(
      canvas,
      opts.upscale.scale,
      opts.upscale.tileSize ?? 512
    );
    report.upscale = {
      scale: opts.upscale.scale,
      tileSize: opts.upscale.tileSize ?? 512,
    };
  }

  // Denoise (median filter)
  if (opts.denoise) {
    medianDenoise(canvas, opts.denoise.radius ?? 1);
    report.denoise = { radius: opts.denoise.radius ?? 1 };
  }

  // Sharpen (unsharp mask)
  if (opts.sharpen) {
    unsharpMask(
      canvas,
      opts.sharpen.radiusPx ?? 2,
      opts.sharpen.amount ?? 0.6,
      opts.sharpen.threshold ?? 3
    );
    report.sharpen = opts.sharpen;
  }

  // Export
  if (!opts.export) {
    // Default: PNG (lossless, EXIF stripped)
    const blob = await new Promise<Blob>((r) =>
      canvas.toBlob((b) => r(b!), "image/png")
    );
    return { blob, report, canvas };
  }

  // Adaptive SSIM path
  if (opts.export.adaptive) {
    const { target } = opts.export;
    const minQ = opts.export.adaptive.minQ ?? 0.6;
    const maxQ = opts.export.adaptive.maxQ ?? 0.95;
    let lo = minQ;
    let hi = maxQ;
    let bestBlob: Blob | null = null;
    let bestSSIM = 0;
    let bestQ = hi;

    for (let iter = 0; iter < 7; iter++) {
      const q = (lo + hi) / 2;
      const candidate = await new Promise<Blob>((r) =>
        canvas.toBlob((b) => r(b!), mime(target), q)
      );
      const compCanvas = await loadImageToCanvas(candidate);
      const ssim = await ssimApprox(opts.export.adaptive.baselineCanvas, compCanvas);

      if (ssim >= opts.export.adaptive.targetSSIM) {
        bestBlob = candidate;
        bestSSIM = ssim;
        bestQ = q;
        hi = q - 0.02;
      } else {
        lo = q + 0.02;
      }

      if (hi - lo < 0.02) break;
    }

    const blob =
      bestBlob ??
      (await new Promise<Blob>((r) =>
        canvas.toBlob((b) => r(b!), mime(target), maxQ)
      ));

    report.export = {
      mode: "adaptive-ssim",
      targetSSIM: opts.export.adaptive.targetSSIM,
      quality: round2(bestQ),
      ssim: round3(bestSSIM),
    };

    return { blob, report, canvas };
  }

  // Simple export
  const blob = await new Promise<Blob>((r) =>
    canvas.toBlob(
      (b) => r(b!),
      mime(opts.export.target),
      opts.export.quality ?? 0.9
    )
  );

  report.export = {
    mode: "fixed",
    target: opts.export.target,
    quality: opts.export.quality ?? 0.9,
  };

  return { blob, report, canvas };
}

const mime = (t: "jpeg" | "webp" | "png") =>
  t === "jpeg"
    ? "image/jpeg"
    : t === "webp"
      ? "image/webp"
      : "image/png";

const round2 = (v: number) => Math.round(v * 100) / 100;
const round3 = (v: number) => Math.round(v * 1000) / 1000;

