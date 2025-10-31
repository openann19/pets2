import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '../services/logger';
import { useAuthStore } from '../stores/useAuthStore';
import { useFilterStore } from '../store/filterStore';
import type { Pet, PetFilters } from '../types/api';
import { matchesAPI } from '../services/api';
import { usePerformanceMonitor } from './optimization/usePerformanceMonitor';
import { useRequestBatching } from './optimization/useRequestBatching';

export interface SwipeFilters {
  species: string;
  breed: string;
  ageMin: number;
  ageMax: number;
  distance: number;
}

export interface SwipeData {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  filters: SwipeFilters;
  showFilters: boolean;
  showMatchModal: boolean;
  matchedPet: Pet | null;
}

export interface SwipeActions {
  loadPets: () => Promise<void>;
  handleSwipe: (action: 'like' | 'pass' | 'superlike') => Promise<void>;
  handleButtonSwipe: (action: 'like' | 'pass' | 'superlike') => void;
  setCurrentIndex: (index: number) => void;
  setShowFilters: (show: boolean) => void;
  setShowMatchModal: (show: boolean) => void;
  setMatchedPet: (pet: Pet | null) => void;
  setFilters: (filters: SwipeFilters) => void;
  refreshPets: () => void;
}

export function useSwipeData(): SwipeData & SwipeActions {
  const { user } = useAuthStore();
  const { filters: filterStoreFilters, setFilters: setFilterStoreFilters } = useFilterStore();

  // Performance monitoring (automatically tracks and logs in background)
  usePerformanceMonitor({
    name: 'SwipeData',
    logMetrics: __DEV__,
    thresholds: { minFrameRate: 55, maxInteractionDelay: 100 },
  });

  // Request batching for API calls
  const { batchRequest } = useRequestBatching({
    maxWaitTime: 50,
    maxBatchSize: 10,
    dedupeWindow: 1000,
  });

  // State
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);

  // Convert filter store to local filters
  const filters: SwipeFilters = {
    species: filterStoreFilters.species ?? '',
    breed: filterStoreFilters.breed ?? '',
    ageMin: filterStoreFilters.minAge ?? 0,
    ageMax: filterStoreFilters.maxAge ?? 20,
    distance: filterStoreFilters.maxDistance ?? 50,
  };

  // Load pets from API with request batching
  const loadPets = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Real API call with filters - build object conditionally to avoid undefined
      const apiFilters: PetFilters = {};

      if (filters.species) apiFilters.species = filters.species;
      if (filters.breed) apiFilters.breed = filters.breed;
      if (filters.ageMin > 0) apiFilters.minAge = filters.ageMin;
      if (filters.ageMax < 20) apiFilters.maxAge = filters.ageMax;
      apiFilters.maxDistance = filters.distance;

      // Use request batching for deduplication
      const filterKey = JSON.stringify(apiFilters);
      const fetchedPets = await batchRequest(
        `pets-${filterKey}`,
        () => matchesAPI.getPets(apiFilters),
      );

      setPets(fetchedPets);
      setCurrentIndex(0);

      logger.info('Pets loaded successfully', {
        count: fetchedPets.length,
        filters,
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const errorMessage = err instanceof Error ? err.message : 'Failed to load pets';
      setError(errorMessage);
      logger.error('Failed to load pets', { error });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, batchRequest]);

  // Handle swipe actions with optimistic updates
  const handleSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      const currentPet = pets[currentIndex];
      const userPetId = user?.pets?.[0] || user?.activePetId;
      if (!currentPet || !userPetId) return;

      // Optimistic update: Move to next pet immediately
      const originalIndex = currentIndex;
      const originalPets = [...pets];
      setCurrentIndex((prev) => prev + 1);

      try {
        // Real API call for swipe action with request batching
        if (action === 'like' || action === 'superlike') {
          const matchKey = `match-${userPetId}-${currentPet._id}`;
          const match = await batchRequest(
            matchKey,
            () => matchesAPI.createMatch(userPetId, currentPet._id),
          );

          // Check if it's a mutual match (match object exists means mutual match)
          if (match) {
            setMatchedPet(currentPet);
            setShowMatchModal(true);
          }
        }
        // For 'pass', we don't need to call API (or implement a pass endpoint if needed)

        // Load more pets when running low (background)
        if (originalIndex >= pets.length - 2) {
          // Use setTimeout to prevent blocking UI
          setTimeout(() => {
            void loadPets();
          }, 100);
        }

        logger.info('Swipe action completed', {
          action,
          petId: currentPet._id,
          isMatch: action === 'like' || action === 'superlike',
        });
      } catch (err: unknown) {
        // Rollback optimistic update on error
        setCurrentIndex(originalIndex);
        setPets(originalPets);
        const error = err instanceof Error ? err : new Error(String(err));
        const errorMessage = err instanceof Error ? err.message : 'Failed to process swipe';
        
        // Try to extract structured error from response
        // The API client may preserve error structure in error response
        let errorData: any = err;
        
        // Check if error has response data (from axios or fetch)
        if (err && typeof err === 'object') {
          const errObj = err as any;
          // Check for axios error structure
          if (errObj.response?.data) {
            errorData = errObj.response.data;
          } else if (errObj.data) {
            errorData = errObj.data;
          }
        }
        
        // Check if error is SWIPE_LIMIT_EXCEEDED
        if (errorData?.code === 'SWIPE_LIMIT_EXCEEDED' || errorMessage.includes('swipe limit')) {
          // Throw structured error for modal handling
          throw {
            code: 'SWIPE_LIMIT_EXCEEDED',
            message: errorData?.message || errorMessage,
            currentLimit: errorData?.currentLimit || 5,
            usedToday: errorData?.usedToday || 5,
          };
        }
        
        Alert.alert('Error', errorMessage);
        logger.error('Swipe action failed', { error, errorData });
      }
    },
    [pets, currentIndex, loadPets, user, batchRequest],
  );

  // Handle button swipe (immediate)
  const handleButtonSwipe = useCallback(
    (action: 'like' | 'pass' | 'superlike') => {
      void handleSwipe(action);
    },
    [handleSwipe],
  );

  // Refresh pets
  const refreshPets = useCallback(() => {
    void loadPets();
  }, [loadPets]);

  // Set filters
  const setFilters = useCallback(
    (newFilters: SwipeFilters) => {
      setFilterStoreFilters({
        species: newFilters.species,
        breed: newFilters.breed,
        minAge: newFilters.ageMin,
        maxAge: newFilters.ageMax,
        maxDistance: newFilters.distance,
      });
    },
    [setFilterStoreFilters],
  );

  // Load pets on component mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  return {
    // Data
    pets,
    isLoading,
    error,
    currentIndex,
    filters,
    showFilters,
    showMatchModal,
    matchedPet,

    // Actions
    loadPets,
    handleSwipe,
    handleButtonSwipe,
    setCurrentIndex,
    setShowFilters,
    setShowMatchModal,
    setMatchedPet,
    setFilters,
    refreshPets,
  };
}
