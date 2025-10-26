/**
 * Auto-Straighten: Sobel Gradient Analysis + Weighted Hough Transform
 * Detects horizon angle and provides rotation for leveling
 */

/**
 * Estimate horizon angle using Sobel edge detection and weighted histogram
 * 
 * @param canvas - Source canvas
 * @returns Rotation angle in degrees (-90 to +90)
 */
export function estimateHorizonAngle(canvas: HTMLCanvasElement): number {
  const { width: w, height: h } = canvas;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(canvas, 0, 0);
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  // Sobel kernels
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const mag = new Float32Array(w * h);
  const ang = new Float32Array(w * h);

  const getL = (x: number, y: number) => {
    if (x < 0) x = 0;
    if (x >= w) x = w - 1;
    if (y < 0) y = 0;
    if (y >= h) y = h - 1;
    const i = (y * w + x) * 4;
    return 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
  };

  // Compute gradients
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sx = 0;
      let sy = 0;
      let k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const v = getL(x + i, y + j);
          sx += v * gx[k];
          sy += v * gy[k];
          k++;
        }
      }
      const m = Math.hypot(sx, sy);
      const a = Math.atan2(sy, sx); // -PI..PI
      mag[y * w + x] = m;
      ang[y * w + x] = a;
    }
  }

  // Weighted angle histogram (prefer near-horizontal edges)
  const bins = new Float32Array(181); // -90..+90

  for (let i = 0; i < ang.length; i++) {
    const a = ang[i];
    const m = mag[i];
    if (!isFinite(a) || m < 5) continue;
    // Angle of edge normal; horizon is near 0°
    let deg = ((a * 180) / Math.PI + 180) % 180; // 0..180
    if (deg > 90) deg -= 180; // -90..90
    const bin = Math.round(deg + 90);
    bins[bin] += m;
  }

  // Pick mode within ±10° around 0° for stability
  let best = -1;
  let bestV = -1;
  for (let i = 80; i <= 100; i++) {
    if (bins[i] > bestV) {
      bestV = bins[i];
      best = i;
    }
  }
  const angle = best - 90; // degrees
  // Clamp small angles; if noisy, return 0
  return Math.abs(angle) < 0.2 ? 0 : angle;
}

/**
 * Rotate canvas by specified angle and crop to fit
 * 
 * @param src - Source canvas
 * @param degrees - Rotation angle
 * @returns New rotated canvas with proper dimensions
 */
export function rotateCanvas(
  src: HTMLCanvasElement,
  degrees: number
): HTMLCanvasElement {
  const rad = (degrees * Math.PI) / 180;
  const s = Math.sin(rad);
  const c = Math.cos(rad);
  const w = src.width;
  const h = src.height;
  
  // Fit bounding box
  const nw = Math.abs(w * c) + Math.abs(h * s);
  const nh = Math.abs(w * s) + Math.abs(h * c);
  
  const out = document.createElement("canvas");
  out.width = Math.round(nw);
  out.height = Math.round(nh);
  const ctx = out.getContext("2d")!;
  ctx.translate(nw / 2, nh / 2);
  ctx.rotate(rad);
  ctx.drawImage(src, -w / 2, -h / 2);
  
  return out;
}

