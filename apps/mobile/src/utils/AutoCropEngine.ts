// utils/AutoCropEngine.ts
import { Image as RNImage } from "react-native";
import * as ImageManipulator from "expo-image-manipulator";

export type Rect = { x: number; y: number; width: number; height: number };
type Suggestion = {
  ratio: string;            // "1:1" | "4:5" | "9:16" | etc.
  focus: Rect;              // the subject focus rect (after padding/weighting)
  crop: Rect;               // final crop rect to apply for this ratio
  thumbUri?: string;        // small preview (optional, generated via makeThumbnails)
  method: "eyes" | "face" | "fallback";
};

type DetectOpts = {
  eyeWeight?: number;       // 0..1 (how much to bias toward eyes)
  padPct?: number;          // extra space around subject focus
};

type ThumbOpts = {
  size?: number;            // width of thumbnail (px)
  quality?: number;         // 0..1
};

let FaceDetector: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  FaceDetector = require("expo-face-detector");
} catch {
  FaceDetector = null;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const padRect = (r: Rect, imgW: number, imgH: number, padPct = 0.18): Rect => {
  const padX = r.width * padPct;
  const padY = r.height * padPct;
  const x = clamp(r.x - padX, 0, imgW);
  const y = clamp(r.y - padY, 0, imgH);
  const width = clamp(r.width + padX * 2, 1, imgW - x);
  const height = clamp(r.height + padY * 2, 1, imgH - y);
  return { x, y, width, height };
};
const unionRects = (rects: Rect[]): Rect => {
  const minX = Math.min(...rects.map((r) => r.x));
  const minY = Math.min(...rects.map((r) => r.y));
  const maxX = Math.max(...rects.map((r) => r.x + r.width));
  const maxY = Math.max(...rects.map((r) => r.y + r.height));
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
};
const biggestRect = (rects: Rect[]) =>
  rects.slice().sort((a, b) => b.width * b.height - a.width * a.height)[0];

const ratioToNumber = (r: string): number => {
  if (r === "FREE") return NaN;
  const parts = r.split(":");
  if (parts.length !== 2) return NaN;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (isNaN(a) || isNaN(b) || b === 0) return NaN;
  return a / b;
};

async function getImageSize(uri: string): Promise<{ w: number; h: number }> {
  return new Promise((resolve) => {
    RNImage.getSize(
      uri,
      (w, h) => { resolve({ w, h }); },
      () => { resolve({ w: 0, h: 0 }); },
    );
  });
}

/** Compute a crop rect of a given aspect ratio that fully contains `focus` with optional padding. */
function cropForRatio(focus: Rect, imgW: number, imgH: number, ratio: string, padPct = 0.12): Rect {
  const ar = ratioToNumber(ratio);
  const padded = padRect(focus, imgW, imgH, padPct);
  const cx = padded.x + padded.width / 2;
  const cy = padded.y + padded.height / 2;

  // Ensure rect with target AR that fully contains padded
  let width: number;
  let height: number;
  const focusAR = padded.width / padded.height;

  if (isNaN(ar)) {
    // FREE -> just return padded focus
    width = padded.width;
    height = padded.height;
  } else if (focusAR >= ar) {
    width = padded.width;
    height = width / ar;
  } else {
    height = padded.height;
    width = height * ar;
  }

  // Clamp within image while keeping size
  width = Math.min(width, imgW);
  height = Math.min(height, imgH);

  let x = cx - width / 2;
  let y = cy - height / 2;

  x = clamp(x, 0, imgW - width);
  y = clamp(y, 0, imgH - height);

  return { x, y, width, height };
}

/** Eye-weighted focus from faces (if landmarks available). Falls back to face bounds union. */
function buildEyeWeightedFocus(faces: any[], imgW: number, imgH: number, eyeWeight = 0.55): { rect: Rect; method: "eyes" | "face" } {
  const faceRects: Rect[] = faces.map((f: any) => ({
    x: f.bounds.origin.x,
    y: f.bounds.origin.y,
    width: f.bounds.size.width,
    height: f.bounds.size.height,
  }));

  // landmarks present?
  const haveLandmarks = faces.every((f) => f.LEFT_EYE || f.RIGHT_EYE || f.landmarks?.leftEye || f.landmarks?.rightEye);

  if (haveLandmarks) {
    const points: { x: number; y: number }[] = [];
    faces.forEach((f) => {
      const le = f.LEFT_EYE || f.landmarks?.leftEye;
      const re = f.RIGHT_EYE || f.landmarks?.rightEye;
      if (le) points.push({ x: le.x, y: le.y });
      if (re) points.push({ x: re.x, y: re.y });
    });

    if (points.length >= 2) {
      // BBox around eyes
      const minX = Math.min(...points.map((p) => p.x));
      const maxX = Math.max(...points.map((p) => p.x));
      const minY = Math.min(...points.map((p) => p.y));
      const maxY = Math.max(...points.map((p) => p.y));
      // Validate values to ensure they are numbers
      if (isNaN(minX) || isNaN(maxX) || isNaN(minY) || isNaN(maxY)) {
        // Fallback to merged face bounds
        const merged = padRect(unionRects(faceRects), imgW, imgH, 0.18);
        return { rect: merged, method: "face" };
      }
      const eyesRect: Rect = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };

      // Expand to include a bit of muzzle/forehead (pets) or nose/forehead (humans)
      const base = unionRects(faceRects);
      // Blend eyesRect with faceRect center using eyeWeight
      const targetW = base.width * (0.55);            // natural head framing
      const targetH = base.height * (0.55);
      const cx = eyesRect.x + eyesRect.width / 2;
      const cy = eyesRect.y + eyesRect.height / 2;
      const baseCx = base.x + base.width / 2;
      const baseCy = base.y + base.height / 2;

      const focusCx = baseCx * (1 - eyeWeight) + cx * eyeWeight;
      // Bias slightly upward (forehead/ears for pets)
      const upwardBias = Math.max(8, base.height * 0.08);
      const focusCy = baseCy * (1 - eyeWeight) + (cy - upwardBias) * eyeWeight;

      const rect: Rect = {
        x: clamp(focusCx - targetW / 2, 0, imgW - targetW),
        y: clamp(focusCy - targetH / 2, 0, imgH - targetH),
        width: Math.min(targetW, imgW),
        height: Math.min(targetH, imgH),
      };

      return { rect: padRect(rect, imgW, imgH, 0.18), method: "eyes" };
    }
  }

  // Fallback to merged face bounds
  const merged = padRect(unionRects(faceRects), imgW, imgH, 0.18);
  return { rect: merged, method: "face" };
}

