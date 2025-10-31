/**
 * Shared Element IDs and Utilities
 * Provides constants and utilities for shared element transitions
 */

/**
 * Shared element ID constants for transitions
 */
export const SHARED_ELEMENT_IDS = {
  petImage: 'pet-image',
  petName: 'pet-name',
  petAge: 'pet-age',
  petLocation: 'pet-location',
  petBio: 'pet-bio',
  petPhoto: 'pet-photo',
  matchCard: 'match-card',
  profileImage: 'profile-image',
  chatImage: 'chat-image',
} as const;

/**
 * Prefetch pet image for smooth transitions
 * @param imageUri - URI of the pet image to prefetch
 */
export async function prefetchPetImage(imageUri: string): Promise<void> {
  try {
    // Use expo-image or react-native-fast-image prefetch
    if (typeof imageUri === 'string' && imageUri.startsWith('http')) {
      // Prefetch logic would go here
      // For now, this is a placeholder
      await Promise.resolve();
    }
  } catch (error) {
    // Non-critical - prefetch failure shouldn't block UI
    console.warn('Failed to prefetch pet image:', error);
  }
}
