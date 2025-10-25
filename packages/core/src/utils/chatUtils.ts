import type { User, Pet } from '../types/models';

/**
 * Determines the other user in a match (not the current user)
 */
export const _getOtherUser = (): User => {
  // Return a mock user
  const now = new Date().toISOString();
  return {
    _id: 'mock-user-id',
    id: 'mock-user-id',
    email: 'mock@example.com',
    firstName: 'Mock',
    lastName: 'User',
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
    premium: {
      isActive: false,
      plan: 'basic',
    },
    profileComplete: false,
    subscriptionStatus: 'free',
    role: 'user',
    createdAt: now,
    updatedAt: now,
  } as User;
};

/**
 * Determines the other pet in a match (not owned by current user)
 */
export const _getOtherPet = (): Pet => {
  // Return a mock pet
  const now = new Date().toISOString();
  return {
    _id: 'mock-pet-id',
    id: 'mock-pet-id',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    owner: 'mock-owner-id',
    age: 3,
    gender: 'male',
    size: 'large',
    photos: [
      {
        url: 'https://example.com/pet.jpg',
        thumbnail: 'https://example.com/pet-thumb.jpg',
        cloudinaryId: '',
        isPrimary: true,
      },
    ],
    personalityTags: ['friendly', 'playful'],
    intent: 'adoption',
    healthInfo: {
      vaccinated: true,
      spayedNeutered: true,
      microchipped: true,
    },
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
    createdAt: now,
    updatedAt: now,
  } as Pet;
};

/**
 * Determines the current user's pet in a match
 */
export const _getCurrentUserPet = (): Pet => {
  // Return a mock pet for current user
  const now = new Date().toISOString();
  return {
    _id: 'current-pet-id',
    id: 'current-pet-id',
    name: 'Max',
    species: 'cat',
    breed: 'Tabby',
    owner: 'current-user-id',
    age: 2,
    gender: 'female',
    size: 'small',
    photos: [
      {
        url: 'https://example.com/max.jpg',
        thumbnail: 'https://example.com/max-thumb.jpg',
        cloudinaryId: '',
        isPrimary: true,
      },
    ],
    personalityTags: ['curious'],
    intent: 'playdate',
    healthInfo: {
      vaccinated: true,
      spayedNeutered: true,
      microchipped: true,
    },
    location: {
      type: 'Point',
      coordinates: [0, 0],
    },
    createdAt: now,
    updatedAt: now,
  } as Pet;
};

/**
 * Gets the list of typing users (excluding current user)
 */
export const _getTypingUsers = (
  isTyping: Record<string, boolean>,
  currentUserId: string,
  otherUser: User
): string[] => {
  return Object.keys(isTyping)
    .filter(userId => isTyping[userId] === true && userId !== currentUserId)
    .map(userId => {
      if (userId === otherUser._id) {
        return otherUser.firstName;
      }
      return 'Someone';
    });
};
