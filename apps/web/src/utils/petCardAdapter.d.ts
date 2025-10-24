/**
 * 🔄 Pet Card Data Adapter
 * Converts existing Pet type to new PetCardData structure for SwipeCardV2
 */
import type { PetCardData } from '@/components/Pet/SwipeCardV2';
import type { Pet } from '@/types';
/**
 * Convert Pet to PetCardData for SwipeCardV2
 */
export declare const adaptPetToCardData: (pet: Pet) => PetCardData;
/**
 * Convert multiple Pet objects to PetCardData array
 */
export declare const adaptPetsToCardData: (pets: Pet[]) => PetCardData[];
/**
 * Mock data generator for testing
 */
export declare const generateMockPetCardData: () => PetCardData;
//# sourceMappingURL=petCardAdapter.d.ts.map