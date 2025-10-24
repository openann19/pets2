import { Match, User } from '../types';
/**
 * Determines the other user in a match (not the current user)
 */
export const getOtherUser = (match, currentUserId) => {
    return match.user1._id === currentUserId ? match.user2 : match.user1;
};
/**
 * Determines the other pet in a match (not owned by current user)
 */
export const getOtherPet = (match, currentUserId) => {
    return match.pet1.owner === currentUserId ? match.pet2 : match.pet1;
};
/**
 * Determines the current user's pet in a match
 */
export const getCurrentUserPet = (match, currentUserId) => {
    return match.pet1.owner === currentUserId ? match.pet1 : match.pet2;
};
/**
 * Gets the list of typing users (excluding current user)
 */
export const getTypingUsers = (isTyping, currentUserId, otherUser) => {
    return Object.keys(isTyping)
        .filter(userId => isTyping[userId] && userId !== currentUserId)
        .map(userId => {
        if (userId === otherUser._id) {
            return otherUser.firstName;
        }
        return 'Someone';
    });
};
//# sourceMappingURL=chatUtils.js.map