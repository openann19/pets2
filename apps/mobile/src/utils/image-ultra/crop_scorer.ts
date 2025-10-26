/**
 * Crop Scoring: Tenengrad Focus + Entropy + Composition Scoring
 * Quantifies image quality for smart crop selection
 */

export type Rect = { x: number; y: number; w: number; h: number };

/**
 * Tenengrad sharpness score (gradient magnitude squared)
 * Higher = sharper, more detailed region
 */
export function tenengradScore(
  canvas: HTMLCanvasElement,
  rect?: Rect
): number {
  const c = cut(canvas, rect);
  const ctx = c.getContext("2d")!;
  const { width: w, height: h } = c;
  const data = ctx.getImageData(0, 0, w, h).data;

  // Sobel
  const gx = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const gy = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

  const L = (x: number, y: number) => {
    if (x < 0 || x >= w || y < 0 || y >= h) return 0;
    const i = (y * w + x) * 4;
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  let sum = 0;
  let count = 0;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let sx = 0;
      let sy = 0;
      let k = 0;
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const v = L(x + i, y + j);
          const gxVal = gx[k] ?? 0;
          const gyVal = gy[k] ?? 0;
          sx += v * gxVal;
          sy += v * gyVal;
          k++;
        }
      }
      const g2 = sx * sx + sy * sy;
      sum += g2;
      count++;
    }
  }

  return count ? sum / count : 0;
}

/**
 * Entropy score (information content)
 * Higher = more visually interesting texture
 * Range: 0 (flat) to 8 (maximum entropy)
 */
export function entropyScore(canvas: HTMLCanvasElement, rect?: Rect): number {
  const c = cut(canvas, rect);
  const ctx = c.getContext("2d")!;
  const { width: w, height: h } = c;
  const data = ctx.getImageData(0, 0, w, h).data;
  const hist = new Float32Array(256);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const l = Math.round(
      0.2126 * r + 0.7152 * g + 0.0722 * b
    );
    hist[l] += 1;
  }

  let sum = 0;
  for (let i = 0; i < 256; i++) {
    const val = hist[i] ?? 0;
    sum += val;
  }
  if (!sum) return 0;

  let H = 0;
  for (let i = 0; i < 256; i++) {
    const histVal = hist[i] ?? 0;
    const p = histVal / sum;
    if (p > 0) H += -p * Math.log2(p);
  }
  return H; // 0..8
}

/**
 * Combined composition score
 * Mix of sharpness (60%), entropy (20%), eye-line alignment (20%)
 * 
 * @param canvas - Source canvas
 * @param rect - Crop region
 * @param opts - Options including eye-line % from top (default: 0.28 = top third)
 * @returns Score 0-1
 */
export function compositionScore(
  canvas: HTMLCanvasElement,
  rect: Rect,
  opts?: { eyeLine?: number }
): number {
  const s = tenengradScore(canvas, rect);
  const e = entropyScore(canvas, rect);
  let comp = 0;

  // Normalize sharpness
  comp += norm(s, 2e3, 2e5) * 0.6;
  // Entropy (max ~7.5 for real images)
  comp += Math.min(1, e / 7.5) * 0.2;
  
  // Eye-line alignment bonus
  const eye = opts?.eyeLine ?? 0.28; // % from top
  const centerY = rect.y + rect.h * eye;
  const idealY = canvas.height * eye;
  const dy = Math.abs(centerY - idealY) / canvas.height; // 0..1
  comp += (1 - Math.min(1, dy * 3)) * 0.2; // within ~0.33 screen gets full credit

  return comp;
}

/**
 * Extract region from canvas
 */
export function cut(src: HTMLCanvasElement, rect?: Rect): HTMLCanvasElement {
  if (!rect) return clone(src);
  const c = document.createElement("canvas");
  c.width = Math.round(rect.w);
  c.height = Math.round(rect.h);
  c.getContext("2d")!.drawImage(
    src,
    rect.x,
    rect.y,
    rect.w,
    rect.h,
    0,
    0,
    c.width,
    c.height
  );
  return c;
}

/**
 * Clone canvas
 */
export function clone(src: HTMLCanvasElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width;
  c.height = src.height;
  c.getContext("2d")!.drawImage(src, 0, 0);
  return c;
}

const norm = (v: number, min: number, max: number) => {
  const t = (v - min) / (max - min);
  return Math.max(0, Math.min(1, t));
};

