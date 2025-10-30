/**
 * Image Loader Utility
 * Prefetch and cache images with dominant color placeholder support
 * 
 * Features:
 * - Image prefetching with React Native Image.prefetch
 * - Dominant color extraction (basic implementation)
 * - Cache management
 * - Fade-in animation support
 */

import { Image } from 'react-native';

interface PrefetchOptions {
  priority?: 'low' | 'normal' | 'high';
}

interface DominantColorCache {
  [uri: string]: string;
}

// Simple in-memory cache for dominant colors
const dominantColorCache: DominantColorCache = {};

/**
 * Prefetch an image for faster loading
 * @param uri Image URI to prefetch
 * @param options Prefetch options
 */
export async function prefetchImage(
  uri: string,
  _options: PrefetchOptions = {}
): Promise<void> {
  try {
    await Image.prefetch(uri);
  } catch (error) {
    // Silently fail - prefetch errors shouldn't block the app
    if (__DEV__) {
      console.warn('[imageLoader] Failed to prefetch image:', uri, error);
    }
  }
}

/**
 * Prefetch multiple images
 * @param uris Array of image URIs to prefetch
 * @param options Prefetch options
 */
export async function prefetchImages(
  uris: string[],
  _options: PrefetchOptions = {}
): Promise<void> {
  try {
    await Promise.all(uris.map(uri => Image.prefetch(uri)));
  } catch (error) {
    if (__DEV__) {
      console.warn('[imageLoader] Failed to prefetch images:', error);
    }
  }
}

/**
 * Get or compute dominant color for an image
 * Basic implementation - returns a cached color or generates a placeholder
 * 
 * NOTE: Full dominant color extraction requires image processing libraries.
 * This is a simplified version that can be extended with native modules.
 * 
 * @param uri Image URI
 * @returns Hexadecimal color string (e.g., '#FF5733')
 */
export function getDominantColor(uri: string): string {
  // Check cache first
  if (dominantColorCache[uri]) {
    return dominantColorCache[uri];
  }

  // Generate a deterministic color based on URI hash
  // This is a placeholder - real implementation would extract from image
  const hash = simpleHash(uri);
  const color = generateColorFromHash(hash);
  
  // Cache the result
  dominantColorCache[uri] = color;
  
  return color;
}

/**
 * Cache dominant color for an image
 * @param uri Image URI
 * @param color Hexadecimal color string
 */
export function cacheDominantColor(uri: string, color: string): void {
  dominantColorCache[uri] = color;
}

/**
 * Clear dominant color cache
 */
export function clearDominantColorCache(): void {
  Object.keys(dominantColorCache).forEach(key => {
    delete dominantColorCache[key];
  });
}

/**
 * Simple hash function for URI-based color generation
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Generate a color from a hash value
 * Returns a pleasant, saturated color suitable for placeholders
 */
function generateColorFromHash(hash: number): string {
  // Use HSL color space for better color distribution
  const hue = hash % 360;
  const saturation = 65 + (hash % 20); // 65-85%
  const lightness = 45 + (hash % 15); // 45-60%
  
  // Convert HSL to RGB
  const h = hue / 360;
  const s = saturation / 100;
  const l = lightness / 100;
  
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h * 6) % 2) - 1));
  const m = l - c / 2;
  
  let r = 0, g = 0, b = 0;
  
  if (h * 6 < 1) {
    r = c; g = x; b = 0;
  } else if (h * 6 < 2) {
    r = x; g = c; b = 0;
  } else if (h * 6 < 3) {
    r = 0; g = c; b = x;
  } else if (h * 6 < 4) {
    r = 0; g = x; b = c;
  } else if (h * 6 < 5) {
    r = x; g = 0; b = c;
  } else {
    r = c; g = 0; b = x;
  }
  
  const toHex = (value: number) => {
    const hex = Math.round((value + m) * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

