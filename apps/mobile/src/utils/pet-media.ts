export interface Pet {
  id?: string;
  _id?: string;
  name: string;
  photos?: { uri: string }[] | Array<{ uri: string } | string>;
  tags?: string[];
  personalityTags?: string[];
  traits?: string[];
}

export const getPrimaryPhoto = (pet: Pet): { uri: string } | null => {
  const firstPhoto = pet.photos?.[0];
  if (!firstPhoto) return null;
  if (typeof firstPhoto === 'string') return { uri: firstPhoto };
  return firstPhoto;
};

export const allTags = (pet: Pet): string[] => [
  ...(pet.tags ?? []),
  ...(pet.personalityTags ?? []),
  ...(pet.traits ?? []),
];

/**
 * Extract all image URLs from a pet object
 * Handles various photo formats (string URIs, objects with uri property)
 */
export const extractPetImageUrls = (pet: Pet): string[] => {
  if (!pet.photos || pet.photos.length === 0) return [];
  
  return pet.photos.map((photo) => {
    if (typeof photo === 'string') return photo;
    if (typeof photo === 'object' && 'uri' in photo) return photo.uri;
    return String(photo);
  }).filter((url): url is string => Boolean(url));
};

/**
 * Extract all tags from a pet object (combines tags, personalityTags, and traits)
 * Alias for allTags for consistency
 */
export const extractPetTags = (pet: Pet): string[] => allTags(pet);
