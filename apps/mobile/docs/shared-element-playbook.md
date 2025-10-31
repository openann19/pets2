/**
 * 📘 SHARED-ELEMENT PLAYBOOK
 * 
 * Rules for implementing shared-element transitions:
 * 
 * ✅ DO:
 * - Use for ONE hero flow: Card → Details (pet card to pet profile)
 * - Prefetch destination image before transition starts
 * - Handle interrupted gestures gracefully (clean cancellation)
 * - Measure success as "no layout reflow" (+/- 1px)
 * - Test on both iOS and Android
 * 
 * ❌ DON'T:
 * - Nest within swipeable lists (causes virtualization pop-in)
 * - Use in modals without thorough testing
 * - Overuse (max 2-3 shared elements per screen)
 * - Use for complex nested navigations
 * 
 * Implementation Steps:
 * 
 * 1. Install react-native-shared-element (if not already)
 * 2. Wrap source element (card) with SharedElement
 * 3. Wrap destination element (profile image) with SharedElement
 * 4. Use matching sharedId
 * 5. Prefetch destination image
 * 6. Handle gesture cancellation
 * 7. Measure layout reflow
 * 
 * Success Criteria:
 * - No layout reflow during transition (+/- 1px tolerance)
 * - Smooth 60fps transition
 * - Graceful cancellation on back swipe
 * - Image appears without pop-in
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Shared Element Configuration
 * 
 * Defines shared element IDs and transition settings
 */
export const SHARED_ELEMENT_CONFIG = {
  /**
   * Pet card image → Pet profile hero image
   */
  petImage: {
    id: 'pet-image',
    resizeMode: 'cover' as const,
    animationDuration: 300,
  },
  
  /**
   * Pet card title → Pet profile name
   */
  petName: {
    id: 'pet-name',
    animationDuration: 240,
  },
} as const;

/**
 * Prefetch destination image before transition
 * 
 * @param imageUri - Image URI to prefetch
 * @returns Promise that resolves when image is cached
 */
export async function prefetchPetImage(imageUri: string): Promise<void> {
  // Use expo-image prefetch or react-native-fast-image prefetch
  // This ensures image is ready before transition starts
  try {
    // TODO: Implement actual prefetch logic
    // await Image.prefetch(imageUri);
    await Promise.resolve();
  } catch (error) {
    console.warn('Failed to prefetch pet image:', error);
    // Don't block transition if prefetch fails
  }
}

/**
 * Measure layout reflow during transition
 * 
 * Returns true if layout change is within tolerance (+/- 1px)
 */
export function measureLayoutReflow(
  sourceLayout: { x: number; y: number; width: number; height: number },
  destLayout: { x: number; y: number; width: number; height: number },
  tolerance = 1,
): boolean {
  const dx = Math.abs(sourceLayout.x - destLayout.x);
  const dy = Math.abs(sourceLayout.y - destLayout.y);
  const dw = Math.abs(sourceLayout.width - destLayout.width);
  const dh = Math.abs(sourceLayout.height - destLayout.height);
  
  return dx <= tolerance && dy <= tolerance && dw <= tolerance && dh <= tolerance;
}

/**
 * Handle interrupted gesture cancellation
 * 
 * Call this when user swipes back during transition
 */
export function handleGestureCancellation(): void {
  // Cancel any in-flight animations
  // Reset shared element state
  // Return to source screen smoothly
}

export default {
  SHARED_ELEMENT_CONFIG,
  prefetchPetImage,
  measureLayoutReflow,
  handleGestureCancellation,
};

