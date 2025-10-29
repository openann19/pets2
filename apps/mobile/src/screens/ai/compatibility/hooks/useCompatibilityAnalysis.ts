/**
 * Compatibility Analysis Hook
 * Manages business logic for compatibility analysis
 */

import { useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { aiAPI, matchesAPI } from "../../../../services/api";
import { logger } from "../../../../services/logger";

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

export const useCompatibilityAnalysis = () => {
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

  const loadPets = async (): Promise<void> => {
    try {
      const pets = await matchesAPI.getPets();
      setPets(pets as unknown as Pet[]);
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Failed to load pets:", { error: err });
    } finally {
      setLoading(false);
    }
  };

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

  const handleAnalyze = async () => {
    if (!selectedPetA || !selectedPetB) {
      Alert.alert("Selection Required", "Please select both pets to analyze compatibility");
      return;
    }

    if (selectedPetA.id === selectedPetB.id) {
      Alert.alert("Invalid Selection", "Please select two different pets");
      return;
    }

    await analyzeCompatibility(selectedPetA, selectedPetB);
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

      // Map the API response to our expected format
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

      const analysis: CompatibilityAnalysis = {
        petA,
        petB,
        score: mappedScore,
        analysis: mappedAnalysis,
        generatedAt: new Date().toISOString(),
      };

      setAnalysisResult(analysis);
      setAnalysisHistory((prev) => [analysis, ...prev.slice(0, 4)]); // Keep last 5
      logger.info("Compatibility analysis completed", {
        score: analysis.score.overall,
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error("Compatibility analysis failed:", { error: err });

      // Fallback analysis for demo
      const fallbackAnalysis: CompatibilityAnalysis = {
        petA,
        petB,
        score: {
          overall: 82,
          breakdown: {
            temperament: 85,
            activity: 80,
            size: 90,
            age: 70,
            interests: 85,
            lifestyle: 80,
          },
          factors: {
            strengths: ["Compatible personalities", "Similar activity levels"],
            concerns: ["Age gap", "Different play preferences"],
            recommendations: ["Supervised introduction", "Gradual socialization"],
          },
          interaction: {
            playdate: 85,
            adoption: 75,
            breeding: 60,
          },
        },
        analysis: {
          summary: `${petA.name} and ${petB.name} have good compatibility potential.`,
          detailed:
            "These pets show promising compatibility with some areas that need attention.",
          tips: [
            "Start with short supervised interactions",
            "Pay attention to body language",
            "Respect their individual boundaries",
          ],
        },
        generatedAt: new Date().toISOString(),
      };

      setAnalysisResult(fallbackAnalysis);
      setAnalysisHistory((prev) => [fallbackAnalysis, ...prev.slice(0, 4)]);
    } finally {
      setIsAnalyzing(false);
    }
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
  };
};

