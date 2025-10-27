/**
 * usePetSelection Hook
 * 
 * Manages pet selection logic for compatibility analysis.
 * Handles selection state, validation, and reset functionality.
 * 
 * @example
 * ```typescript
 * const {
 *   selectedPet1,
 *   selectedPet2,
 *   selectPet,
 *   deselectPet,
 *   reset,
 *   canSelectPet,
 * } = usePetSelection();
 * ```
 */

import { useState, useCallback } from "react";

export interface Pet {
  _id: string;
  name: string;
  breed: string;
  owner: {
    _id: string;
    name: string;
  };
}

export interface UsePetSelectionReturn {
  /**
   * First selected pet
   */
  selectedPet1: Pet | null;
  
  /**
   * Second selected pet
   */
  selectedPet2: Pet | null;
  
  /**
   * Select a pet (auto-assigns to first or second slot)
   */
  selectPet: (pet: Pet) => void;
  
  /**
   * Deselect a pet
   */
  deselectPet: (petId: string) => void;
  
  /**
   * Reset both selections
   */
  reset: () => void;
  
  /**
   * Check if a pet can be selected
   */
  canSelectPet: (pet: Pet) => boolean;
  
  /**
   * Check if both pets are selected
   */
  isReadyForAnalysis: boolean;
  
  /**
   * Get selection validation error message
   */
  getValidationError: (pet: Pet) => string | null;
}

/**
 * Manages pet selection state for compatibility analysis
 */
export const usePetSelection = (): UsePetSelectionReturn => {
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);

  /**
   * Check if a pet can be selected based on current selections
   */
  const canSelectPet = useCallback((pet: Pet): boolean => {
    // If both slots are filled, can't select more
    if (selectedPet1 && selectedPet2) return false;
    
    // If trying to select the same pet twice, can't
    if (selectedPet1?._id === pet._id || selectedPet2?._id === pet._id) return false;
    
    // If trying to select two pets from same owner, can't
    if (selectedPet1 && selectedPet1.owner._id === pet.owner._id) return false;
    
    return true;
  }, [selectedPet1, selectedPet2]);

  /**
   * Get validation error message for a pet selection attempt
   */
  const getValidationError = useCallback((pet: Pet): string | null => {
    if (selectedPet1 && selectedPet2) {
      return "Both slots are already filled. Please deselect one pet first.";
    }
    
    if (selectedPet1?._id === pet._id || selectedPet2?._id === pet._id) {
      return "This pet is already selected.";
    }
    
    if (selectedPet1 && selectedPet1.owner._id === pet.owner._id) {
      return "Cannot select two pets from the same owner.";
    }
    
    return null;
  }, [selectedPet1, selectedPet2]);

  /**
   * Select a pet (auto-assigns to first or second slot)
   */
  const selectPet = useCallback((pet: Pet) => {
    if (!canSelectPet(pet)) return;
    
    if (!selectedPet1) {
      // Assign to first slot
      setSelectedPet1(pet);
    } else if (!selectedPet2) {
      // Assign to second slot
      setSelectedPet2(pet);
    }
  }, [selectedPet1, selectedPet2, canSelectPet]);

  /**
   * Deselect a pet
   */
  const deselectPet = useCallback((petId: string) => {
    if (selectedPet1?._id === petId) {
      setSelectedPet1(null);
    } else if (selectedPet2?._id === petId) {
      setSelectedPet2(null);
    }
  }, [selectedPet1, selectedPet2]);

  /**
   * Reset both selections
   */
  const reset = useCallback(() => {
    setSelectedPet1(null);
    setSelectedPet2(null);
  }, []);

  const isReadyForAnalysis = selectedPet1 !== null && selectedPet2 !== null;

  return {
    selectedPet1,
    selectedPet2,
    selectPet,
    deselectPet,
    reset,
    canSelectPet,
    isReadyForAnalysis,
    getValidationError,
  };
};

