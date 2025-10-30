export interface Pet {
  id: string;
  name: string;
  photos?: { uri: string }[];
  tags?: string[];
  personalityTags?: string[];
  traits?: string[];
}

export const getPrimaryPhoto = (pet: Pet): { uri: string } | null =>
  pet.photos?.[0] ?? null;

export const allTags = (pet: Pet): string[] => [
  ...(pet.tags ?? []),
  ...(pet.personalityTags ?? []),
  ...(pet.traits ?? []),
];
