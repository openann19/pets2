/**
 * usePetProfileSetup Hook
 * Manages pet profile creation during onboarding
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import { api } from "../../../services/api";

interface PetProfile {
  name: string;
  breed: string;
  age: number;
  species: string;
  description?: string;
  photos: string[];
}

interface PetProfileSetupState {
  currentStep: number;
  isUploading: boolean;
  isSubmitting: boolean;
  error: string | null;
}

interface UsePetProfileSetupReturn {
  // State
  profile: Partial<PetProfile>;
  state: PetProfileSetupState;

  // Actions
  updateProfile: (updates: Partial<PetProfile>) => void;
  setCurrentStep: (step: number) => void;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: (index: number) => void;
  submitProfile: () => Promise<PetProfile>;
  resetProfile: () => void;
  validateCurrentStep: () => boolean;

  // Computed
  isComplete: boolean;
  canProceed: boolean;
  progressPercentage: number;
}

export const usePetProfileSetup = (): UsePetProfileSetupReturn => {
  const [profile, setProfile] = useState<Partial<PetProfile>>({
    photos: [],
  });

  const [state, setState] = useState<PetProfileSetupState>({
    currentStep: 0,
    isUploading: false,
    isSubmitting: false,
    error: null,
  });

  const updateProfile = useCallback((updates: Partial<PetProfile>) => {
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

      setProfile((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), uri],
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

  const submitProfile = useCallback(async (): Promise<PetProfile> => {
    if (!validateCurrentStep()) {
      throw new Error("Please complete all required fields");
    }

    setState((prev) => ({ ...prev, isSubmitting: true, error: null }));

    try {
      const completeProfile: PetProfile = {
        name: profile.name!,
        breed: profile.breed!,
        age: profile.age!,
        species: profile.species || "dog",
        description: profile.description,
        photos: profile.photos || [],
      };

      // In a real implementation, this would submit to the API
      logger.info("Submitting pet profile", { profile: completeProfile });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Call actual API
      const result = await api.createPet(completeProfile);

      logger.info("Pet profile created successfully", { petId: result.id });
      return completeProfile;
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
