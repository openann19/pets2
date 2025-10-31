/**
 * Pet Profile Setup Hook
 * Manages form state and step navigation for pet profile setup
 */

import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import type { PetFormData } from './types';

interface UsePetProfileSetupProps {
  userIntent: string;
  onComplete: (formData: PetFormData) => Promise<void>;
}

export const usePetProfileSetup = ({ userIntent, onComplete }: UsePetProfileSetupProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    size: '',
    description: '',
    intent: userIntent === 'list' ? 'adoption' : 'all',
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
  });

  const updateFormData = useCallback((field: string, value: import('../../../types/forms').FormFieldValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const updateHealthInfo = useCallback((field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [field]: value,
      },
    }));
  }, []);

  const togglePersonalityTag = useCallback((tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  }, []);

  const validateStep = useCallback(() => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() && formData.species && formData.breed.trim();
      case 1:
        return formData.age && formData.gender && formData.size;
      case 2:
        return formData.intent && formData.personalityTags.length > 0;
      case 3:
        return true; // Health info is optional
      default:
        return false;
    }
  }, [currentStep, formData]);

  const handleNext = useCallback(async () => {
    if (!validateStep()) {
      Alert.alert('Missing Information', 'Please fill in all required fields to continue.');
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      try {
        logger.info('Creating pet profile:', { formData });
        await onComplete(formData);
      } catch (error) {
        Alert.alert('Error', 'Failed to create pet profile. Please try again.');
      }
    }
  }, [currentStep, formData, validateStep, onComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  return {
    currentStep,
    formData,
    updateFormData,
    updateHealthInfo,
    togglePersonalityTag,
    handleNext,
    handleBack,
    validateStep,
    canProceed: validateStep(),
  };
};

