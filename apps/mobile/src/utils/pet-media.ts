import type { Pet } from '@pawfectmatch/core';

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

export const extractPetImageUrls = (pet: Pet | Record<string, unknown>): string[] => {
  const photos = (pet as any)?.photos;
  if (!Array.isArray(photos)) {
    return [];
  }

  const urls = photos
    .map((photo: unknown) => {
      if (isNonEmptyString(photo)) return photo;
      if (photo && typeof photo === 'object') {
        const candidate =
          (photo as { url?: string }).url ??
          (photo as { secureUrl?: string }).secureUrl ??
          (photo as { uri?: string }).uri ??
          (photo as { original?: string }).original ??
          (photo as { preview?: string }).preview;
        if (isNonEmptyString(candidate)) {
          return candidate;
        }
      }
      return null;
    })
    .filter(isNonEmptyString);

  return Array.from(new Set(urls));
};

export const extractPetTags = (pet: Pet | Record<string, unknown>): string[] => {
  if (Array.isArray((pet as any)?.tags)) {
    return (pet as any).tags.filter(isNonEmptyString);
  }
  if (Array.isArray((pet as any)?.personalityTags)) {
    return (pet as any).personalityTags.filter(isNonEmptyString);
  }
  if (Array.isArray((pet as any)?.traits)) {
    return (pet as any).traits.filter(isNonEmptyString);
  }
  return [];
};
