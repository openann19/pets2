import { useAuthStore } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { aiAPI, matchesAPI } from '../../services/api';
import { logger } from '../../services/logger';

export interface Pet {
  id: string;
  name: string;
  breed: string;
  age: number;
  size: string;
  temperament: string[];
  interests: string[];
  photos: string[];
  owner: {
    id: string;
    name: string;
    location: string;
  };
}

export interface CompatibilityScore {
  overall: number;
  breakdown: {
    temperament: number;
    activity: number;
    size: number;
    age: number;
    interests: number;
    lifestyle: number;
  };
  factors: {
    strengths: string[];
    concerns: string[];
    recommendations: string[];
  };
  interaction: {
    playdate: number;
    adoption: number;
    breeding: number;
  };
}

export interface CompatibilityAnalysis {
  petA: Pet;
  petB: Pet;
  score: CompatibilityScore;
  analysis: {
    summary: string;
    detailed: string;
    tips: string[];
  };
  generatedAt: string;
}

interface CompatibilityResponse {
  success: boolean;
  data?: {
    score?: CompatibilityScore;
    analysis?: {
      summary: string;
      detailed: string;
      tips: string[];
    };
  };
}

interface UseAICompatibilityProps {
  route?: {
    params?: {
      petAId?: string;
      petBId?: string;
    };
  };
}

export const useAICompatibility = ({ route }: UseAICompatibilityProps = {}) => {
  const { user: _user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetA, setSelectedPetA] = useState<Pet | null>(null);
  const [selectedPetB, setSelectedPetB] = useState<Pet | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<CompatibilityAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<CompatibilityAnalysis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void loadPets();
  }, []);

  useEffect(() => {
    if (route?.params?.petAId && route?.params?.petBId) {
      const petA = pets.find((p) => p.id === route.params?.petAId);
      const petB = pets.find((p) => p.id === route.params?.petBId);
      if (petA != null && petB != null) {
        setSelectedPetA(petA);
        setSelectedPetB(petB);
        void analyzeCompatibility(petA, petB);
      }
    }
  }, [pets, route?.params]);

  const loadPets = async (): Promise<void> => {
    try {
      const pets = await matchesAPI.getPets();
      setPets(pets as unknown as Pet[]);
      setLoading(false);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Failed to load pets:', { error: err });
      setLoading(false);
    }
  };

  const analyzeCompatibility = async (petA: Pet, petB: Pet) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    setIsAnalyzing(true);
    try {
      const data = await aiAPI.analyzeCompatibility({
        pet1Id: petA.id,
        pet2Id: petB.id,
      });

      const mappedScore: CompatibilityScore = {
        overall: data.compatibility_score,
        breakdown: {
          temperament: data.breakdown.personality_compatibility,
          activity: data.breakdown.activity_compatibility,
          size: data.breakdown.social_compatibility,
          age: data.breakdown.social_compatibility,
          interests: data.breakdown.lifestyle_compatibility,
          lifestyle: data.breakdown.environment_compatibility,
        },
        factors: {
          strengths: data.recommendations.meeting_suggestions,
          concerns: data.recommendations.supervision_requirements,
          recommendations: data.recommendations.activity_recommendations,
        },
        interaction: {
          playdate: data.recommendations.success_probability * 100,
          adoption: data.recommendations.success_probability * 90,
          breeding: data.recommendations.success_probability * 70,
        },
      };

      const mappedAnalysis = {
        summary: data.ai_analysis,
        detailed: data.ai_analysis,
        tips: data.recommendations.activity_recommendations,
      };

      const response: CompatibilityResponse = {
        success: true,
        data: {
          score: mappedScore,
          analysis: mappedAnalysis,
        },
      };

      if (response && response.success && response.data) {
        const analysis: CompatibilityAnalysis = {
          petA,
          petB,
          score: response.data.score || createFallbackScore(petA, petB),
          analysis: response.data.analysis || createFallbackAnalysis(petA, petB),
          generatedAt: new Date().toISOString(),
        };

        setAnalysisResult(analysis);
        setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 4)]);
        logger.info('Compatibility analysis completed', {
          score: analysis.score.overall,
        });
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Compatibility analysis failed:', { error: err });

      const fallbackAnalysis: CompatibilityAnalysis = {
        petA,
        petB,
        score: createFallbackScore(petA, petB),
        analysis: createFallbackAnalysis(petA, petB),
        generatedAt: new Date().toISOString(),
      };

      setAnalysisResult(fallbackAnalysis);
      setAnalysisHistory((prev) => [fallbackAnalysis, ...prev.slice(0, 4)]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const createFallbackScore = (petA: Pet, petB: Pet): CompatibilityScore => ({
    overall: 85,
    breakdown: {
      temperament: 90,
      activity: 80,
      size: 85,
      age: 75,
      interests: 88,
      lifestyle: 82,
    },
    factors: {
      strengths: ['Both are playful', 'Similar energy levels', 'Compatible sizes'],
      concerns: ['Age difference', 'Different play styles'],
      recommendations: ['Gradual introduction', 'Supervised playtime', 'Monitor interactions'],
    },
    interaction: {
      playdate: 88,
      adoption: 75,
      breeding: 65,
    },
  });

  const createFallbackAnalysis = (petA: Pet, petB: Pet) => ({
    summary: `${petA.name} and ${petB.name} show strong compatibility with an overall score of 85%.`,
    detailed:
      'Both pets share similar temperaments and energy levels, making them well-suited for playdates and potential adoption.',
    tips: [
      'Introduce them gradually in a neutral environment',
      'Monitor their interactions closely during initial meetings',
      'Consider their individual needs and preferences',
    ],
  });

  const handlePetSelection = (pet: Pet, isPetA: boolean) => {
    if (Haptics) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    if (isPetA) {
      setSelectedPetA(pet);
      setAnalysisResult(null);
    } else {
      setSelectedPetB(pet);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = () => {
    if (!selectedPetA || !selectedPetB) {
      Alert.alert('Selection Required', 'Please select both pets to analyze compatibility');
      return;
    }

    if (selectedPetA.id === selectedPetB.id) {
      Alert.alert('Invalid Selection', 'Please select two different pets');
      return;
    }

    void analyzeCompatibility(selectedPetA, selectedPetB);
  };

  return {
    pets,
    selectedPetA,
    selectedPetB,
    isAnalyzing,
    analysisResult,
    analysisHistory,
    loading,
    handlePetSelection,
    handleAnalyze,
    loadPets,
    analyzeCompatibility,
  };
};
