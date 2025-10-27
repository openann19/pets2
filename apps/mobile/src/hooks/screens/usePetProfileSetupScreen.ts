/**
 * usePetProfileSetupScreen Hook
 * Manages Pet Profile Setup screen with validation and navigation
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import { usePetProfileSetup } from "../domains/onboarding/usePetProfileSetup";
import type { OnboardingScreenProps } from "../../navigation/types";
import type { PetPhoto } from "@pawfectmatch/core";

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

interface UsePetProfileSetupScreenReturn {
  // From domain hook
  profile: Partial<PetProfileCreationData>;
  state: PetProfileSetupState;
  updateProfile: (updates: Partial<PetProfileCreationData>) => void;
  setCurrentStep: (step: number) => void;
  uploadPhoto: (uri: string) => Promise<void>;
  removePhoto: (index: number) => void;
  validateCurrentStep: () => boolean;
  canProceed: boolean;
  progressPercentage: number;

  // Route params
  userIntent: string;

  // Navigation
  handleNext: () => void;
  handlePrevious: () => void;
  handleComplete: () => Promise<void>;
  handleGoBack: () => void;
}

export const usePetProfileSetupScreen = (): UsePetProfileSetupScreenReturn => {
  const navigation = useNavigation<OnboardingScreenProps<"PetProfileSetup">['navigation']>();
  const route = useRoute<OnboardingScreenProps<"PetProfileSetup">['route']>();
  const { userIntent } = route.params as { userIntent: string };

  const {
    profile,
    state,
    updateProfile,
    setCurrentStep,
    uploadPhoto,
    removePhoto,
    validateCurrentStep,
    canProceed,
    progressPercentage,
    submitProfile,
  } = usePetProfileSetup();

  const handleNext = () => {
    if (canProceed && state.currentStep < 2) {
      setCurrentStep(state.currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (state.currentStep > 0) {
      setCurrentStep(state.currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!canProceed) return;

    try {
      await submitProfile();
      navigation.navigate("PreferencesSetup", { userIntent });
    } catch (error) {
      // Error handling is done in the domain hook
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // From domain hook
    profile,
    state,
    updateProfile,
    setCurrentStep,
    uploadPhoto,
    removePhoto,
    validateCurrentStep,
    canProceed,
    progressPercentage,

    // Route params
    userIntent,

    // Navigation
    handleNext,
    handlePrevious,
    handleComplete,
    handleGoBack,
  };
};
