/**
 * Pet test fixtures
 */

export const testPets = {
  dog: {
    id: 'pet-dog-1',
    name: 'Buddy',
    type: 'dog',
    breed: 'Golden Retriever',
    age: 3,
    gender: 'male',
    size: 'large',
    ownerId: 'user-1',
    photos: [
      'https://example.com/pets/buddy1.jpg',
      'https://example.com/pets/buddy2.jpg',
    ],
    bio: 'Friendly and loves to play fetch!',
    vaccinated: true,
    neutered: true,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: 'high',
    createdAt: '2024-01-15T00:00:00Z',
  },

  cat: {
    id: 'pet-cat-1',
    name: 'Whiskers',
    type: 'cat',
    breed: 'Persian',
    age: 2,
    gender: 'female',
    size: 'small',
    ownerId: 'user-1',
    photos: [
      'https://example.com/pets/whiskers1.jpg',
    ],
    bio: 'Loves naps and gentle pets',
    vaccinated: true,
    neutered: true,
    goodWithKids: true,
    goodWithPets: false,
    energyLevel: 'low',
    createdAt: '2024-02-01T00:00:00Z',
  },

  puppy: {
    id: 'pet-puppy-1',
    name: 'Max',
    type: 'dog',
    breed: 'Labrador',
    age: 0.5,
    gender: 'male',
    size: 'medium',
    ownerId: 'user-premium',
    photos: [
      'https://example.com/pets/max1.jpg',
      'https://example.com/pets/max2.jpg',
      'https://example.com/pets/max3.jpg',
    ],
    bio: 'Playful puppy looking for friends!',
    vaccinated: true,
    neutered: false,
    goodWithKids: true,
    goodWithPets: true,
    energyLevel: 'very-high',
    createdAt: '2024-05-01T00:00:00Z',
  },

  incomplete: {
    id: 'pet-incomplete',
    name: 'Unknown',
    type: 'dog',
    breed: null,
    age: null,
    gender: 'unknown',
    size: null,
    ownerId: 'user-unverified',
    photos: [],
    bio: null,
    vaccinated: null,
    neutered: null,
    goodWithKids: null,
    goodWithPets: null,
    energyLevel: null,
    createdAt: '2024-06-01T00:00:00Z',
  },
};

export const testPetList = Object.values(testPets);
