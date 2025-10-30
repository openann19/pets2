/**
 * Canvas Image Filters
 * Production-grade image processing filters for in-browser canvas
 * Includes denoising and sharpening operations
 */

/**
 * Median denoise filter
 * Removes noise by replacing each pixel with the median value in a window
 * Preserves edges better than Gaussian blur
 *
 * @param canvas - Canvas to denoise (mutated)
 * @param radius - Window radius (default: 1)
 */
export function medianDenoise(canvas: HTMLCanvasElement, radius = 1) {
  const ctx = canvas.getContext('2d')!;
  const { width: w, height: h } = canvas;
  const src = ctx.getImageData(0, 0, w, h);
  const dst = ctx.createImageData(w, h);
  const win = (2 * radius + 1) * (2 * radius + 1);

  const clamp = (v: number, min: number, max: number) => (v < min ? min : v > max ? max : v);

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const rArr: number[] = [];
      const gArr: number[] = [];
      const bArr: number[] = [];

      // Collect neighbors
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = clamp(x + dx, 0, w - 1);
          const yy = clamp(y + dy, 0, h - 1);
          const idx = (yy * w + xx) * 4;
          rArr.push(src.data[idx] ?? 0);
          gArr.push(src.data[idx + 1] ?? 0);
          bArr.push(src.data[idx + 2] ?? 0);
        }
      }

      // Compute medians
      rArr.sort((a, b) => a - b);
      gArr.sort((a, b) => a - b);
      bArr.sort((a, b) => a - b);

      const mid = win >> 1;
      const i = (y * w + x) * 4;

      dst.data[i] = rArr[mid] ?? 0;
      dst.data[i + 1] = gArr[mid] ?? 0;
      dst.data[i + 2] = bArr[mid] ?? 0;
      dst.data[i + 3] = src.data[i + 3] ?? 255;
    }
  }

  ctx.putImageData(dst, 0, 0);
}

/**
 * Unsharp mask sharpening filter
 * Classic sharpening algorithm: result = original + amount * (original - blurred)
 * Only applies when difference exceeds threshold to avoid amplifying noise
 *
 * @param canvas - Canvas to sharpen (mutated)
 * @param radiusPx - Blur radius in pixels (default: 2)
 * @param amount - Sharpening strength 0-2 (default: 0.6)
 * @param threshold - Minimum difference to apply sharpening (default: 3)
 */
export function unsharpMask(canvas: HTMLCanvasElement, radiusPx = 2, amount = 0.6, threshold = 3) {
  const { width: w, height: h } = canvas;

  // Blur pass using canvas filter -> offscreen copy
  const blur = document.createElement('canvas');
  blur.width = w;
  blur.height = h;
  const bctx = blur.getContext('2d')!;
  bctx.filter = `blur(${radiusPx}px)`;
  bctx.drawImage(canvas, 0, 0);

  const ctx = canvas.getContext('2d')!;
  const src = ctx.getImageData(0, 0, w, h);
  const blr = bctx.getImageData(0, 0, w, h);
  const out = ctx.createImageData(w, h);

  for (let i = 0; i < src.data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const srcVal = src.data[i + c] ?? 0;
      const blrVal = blr.data[i + c] ?? 0;
      const diff = srcVal - blrVal;
      const add = Math.abs(diff) > threshold ? diff * amount : 0;
      out.data[i + c] = clampByte(srcVal + add);
    }
    out.data[i + 3] = src.data[i + 3] ?? 255;
  }

  ctx.putImageData(out, 0, 0);
}

const clampByte = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);
