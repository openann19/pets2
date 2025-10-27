/**
 * Auto Crop: Propose and Select Best-of-3 Crops
 * Generates trio (tight/medium/loose) and scores them for optimal composition
 */

import type { Rect } from "./crop_scorer";
import { compositionScore } from "./crop_scorer";

export type TrioMode = "tight" | "medium" | "loose";

/**
 * Propose three crop candidates (tight/medium/loose) around subject or center
 * 
 * @param canvas - Source canvas
 * @param ratio - Target aspect ratio (e.g., 4/5 for 4:5)
 * @param subject - Optional subject bounding box
 * @returns Object with three crop rectangles
 */
export function proposeTrioCrops(
  canvas: HTMLCanvasElement,
  ratio: number,
  subject?: Rect | null
): Record<TrioMode, Rect> {
  const W = canvas.width;
  const H = canvas.height;
  
  const boxW = Math.min(W, H * ratio);
  const boxH = boxW / ratio;
  
  // Subject center or default position
  const cx = subject ? subject.x + subject.w / 2 : W / 2;
  const cy = subject ? subject.y + subject.h / 2 : H * 0.38; // slight eye-line bias

  const mk = (scale: number): Rect => {
    const w = boxW * scale;
    const h = boxH * scale;
    return clampRect({ x: cx - w / 2, y: cy - h / 2, w, h }, W, H);
  };

  return {
    tight: mk(0.82),
    medium: mk(1.0),
    loose: mk(1.15),
  };
}

/**
 * Score all three crops and return best
 * 
 * @param canvas - Source canvas
 * @param trio - Three crop candidates
 * @param opts - Options for scoring
 * @returns Best crop with its key and score
 */
export function bestOf3(
  canvas: HTMLCanvasElement,
  trio: Record<"tight" | "medium" | "loose", Rect>,
  opts?: { eyeLine?: number }
): { key: "tight" | "medium" | "loose"; rect: Rect; score: number } {
  let bestKey: "tight" | "medium" | "loose" = "medium";
  let bestV = -1;

  (["tight", "medium", "loose"] as const).forEach((k) => {
    const v = compositionScore(canvas, trio[k], {
      eyeLine: opts?.eyeLine ?? 0.28,
    });
    if (v > bestV) {
      bestV = v;
      bestKey = k;
    }
  });

  return { key: bestKey, rect: trio[bestKey], score: bestV };
}

/**
 * Clamp rectangle to canvas bounds
 */
export function clampRect(r: Rect, W: number, H: number): Rect {
  let x = r.x;
  let y = r.y;
  let w = r.w;
  let h = r.h;

  // Keep inside bounds; if edges exceed, shift back
  if (w > W) {
    w = W;
    x = 0;
  }
  if (h > H) {
    h = H;
    y = 0;
  }
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x + w > W) x = W - w;
  if (y + h > H) y = H - h;

  return { x, y, w, h };
}

