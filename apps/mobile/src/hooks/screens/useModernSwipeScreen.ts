/**
 * useModernSwipeScreen Hook
 * Manages ModernSwipeScreen state and business logic
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { useAuthStore, type Pet, type PetFilters } from '@pawfectmatch/core';
import { matchesAPI } from '../../services/api';

interface UseModernSwipeScreenReturn {
  // Data
  pets: Pet[];
  currentPet: Pet | null;
  filters: PetFilters;

  // State
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  showMatchModal: boolean;
  matchedPet: Pet | null;
  showFilters: boolean;

  // Actions
  setCurrentIndex: (index: number) => void;
  setShowMatchModal: (show: boolean) => void;
  setShowFilters: (show: boolean) => void;
  setFilters: (filters: PetFilters) => void;
  loadPets: () => Promise<void>;
  swipePet: (petId: string, action: 'like' | 'pass' | 'superlike') => Promise<any>;
  handleSwipeRight: (pet: Pet) => void;
  handleSwipeLeft: (pet: Pet) => void;
  handleSwipeUp: (pet: Pet) => void;
  handleButtonSwipe: (action: 'like' | 'pass' | 'superlike') => void;
}

export const useModernSwipeScreen = (): UseModernSwipeScreenReturn => {
  const { user } = useAuthStore();

  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState<PetFilters>({
    breed: '',
    species: '',
    size: '',
    maxDistance: 25,
  });

  // Load pets function
  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const realPets = await matchesAPI.getPets(filters);
      setPets(realPets);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load pets. Please check your connection.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Handle like action
  const handleLike = useCallback(
    async (pet: Pet) => {
      try {
        if (user?._id && pet._id) {
          const match = await matchesAPI.createMatch(user._id, pet._id);

          if (match) {
            // Check if it's a mutual match
            setShowMatchModal(true);
            setMatchedPet(pet);
          }

          return match;
        }
        return null;
      } catch (error) {
        logger.error('Error liking pet', { error });
        return null;
      }
    },
    [user],
  );

  // Handle pass action
  const handlePass = useCallback(async (pet: Pet) => {
    try {
      logger.info('Pet passed', { petId: pet._id });
      return null;
    } catch (error) {
      logger.error('Error passing pet', { error });
      return null;
    }
  }, []);

  // Handle super like
  const handleSuperLike = useCallback(
    async (pet: Pet) => {
      try {
        const result = await handleLike(pet);

        if (result) {
          Alert.alert('Super Like Sent!', `${pet.name} will see that you super liked them!`);
        }

        return result;
      } catch (error) {
        logger.error('Error super liking pet', { error });
        return null;
      }
    },
    [handleLike],
  );

  // Swipe pet function
  const swipePet = useCallback(
    async (petId: string, action: 'like' | 'pass' | 'superlike') => {
      try {
        const pet = pets.find((p) => p._id === petId);
        if (!pet) return null;

        switch (action) {
          case 'like':
            return await handleLike(pet);
          case 'pass':
            return await handlePass(pet);
          case 'superlike':
            return await handleSuperLike(pet);
          default:
            return null;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        Alert.alert('Error', `Failed to process swipe: ${errorMessage}`);
        return null;
      }
    },
    [pets, handleLike, handlePass, handleSuperLike],
  );

  // Swipe handlers
  const handleSwipeRight = useCallback(
    (pet: Pet) => {
      swipePet(pet._id, 'like');
      setCurrentIndex((prev) => Math.min(prev + 1, pets.length - 1));
    },
    [swipePet, pets.length],
  );

  const handleSwipeLeft = useCallback(
    (pet: Pet) => {
      swipePet(pet._id, 'pass');
      setCurrentIndex((prev) => Math.min(prev + 1, pets.length - 1));
    },
    [swipePet, pets.length],
  );

  const handleSwipeUp = useCallback(
    (pet: Pet) => {
      swipePet(pet._id, 'superlike');
      setCurrentIndex((prev) => Math.min(prev + 1, pets.length - 1));
    },
    [swipePet, pets.length],
  );

  // Handle button swipe
  const handleButtonSwipe = useCallback(
    (action: 'like' | 'pass' | 'superlike') => {
      const currentPet = pets[currentIndex];
      if (!currentPet) return;

      switch (action) {
        case 'like':
          handleSwipeRight(currentPet);
          break;
        case 'pass':
          handleSwipeLeft(currentPet);
          break;
        case 'superlike':
          handleSwipeUp(currentPet);
          break;
      }
    },
    [pets, currentIndex, handleSwipeRight, handleSwipeLeft, handleSwipeUp, swipePet],
  );

  // Load pets on mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const currentPet = pets[currentIndex] ?? null;

  return {
    // Data
    pets,
    currentPet,
    filters,

    // State
    isLoading,
    error,
    currentIndex,
    showMatchModal,
    matchedPet,
    showFilters,

    // Actions
    setCurrentIndex,
    setShowMatchModal,
    setShowFilters,
    setFilters,
    loadPets,
    swipePet,
    handleSwipeRight,
    handleSwipeLeft,
    handleSwipeUp,
    handleButtonSwipe,
  };
};
