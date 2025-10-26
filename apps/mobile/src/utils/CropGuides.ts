/**
 * Crop Guides & Composition Helpers
 * Rule of thirds, golden ratio, content-aware borders
 */

import type { Rect } from "./AutoCropEngine";

export interface CropGuide {
  type: "thirds" | "golden" | "diagonal" | "center" | "eye-line";
  lines: Array<{ x?: number; y?: number; style: "vertical" | "horizontal" | "diagonal" }>;
}

/**
 * Generate rule of thirds lines
 */
export function ruleOfThirds(containerW: number, containerH: number): CropGuide {
  const third = { x: containerW / 3, y: containerH / 3 };
  
  return {
    type: "thirds",
    lines: [
      { x: third.x, style: "vertical" },
      { x: third.x * 2, style: "vertical" },
      { y: third.y, style: "horizontal" },
      { y: third.y * 2, style: "horizontal" },
    ],
  };
}

/**
 * Generate golden ratio lines (~0.618)
 */
export function goldenRatio(containerW: number, containerH: number): CropGuide {
  const golden = 0.618;
  const goldenW = containerW * golden;
  const goldenH = containerH * golden;
  
  return {
    type: "golden",
    lines: [
      { x: goldenW, style: "vertical" },
      { x: containerW - goldenW, style: "vertical" },
      { y: goldenH, style: "horizontal" },
      { y: containerH - goldenH, style: "horizontal" },
    ],
  };
}

/**
 * Generate diagonal guide (symmetry line)
 */
export function diagonalGuide(containerW: number, containerH: number): CropGuide {
  return {
    type: "diagonal",
    lines: [
      { style: "diagonal" }, // Top-left to bottom-right
      { style: "diagonal" }, // Top-right to bottom-left
    ],
  };
}

/**
 * Generate center crosshair
 */
export function centerGuide(containerW: number, containerH: number): CropGuide {
  const cx = containerW / 2;
  const cy = containerH / 2;
  
  return {
    type: "center",
    lines: [
      { x: cx, style: "vertical" },
      { y: cy, style: "horizontal" },
    ],
  };
}

/**
 * Generate eye-line guide (assumes subject is in top 2/3)
 * Helps ensure eyes are at the correct level for portraits
 */
export function eyeLineGuide(containerW: number, containerH: number): CropGuide {
  const eyeLevel = containerH * 0.4; // Eyes typically at upper 40% for portraits
  const topBound = containerH * 0.1;
  const bottomBound = containerH * 0.7;
  
  return {
    type: "eye-line",
    lines: [
      { y: eyeLevel, style: "horizontal" },
      { y: topBound, style: "horizontal" },
      { y: bottomBound, style: "horizontal" },
    ],
  };
}

/**
 * Compute content-aware borders
 * Expands canvas to protect edges (paws, ears) from cropping
 * 
 * @param focus - Subject focus rect
 * @param imgW - Image width
 * @param imgH - Image height
 * @param targetRatio - Target aspect ratio
 * @param protection - Padding percentage (default 0.15 = 15%)
 * @returns Expanded crop rect
 */
export function contentAwareBorder(
  focus: Rect,
  imgW: number,
  imgH: number,
  targetRatio: number,
  protection = 0.15
): Rect {
  // Calculate how much extra space we need around the focus
  const padX = focus.width * protection;
  const padY = focus.height * protection;
  
  // Expand focus rect
  const expanded: Rect = {
    x: Math.max(0, focus.x - padX),
    y: Math.max(0, focus.y - padY),
    width: Math.min(imgW, focus.width + padX * 2),
    height: Math.min(imgH, focus.height + padY * 2),
  };
  
  // Center the expanded rect
  const cx = expanded.x + expanded.width / 2;
  const cy = expanded.y + expanded.height / 2;
  
  // Compute final crop with target ratio
  let width: number;
  let height: number;
  
  const expandedAR = expanded.width / expanded.height;
  
  if (expandedAR >= targetRatio) {
    height = expanded.height;
    width = height * targetRatio;
  } else {
    width = expanded.width;
    height = width / targetRatio;
  }
  
  // Clamp to image bounds
  width = Math.min(width, imgW);
  height = Math.min(height, imgH);
  
  let x = cx - width / 2;
  let y = cy - height / 2;
  
  x = Math.max(0, Math.min(x, imgW - width));
  y = Math.max(0, Math.min(y, imgH - height));
  
  return { x, y, width, height };
}

