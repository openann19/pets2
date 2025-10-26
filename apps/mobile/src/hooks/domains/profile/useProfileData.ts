import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../../stores/useAuthStore";
import { matchesAPI } from "../../services/api";
import { logger } from "../../services/logger";
import type { Pet } from "../../types/api";

export interface UseProfileDataOptions {
  enabled?: boolean;
}

export interface UseProfileDataReturn {
  user: any; // TODO: Replace with proper User type
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

/**
 * Hook for fetching and managing profile data
 */
export function useProfileData({ enabled = true }: UseProfileDataOptions = {}): UseProfileDataReturn {
  const { user } = useAuthStore();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProfile = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const userPets = await matchesAPI.getMyPets();
      setPets(userPets.data || []);
      logger.info("Profile data refreshed", { petCount: userPets.data?.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load profile";
      setError(errorMessage);
      logger.error("Failed to refresh profile", { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  return {
    user,
    pets,
    isLoading,
    error,
    refreshProfile,
  };
}
