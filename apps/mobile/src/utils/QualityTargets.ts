/**
 * Quality Targets for publish-grade resolutions
 * Instagram + story/reel safe zones for social media
 */

export const QualityTargets = {
  // Instagram-grade + story/reel safe
  '1:1': { minW: 1080, minH: 1080 }, // 1080 x 1080
  '4:5': { minW: 1080, minH: 1350 }, // portrait feed
  '9:16': { minW: 1080, minH: 1920 }, // story/reel
  '3:4': { minW: 1080, minH: 1440 }, // alt portrait
  '16:9': { minW: 1920, minH: 1080 }, // landscape
} as const;

export type KnownRatio = keyof typeof QualityTargets;

export const DEFAULT_RATIOS: KnownRatio[] = ['1:1', '4:5', '9:16'];

/**
 * Get target dimensions for a given aspect ratio
 * @param ratio - Aspect ratio string (e.g., "1:1", "4:5")
 * @returns Target width and height, or null if ratio not supported
 */
export function getTargetDimensions(ratio: string): { minW: number; minH: number } | null {
  return QualityTargets[ratio as KnownRatio] || null;
}

/**
 * Calculate upscale factor needed to reach target dimensions
 * @param currentW - Current image width
 * @param currentH - Current image height
 * @param targetW - Target width
 * @param targetH - Target height
 * @returns Upscale factor (1.0 = no upscale needed)
 */
export function calculateUpscaleFactor(
  currentW: number,
  currentH: number,
  targetW: number,
  targetH: number,
): number {
  const scaleW = targetW / currentW;
  const scaleH = targetH / currentH;
  return Math.max(scaleW, scaleH);
}
