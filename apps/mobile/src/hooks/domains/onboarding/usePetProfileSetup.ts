/**
 * usePetProfileSetup Hook
 * Manages pet profile creation during onboarding
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import { api } from "../../../services/api";
import type { Pet, PetPhoto } from "@pawfectmatch/core";

// Interface for pet profile creation during onboarding
interface PetProfileCreationData {
  name: string;
  breed: string;
  age: number;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  gender: 'male' | 'female';
  size: 'tiny' | 'small' | 'medium' | 'large' | 'extra-large';
  description?: string;
  photos: PetPhoto[];
}

interface PetProfileSetupState {
  currentStep: number;
  isUploading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface UsePetProfileSetupReturn {
  // State
  profile: Partial<PetProfileCreationData>;
  state: PetProfileSetupState;

  // Actions
  updateProfile: (updates: Partial<PetProfileCreationData>) => void;
  setCurrentStep: (step: number) => void;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: (index: number) => void;
  submitProfile: () => Promise<Pet>;
  resetProfile: () => void;
  validateCurrentStep: () => boolean;

  // Computed
  isComplete: boolean;
  canProceed: boolean;
  progressPercentage: number;
}

export const usePetProfileSetup = (): UsePetProfileSetupReturn => {
  const [profile, setProfile] = useState<Partial<PetProfileCreationData>>({
    photos: [],
  });

  const [state, setState] = useState<PetProfileSetupState>({
    currentStep: 0,
    isUploading: false,
    isSubmitting: false,
    error: null,
  });

  const updateProfile = useCallback((updates: Partial<PetProfileCreationData>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
    setState((prev) => ({ ...prev, error: null }));
    logger.info("Pet profile updated", { updates });
  }, []);

  const setCurrentStep = useCallback((step: number) => {
    setState((prev) => ({ ...prev, currentStep: step }));
    logger.info("Pet profile setup step changed", { step });
  }, []);

  const uploadPhoto = useCallback(async (uri: string) => {
    setState((prev) => ({ ...prev, isUploading: true, error: null }));

    try {
      // In a real implementation, this would upload to a server
      logger.info("Uploading pet photo", { uri });

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const newPhoto: PetPhoto = {
        url: uri,
        publicId: `photo-${Date.now()}`,
        isPrimary: (profile.photos?.length ?? 0) === 0, // First photo is primary
      };
      
      setProfile((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), newPhoto],
      }));

      logger.info("Pet photo uploaded successfully");
    } catch (error) {
      const errorMessage = "Failed to upload photo";
      setState((prev) => ({ ...prev, error: errorMessage }));
      logger.error("Failed to upload pet photo", { error, uri });
      throw new Error(errorMessage);
    } finally {
      setState((prev) => ({ ...prev, isUploading: false }));
    }
  }, []);

  const removePhoto = useCallback((index: number) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos?.filter((_, i) => i !== index) || [],
    }));
    logger.info("Pet photo removed", { index });
  }, []);

  const submitProfile = useCallback(async (): Promise<Pet> => {
    if (!validateCurrentStep()) {
      throw new Error("Please complete all required fields");
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const completeProfile: PetProfileCreationData = {
        name: profile.name!,
        breed: profile.breed!,
        age: profile.age!,
        species: profile.species || "dog",
        gender: profile.gender || "male",
        size: profile.size || "medium",
        description: profile.description,
        photos: profile.photos || [],
      };

      // In a real implementation, this would submit to the API
      logger.info("Submitting pet profile", { profile: completeProfile });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For onboarding, we need to create a minimal Pet object
      // The API will handle the full creation with proper IDs
      const petData: Partial<Pet> = {
        name: completeProfile.name,
        breed: completeProfile.breed,
        age: completeProfile.age,
        species: completeProfile.species,
        gender: completeProfile.gender,
        size: completeProfile.size,
        description: completeProfile.description,
        photos: completeProfile.photos,
      };
      
      // Call actual API
      const result = await api.createPet(petData);

      logger.info("Pet profile created successfully", { petId: result.id });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to create pet profile";
      setState((prev) => ({ ...prev, error: errorMessage }));
      logger.error("Failed to submit pet profile", { error });
      throw new Error(errorMessage);
    } finally {
      setState((prev) => ({ ...prev, isSubmitting: false }));
    }
  }, [profile]);

  const resetProfile = useCallback(() => {
    setProfile({ photos: [] });
    setState({
      currentStep: 0,
      isUploading: false,
      isSubmitting: false,
      error: null,
    });
    logger.info("Pet profile setup reset");
  }, []);

  const validateCurrentStep = useCallback((): boolean => {
    switch (state.currentStep) {
      case 0: // Basic info
        return !!(profile.name && profile.breed && profile.age);
      case 1: // Photos
        return !!(profile.photos && profile.photos.length > 0);
      case 2: // Description
        return !!profile.description;
      default:
        return true;
    }
  }, [state.currentStep, profile]);

  const isComplete = !!(
    profile.name &&
    profile.breed &&
    profile.age &&
    profile.photos &&
    profile.photos.length > 0
  );

  const canProceed = validateCurrentStep();

  const progressPercentage =
    ((state.currentStep + (canProceed ? 1 : 0)) / 3) * 100;

  return {
    // State
    profile,
    state,

    // Actions
    updateProfile,
    setCurrentStep,
    uploadPhoto,
    removePhoto,
    submitProfile,
    resetProfile,
    validateCurrentStep,

    // Computed
    isComplete,
    canProceed,
    progressPercentage,
  };
};
