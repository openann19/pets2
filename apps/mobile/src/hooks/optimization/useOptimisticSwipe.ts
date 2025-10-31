/**
 * Optimistic Swipe Hook
 * 
 * Provides optimistic updates for swipe actions (like/pass/superlike)
 * with automatic rollback on error
 */
import { useCallback } from 'react';
import { useOptimisticUpdate } from './useOptimisticUpdate';
import { matchesAPI } from '@/services/api';
import { logger } from '@/services/logger';
import type { Pet } from '@pawfectmatch/core';

interface OptimisticSwipeOptions {
  /** Callback when swipe succeeds */
  onSuccess?: (action: 'like' | 'pass' | 'superlike', pet: Pet, match?: unknown) => void;
  /** Callback when swipe fails */
  onError?: (action: 'like' | 'pass' | 'superlike', pet: Pet, error: Error) => void;
  /** User's pet ID */
  userPetId: string;
  /** Current pets list */
  pets: Pet[];
  /** Callback to update pets list */
  setPets: (pets: Pet[]) => void;
  /** Callback to move to next pet */
  moveToNext: () => void;
}

/**
 * Hook for optimistic swipe actions
 */
export function useOptimisticSwipe({
  onSuccess,
  onError,
  userPetId,
  pets,
  setPets,
  moveToNext,
}: OptimisticSwipeOptions) {
  // Optimistic state for current swipe
  const { update: optimisticSwipe } = useOptimisticUpdate(
    { swiped: false, matched: false },
    {
      rollbackOnError: true,
    },
  );

  /**
   * Optimistically like a pet
   */
  const handleLike = useCallback(
    async (pet: Pet) => {
      // Optimistically remove pet from list
      const updatedPets = pets.filter((p) => p._id !== pet._id);
      setPets(updatedPets);
      
      // Move to next immediately
      moveToNext();

      try {
        // Update optimistic state
        await optimisticSwipe(
          { swiped: true, matched: false },
          async () => {
            // Perform actual API call
            const match = await matchesAPI.createMatch(userPetId, pet._id);
            
            if (match) {
              onSuccess?.('like', pet, match);
              return { swiped: true, matched: true };
            }
            
            onSuccess?.('like', pet);
            return { swiped: true, matched: false };
          },
        );

        // Load more pets if running low
        if (updatedPets.length <= 2) {
          // Trigger load more in background
          setTimeout(() => {
            // This would call loadPets or similar
          }, 100);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Rollback: re-add pet to list
        setPets([pet, ...updatedPets]);
        
        logger.error('Swipe like failed', { error: err, petId: pet._id });
        onError?.('like', pet, err);
        throw err;
      }
    },
    [pets, setPets, moveToNext, userPetId, optimisticSwipe, onSuccess, onError],
  );

  /**
   * Optimistically pass a pet
   */
  const handlePass = useCallback(
    async (pet: Pet) => {
      // Optimistically remove pet from list
      const updatedPets = pets.filter((p) => p._id !== pet._id);
      setPets(updatedPets);
      
      // Move to next immediately
      moveToNext();

      try {
        // Update optimistic state
        await optimisticSwipe(
          { swiped: true, matched: false },
          async () => {
            // Pass doesn't require API call in many cases
            // But if you have a pass endpoint, call it here
            // await matchesAPI.passPet(userPetId, pet._id);
            
            onSuccess?.('pass', pet);
            return { swiped: true, matched: false };
          },
        );

        // Load more pets if running low
        if (updatedPets.length <= 2) {
          setTimeout(() => {
            // Trigger load more
          }, 100);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Rollback: re-add pet to list
        setPets([pet, ...updatedPets]);
        
        logger.error('Swipe pass failed', { error: err, petId: pet._id });
        onError?.('pass', pet, err);
        throw err;
      }
    },
    [pets, setPets, moveToNext, optimisticSwipe, onSuccess, onError],
  );

  /**
   * Optimistically superlike a pet
   */
  const handleSuperLike = useCallback(
    async (pet: Pet) => {
      // Optimistically remove pet from list
      const updatedPets = pets.filter((p) => p._id !== pet._id);
      setPets(updatedPets);
      
      // Move to next immediately
      moveToNext();

      try {
        // Update optimistic state
        await optimisticSwipe(
          { swiped: true, matched: false },
          async () => {
            // Perform actual API call for superlike
            const match = await matchesAPI.createMatch(userPetId, pet._id, { superlike: true });
            
            if (match) {
              onSuccess?.('superlike', pet, match);
              return { swiped: true, matched: true };
            }
            
            onSuccess?.('superlike', pet);
            return { swiped: true, matched: false };
          },
        );

        // Load more pets if running low
        if (updatedPets.length <= 2) {
          setTimeout(() => {
            // Trigger load more
          }, 100);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        
        // Rollback: re-add pet to list
        setPets([pet, ...updatedPets]);
        
        logger.error('Swipe superlike failed', { error: err, petId: pet._id });
        onError?.('superlike', pet, err);
        throw err;
      }
    },
    [pets, setPets, moveToNext, userPetId, optimisticSwipe, onSuccess, onError],
  );

  return {
    handleLike,
    handlePass,
    handleSuperLike,
  };
}
