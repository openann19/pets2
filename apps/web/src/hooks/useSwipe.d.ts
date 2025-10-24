import { Pet, SwipeResult } from '../types';
interface UseSwipeReturn {
    pets: Pet[];
    isLoading: boolean;
    error: string | null;
    hasMore: boolean;
    loadPets: () => Promise<void>;
    swipePet: (petId: string, action: 'like' | 'pass' | 'superlike') => Promise<SwipeResult>;
    refreshPets: () => Promise<void>;
}
export declare const useSwipe: () => UseSwipeReturn;
export {};
//# sourceMappingURL=useSwipe.d.ts.map