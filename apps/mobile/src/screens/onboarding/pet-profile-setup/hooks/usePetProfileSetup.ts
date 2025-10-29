/**
 * Hook for managing Pet Profile Setup form state and navigation
 */

import { logger } from "@pawfectmatch/core";
import { useState } from "react";
import { Alert } from "react-native";
import type { PetFormData } from "../types";

interface UsePetProfileSetupOptions {
  userIntent: string;
  onComplete: (formData: PetFormData) => void;
  onBack: () => void;
}

interface UsePetProfileSetupReturn {
  currentStep: number;
  formData: PetFormData;
  isStepValid: boolean;
  nextStep: () => void;
  previousStep: () => void;
  updateFormData: (field: string, value: any) => void;
  updateHealthInfo: (field: string, value: boolean) => void;
  togglePersonalityTag: (tag: string) => void;
}

export function usePetProfileSetup({
  userIntent,
  onComplete,
  onBack,
}: UsePetProfileSetupOptions): UsePetProfileSetupReturn {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    species: "",
    breed: "",
    age: "",
    gender: "",
    size: "",
    description: "",
    intent: userIntent === "list" ? "adoption" : "all",
    personalityTags: [],
    healthInfo: {
      vaccinated: false,
      spayedNeutered: false,
      microchipped: false,
    },
  });

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 0:
        return !!(formData.name.trim() && formData.species && formData.breed.trim());
      case 1:
        return !!(formData.age && formData.gender && formData.size);
      case 2:
        return !!(formData.intent && formData.personalityTags.length > 0);
      case 3:
        return true; // Health info is optional
      default:
        return false;
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateHealthInfo = (field: string, value: boolean) => {
    setFormData((prev) => ({
      ...prev,
      healthInfo: {
        ...prev.healthInfo,
        [field]: value,
      },
    }));
  };

  const togglePersonalityTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      personalityTags: prev.personalityTags.includes(tag)
        ? prev.personalityTags.filter((t) => t !== tag)
        : [...prev.personalityTags, tag],
    }));
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) {
      Alert.alert(
        "Missing Information",
        "Please fill in all required fields to continue.",
      );
      return;
    }

    if (currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleComplete();
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    } else {
      onBack();
    }
  };

  const handleComplete = async () => {
    try {
      logger.info("Creating pet profile:", { formData });
      onComplete(formData);
    } catch (error) {
      Alert.alert("Error", "Failed to create pet profile. Please try again.");
    }
  };

  const isStepValid = validateStep(currentStep);

  return {
    currentStep,
    formData,
    isStepValid,
    nextStep,
    previousStep,
    updateFormData,
    updateHealthInfo,
    togglePersonalityTag,
  };
}
