/**
 * Shared Utility Functions
 * Platform-agnostic logic for both web and mobile
 */
import type { Pet, User } from '../types';
export declare function calculateAge(dateOfBirth: string): number;
export declare function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number;
export declare function calculateCompatibilityScore(pet1: Pet, pet2: Pet): number;
export declare function formatDisplayName(user: User): string;
export declare function formatPetAge(age: number): string;
export declare function isValidEmail(email: string): boolean;
export declare function generateId(length?: number): string;
export declare function formatRelativeTime(date: string): string;
//# sourceMappingURL=index.d.ts.map