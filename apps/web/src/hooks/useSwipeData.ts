/**
 * useSwipeData Hook - Web Version
 * Matches mobile useSwipeData exactly
 */

'use client';

import { useCallback, useEffect, useState } from 'react';
import { logger } from '@pawfectmatch/core';
import { useAuthStore } from '@/lib/auth-store';
import apiClient from '@/lib/api-client';

export interface SwipeFilters {
  species: string;
  breed: string;
  ageMin: number;
  ageMax: number;
  distance: number;
}

export interface SwipeData {
  pets: any[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  filters: SwipeFilters;
  showFilters: boolean;
  showMatchModal: boolean;
  matchedPet: any | null;
}

export interface SwipeActions {
  loadPets: () => Promise<void>;
  handleSwipe: (action: 'like' | 'pass' | 'superlike') => Promise<void>;
  handleButtonSwipe: (action: 'like' | 'pass' | 'superlike') => void;
  setCurrentIndex: (index: number) => void;
  setShowFilters: (show: boolean) => void;
  setShowMatchModal: (show: boolean) => void;
  setMatchedPet: (pet: any | null) => void;
  setFilters: (filters: SwipeFilters) => void;
  refreshPets: () => void;
}

export function useSwipeData(): SwipeData & SwipeActions {
  const { user } = useAuthStore();

  // State
  const [pets, setPets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<any | null>(null);

  // Default filters
  const filters: SwipeFilters = {
    species: '',
    breed: '',
    ageMin: 0,
    ageMax: 20,
    distance: 50,
  };

  // Load pets from API
  const loadPets = useCallback(async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedPets = await apiClient.getPets({
        ...filters,
        maxDistance: filters.distance,
      });

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
  }, [user]);

  // Handle swipe actions
  const handleSwipe = useCallback(
    async (action: 'like' | 'pass' | 'superlike') => {
      const currentPet = pets[currentIndex];
      const userPetId = user?.pets?.[0] || (user && 'activePetId' in user ? user.activePetId : undefined);
      if (!currentPet || !userPetId) return;

      try {
        // Real API call for swipe action
        if (action === 'like' || action === 'superlike') {
          const match = await apiClient.createMatch(userPetId, currentPet._id || currentPet.id);

          // Check if it's a mutual match
          if (match) {
            setMatchedPet(currentPet);
            setShowMatchModal(true);
          }
        }

        // Move to next pet
        setCurrentIndex((prev) => prev + 1);

        // Load more pets when running low
        if (currentIndex >= pets.length - 2) {
          void loadPets();
        }

        logger.info('Swipe action completed', {
          action,
          petId: currentPet._id || currentPet.id,
          isMatch: action === 'like' || action === 'superlike',
        });
      } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error(String(err));
        const errorMessage = err instanceof Error ? err.message : 'Failed to process swipe';
        
        // Try to extract structured error from response
        let errorData: unknown = err;
        
        if (err && typeof err === 'object') {
          const errObj = err as { response?: { data?: unknown }; data?: unknown };
          if (errObj.response?.data) {
            errorData = errObj.response.data;
          } else if (errObj.data) {
            errorData = errObj.data;
          }
        }
        
        // Check if error is SWIPE_LIMIT_EXCEEDED
        const errorObj = errorData && typeof errorData === 'object' ? errorData as Record<string, unknown> : null;
        const errorCode = errorObj?.code;
        if (errorCode === 'SWIPE_LIMIT_EXCEEDED' || errorMessage.includes('swipe limit')) {
          throw {
            code: 'SWIPE_LIMIT_EXCEEDED',
            message: (errorObj?.message as string | undefined) || errorMessage,
            currentLimit: (errorObj?.currentLimit as number | undefined) || 5,
            usedToday: (errorObj?.usedToday as number | undefined) || 5,
          };
        }
        
        logger.error('Swipe action failed', { error, errorData });
        throw error;
      }
    },
    [pets, currentIndex, loadPets, user],
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
      // Store filters (implement filter store if needed)
    },
    [],
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

