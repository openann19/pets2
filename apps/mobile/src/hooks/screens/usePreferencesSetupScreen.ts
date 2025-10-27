/**
 * usePreferencesSetupScreen Hook
 * Manages Preferences Setup screen with completion and navigation
 */
import { useNavigation, useRoute } from "@react-navigation/native";
import { usePreferencesSetup } from "../domains/onboarding/usePreferencesSetup";

interface UsePreferencesSetupScreenReturn {
  // From domain hook
  preferences: any;
  isSubmitting: boolean;
  error: string | null;
  updatePreferences: (updates: any) => void;
  updateMaxDistance: (distance: number) => void;
  updateAgeRange: (range: any) => void;
  toggleBreed: (breed: string) => void;
  setActivityLevel: (level: "low" | "medium" | "high") => void;
  setSize: (size: "small" | "medium" | "large") => void;
  toggleNotification: (type: "push" | "email" | "matches" | "messages" | "updates") => void;
  togglePrivacy: (type: "showOnlineStatus" | "showDistance" | "showProfile") => void;
  isValid: boolean;
  isComplete: boolean;
  availableBreeds: string[];
  activityLevels: any[];
  sizes: any[];

  // Route params
  userIntent: string;

  // Navigation
  handleComplete: () => Promise<void>;
  handleGoBack: () => void;
}

export const usePreferencesSetupScreen =
  (): UsePreferencesSetupScreenReturn => {
    const navigation = useNavigation();
    const route = useRoute();
    const { userIntent } = route.params as { userIntent: string };

    const {
      preferences,
      isSubmitting,
      error,
      updatePreferences,
      updateMaxDistance,
      updateAgeRange,
      toggleBreed,
      setActivityLevel,
      setSize,
      toggleNotification,
      togglePrivacy,
      submitPreferences,
      isValid,
      isComplete,
      availableBreeds,
      activityLevels,
      sizes,
    } = usePreferencesSetup();

    const handleComplete = async () => {
      if (!isComplete) return;

      try {
        await submitPreferences();
        // Navigate to main app - onboarding complete
        navigation.navigate("Main" as never);
      } catch (error) {
        // Error handling is done in the domain hook
      }
    };

    const handleGoBack = () => {
      navigation.goBack();
    };

    return {
      // From domain hook
      preferences,
      isSubmitting,
      error,
      updatePreferences,
      updateMaxDistance,
      updateAgeRange,
      toggleBreed,
      setActivityLevel,
      setSize,
      toggleNotification,
      togglePrivacy,
      isValid,
      isComplete,
      availableBreeds,
      activityLevels,
      sizes,

      // Route params
      userIntent,

      // Navigation
      handleComplete,
      handleGoBack,
    };
  };
