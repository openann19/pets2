import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "../../../stores/useAuthStore";
import { matchesAPI } from "../../../services/api";

export interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  preferences?: Record<string, any>;
}

export interface UseProfileUpdateReturn {
  isUpdating: boolean;
  updateProfile: (data: ProfileUpdateData) => Promise<boolean>;
  error: string | null;
}

/**
 * Hook for updating user profile data
 */
export function useProfileUpdate(): UseProfileUpdateReturn {
  const { user, updateUser } = useAuthStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = useCallback(
    async (data: ProfileUpdateData): Promise<boolean> => {
      if (!user) {
        setError("User not authenticated");
        return false;
      }

      setIsUpdating(true);
      setError(null);

      try {
        const updatedUser = await matchesAPI.updateUserProfile(data);
        updateUser(updatedUser);
        logger.info("Profile updated successfully", { userId: user._id });
        Alert.alert("Success", "Profile updated successfully!");
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update profile";
        setError(errorMessage);
        logger.error("Failed to update profile", { error: errorMessage });
        Alert.alert("Error", errorMessage);
        return false;
      } finally {
        setIsUpdating(false);
      }
    },
    [user, updateUser],
  );

  return {
    isUpdating,
    updateProfile,
    error,
  };
}
