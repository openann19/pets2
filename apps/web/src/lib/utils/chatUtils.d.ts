import { Match, User } from '../types';
/**
 * Determines the other user in a match (not the current user)
 */
export declare const getOtherUser: (match: Match, currentUserId: string) => User;
/**
 * Determines the other pet in a match (not owned by current user)
 */
export declare const getOtherPet: (match: Match, currentUserId: string) => import("..").Pet;
/**
 * Determines the current user's pet in a match
 */
export declare const getCurrentUserPet: (match: Match, currentUserId: string) => import("..").Pet;
/**
 * Gets the list of typing users (excluding current user)
 */
export declare const getTypingUsers: (isTyping: Record<string, boolean>, currentUserId: string, otherUser: User) => string[];
//# sourceMappingURL=chatUtils.d.ts.map