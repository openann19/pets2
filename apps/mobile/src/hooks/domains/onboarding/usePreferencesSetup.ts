/**
 * usePreferencesSetup Hook
 * Manages user preferences configuration during onboarding
 */
import { useCallback, useState } from "react";
import { logger } from "@pawfectmatch/core";
import { api } from "../../../services/api";

interface UserPreferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  breeds: string[];
  activityLevel: "low" | "medium" | "high";
  size: "small" | "medium" | "large";
  notifications: {
    matches: boolean;
    messages: boolean;
    updates: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showDistance: boolean;
    showProfile: boolean;
  };
}

interface UsePreferencesSetupReturn {
  // State
  preferences: Partial<UserPreferences>;
  isSubmitting: boolean;
  error: string | null;

  // Actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  updateMaxDistance: (distance: number) => void;
  updateAgeRange: (range: { min: number; max: number }) => void;
  toggleBreed: (breed: string) => void;
  setActivityLevel: (level: "low" | "medium" | "high") => void;
  setSize: (size: "small" | "medium" | "large") => void;
  toggleNotification: (type: keyof UserPreferences["notifications"]) => void;
  togglePrivacy: (type: keyof UserPreferences["privacy"]) => void;
  submitPreferences: () => Promise<UserPreferences>;
  resetPreferences: () => void;

  // Validation
  isValid: boolean;
  isComplete: boolean;

  // Constants
  availableBreeds: string[];
  activityLevels: Array<{
    id: "low" | "medium" | "high";
    label: string;
    description: string;
  }>;
  sizes: Array<{
    id: "small" | "medium" | "large";
    label: string;
    description: string;
  }>;
}

const DEFAULT_PREFERENCES: Partial<UserPreferences> = {
  maxDistance: 25,
  ageRange: { min: 1, max: 10 },
  breeds: [],
  activityLevel: "medium",
  size: "medium",
  notifications: {
    matches: true,
    messages: true,
    updates: false,
  },
  privacy: {
    showOnlineStatus: true,
    showDistance: true,
    showProfile: true,
  },
};

const AVAILABLE_BREEDS = [
  "Golden Retriever",
  "Labrador Retriever",
  "German Shepherd",
  "Bulldog",
  "Beagle",
  "Poodle",
  "Rottweiler",
  "Yorkshire Terrier",
  "Boxer",
  "Dachshund",
  "Mixed Breed",
  "Other",
];

const ACTIVITY_LEVELS = [
  {
    id: "low" as const,
    label: "Low Activity",
    description: "Calm, relaxed lifestyle",
  },
  {
    id: "medium" as const,
    label: "Moderate Activity",
    description: "Regular walks and play",
  },
  {
    id: "high" as const,
    label: "High Activity",
    description: "Active lifestyle with lots of exercise",
  },
];

const PET_SIZES = [
  { id: "small" as const, label: "Small", description: "Under 20 lbs" },
  { id: "medium" as const, label: "Medium", description: "20-60 lbs" },
  { id: "large" as const, label: "Large", description: "Over 60 lbs" },
];

export const usePreferencesSetup = (): UsePreferencesSetupReturn => {
  const [preferences, setPreferences] =
    useState<Partial<UserPreferences>>(DEFAULT_PREFERENCES);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updates }));
    setError(null);
  }, []);

  const updateMaxDistance = useCallback(
    (distance: number) => {
      updatePreferences({ maxDistance: distance });
    },
    [updatePreferences],
  );

  const updateAgeRange = useCallback(
    (range: { min: number; max: number }) => {
      updatePreferences({ ageRange: range });
    },
    [updatePreferences],
  );

  const toggleBreed = useCallback((breed: string) => {
    setPreferences((prev) => ({
      ...prev,
      breeds: prev.breeds?.includes(breed)
        ? prev.breeds.filter((b) => b !== breed)
        : [...(prev.breeds || []), breed],
    }));
    setError(null);
  }, []);

  const setActivityLevel = useCallback(
    (level: "low" | "medium" | "high") => {
      updatePreferences({ activityLevel: level });
    },
    [updatePreferences],
  );

  const setSize = useCallback(
    (size: "small" | "medium" | "large") => {
      updatePreferences({ size });
    },
    [updatePreferences],
  );

  const toggleNotification = useCallback(
    (type: keyof UserPreferences["notifications"]) => {
      setPreferences((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications!,
          [type]: !prev.notifications![type],
        },
      }));
      setError(null);
    },
    [],
  );

  const togglePrivacy = useCallback(
    (type: keyof UserPreferences["privacy"]) => {
      setPreferences((prev) => ({
        ...prev,
        privacy: {
          ...prev.privacy!,
          [type]: !prev.privacy![type],
        },
      }));
      setError(null);
    },
    [],
  );

  const submitPreferences = useCallback(async (): Promise<UserPreferences> => {
    if (!isValid) {
      throw new Error("Please complete all required preferences");
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const completePreferences: UserPreferences = {
        maxDistance: preferences.maxDistance!,
        ageRange: preferences.ageRange!,
        breeds: preferences.breeds!,
        activityLevel: preferences.activityLevel!,
        size: preferences.size!,
        notifications: preferences.notifications!,
        privacy: preferences.privacy!,
      };

      logger.info("Submitting user preferences", {
        preferences: completePreferences,
      });

      // Submit to API
      await api.updateUserPreferences(completePreferences);

      logger.info("User preferences saved successfully");
      return completePreferences;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to save preferences";
      setError(errorMessage);
      logger.error("Failed to submit preferences", { error });
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [preferences, isValid]);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    setError(null);
    logger.info("User preferences reset to defaults");
  }, []);

  const isValid = !!(
    preferences.maxDistance &&
    preferences.ageRange &&
    preferences.activityLevel &&
    preferences.size &&
    preferences.notifications &&
    preferences.privacy
  );

  const isComplete = isValid && (preferences.breeds?.length ?? 0) > 0;

  return {
    // State
    preferences,
    isSubmitting,
    error,

    // Actions
    updatePreferences,
    updateMaxDistance,
    updateAgeRange,
    toggleBreed,
    setActivityLevel,
    setSize,
    toggleNotification,
    togglePrivacy,
    submitPreferences,
    resetPreferences,

    // Validation
    isValid,
    isComplete,

    // Constants
    availableBreeds: AVAILABLE_BREEDS,
    activityLevels: ACTIVITY_LEVELS,
    sizes: PET_SIZES,
  };
};
