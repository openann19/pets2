import { useState, useCallback } from 'react';
import type { Pet } from '../../types';

export interface UseMatchModalOptions {
  onSendMessage: (matchId: string, petName: string) => void;
}

export interface UseMatchModalReturn {
  isOpen: boolean;
  matchedPet: Pet | null;
  showMatch: (pet: Pet) => void;
  closeModal: () => void;
  handleKeepSwiping: () => void;
  handleSendMessage: () => void;
}

/**
 * Hook for managing match modal state and actions
 */
export function useMatchModal({ onSendMessage }: UseMatchModalOptions): UseMatchModalReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);

  const showMatch = useCallback((pet: Pet) => {
    setMatchedPet(pet);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    // Delay clearing matched pet to allow exit animation
    setTimeout(() => {
      setMatchedPet(null);
    }, 300);
  }, []);

  const handleKeepSwiping = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleSendMessage = useCallback(() => {
    if (matchedPet) {
      onSendMessage(matchedPet._id, matchedPet.name);
      closeModal();
    }
  }, [matchedPet, onSendMessage, closeModal]);

  return {
    isOpen,
    matchedPet,
    showMatch,
    closeModal,
    handleKeepSwiping,
    handleSendMessage,
  };
}
