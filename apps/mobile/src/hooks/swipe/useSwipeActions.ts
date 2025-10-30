/**
 * Hook for managing swipe actions (like, pass, super-like)
 * Handles async action execution with loading states
 */

import { useState, useCallback } from 'react';
import * as Haptics from 'expo-haptics';
import { logger } from '../../services/logger';

export interface Pet {
  _id: string;
  name: string;
  age?: number;
  breed?: string;
  photos?: string[];
  bio?: string;
  tags?: string[];
  distance?: number;
  compatibility?: number;
  isVerified?: boolean;
  [key: string]: unknown;
}

export interface UseSwipeActionsOptions {
  onLike?: (pet: Pet) => Promise<void> | void;
  onPass?: (pet: Pet) => Promise<void> | void;
  onSuperLike?: (pet: Pet) => Promise<void> | void;
}

export interface UseSwipeActionsReturn {
  isProcessing: boolean;
  handleLike: (pet: Pet) => Promise<void>;
  handlePass: (pet: Pet) => Promise<void>;
  handleSuperLike: (pet: Pet) => Promise<void>;
}

export function useSwipeActions({
  onLike,
  onPass,
  onSuperLike,
}: UseSwipeActionsOptions = {}): UseSwipeActionsReturn {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleLike = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info('Liked pet:', { petName: pet.name });
        await onLike?.(pet);
      } catch (error) {
        logger.error('Error liking pet:', { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, onLike],
  );

  const handlePass = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info('Passed pet:', { petName: pet.name });
        await onPass?.(pet);
      } catch (error) {
        logger.error('Error passing pet:', { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, onPass],
  );

  const handleSuperLike = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info('Super liked pet:', { petName: pet.name });
        await onSuperLike?.(pet);
      } catch (error) {
        logger.error('Error super liking pet:', { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing, onSuperLike],
  );

  return {
    isProcessing,
    handleLike,
    handlePass,
    handleSuperLike,
  };
}

