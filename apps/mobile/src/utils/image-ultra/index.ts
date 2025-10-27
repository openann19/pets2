/**
 * Image Ultra - Ultra-Advanced Image Processing Pipeline
 * 
 * Complete exports for all image processing utilities
 */

export { AbortableQueue } from "./queue";
export type { Task } from "./queue";

export { LRU } from "./lru";

export {
  processImagePipeline,
  loadImageToCanvas,
  tileUpscaleCanvas,
} from "./pipeline";
export type { PipelineOptions } from "./pipeline";

export { medianDenoise, unsharpMask } from "./filters";

export { ssimApprox } from "./ssim";

// Filters Extras
export {
  toneMapHighlights,
  clarityLocalContrast,
  vignetteCorrect,
  applyNoisePreset,
  median3,
} from "./filters_extras";
export type { NoisePreset } from "./filters_extras";

// Crop Scoring
export {
  tenengradScore,
  entropyScore,
  compositionScore,
  cut,
  clone,
} from "./crop_scorer";
export type { Rect } from "./crop_scorer";

// Auto Crop
export {
  proposeTrioCrops,
  bestOf3,
  clampRect,
} from "./auto_crop";
export type { TrioMode } from "./auto_crop";

// Horizon / Auto-Straighten
export {
  estimateHorizonAngle,
  rotateCanvas,
} from "./horizon";

// Histogram / HDR Detection
export {
  computeHistogram,
  highlightClipFraction,
} from "./histogram";

// Pro Pipeline
export { processImageUltraPro } from "./pipeline_pro";
export type { ProOpts } from "./pipeline_pro";
