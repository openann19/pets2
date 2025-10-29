import { describe, test, expect } from '@jest/globals';
import { AIMatchingAlgorithm, type PetProfile, type UserPreferences } from '../algorithm';

describe('AIMatchingAlgorithm', () => {
  const algo = new AIMatchingAlgorithm();

  const pet: PetProfile = {
    _id: 'p1',
    name: 'Buddy',
    species: 'dog',
    breed: 'labrador',
    age: 3,
    gender: 'male',
    size: 'large',
    temperament: ['friendly', 'energetic', 'smart'],
    activityLevel: 8,
    specialNeeds: [],
    medicalHistory: [],
    location: { latitude: 37.7749, longitude: -122.4194, city: 'SF', state: 'CA' },
    photos: ['a.jpg'],
    bio: 'Great dog',
    tags: ['popular'],
    preferences: { otherPets: true, children: true, apartment: false, yard: true },
    ownerExperience: 'intermediate',
    timeCommitment: 'medium',
  };

  const prefs: UserPreferences = {
    species: ['dog'],
    breedPreferences: ['golden_retriever', 'labrador'],
    ageRange: [1, 6],
    genderPreference: 'any',
    sizePreference: ['medium', 'large'],
    temperamentPreferences: ['friendly', 'smart', 'calm'],
    activityLevelRange: [5, 9],
    specialNeedsTolerance: true,
    locationRadius: 50,
    experienceLevel: 'intermediate',
    timeCommitment: 'medium',
    lifestyleFactors: {
      hasOtherPets: true,
      hasChildren: true,
      apartmentLiving: false,
      hasYard: true,
    },
  };

  test('calculates match score with detailed breakdown and insights', () => {
    const result = algo.calculateMatchScore(pet, prefs);

    expect(Number.isFinite(result.compatibilityScore)).toBe(true);
    expect(result.compatibilityScore).toBeGreaterThan(0);

    // Breakdown has all categories
    expect(Object.keys(result.breakdown)).toEqual(
      expect.arrayContaining([
        'species',
        'breed',
        'age',
        'temperament',
        'activity',
        'location',
        'lifestyle',
        'specialNeeds',
      ]),
    );

    // Each breakdown value is in a reasonable number range
    for (const key of Object.keys(result.breakdown) as (keyof typeof result.breakdown)[]) {
      expect(Number.isFinite(result.breakdown[key])).toBe(true);
    }

    // Reasons/concerns/recommendations are arrays (not necessarily non-empty)
    expect(Array.isArray(result.reasons)).toBe(true);
    expect(Array.isArray(result.concerns)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
  });
});
