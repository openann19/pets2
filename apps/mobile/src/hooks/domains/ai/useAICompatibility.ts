/**
 * useAICompatibility Hook
 * Manages AI-powered pet compatibility analysis
 */
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { api, matchesAPI } from '../../../services/api';

interface Pet {
  _id: string;
  name: string;
  photos: string[];
  breed: string;
  age: number;
  species: string;
  owner: {
    _id: string;
    name: string;
  };
}

interface CompatibilityResult {
  compatibility_score: number;
  ai_analysis: string;
  breakdown: {
    personality_compatibility: number;
    lifestyle_compatibility: number;
    activity_compatibility: number;
    social_compatibility: number;
    environment_compatibility: number;
  };
  recommendations: {
    meeting_suggestions: string[];
    activity_recommendations: string[];
    supervision_requirements: string[];
    success_probability: number;
  };
}

interface UseAICompatibilityReturn {
  analyzeCompatibility: (pet1Id: string, pet2Id: string) => Promise<CompatibilityResult>;
  isAnalyzing: boolean;
  compatibilityResult: CompatibilityResult | null;
  error: string | null;
  clearError: () => void;
  resetAnalysis: () => void;
  loadAvailablePets: () => Promise<Pet[]>;
  availablePets: Pet[];
  isLoadingPets: boolean;
  selectedPet1: Pet | null;
  selectedPet2: Pet | null;
  setSelectedPet1: (pet: Pet | null) => void;
  setSelectedPet2: (pet: Pet | null) => void;
}

export const useAICompatibility = (): UseAICompatibilityReturn => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [compatibilityResult, setCompatibilityResult] = useState<CompatibilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(false);
  const [selectedPet1, setSelectedPet1] = useState<Pet | null>(null);
  const [selectedPet2, setSelectedPet2] = useState<Pet | null>(null);

  const loadAvailablePets = useCallback(async (): Promise<Pet[]> => {
    try {
      setIsLoadingPets(true);
      setError(null);

      const pets = await matchesAPI.getPets();

      // Filter out current user's pets (simplified - in real app you'd get current user)
      const filteredPets = pets.filter((pet) => {
        // This would normally filter out user's own pets
        return true; // For demo purposes, show all
      });

      setAvailablePets(filteredPets as unknown as Pet[]);

      logger.info('Available pets loaded', { count: filteredPets.length });
      return filteredPets as unknown as Pet[];
    } catch (err) {
      const errorMessage = 'Failed to load pets. Please try again.';
      setError(errorMessage);
      logger.error('Error loading pets', { error: err });
      throw new Error(errorMessage);
    } finally {
      setIsLoadingPets(false);
    }
  }, []);

  const analyzeCompatibility = useCallback(
    async (pet1Id: string, pet2Id: string): Promise<CompatibilityResult> => {
      if (!pet1Id || !pet2Id) {
        const errorMsg = 'Please select two pets to analyze compatibility.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      if (pet1Id === pet2Id) {
        const errorMsg = 'Please select two different pets.';
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      setIsAnalyzing(true);
      setError(null);

      try {
        const result = await api.ai.analyzeCompatibility({
          pet1Id,
          pet2Id,
        });

        setCompatibilityResult(result);

        logger.info('Compatibility analysis completed', {
          pet1Id,
          pet2Id,
          score: result.compatibility_score,
        });

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to analyze compatibility. Please try again.';
        setError(errorMessage);
        logger.error('Compatibility analysis error', {
          error: err,
          pet1Id,
          pet2Id,
        });

        // For demo purposes, return a mock result
        const mockResult: CompatibilityResult = {
          compatibility_score: 85,
          ai_analysis:
            'These pets show excellent compatibility! Both are energetic and social, making them perfect playmates.',
          breakdown: {
            personality_compatibility: 90,
            lifestyle_compatibility: 85,
            activity_compatibility: 88,
            social_compatibility: 82,
            environment_compatibility: 86,
          },
          recommendations: {
            meeting_suggestions: [
              'Introduce them in a neutral outdoor space',
              'Keep initial meetings short (15-20 minutes)',
              'Have both owners present for supervision',
            ],
            activity_recommendations: [
              'Daily walks together',
              'Joint play sessions in the park',
              'Shared grooming sessions',
            ],
            supervision_requirements: [
              'Monitor for signs of stress',
              'Separate if either shows discomfort',
              'Gradually increase interaction time',
            ],
            success_probability: 85,
          },
        };

        setCompatibilityResult(mockResult);
        logger.info('Using mock compatibility result');
        return mockResult;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [],
  );

  const resetAnalysis = useCallback(() => {
    setSelectedPet1(null);
    setSelectedPet2(null);
    setCompatibilityResult(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    analyzeCompatibility,
    isAnalyzing,
    compatibilityResult,
    error,
    clearError,
    resetAnalysis,
    loadAvailablePets,
    availablePets,
    isLoadingPets,
    selectedPet1,
    selectedPet2,
    setSelectedPet1,
    setSelectedPet2,
  };
};
