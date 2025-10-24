import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import { logger } from "../services/logger";
import { useAuthStore } from "../stores/useAuthStore";
import { useFilterStore } from "../store/filterStore";
import type { Pet, PetFilters } from "../types/api";
import { matchesAPI } from "../services/api";

export interface SwipeFilters {
  species: string;
  breed: string;
  ageMin: number;
  ageMax: number;
  distance: number;
}

export interface SwipeData {
  pets: Pet[];
  isLoading: boolean;
  error: string | null;
  currentIndex: number;
  filters: SwipeFilters;
  showFilters: boolean;
  showMatchModal: boolean;
  matchedPet: Pet | null;
}

export interface SwipeActions {
  loadPets: () => Promise<void>;
  handleSwipe: (action: "like" | "pass" | "superlike") => Promise<void>;
  handleButtonSwipe: (action: "like" | "pass" | "superlike") => void;
  setCurrentIndex: (index: number) => void;
  setShowFilters: (show: boolean) => void;
  setShowMatchModal: (show: boolean) => void;
  setMatchedPet: (pet: Pet | null) => void;
  setFilters: (filters: SwipeFilters) => void;
  refreshPets: () => void;
}

export function useSwipeData(): SwipeData & SwipeActions {
  const { user } = useAuthStore();
  const { filters: filterStoreFilters, setFilters: setFilterStoreFilters } =
    useFilterStore();

  // State
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);

  // Convert filter store to local filters
  const filters: SwipeFilters = {
    species: filterStoreFilters.species ?? "",
    breed: filterStoreFilters.breed ?? "",
    ageMin: filterStoreFilters.ageMin ?? 0,
    ageMax: filterStoreFilters.ageMax ?? 20,
    distance: filterStoreFilters.distance ?? 50,
  };

  // Load pets from API
  const loadPets = useCallback(async () => {
    if (!user) {
      setError("User not authenticated");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Real API call with filters - build object conditionally to avoid undefined
      const apiFilters: PetFilters = {};

      if (filters.species) apiFilters.species = filters.species;
      if (filters.breed) apiFilters.breed = filters.breed;
      if (filters.ageMin > 0) apiFilters.minAge = filters.ageMin;
      if (filters.ageMax < 20) apiFilters.maxAge = filters.ageMax;
      apiFilters.maxDistance = filters.distance;

      const fetchedPets = await matchesAPI.getPets(apiFilters);

      setPets(fetchedPets);
      setCurrentIndex(0);

      logger.info("Pets loaded successfully", {
        count: fetchedPets.length,
        filters,
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load pets";
      setError(errorMessage);
      logger.error("Failed to load pets", { error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  // Handle swipe actions
  const handleSwipe = useCallback(
    async (action: "like" | "pass" | "superlike") => {
      const currentPet = pets[currentIndex];
      const userPetId = user?.pets?.[0] || user?.activePetId;
      if (!currentPet || !userPetId) return;

      try {
        // Real API call for swipe action
        if (action === "like" || action === "superlike") {
          const match = await matchesAPI.createMatch(userPetId, currentPet._id);

          // Check if it's a mutual match (match object exists means mutual match)
          if (match) {
            setMatchedPet(currentPet);
            setShowMatchModal(true);
          }
        }
        // For 'pass', we don't need to call API (or implement a pass endpoint if needed)

        // Move to next pet
        setCurrentIndex((prev) => prev + 1);

        // Load more pets when running low
        if (currentIndex >= pets.length - 2) {
          void loadPets();
        }

        logger.info("Swipe action completed", {
          action,
          petId: currentPet._id,
          isMatch: action === "like" || action === "superlike",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to process swipe";
        Alert.alert("Error", errorMessage);
        logger.error("Swipe action failed", { error: errorMessage });
      }
    },
    [pets, currentIndex, loadPets, user],
  );

  // Handle button swipe (immediate)
  const handleButtonSwipe = useCallback(
    (action: "like" | "pass" | "superlike") => {
      void handleSwipe(action);
    },
    [handleSwipe],
  );

  // Refresh pets
  const refreshPets = useCallback(() => {
    void loadPets();
  }, [loadPets]);

  // Set filters
  const setFilters = useCallback(
    (newFilters: SwipeFilters) => {
      setFilterStoreFilters({
        species: newFilters.species,
        breed: newFilters.breed,
        ageMin: newFilters.ageMin,
        ageMax: newFilters.ageMax,
        distance: newFilters.distance,
      });
    },
    [setFilterStoreFilters],
  );

  // Load pets on component mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  return {
    // Data
    pets,
    isLoading,
    error,
    currentIndex,
    filters,
    showFilters,
    showMatchModal,
    matchedPet,

    // Actions
    loadPets,
    handleSwipe,
    handleButtonSwipe,
    setCurrentIndex,
    setShowFilters,
    setShowMatchModal,
    setMatchedPet,
    setFilters,
    refreshPets,
  };
}
