/**
 * Shared Types for PawfectMatch
 * Rule II.1: Cross-Platform Architecture - shared types in packages/core
 * Comprehensive types migrated from client/src/types
 */
// Constants
export const SPECIES_OPTIONS = [
    { value: 'dog', label: '🐕 Dog' },
    { value: 'cat', label: '🐱 Cat' },
    { value: 'bird', label: '🐦 Bird' },
    { value: 'rabbit', label: '🐰 Rabbit' },
    { value: 'other', label: '🐾 Other' },
];
export const SIZE_OPTIONS = [
    { value: 'tiny', label: 'Tiny (0-10 lbs)' },
    { value: 'small', label: 'Small (11-25 lbs)' },
    { value: 'medium', label: 'Medium (26-60 lbs)' },
    { value: 'large', label: 'Large (61-100 lbs)' },
    { value: 'extra-large', label: 'Extra Large (100+ lbs)' },
];
export const INTENT_OPTIONS = [
    { value: 'adoption', label: '🏠 Adoption' },
    { value: 'mating', label: '❤️ Mating' },
    { value: 'playdate', label: '🎾 Playdate' },
    { value: 'all', label: '🌟 All' },
];
export const PERSONALITY_TAGS = [
    'friendly', 'energetic', 'calm', 'playful', 'shy', 'protective',
    'good-with-kids', 'good-with-pets', 'good-with-strangers',
    'trained', 'house-trained', 'leash-trained', 'crate-trained',
    'vocal', 'quiet', 'independent', 'clingy', 'intelligent',
    'gentle', 'active', 'lazy', 'social', 'aggressive', 'anxious'
];
//# sourceMappingURL=index.js.map