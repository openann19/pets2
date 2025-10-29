/**
 * AI Bio Generation Hook
 * Production-hardened hook for AI-powered pet bio generation
 * Features: Form state management, API integration, error handling, history tracking
 */

import { useState, useCallback } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../services/api';
import { logger } from '@pawfectmatch/core';

export interface GeneratedBio {
  bio: string;
  keywords: string[];
  sentiment: {
    score: number;
    label: string;
  };
  matchScore: number;
  createdAt: string;
}

export interface BioGenerationParams {
  petName: string;
  petBreed: string;
  petAge: string;
  petPersonality: string;
  tone: string;
  photoUri?: string;
}

export interface UseAIBioReturn {
  // Form state
  petName: string;
  setPetName: (name: string) => void;
  petBreed: string;
  setPetBreed: (breed: string) => void;
  petAge: string;
  setPetAge: (age: string) => void;
  petPersonality: string;
  setPetPersonality: (personality: string) => void;
  selectedTone: string;
  setSelectedTone: (tone: string) => void;
  selectedPhoto: string | null;
  setSelectedPhoto: (photo: string | null) => void;

  // Generation state
  isGenerating: boolean;
  generatedBio: GeneratedBio | null;
  bioHistory: GeneratedBio[];

  // Actions
  generateBio: () => Promise<void>;
  pickImage: () => Promise<void>;
  saveBio: (bio: GeneratedBio) => void;
  clearForm: () => void;
  resetGeneration: () => void;

  // Validation
  isFormValid: boolean;
  validationErrors: Record<string, string>;
}

const TONE_OPTIONS = [
  { id: 'playful', label: 'Playful', icon: '🎾', color: '#ff6b6b' },
  { id: 'professional', label: 'Professional', icon: '💼', color: '#4dabf7' },
  { id: 'casual', label: 'Casual', icon: '😊', color: '#69db7c' },
  { id: 'romantic', label: 'Romantic', icon: '💕', color: '#f783ac' },
  { id: 'mysterious', label: 'Mysterious', icon: '🕵️', color: '#a78bfa' },
];

export function useAIBio(): UseAIBioReturn {
  // Form state
  const [petName, setPetName] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petPersonality, setPetPersonality] = useState('');
  const [selectedTone, setSelectedTone] = useState('playful');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedBio, setGeneratedBio] = useState<GeneratedBio | null>(null);
  const [bioHistory, setBioHistory] = useState<GeneratedBio[]>([]);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Validation function
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (!petName.trim()) errors.petName = 'Pet name is required';
    if (!petBreed.trim()) errors.petBreed = 'Pet breed is required';
    if (!petAge.trim()) errors.petAge = 'Pet age is required';
    if (!petPersonality.trim()) errors.petPersonality = 'Pet personality is required';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [petName, petBreed, petAge, petPersonality]);

  // Generate bio function
  const generateBio = useCallback(async (): Promise<void> => {
    if (!validateForm()) {
      logger.warn('Bio generation validation failed', {
        errors: validationErrors,
      });
      return;
    }

    setIsGenerating(true);
    setValidationErrors({});

    try {
      const params: BioGenerationParams = {
        petName: petName.trim(),
        petBreed: petBreed.trim(),
        petAge: petAge.trim(),
        petPersonality: petPersonality.trim(),
        tone: selectedTone,
        photoUri: selectedPhoto || undefined,
      };

      logger.info('Generating AI bio', {
        petName: params.petName,
        tone: params.tone,
      });

      const response = await api.ai.generateBio({
        petName: params.petName,
        keywords: [params.petBreed, params.petAge, params.petPersonality].filter(Boolean),
        tone: params.tone as
          | 'playful'
          | 'professional'
          | 'casual'
          | 'romantic'
          | 'funny'
          | undefined,
        length: 'medium',
        petType: 'pet',
      });

      // The API returns the response directly, not wrapped in success/data
      const newBio: GeneratedBio = {
        bio: response.bio,
        keywords: response.keywords,
        sentiment: response.sentiment,
        matchScore: response.matchScore,
        createdAt: new Date().toISOString(),
      };

      setGeneratedBio(newBio);
      setBioHistory((prev) => [newBio, ...prev.slice(0, 9)]); // Keep last 10

      logger.info('AI bio generated successfully', {
        bioLength: newBio.bio.length,
        keywordsCount: newBio.keywords.length,
        matchScore: newBio.matchScore,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('AI bio generation failed', { error: errorMessage });
      setValidationErrors({ submit: errorMessage });
      throw error;
    } finally {
      setIsGenerating(false);
    }
  }, [petName, petBreed, petAge, petPersonality, selectedTone, selectedPhoto, validateForm]);

  // Pick image function
  const pickImage = useCallback(async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        throw new Error('Camera roll permissions are required to select photos');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setSelectedPhoto(uri);
        logger.info('Photo selected for AI bio', {
          uri: uri.substring(0, 50) + '...',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to pick image';
      logger.error('Image picker failed', { error: errorMessage });
      setValidationErrors({ photo: errorMessage });
    }
  }, []);

  // Save bio function
  const saveBio = useCallback((bio: GeneratedBio): void => {
    setBioHistory((prev) => {
      const filtered = prev.filter((b) => b.createdAt !== bio.createdAt);
      return [bio, ...filtered.slice(0, 9)];
    });
    logger.info('Bio saved to history', { bioLength: bio.bio.length });
  }, []);

  // Clear form function
  const clearForm = useCallback((): void => {
    setPetName('');
    setPetBreed('');
    setPetAge('');
    setPetPersonality('');
    setSelectedTone('playful');
    setSelectedPhoto(null);
    setValidationErrors({});
    logger.debug('AI bio form cleared');
  }, []);

  // Reset generation function
  const resetGeneration = useCallback((): void => {
    setGeneratedBio(null);
    setValidationErrors({});
    logger.debug('AI bio generation reset');
  }, []);

  // Computed values
  const isFormValid = validateForm();

  return {
    // Form state
    petName,
    setPetName,
    petBreed,
    setPetBreed,
    petAge,
    setPetAge,
    petPersonality,
    setPetPersonality,
    selectedTone,
    setSelectedTone,
    selectedPhoto,
    setSelectedPhoto,

    // Generation state
    isGenerating,
    generatedBio,
    bioHistory,

    // Actions
    generateBio,
    pickImage,
    saveBio,
    clearForm,
    resetGeneration,

    // Validation
    isFormValid,
    validationErrors,
  };
}

// Export tone options for reuse
export { TONE_OPTIONS };
