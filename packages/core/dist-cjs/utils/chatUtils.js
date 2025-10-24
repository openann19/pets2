"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getTypingUsers = exports._getCurrentUserPet = exports._getOtherPet = exports._getOtherUser = void 0;
/**
 * Determines the other user in a match (not the current user)
 */
const _getOtherUser = () => {
    // Return a mock user
    return {
        _id: 'mock-user-id',
        email: 'mock@example.com',
        firstName: 'Mock',
        lastName: 'User'
    };
};
exports._getOtherUser = _getOtherUser;
/**
 * Determines the other pet in a match (not owned by current user)
 */
const _getOtherPet = () => {
    // Return a mock pet
    return {
        _id: 'mock-pet-id',
        name: 'Buddy',
        species: 'dog',
        breed: 'Golden Retriever',
        owner: 'mock-owner-id',
        age: 3,
        photos: ['https://example.com/pet.jpg']
    };
};
exports._getOtherPet = _getOtherPet;
/**
 * Determines the current user's pet in a match
 */
const _getCurrentUserPet = () => {
    // Return a mock pet for current user
    return {
        _id: 'current-pet-id',
        name: 'Max',
        species: 'cat',
        breed: 'Tabby',
        owner: 'current-user-id',
        age: 2,
        photos: ['https://example.com/max.jpg']
    };
};
exports._getCurrentUserPet = _getCurrentUserPet;
/**
 * Gets the list of typing users (excluding current user)
 */
const _getTypingUsers = (isTyping, currentUserId, otherUser) => {
    return Object.keys(isTyping)
        .filter(userId => isTyping[userId] === true && userId !== currentUserId)
        .map(userId => {
        if (userId === otherUser._id) {
            return otherUser.firstName;
        }
        return 'Someone';
    });
};
exports._getTypingUsers = _getTypingUsers;
//# sourceMappingURL=chatUtils.js.map