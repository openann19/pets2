import { useState, useCallback } from 'react';
import { petsAPI } from '../services/api';
import type { Pet, SwipeResult } from '../lib/types/swipe';
import { logger } from '../services/logger';

interface UseSwipeReturn {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadPets: () => Promise<void>;
  swipePet: (petId: string, action: 'like' | 'pass' | 'superlike') => Promise<SwipeResult>;
  refreshPets: () => Promise<void>;
}

export const useSwipe = (): UseSwipeReturn => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const loadPets = useCallback(async () => {
        if (isLoading || !hasMore)
            return;
        try {
            setIsLoading(true);
            setError(null);
            const response = await petsAPI.discoverPets({
                page,
                limit: 10,
            });
            if (response.data?.pets) {
                const newPets = response.data.pets;
                setPets(prev => {
                    // Remove duplicates
                    const existingIds = new Set(prev.map(p => p._id));
                    const uniqueNewPets = newPets.filter(p => !existingIds.has(p._id));
                    return [...prev, ...uniqueNewPets];
                });
                setHasMore(response.data.pagination?.hasMore ?? false);
                setPage(prev => prev + 1);
            }
            else {
                setHasMore(false);
            }
        }
        catch (err) {
            logger.error('Failed to load pets', err instanceof Error ? err : new Error('Unknown error'), { page });
            setError('Failed to load pets. Please try again.');
        }
        finally {
            setIsLoading(false);
        }
    }, [page, isLoading, hasMore]);
    const swipePet = useCallback(async (petId: string, action: 'like' | 'pass' | 'superlike') => {
        try {
            const response = await petsAPI.swipePet(petId, action);
            // Remove the swiped pet from the list
            setPets(prev => prev.filter(p => p._id !== petId));
            return response.data || { isMatch: false, action };
        }
        catch (err) {
            logger.error('Failed to swipe pet', err instanceof Error ? err : new Error('Unknown error'), { petId, action });
            throw new Error('Failed to process swipe. Please try again.');
        }
    }, []);
    const refreshPets = useCallback(async () => {
        setPets([]);
        setPage(1);
        setHasMore(true);
        setError(null);
        await loadPets();
    }, []);
    return {
        pets,
        isLoading,
        error,
        hasMore,
        loadPets,
        swipePet,
        refreshPets,
    };
};
//# sourceMappingURL=useSwipe.js.map