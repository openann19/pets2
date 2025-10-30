/**
 * useAICompatibilityScreen Hook
 * Manages AI Compatibility Analysis screen state and interactions
 */
import { useNavigation } from '@react-navigation/native';
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { useAICompatibility } from '../domains/ai/useAICompatibility';

interface UseAICompatibilityScreenReturn {
  // State from domain hook
  isAnalyzing: boolean;
  compatibilityResult: any | null;
  error: string | null;
  availablePets: any[];
  isLoadingPets: boolean;
  selectedPet1: any | null;
  selectedPet2: any | null;

  // Actions
  setSelectedPet1: (pet: any | null) => void;
  setSelectedPet2: (pet: any | null) => void;
  analyzeCompatibility: () => Promise<void>;
  resetAnalysis: () => void;
  handleGoBack: () => void;
  clearError: () => void;
}

export const useAICompatibilityScreen = (route?: {
  params?: { petAId?: string; petBId?: string };
}): UseAICompatibilityScreenReturn => {
  const navigation = useNavigation();
  const {
    analyzeCompatibility: analyzeCompat,
    isAnalyzing,
    compatibilityResult,
    error,
    loadAvailablePets,
    availablePets,
    isLoadingPets,
    selectedPet1,
    selectedPet2,
    setSelectedPet1,
    setSelectedPet2,
    resetAnalysis,
    clearError,
  } = useAICompatibility();

  useEffect(() => {
    void loadAvailablePets();

    // Check if pets were passed via route params
    const params = route?.params;
    if (params?.petAId && params?.petBId) {
      // Load specific pets for analysis
      loadSpecificPets(params.petAId, params.petBId);
    }
  }, [route?.params]);

  const loadSpecificPets = async (pet1Id: string, pet2Id: string) => {
    try {
      // Wait for pets to load first
      if (availablePets.length === 0) {
        await loadAvailablePets();
      }

      const pet1 = availablePets.find((p) => p._id === pet1Id);
      const pet2 = availablePets.find((p) => p._id === pet2Id);

      if (pet1 && pet2) {
        setSelectedPet1(pet1);
        setSelectedPet2(pet2);
        // Auto-analyze if both pets are selected
        setTimeout(() => void handleAnalyzeCompatibility(), 500);
      }
    } catch (err) {
      logger.error('Error loading specific pets', { error: err });
    }
  };

  const handleAnalyzeCompatibility = async () => {
    if (!selectedPet1 || !selectedPet2) {
      Alert.alert('Selection Required', 'Please select two pets to analyze compatibility.');
      return;
    }

    try {
      await analyzeCompat(selectedPet1._id, selectedPet2._id);
    } catch (error) {
      logger.error('Compatibility analysis failed', { error });
      // Error handling is done in the domain hook
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // State from domain hook
    isAnalyzing,
    compatibilityResult,
    error,
    availablePets,
    isLoadingPets,
    selectedPet1,
    selectedPet2,

    // Actions
    setSelectedPet1,
    setSelectedPet2,
    analyzeCompatibility: handleAnalyzeCompatibility,
    resetAnalysis,
    handleGoBack,
    clearError,
  };
};
