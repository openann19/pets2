import type { User, Pet } from '../types/models';

/**
 * Determines the other user in a match (not the current user)
 */
export const _getOtherUser = (): User => {
  // Return a mock user
  return {
    _id: 'mock-user-id',
    email: 'mock@example.com',
    firstName: 'Mock',
    lastName: 'User'
  } as User;
};

/**
 * Determines the other pet in a match (not owned by current user)
 */
export const _getOtherPet = (): Pet => {
  // Return a mock pet
  return {
    _id: 'mock-pet-id',
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    owner: 'mock-owner-id',
    age: 3,
    photos: ['https://example.com/pet.jpg']
  } as Pet;
};

/**
 * Determines the current user's pet in a match
 */
export const _getCurrentUserPet = (): Pet => {
  // Return a mock pet for current user
  return {
    _id: 'current-pet-id',
    name: 'Max',
    species: 'cat',
    breed: 'Tabby',
    owner: 'current-user-id',
    age: 2,
    photos: ['https://example.com/max.jpg']
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