async function detectFaces(uri: string): Promise<any[] | null> {
  if (!FaceDetector?.FaceDetector) return null;
  try {
    const options = {
      mode: FaceDetector.FaceDetectorMode.accurate,
      detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
      runClassifications: FaceDetector.FaceDetectorClassifications.none,
    };
    const result = await FaceDetector.FaceDetector.processImageAsync(uri, options);
    return Array.isArray(result) ? result : null;
  } catch {
    return null;
  }
}

export type AutoCropResult = {
  focus: Rect;
  method: "eyes" | "face" | "fallback";
  size: { w: number; h: number };
};

export type SuggestionType = Suggestion;

export const AutoCropEngine = {
  /** Return a **focus rect** (subject box) using eyes>face>fallback. */
  detect: async (uri: string, opts: DetectOpts = {}): Promise<AutoCropResult | null> => {
    const { w: imgW, h: imgH } = await getImageSize(uri);
    if (!imgW || !imgH) return null;

    const faces = await detectFaces(uri);
    if (faces && faces.length > 0) {
      const { rect, method } = buildEyeWeightedFocus(faces, imgW, imgH, opts.eyeWeight ?? 0.55);
      return { focus: rect, method, size: { w: imgW, h: imgH } };
    }

    // Beautiful fallback (center, slight upward bias, 4:5-ish)
    const targetAR = 4 / 5;
    const w = Math.min(imgW * 0.7, imgH * targetAR * 0.9);
    const h = w / targetAR;
    const focus: Rect = {
      x: (imgW - w) / 2,
      y: (imgH - h) / 2 - imgH * 0.06,
      width: w,
      height: h,
    };
    return { focus: padRect(focus, imgW, imgH, opts.padPct ?? 0.18), method: "fallback", size: { w: imgW, h: imgH } };
  },

  /** Build multi-ratio **suggested crops** (1:1, 4:5, 9:16, etc.) from the focus. */
  suggestCrops: async (uri: string, ratios: string[] = ["1:1", "4:5", "9:16"], opts: DetectOpts = {}): Promise<Suggestion[]> => {
    const res = await AutoCropEngine.detect(uri, opts);
    if (!res) return [];
    const { focus, method, size } = res;

    return ratios.map((r) => ({
      ratio: r,
      focus,
      crop: cropForRatio(focus, size.w, size.h, r, opts.padPct ?? 0.12),
      method,
    }));
  },

  /** Generate thumbnails for suggestions (optional UI candy). */
  makeThumbnails: async (uri: string, suggestions: Suggestion[], thumbOpts: ThumbOpts = {}): Promise<Suggestion[]> => {
    const { size = 240, quality = 0.9 } = thumbOpts;
    const withThumbs: Suggestion[] = [];

    for (const s of suggestions) {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ crop: { originX: Math.round(s.crop.x), originY: Math.round(s.crop.y), width: Math.round(s.crop.width), height: Math.round(s.crop.height) } },
         { resize: { width: size } }],
        { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
      );
      withThumbs.push({ ...s, thumbUri: result.uri });
    }
    return withThumbs;
  },

  /** Apply a concrete crop rect to the original and return a new uri. */
  applyCrop: async (uri: string, rect: Rect, quality = 1): Promise<string> => {
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ crop: { originX: Math.round(rect.x), originY: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) } }],
      { compress: quality, format: ImageManipulator.SaveFormat.JPEG },
    );
    return result.uri;
  },
};

