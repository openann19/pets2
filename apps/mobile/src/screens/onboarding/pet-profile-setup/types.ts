/**
 * Pet Profile Setup Types
 */

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  gender: string;
  size: string;
  description: string;
  intent: string;
  personalityTags: string[];
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
}

export interface Option {
  value: string;
  label: string;
}

export const SPECIES_OPTIONS: Option[] = [
  { value: 'dog', label: '🐕 Dog' },
  { value: 'cat', label: '🐱 Cat' },
  { value: 'bird', label: '🐦 Bird' },
  { value: 'rabbit', label: '🐰 Rabbit' },
  { value: 'other', label: '🐾 Other' },
];

export const SIZE_OPTIONS: Option[] = [
  { value: 'tiny', label: 'Tiny (0-10 lbs)' },
  { value: 'small', label: 'Small (10-25 lbs)' },
  { value: 'medium', label: 'Medium (25-55 lbs)' },
  { value: 'large', label: 'Large (55-85 lbs)' },
  { value: 'extra-large', label: 'Extra Large (85+ lbs)' },
];

export const INTENT_OPTIONS: Option[] = [
  { value: 'adoption', label: 'Adoption' },
  { value: 'mating', label: 'Mating' },
  { value: 'playdate', label: 'Playdate' },
  { value: 'all', label: 'Open to All' },
];

export const PERSONALITY_TAGS: string[] = [
  'friendly',
  'energetic',
  'playful',
  'calm',
  'shy',
  'protective',
  'good-with-kids',
  'good-with-pets',
  'trained',
  'house-trained',
];
