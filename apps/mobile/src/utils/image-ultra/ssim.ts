/**
 * SSIM (Structural Similarity Index)
 * Fast downscaled, luminance-only, windowed SSIM computation
 * Used for adaptive JPEG quality targeting
 * 
 * Reference: Wang et al. (2004) "Image quality assessment: from error visibility to structural similarity"
 */

/**
 * Approximate SSIM using downscaled luminance channel with 8x8 windows
 * Downscale to ~512px for performance, then compute windowed SSIM
 * 
 * @param a - First canvas (baseline)
 * @param b - Second canvas (comparison)
 * @returns SSIM score 0-1 (1 = identical, lower = more different)
 */
export async function ssimApprox(
  a: HTMLCanvasElement,
  b: HTMLCanvasElement
): Promise<number> {
  const targetW = 512;
  const scale = targetW / Math.max(a.width, 1);
  const h = Math.max(1, Math.round(a.height * scale));

  const aa = downscale(a, targetW, h);
  const bb = downscale(b, targetW, h);

  const ai = aa.getContext("2d")!.getImageData(0, 0, aa.width, aa.height).data;
  const bi = bb.getContext("2d")!.getImageData(0, 0, bb.width, bb.height).data;

  const win = 8;
  const C1 = 6.5025; // (0.01 * 255)^2
  const C2 = 58.5225; // (0.03 * 255)^2
  let ssimSum = 0;
  let n = 0;

  for (let y = 0; y < aa.height; y += win) {
    for (let x = 0; x < aa.width; x += win) {
      let muA = 0;
      let muB = 0;
      let sA = 0;
      let sB = 0;
      let sAB = 0;
      let count = 0;

      // First pass: compute means
      for (let j = 0; j < win && y + j < aa.height; j++) {
        for (let i = 0; i < win && x + i < aa.width; i++) {
          const idx = ((y + j) * aa.width + (x + i)) * 4;
          const la =
            0.2126 * ai[idx] + 0.7152 * ai[idx + 1] + 0.0722 * ai[idx + 2];
          const lb =
            0.2126 * bi[idx] + 0.7152 * bi[idx + 1] + 0.0722 * bi[idx + 2];
          muA += la;
          muB += lb;
          count++;
        }
      }

      if (count < 4) continue;

      muA /= count;
      muB /= count;

      // Second pass: compute variances and covariance
      for (let j = 0; j < win && y + j < aa.height; j++) {
        for (let i = 0; i < win && x + i < aa.width; i++) {
          const idx = ((y + j) * aa.width + (x + i)) * 4;
          const la =
            0.2126 * ai[idx] + 0.7152 * ai[idx + 1] + 0.0722 * ai[idx + 2];
          const lb =
            0.2126 * bi[idx] + 0.7152 * bi[idx + 1] + 0.0722 * bi[idx + 2];
          sA += (la - muA) * (la - muA);
          sB += (lb - muB) * (lb - muB);
          sAB += (la - muA) * (lb - muB);
        }
      }

      sA /= count - 1;
      sB /= count - 1;
      sAB /= count - 1;

      // SSIM formula: (2*μ₁μ₂ + C₁)(2*σ₁₂ + C₂) / ((μ₁²+μ₂²+C₁)(σ₁²+σ₂²+C₂))
      const num = (2 * muA * muB + C1) * (2 * sAB + C2);
      const den = (muA * muA + muB * muB + C1) * (sA + sB + C2);

      ssimSum += num / den;
      n++;
    }
  }

  return n ? ssimSum / n : 0;
}

/**
 * Downscale canvas using high-quality interpolation
 */
function downscale(src: HTMLCanvasElement, w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(src, 0, 0, w, h);
  return c;
}

