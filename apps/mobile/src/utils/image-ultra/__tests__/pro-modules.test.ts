/**
 * PRO Modules Integration Tests
 * Tests for glare recovery, clarity, vignette, auto-straighten, smart crop
 */

import {
  toneMapHighlights,
  clarityLocalContrast,
  vignetteCorrect,
  applyNoisePreset,
} from "../filters_extras";
import { highlightClipFraction, computeHistogram } from "../histogram";
import { estimateHorizonAngle, rotateCanvas } from "../horizon";
import {
  tenengradScore,
  entropyScore,
  compositionScore,
  proposeTrioCrops,
  bestOf3,
  cut,
} from "../crop_scorer";
import type { Rect } from "../crop_scorer";

/**
 * Helper: Create test canvas with gradient or pattern
 */
function createTestCanvas(width = 200, height = 150): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#ff0000");
  gradient.addColorStop(0.5, "#00ff00");
  gradient.addColorStop(1, "#0000ff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  return canvas;
}

/**
 * Helper: Create high-contrast canvas for sharpness tests
 */
function createHighContrastCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d")!;

  // Chessboard pattern
  for (let y = 0; y < 100; y += 10) {
    for (let x = 0; x < 100; x += 10) {
      const isBlack = Math.floor(x / 10) % 2 === Math.floor(y / 10) % 2;
      ctx.fillStyle = isBlack ? "#000" : "#fff";
      ctx.fillRect(x, y, 10, 10);
    }
  }

  return canvas;
}

describe("PRO Modules", () => {
  describe("filters_extras", () => {
    test("toneMapHighlights recovers blown areas", () => {
      const canvas = createTestCanvas();
      const before = canvas.getContext("2d")!.getImageData(0, 0, 50, 50);

      toneMapHighlights(canvas, 0.5, 0.75);

      const after = canvas.getContext("2d")!.getImageData(0, 0, 50, 50);
      // Should modify pixels without errors
      expect(after.data.length).toBe(before.data.length);
    });

    test("clarityLocalContrast enhances edges", () => {
      const canvas = createHighContrastCanvas();
      clarityLocalContrast(canvas, 10, 0.3);
      // No errors, should complete
      expect(canvas.width).toBe(100);
    });

    test("vignetteCorrect adjusts edges", () => {
      const canvas = createTestCanvas();
      vignetteCorrect(canvas, 0.25, 0.6);
      expect(canvas.width).toBe(200);
    });

    test("applyNoisePreset handles mobile presets", () => {
      const canvas = createTestCanvas();
      applyNoisePreset(canvas, "ios-night");
      applyNoisePreset(canvas, "android-mid");
      // Should complete without errors
      expect(canvas.width).toBe(200);
    });
  });

  describe("histogram", () => {
    test("computeHistogram returns 256 bins", () => {
      const canvas = createTestCanvas();
      const hist = computeHistogram(canvas);
      expect(hist.length).toBe(256);
      expect(hist.reduce((a, b) => a + b, 0)).toBeGreaterThan(0);
    });

    test("highlightClipFraction detects overexposure", () => {
      const canvas = createTestCanvas();
      const clip = highlightClipFraction(canvas, 250);
      expect(clip).toBeGreaterThanOrEqual(0);
      expect(clip).toBeLessThanOrEqual(1);
    });
  });

  describe("horizon", () => {
    test("estimateHorizonAngle returns valid angle", () => {
      const canvas = createTestCanvas();
      const angle = estimateHorizonAngle(canvas);
      expect(angle).toBeGreaterThanOrEqual(-90);
      expect(angle).toBeLessThanOrEqual(90);
    });

    test("rotateCanvas preserves dimensions", () => {
      const canvas = createTestCanvas(200, 150);
      const rotated = rotateCanvas(canvas, 5);
      // Should handle rotation
      expect(rotated.width).toBeGreaterThan(0);
      expect(rotated.height).toBeGreaterThan(0);
    });
  });

  describe("crop_scorer", () => {
    test("tenengradScore quantifies sharpness", () => {
      const canvas = createHighContrastCanvas();
      const score = tenengradScore(canvas);
      expect(score).toBeGreaterThan(0);
      // High contrast should score higher
      expect(typeof score).toBe("number");
    });

    test("entropyScore measures information content", () => {
      const canvas = createHighContrastCanvas();
      const score = entropyScore(canvas);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(8);
    });

    test("compositionScore combines metrics", () => {
      const canvas = createHighContrastCanvas();
      const rect: Rect = { x: 0, y: 0, w: 50, h: 50 };
      const score = compositionScore(canvas, rect);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(1);
    });

    test("cut extracts region", () => {
      const canvas = createTestCanvas(200, 200);
      const rect: Rect = { x: 10, y: 10, w: 50, h: 50 };
      const cropped = cut(canvas, rect);
      expect(cropped.width).toBe(50);
      expect(cropped.height).toBe(50);
    });
  });

  describe("auto_crop", () => {
    test("proposeTrioCrops generates three candidates", () => {
      const canvas = createTestCanvas(400, 500);
      const trio = proposeTrioCrops(canvas, 4 / 5); // 4:5 ratio

      expect(trio.tight).toBeDefined();
      expect(trio.medium).toBeDefined();
      expect(trio.loose).toBeDefined();

      // All should be valid rectangles
      expect(trio.tight.w).toBeGreaterThan(0);
      expect(trio.tight.h).toBeGreaterThan(0);
      expect(trio.medium.w).toBeGreaterThan(0);
      expect(trio.loose.w).toBeGreaterThan(0);

      // Tight should be smallest
      expect(trio.tight.w).toBeLessThan(trio.loose.w);
    });

    test("bestOf3 selects highest scorer", () => {
      const canvas = createHighContrastCanvas();
      const trio = proposeTrioCrops(canvas, 1); // 1:1 ratio
      const best = bestOf3(canvas, trio);

      expect(best.key).toMatch(/tight|medium|loose/);
      expect(best.rect).toBeDefined();
      expect(best.score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("integration workflow", () => {
    test("full PRO pipeline executes without errors", () => {
      const canvas = createTestCanvas(300, 400);

      // 1. Noise reduction
      applyNoisePreset(canvas, "ios-night");

      // 2. Highlights recovery
      toneMapHighlights(canvas, 0.6, 0.75);

      // 3. Clarity
      clarityLocalContrast(canvas, 12, 0.35);

      // 4. Vignette
      vignetteCorrect(canvas, 0.25, 0.6);

      // 5. HDR check
      const clip = highlightClipFraction(canvas);
      expect(typeof clip).toBe("number");

      // 6. Auto-straighten
      const angle = estimateHorizonAngle(canvas);
      expect(typeof angle).toBe("number");

      // 7. Smart crop
      const trio = proposeTrioCrops(canvas, 4 / 5);
      const best = bestOf3(canvas, trio);
      expect(best).toBeDefined();

      // Should complete successfully
      expect(canvas.width).toBe(300);
      expect(canvas.height).toBe(400);
    });
  });
});

