/**
 * Shared Element utilities - stub implementation
 */

export const SHARED_ELEMENT_IDS = {
  PET_IMAGE: 'pet-image',
  PET_NAME: 'pet-name',
} as const;

export async function prefetchPetImage(url: string): Promise<void> {
  // Stub implementation
  return Promise.resolve();
}
