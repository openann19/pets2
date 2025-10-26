/**
 * usePetProfileSetupScreen Hook
 * Manages Pet Profile Setup screen with validation and navigation
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import { usePetProfileSetup } from "../domains/onboarding/usePetProfileSetup";

interface UsePetProfileSetupScreenReturn {
  // From domain hook
  profile: any;
  state: any;
  updateProfile: (updates: any) => void;
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
  const navigation = useNavigation();
  const route = useRoute();
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
      navigation.navigate("PreferencesSetup" as never, { userIntent });
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