/**
 * Check if highlights are clipped
 * Suggests HDR framing warning
 * 
 * @param uri - Image URI
 * @returns true if highlights appear clipped
 */
export async function checkHighlightClipping(uri: string): Promise<boolean> {
  // This is a heuristic check
  // In a full implementation, you'd analyze the image histogram
  // For now, we return false (no clipping detected)
  // TODO: Implement actual histogram analysis
  return false;
}

/**
 * Crop rotation angle using horizon/lines detection
 * Returns rotation needed to straighten the image
 * 
 * @param uri - Image URI
 * @returns Rotation angle in degrees (positive = counter-clockwise)
 */
export async function detectRotation(uri: string): Promise<number> {
  // TODO: Implement Hough line detection for horizon
  // For now, return 0 (no rotation needed)
  return 0;
}

/**
 * Suggest safe text zones for Instagram stories/reels
 * Ensures captions don't get cut off by UI chrome
 * 
 * @param containerW - Container width
 * @param containerH - Container height
 * @param platform - "instagram" | "tiktok" | "youtube"
 * @returns Safe zones (rects to avoid)
 */
export function safeTextZones(
  containerW: number,
  containerH: number,
  platform: "instagram" | "tiktok" | "youtube" = "instagram"
): Array<Rect> {
  const zones: Array<Rect> = [];
  
  if (platform === "instagram") {
    // Top 15% (profile + back button)
    zones.push({
      x: 0,
      y: 0,
      width: containerW,
      height: containerH * 0.15,
    });
    
    // Bottom 20% (next/menu buttons + captions)
    zones.push({
      x: 0,
      y: containerH * 0.8,
      width: containerW,
      height: containerH * 0.2,
    });
  } else if (platform === "tiktok") {
    // Top 10%
    zones.push({
      x: 0,
      y: 0,
      width: containerW,
      height: containerH * 0.1,
    });
    
    // Bottom 15%
    zones.push({
      x: 0,
      y: containerH * 0.85,
      width: containerW,
      height: containerH * 0.15,
    });
  } else if (platform === "youtube") {
    // Top 8%
    zones.push({
      x: 0,
      y: 0,
      width: containerW,
      height: containerH * 0.08,
    });
    
    // Bottom 12%
    zones.push({
      x: 0,
      y: containerH * 0.88,
      width: containerW,
      height: containerH * 0.12,
    });
  }
  
  return zones;
}

/**
 * Calculate score for a crop based on composition rules
 * Higher score = better composition
 * 
 * @param focus - Subject position
 * @param crop - Crop rect
 * @param imgW - Image width
 * @param imgH - Image height
 * @returns Score 0..100
 */
export function compositionScore(
  focus: Rect,
  crop: Rect,
  imgW: number,
  imgH: number
): number {
  let score = 0;
  
  // Check rule of thirds positioning
  const cx = (focus.x + focus.width / 2) / imgW;
  const cy = (focus.y + focus.height / 2) / imgH;
  
  // Reward near third lines (33% or 67%)
  const distX = Math.min(Math.abs(cx - 0.33), Math.abs(cx - 0.67));
  const distY = Math.min(Math.abs(cy - 0.33), Math.abs(cy - 0.67));
  
  score += Math.max(0, 40 - distX * 100); // Up to 40 points
  score += Math.max(0, 40 - distY * 100); // Up to 40 points
  
  // Check symmetry (center alignment gets lower score but still valid)
  if (cx > 0.4 && cx < 0.6 && cy > 0.4 && cy < 0.6) {
    score += 20; // Central composition bonus
  }
  
  // Check aspect ratio match
  const cropAR = crop.width / crop.height;
  const focusAR = focus.width / focus.height;
  
  if (Math.abs(cropAR - focusAR) < 0.2) {
    score += 20; // Good ratio match
  }
  
  return Math.min(100, Math.round(score));
}

