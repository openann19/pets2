/**
 * Histogram Analysis for HDR Clipping Detection
 * Computes luminance histogram and detects overexposed regions
 */

/**
 * Compute luminance histogram from canvas
 * Returns 256-bin array counting pixel luminances
 */
export function computeHistogram(canvas: HTMLCanvasElement): Uint32Array {
  const ctx = canvas.getContext('2d')!;
  const { width: w, height: h } = canvas;
  const data = ctx.getImageData(0, 0, w, h).data;
  const hist = new Uint32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    const l = Math.round(
      0.2126 * (data[i] ?? 0) + 0.7152 * (data[i + 1] ?? 0) + 0.0722 * (data[i + 2] ?? 0),
    );
    const idx = Math.min(Math.max(l, 0), 255);
    hist[idx] = (hist[idx] ?? 0) + 1;
  }

  return hist;
}

/**
 * Calculate fraction of pixels that are clipped (overexposed)
 *
 * @param canvas - Source canvas
 * @param threshold - Luminance threshold 0-255 (default: 250)
 * @returns Fraction 0-1 (e.g., 0.03 = 3% clipped)
 */
export function highlightClipFraction(canvas: HTMLCanvasElement, threshold = 250): number {
  const hist = computeHistogram(canvas);
  const total = hist.reduce((a, b) => a + b, 0);
  let clipped = 0;
  for (let i = threshold; i < 256; i++) {
    clipped += hist[i] ?? 0;
  }
  return total ? clipped / total : 0;
}
