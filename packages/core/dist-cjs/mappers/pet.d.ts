/**
 * Legacy pet shape from web API responses
 */
export interface LegacyWebPet {
    id: string;
    ownerId?: string;
    name: string;
    species?: string;
    breed: string;
    age: number;
    gender?: 'male' | 'female';
    size?: string;
    weight?: number;
    photos?: Array<string | {
        url: string;
        isPrimary?: boolean;
    }>;
    description?: string;
    temperament?: string[];
    location?: {
        latitude?: number;
        longitude?: number;
    } | {
        lat?: number;
        lon?: number;
        coordinates?: [number, number];
    };
}
/**
 * Convert legacy web pet to core Pet type
 */
import type { Pet } from '../types';
export declare function toCorePet(legacy: LegacyWebPet): Pet;
/**
 * Convert array of legacy pets to core Pet types
 */
export declare function toCorePets(legacyPets: LegacyWebPet[]): Pet[];
/**
 * Convert core Pet to legacy format (for API requests)
 */
export declare function toLegacyPet(pet: Pet): LegacyWebPet;
