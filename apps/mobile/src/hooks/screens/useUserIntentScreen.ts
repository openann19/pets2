/**
 * useUserIntentScreen Hook
 * Manages User Intent screen with animations and navigation
 */
import { useNavigation } from "@react-navigation/native";
import { useUserIntent } from "../domains/onboarding/useUserIntent";
import type { OnboardingScreenProps } from "../../navigation/types";

interface UseUserIntentScreenReturn {
  // From domain hook
  intents: any[];
  selectedIntent: string | null;
  isNavigating: boolean;
  selectIntent: (intentId: string) => void;
  isValidSelection: boolean;

  // Navigation
  handleContinue: () => Promise<void>;
  handleGoBack: () => void;
}

export const useUserIntentScreen = (): UseUserIntentScreenReturn => {
  const navigation = useNavigation<any>();

  const {
    intents,
    selectedIntent,
    isNavigating,
    selectIntent,
    confirmIntent,
    isValidSelection,
  } = useUserIntent();

  const handleContinue = async () => {
    if (!isValidSelection) return;

    try {
      const intent = await confirmIntent();
      navigation.navigate("PetProfileSetup", { userIntent: intent });
    } catch (error) {
      // Error handling is done in the domain hook
    }
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  return {
    // From domain hook
    intents,
    selectedIntent,
    isNavigating,
    selectIntent,
    isValidSelection,

    // Navigation
    handleContinue,
    handleGoBack,
  };
};
