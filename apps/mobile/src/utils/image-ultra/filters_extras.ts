/**
 * Pro Extras: Glare/Highlights Recovery, Clarity (Local Contrast), Vignette, Noise Presets
 * Advanced image enhancement filters for professional-quality results
 */

/**
 * Tone map highlights to recover blown-out areas
 * Uses smooth compression curve to recover detail in overexposed regions
 * 
 * @param canvas - Canvas to process (mutated)
 * @param strength - Recovery strength 0-1 (default: 0.6)
 * @param pivot - Luminance pivot point 0-1 (default: 0.75, higher = compress more highlights)
 */
export function toneMapHighlights(
  canvas: HTMLCanvasElement,
  strength = 0.6,
  pivot = 0.75
) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const p = Math.max(0.01, Math.min(0.99, pivot));

  for (let i = 0; i < d.length; i += 4) {
    const r = (d[i] ?? 0) / 255;
    const g = (d[i + 1] ?? 0) / 255;
    const b = (d[i + 2] ?? 0) / 255;
    const l = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    // Compress highlights smoothly
    const t =
      l > p
        ? p + (1 - Math.exp(-(l - p) * 4)) * (1 - p)
        : l;
    // Scale channels by luminance ratio
    const k = l === 0 ? 0 : t / l;
    const mix = strength;
    d[i] = clampByte(255 * (r * (1 - mix) + r * k * mix));
    d[i + 1] = clampByte(255 * (g * (1 - mix) + g * k * mix));
    d[i + 2] = clampByte(255 * (b * (1 - mix) + b * k * mix));
  }
  ctx.putImageData(img, 0, 0);
}

/**
 * Clarity filter: Local contrast enhancement
 * Wide-radius unsharp mask on luminance channel for edge-aware clarity boost
 * 
 * @param canvas - Canvas to process (mutated)
 * @param radiusPx - Blur radius for luminance comparison (default: 12)
 * @param amount - Strength 0-1 (default: 0.35)
 */
export function clarityLocalContrast(
  canvas: HTMLCanvasElement,
  radiusPx = 12,
  amount = 0.35
) {
  const { width: w, height: h } = canvas;
  const ctx = canvas.getContext("2d")!;
  const base = ctx.getImageData(0, 0, w, h);
  
  // Blur copy
  const blur = document.createElement("canvas");
  blur.width = w;
  blur.height = h;
  const bctx = blur.getContext("2d")!;
  bctx.filter = `blur(${radiusPx}px)`;
  bctx.drawImage(canvas, 0, 0);
  const blr = bctx.getImageData(0, 0, w, h);

  for (let i = 0; i < base.data.length; i += 4) {
    const r = base.data[i] ?? 0;
    const g = base.data[i + 1] ?? 0;
    const b = base.data[i + 2] ?? 0;
    const rl = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const bl =
      0.2126 * (blr.data[i] ?? 0) + 0.7152 * (blr.data[i + 1] ?? 0) + 0.0722 * (blr.data[i + 2] ?? 0);
    // Detail = baseLuma - blurLuma; add fraction back
    const detail = rl - bl;
    const add = detail * amount;
    const scale = rl === 0 ? 0 : (rl + add) / rl;
    base.data[i] = clampByte(r * scale);
    base.data[i + 1] = clampByte(g * scale);
    base.data[i + 2] = clampByte(b * scale);
  }
  ctx.putImageData(base, 0, 0);
}

/**
 * Vignette correction (or artistic vignette if amount < 0)
 * Brightens edges when amount > 0, darkens for artistic effect when amount < 0
 * 
 * @param canvas - Canvas to process (mutated)
 * @param amount - Correction strength -1..+1, positive = brighten edges (default: 0.25)
 * @param softness - Transition softness 0-1 (default: 0.6)
 */
export function vignetteCorrect(
  canvas: HTMLCanvasElement,
  amount = 0.25,
  softness = 0.6
) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;
  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.hypot(cx, cy);
  const soft = Math.max(0.01, Math.min(0.99, softness));

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = Math.hypot(x - cx, y - cy) / maxR; // 0..1
      const v = 1 + amount * smoothstep(soft, 1, r); // boost/darken edges
      d[i] = clampByte((d[i] ?? 0) * v);
      d[i + 1] = clampByte((d[i + 1] ?? 0) * v);
      d[i + 2] = clampByte((d[i + 2] ?? 0) * v);
    }
  }
  ctx.putImageData(img, 0, 0);
}

export type NoisePreset = "ios-night" | "android-mid";

/**
 * Apply noise reduction preset optimized for mobile camera sensors
 * 
 * @param canvas - Canvas to process (mutated)
 * @param preset - Preset type
 */
export function applyNoisePreset(canvas: HTMLCanvasElement, preset: NoisePreset) {
  switch (preset) {
    case "ios-night":
      // Denoise slightly then clarity + tiny USM
      median3(canvas);
      clarityLocalContrast(canvas, 14, 0.28);
      return;
    case "android-mid":
      median3(canvas);
      return;
  }
}

/**
 * Fast median filter (3x3 only for performance)
 */
export function median3(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d")!;
  const { width: w, height: h } = canvas;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const clamp = (v: number, min: number, max: number) =>
    v < min ? min : v > max ? max : v;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rs: number[] = [];
      const gs: number[] = [];
      const bs: number[] = [];
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const xx = clamp(x + dx, 0, w - 1);
          const yy = clamp(y + dy, 0, h - 1);
          const idx = (yy * w + xx) * 4;
          rs.push(src.data[idx] ?? 0);
          gs.push(src.data[idx + 1] ?? 0);
          bs.push(src.data[idx + 2] ?? 0);
        }
      }
      rs.sort(n);
      gs.sort(n);
      bs.sort(n);
      const i = (y * w + x) * 4;
      dst.data[i] = rs[4] ?? 0;
      dst.data[i + 1] = gs[4] ?? 0;
      dst.data[i + 2] = bs[4] ?? 0;
      dst.data[i + 3] = src.data[i + 3] ?? 255;
    }
  }
  ctx.putImageData(dst, 0, 0);
}

const n = (a: number, b: number) => a - b;
const clampByte = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

