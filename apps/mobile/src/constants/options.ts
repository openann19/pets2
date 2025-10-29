/**
 * Constants for pet preferences and options
 */

export const SPECIES_OPTIONS = [
  { label: 'Dog', value: 'dog' },
  { label: 'Cat', value: 'cat' },
  { label: 'Bird', value: 'bird' },
  { label: 'Rabbit', value: 'rabbit' },
  { label: 'Hamster', value: 'hamster' },
  { label: 'Fish', value: 'fish' },
  { label: 'Reptile', value: 'reptile' },
  { label: 'Other', value: 'other' },
] as const;

export const INTENT_OPTIONS = [
  { label: 'Find a Match', value: 'match' },
  { label: 'Browse Pets', value: 'browse' },
  { label: 'Connect with Pet Owners', value: 'connect' },
  { label: 'Adopt a Pet', value: 'adopt' },
] as const;

export const PERSONALITY_TAGS = [
  'playful',
  'calm',
  'energetic',
  'independent',
  'affectionate',
  'shy',
  'friendly',
  'curious',
] as const;
