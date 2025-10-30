/**
 * useAIBio Hook
 * Manages AI-powered bio generation and analysis
 */
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { api } from '../../../services/api';

interface GeneratedBio {
  bio: string;
  keywords: string[];
  sentiment: {
    score: number;
    label: string;
  };
  matchScore: number;
}

interface BioGenerationParams {
  petName: string;
  keywords: string[];
  tone: 'playful' | 'professional' | 'casual' | 'romantic' | 'funny';
  length: 'short' | 'medium' | 'long';
  petType: string;
  age: number;
  breed: string;
}

interface UseAIBioReturn {
  generateBio: (params: BioGenerationParams) => Promise<GeneratedBio>;
  isGenerating: boolean;
  lastGeneratedBio: GeneratedBio | null;
  error: string | null;
  clearError: () => void;
  bioHistory: GeneratedBio[];
  addToHistory: (bio: GeneratedBio) => void;
  clearHistory: () => void;
}

export const useAIBio = (): UseAIBioReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedBio, setLastGeneratedBio] = useState<GeneratedBio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [bioHistory, setBioHistory] = useState<GeneratedBio[]>([]);

  const generateBio = useCallback(async (params: BioGenerationParams): Promise<GeneratedBio> => {
    if (!params.petName.trim()) {
      const errorMsg = 'Pet name is required';
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    setIsGenerating(true);
    setError(null);

    try {
      const bioData = await api.ai.generateBio(params);

      const generatedBio: GeneratedBio = {
        bio: bioData.bio,
        keywords: bioData.keywords ?? [],
        sentiment: bioData.sentiment ?? {
          score: 0.8,
          label: 'positive',
        },
        matchScore: bioData.matchScore ?? 85,
      };

      setLastGeneratedBio(generatedBio);
      addToHistory(generatedBio);

      logger.info('AI bio generated successfully', {
        petName: params.petName,
        keywordsCount: generatedBio.keywords.length,
        matchScore: generatedBio.matchScore,
      });

      return generatedBio;
    } catch (err) {
      // Fallback generation for demo
      const fallbackBio: GeneratedBio = {
        bio: `Meet ${params.petName}! This adorable ${params.breed || 'furry friend'} is ${params.age || 'young'} and full of personality. ${params.keywords.join(', ') || 'They love making new friends'} and would be perfect for someone looking for a ${params.tone} companion. Ready for adventures and lots of love! 🐾`,
        keywords: ['friendly', 'playful', 'loving', 'adventurous'],
        sentiment: { score: 0.9, label: 'positive' },
        matchScore: 88,
      };

      setLastGeneratedBio(fallbackBio);
      addToHistory(fallbackBio);

      logger.info('Using fallback bio generation', {
        error: err,
        petName: params.petName,
      });
      return fallbackBio;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const addToHistory = useCallback((bio: GeneratedBio) => {
    setBioHistory((prev) => [bio, ...prev.slice(0, 4)]); // Keep last 5
  }, []);

  const clearHistory = useCallback(() => {
    setBioHistory([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    generateBio,
    isGenerating,
    lastGeneratedBio,
    error,
    clearError,
    bioHistory,
    addToHistory,
    clearHistory,
  };
};
