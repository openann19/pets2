/**
 * PROJECT HYPERION: MODERNIZED SWIPE SCREEN
 *
 * This demonstrates the new architecture in action:
 * - Uses ModernSwipeCard with react-native-gesture-handler
 * - Implements EliteButton with composition pattern
 * - Applies FXContainer for visual effects
 * - Uses unified design system throughout
 * - Performance optimized with proper memoization
 */

import { Ionicons } from "@expo/vector-icons";
import {
  useAuthStore,
  useSwipeLogic,
  type Pet,
  type PetFilters,
} from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Dimensions, Alert } from "react-native";

// Import new architecture components
import {
  Theme,
  ModernSwipeCard,
  EliteButton,
  EliteButtonPresets,
  FXContainer,
  FXContainerPresets,
  Heading1,
  Heading2,
  Body,
  BodySmall,
  useStaggeredAnimation,
  useEntranceAnimation,
} from "../components";

// Import legacy components for gradual migration
import { EliteContainer, EliteHeader } from "../components/EliteComponents";
import { useTheme } from "../contexts/ThemeContext";
import { matchesAPI } from "../services/api";
import { getTextColor } from "../../theme/helpers";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type RootStackParamList = {
  Swipe: undefined;
  Matches: undefined;
  Chat: { matchId: string; petName: string };
};

type SwipeScreenProps = NativeStackScreenProps<RootStackParamList, "Swipe">;

