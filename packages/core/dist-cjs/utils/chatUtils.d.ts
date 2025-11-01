import type { User, Pet } from '../types/models';
/**
 * Determines the other user in a match (not the current user)
 */
export declare const _getOtherUser: () => User;
/**
 * Determines the other pet in a match (not owned by current user)
 */
export declare const _getOtherPet: () => Pet;
/**
 * Determines the current user's pet in a match
 */
export declare const _getCurrentUserPet: () => Pet;
/**
 * Gets the list of typing users (excluding current user)
 */
export declare const _getTypingUsers: (isTyping: Record<string, boolean>, currentUserId: string, otherUser: User) => string[];
