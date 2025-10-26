import { logger } from "@pawfectmatch/core";
import type { Pet } from "@pawfectmatch/core";
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { matchesAPI } from "../../services/api";

export function useMyPetsScreen() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const loadPets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await matchesAPI.getMyPets();
      setPets(response.data || []);
    } catch (error) {
      logger.error("Error loading pets:", { error });
      Alert.alert("Connection Error", "Network error");
      setPets([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPets();
    setRefreshing(false);
  }, [loadPets]);

  const getSpeciesEmoji = useCallback((species: string) => {
    const emojis: Record<string, string> = {
      dog: "🐕",
      cat: "🐱",
      bird: "🐦",
      rabbit: "🐰",
      other: "🐾",
    };
    return emojis[species] ?? "🐾";
  }, []);

  const getIntentColor = useCallback((intent: string) => {
    const colors: Record<string, string> = {
      adoption: "#10B981",
      mating: "#EC4899",
      playdate: "#3B82F6",
      all: "#8B5CF6",
    };
    return colors[intent] ?? "#6B7280";
  }, []);

  const getIntentLabel = useCallback((intent: string) => {
    const labels: Record<string, string> = {
      adoption: "For Adoption",
      mating: "Seeking Mates",
      playdate: "Playdates",
      all: "Open to All",
    };
    return labels[intent] ?? intent;
  }, []);

  const handleDeletePet = useCallback(
    (petId: string) => {
      Alert.alert(
        "Delete Pet Profile",
        "Are you sure you want to delete this pet profile? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                await matchesAPI.deletePet(petId);
                setPets((prev) => prev.filter((pet) => pet._id !== petId));
                Alert.alert("Success", "Pet profile deleted successfully");
              } catch (error) {
                Alert.alert(
                  "Error",
                  "Failed to delete pet profile. Please try again.",
                );
              }
            },
          },
        ],
      );
    },
    [],
  );

  return {
    pets,
    isLoading,
    refreshing,
    deleteConfirm,
    setDeleteConfirm,
    loadPets,
    onRefresh,
    getSpeciesEmoji,
    getIntentColor,
    getIntentLabel,
    handleDeletePet,
  };
}