export default function ModernSwipeScreen({ navigation }: SwipeScreenProps) {
  const { user } = useAuthStore();

  // State management
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedPet, setMatchedPet] = useState<Pet | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [filters, setFilters] = useState<PetFilters>({
    breed: "",
    species: "",
    size: "",
    maxDistance: 25,
  });

  // Swipe logic hook
  const { handleLike, handlePass, handleSuperLike } = useSwipeLogic({
    onMatch: (result) => {
      if (result.isMatch) {
        setShowMatchModal(true);
      }
    },
  });

  // Animation hooks
  const { start: startStaggeredAnimation, getAnimatedStyle } =
    useStaggeredAnimation(
      3, // Number of action buttons
      100,
      "gentle",
    );

  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation("fadeInUp", 0, "standard");

  // Start animations
  useEffect(() => {
    startStaggeredAnimation();
    startEntrance();
  }, [startStaggeredAnimation, startEntrance]);

  // Load pets function
  const loadPets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const realPets = await matchesAPI.getPets(filters);
      setPets(realPets);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load pets. Please check your connection.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Swipe pet function
  const swipePet = useCallback(
    async (petId: string, action: "like" | "pass" | "superlike") => {
      try {
        const pet = pets.find((p) => p._id === petId);
        if (!pet) return null;

        const corePet = {
          ...pet,
          bio: pet.description ?? "",
          distance: 0,
          compatibility: 0,
          isVerified: true,
          owner: { _id: "owner1", name: "Owner" },
        };

        switch (action) {
          case "like":
            return await handleLike(corePet);
          case "pass":
            return await handlePass(corePet);
          case "superlike":
            return await handleSuperLike(corePet);
          default:
            return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error occurred";
        Alert.alert("Error", `Failed to process swipe: ${errorMessage}`);
        return null;
      }
    },
    [pets, handleLike, handlePass, handleSuperLike],
  );

  // Swipe handlers
  const handleSwipeLeft = useCallback(
    async (pet: Pet) => {
      const result = await swipePet(pet._id, "pass");
      if (result?.isMatch) {
        setMatchedPet(pet);
        setShowMatchModal(true);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [swipePet],
  );

  const handleSwipeRight = useCallback(
    async (pet: Pet) => {
      const result = await swipePet(pet._id, "like");
      if (result?.isMatch) {
        setMatchedPet(pet);
        setShowMatchModal(true);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [swipePet],
  );

  const handleSwipeUp = useCallback(
    async (pet: Pet) => {
      const result = await swipePet(pet._id, "superlike");
      if (result?.isMatch) {
        setMatchedPet(pet);
        setShowMatchModal(true);
      }
      setCurrentIndex((prev) => prev + 1);
    },
    [swipePet],
  );

  // Button swipe handlers
  const handleButtonSwipe = useCallback(
    (action: "like" | "pass" | "superlike") => {
      const currentPet = pets[currentIndex];
      if (!currentPet) return;

      switch (action) {
        case "like":
          handleSwipeRight(currentPet);
          break;
        case "pass":
          handleSwipeLeft(currentPet);
          break;
        case "superlike":
          handleSwipeUp(currentPet);
          break;
      }
    },
    [pets, currentIndex, handleSwipeRight, handleSwipeLeft, handleSwipeUp],
  );

  // Load pets on mount
  useEffect(() => {
    void loadPets();
  }, [loadPets]);

  const currentPet = pets[currentIndex];

  // Loading state
  if (isLoading && pets.length === 0) {
    return (
      <EliteContainer gradient="primary">
        <View style={styles.loadingContainer}>
          <FXContainerPresets.glass style={styles.loadingCard}>
            <Heading1 animated={true} style={styles.loadingTitle}>
              Finding Matches
            </Heading1>
            <Body style={styles.loadingSubtitle}>
              Discovering your perfect pet companions...
            </Body>
          </FXContainerPresets.glass>
        </View>
      </EliteContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <EliteContainer gradient="primary">
        <View style={styles.emptyContainer}>
          <FXContainer
            type="glow"
            hasGlow={true}
            glowColor={Theme.colors.status.error}
            style={styles.errorCard}
          >
            <Ionicons
              name="alert-circle-outline"
              size={80}
              color={Theme.colors.status.error}
            />
            <Heading2 style={styles.errorTitle}>Error loading pets</Heading2>
            <Body style={styles.errorMessage}>{error}</Body>
            <EliteButtonPresets.premium
              title="Try Again"
              leftIcon="refresh"
              onPress={loadPets}
            />
          </FXContainer>
        </View>
      </EliteContainer>
    );
  }

  // No more pets state
  if (!currentPet) {
    return (
      <EliteContainer gradient="primary">
        <View style={styles.emptyContainer}>
          <FXContainerPresets.glass style={styles.emptyCard}>
            <Ionicons
              name="heart-outline"
              size={80}
              color={Theme.colors.primary[500]}
            />
            <Heading2 style={styles.emptyTitle}>No more pets!</Heading2>
            <Body style={styles.emptySubtitle}>
              Check back later for more matches
            </Body>
            <EliteButtonPresets.premium
              title="Refresh"
              leftIcon="refresh"
              onPress={loadPets}
            />
          </FXContainerPresets.glass>
        </View>
      </EliteContainer>
    );
  }

  return (
    <EliteContainer gradient="primary">
      {/* Modern Header */}
      <EliteHeader
        title="Discover"
        subtitle="Find your perfect match"
        blur={true}
        onBack={() => navigation.goBack()}
        rightComponent={
          <View style={styles.headerActions}>
            <EliteButtonPresets.glass
              title="Filter"
              size="sm"
              leftIcon="options-outline"
              onPress={() => {
                setShowFilters(!showFilters);
              }}
            />
            <EliteButtonPresets.glass
              title=""
              size="sm"
              leftIcon="heart"
              onPress={() => navigation.navigate("Matches")}
            />
          </View>
        }
      />

      {/* Filter Panel */}
      {showFilters && (
        <View style={styles.filterContainer}>
          <FXContainerPresets.glass style={styles.filterPanel}>
            <Heading2 style={styles.filterTitle}>Quick Filters</Heading2>

            {/* Breed Filters */}
            <View style={styles.filterSection}>
              <BodySmall style={styles.filterLabel}>Popular Breeds:</BodySmall>
              <View style={styles.filterButtons}>
                {[
                  "Shiba Inu",
                  "Golden Retriever",
                  "Labrador",
                  "Border Collie",
                ].map((breed) => (
                  <EliteButton
                    key={breed}
                    title={breed}
                    variant={filters.breed === breed ? "primary" : "outline"}
                    size="sm"
                    onPress={() => {
                      setFilters((prev) => ({
                        ...prev,
                        breed: prev.breed === breed ? "" : breed,
                        species: "dog",
                      }));
                    }}
                  />
                ))}
              </View>
            </View>

            {/* Species Filters */}
            <View style={styles.filterSection}>
              <BodySmall style={styles.filterLabel}>Species:</BodySmall>
              <View style={styles.filterButtons}>
                {["All", "Dogs", "Cats", "Birds"].map((species) => (
                  <EliteButton
                    key={species}
                    title={species}
                    variant={
                      (species === "All" ? "" : species.toLowerCase()) ===
                      filters.species
                        ? "secondary"
                        : "outline"
                    }
                    size="sm"
                    onPress={() => {
                      setFilters((prev) => ({
                        ...prev,
                        species: species === "All" ? "" : species.toLowerCase(),
                      }));
                    }}
                  />
                ))}
              </View>
            </View>

            <EliteButtonPresets.holographic
              title="Apply Filters"
              leftIcon="checkmark"
              onPress={loadPets}
            />
          </FXContainerPresets.glass>
        </View>
      )}

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        {/* Current Card */}
        <ModernSwipeCard
          pet={{
            _id: currentPet._id,
            name: currentPet.name,
            age: currentPet.age,
            breed: currentPet.breed,
            photos: currentPet.photos.map((p) => p.url),
            bio: currentPet.description || "",
            distance: 2.5,
            compatibility: 85,
            isVerified: true,
            tags: ["Friendly", "Active", "Playful"],
          }}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          onSwipeUp={handleSwipeUp}
          isTopCard={true}
        />

        {/* Next Card Preview */}
        {pets[currentIndex + 1] && (
          <View style={styles.nextCardContainer}>
            <FXContainerPresets.glass style={styles.nextCard}>
              {/* Preview content would go here */}
            </FXContainerPresets.glass>
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View style={getAnimatedStyle(0)}>
          <EliteButtonPresets.glass
            title=""
            size="xl"
            leftIcon="close"
            onPress={() => {
              handleButtonSwipe("pass");
            }}
            style={styles.actionButton}
          />
        </View>

        <View style={getAnimatedStyle(1)}>
          <EliteButtonPresets.holographic
            title=""
            size="lg"
            leftIcon="star"
            onPress={() => {
              handleButtonSwipe("superlike");
            }}
            style={styles.actionButton}
          />
        </View>

        <View style={getAnimatedStyle(2)}>
          <EliteButtonPresets.premium
            title=""
            size="xl"
            leftIcon="heart"
            onPress={() => {
              handleButtonSwipe("like");
            }}
            style={styles.actionButton}
          />
        </View>
      </View>

      {/* Match Modal */}
      {showMatchModal && matchedPet && (
        <View style={styles.matchModal}>
          <FXContainerPresets.holographic style={styles.matchModalContent}>
            <Heading1 style={styles.matchTitle}>It's a Match! 🎉</Heading1>

            <View style={styles.matchPhotos}>
              <FXContainer
                type="glow"
                hasGlow={true}
                style={styles.matchPhotoContainer}
              >
                {/* Match photo would go here */}
              </FXContainer>
            </View>

            <Body style={styles.matchText}>
              You and {matchedPet.name} liked each other!
            </Body>

            <View style={styles.matchButtons}>
              <EliteButtonPresets.glass
                title="Keep Swiping"
                onPress={() => {
                  setShowMatchModal(false);
                }}
              />
              <EliteButtonPresets.holographic
                title="Send Message"
                leftIcon="chatbubble"
                onPress={() => {
                  setShowMatchModal(false);
                  navigation.navigate("Chat", {
                    matchId: matchedPet._id,
                    petName: matchedPet.name,
                  });
                }}
              />
            </View>
          </FXContainerPresets.holographic>
        </View>
      )}
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  loadingCard: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  loadingTitle: {
    textAlign: "center",
    marginBottom: Theme.spacing.lg,
  },
  loadingSubtitle: {
    textAlign: "center",
    color: getTextColor(Theme, "secondary"),
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Theme.spacing.xl,
  },
  errorCard: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  errorTitle: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
    color: Theme.colors.status.error,
  },
  errorMessage: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    color: getTextColor(Theme, "secondary"),
  },
  emptyCard: {
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  emptyTitle: {
    textAlign: "center",
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.md,
  },
  emptySubtitle: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    color: getTextColor(Theme, "secondary"),
  },
  headerActions: {
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  filterContainer: {
    padding: Theme.spacing.lg,
  },
  filterPanel: {
    padding: Theme.spacing.xl,
  },
  filterTitle: {
    marginBottom: Theme.spacing.lg,
    textAlign: "center",
  },
  filterSection: {
    marginBottom: Theme.spacing.lg,
  },
  filterLabel: {
    marginBottom: Theme.spacing.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Theme.spacing.sm,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Theme.spacing.xl,
  },
  nextCardContainer: {
    position: "absolute",
    zIndex: -1,
  },
  nextCard: {
    width: screenWidth - Theme.spacing["4xl"] - Theme.spacing.lg,
    height: screenHeight * 0.65,
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing["4xl"],
    gap: Theme.spacing.lg,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  matchModal: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  matchModalContent: {
    width: screenWidth - Theme.spacing["4xl"],
    padding: Theme.spacing["4xl"],
    alignItems: "center",
  },
  matchTitle: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
  },
  matchPhotos: {
    flexDirection: "row",
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  matchPhotoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  matchText: {
    textAlign: "center",
    marginBottom: Theme.spacing.xl,
    color: getTextColor(Theme, "secondary"),
  },
  matchButtons: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
  },
});
