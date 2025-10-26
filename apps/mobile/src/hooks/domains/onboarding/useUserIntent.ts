/**
 * useUserIntent Hook
 * Manages user intent collection and validation during onboarding
 */
import { useCallback, useState } from "react";
import { logger } from "@pawfectmatch/core";

interface UserIntent {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

interface UseUserIntentReturn {
  // Data
  intents: UserIntent[];
  selectedIntent: string | null;
  isNavigating: boolean;

  // Actions
  selectIntent: (intentId: string) => void;
  confirmIntent: () => Promise<string>;
  resetSelection: () => void;

  // Validation
  isValidSelection: boolean;
}

const AVAILABLE_INTENTS: UserIntent[] = [
  {
    id: "adopt",
    title: "Find My Perfect Pet",
    description:
      "I'm looking to adopt and find the perfect companion for my lifestyle",
    icon: "heart",
    color: "#FF6B6B",
  },
  {
    id: "connect",
    title: "Connect with Pet Lovers",
    description: "I want to meet other pet owners and build a community",
    icon: "people",
    color: "#4ECDC4",
  },
  {
    id: "both",
    title: "Both Adoption & Community",
    description: "I'm open to adoption and connecting with the pet community",
    icon: "sparkles",
    color: "#8B5CF6",
  },
];

export const useUserIntent = (): UseUserIntentReturn => {
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const selectIntent = useCallback((intentId: string) => {
    setSelectedIntent(intentId);
    logger.info("User selected intent", { intentId });
  }, []);

  const confirmIntent = useCallback(async (): Promise<string> => {
    if (!selectedIntent) {
      throw new Error("No intent selected");
    }

    setIsNavigating(true);
    try {
      logger.info("User confirmed intent", { intentId: selectedIntent });

      // Simulate API call or validation
      await new Promise((resolve) => setTimeout(resolve, 500));

      return selectedIntent;
    } catch (error) {
      logger.error("Failed to confirm user intent", {
        error,
        intentId: selectedIntent,
      });
      throw error;
    } finally {
      setIsNavigating(false);
    }
  }, [selectedIntent]);

  const resetSelection = useCallback(() => {
    setSelectedIntent(null);
    logger.info("User intent selection reset");
  }, []);

  const isValidSelection = selectedIntent !== null;

  return {
    // Data
    intents: AVAILABLE_INTENTS,
    selectedIntent,
    isNavigating,

    // Actions
    selectIntent,
    confirmIntent,
    resetSelection,

    // Validation
    isValidSelection,
  };
};
