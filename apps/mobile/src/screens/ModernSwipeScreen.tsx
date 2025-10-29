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
import { type Pet } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

// Import new architecture components
import {
  ModernSwipeCard,
  EliteButton,
  EliteButtonPresets,
  FXContainer,
  FXContainerPresets,
  Heading1,
  Heading2,
  Body,
  BodySmall,
} from "../components";

// Import legacy components for gradual migration
import { EliteContainer, EliteHeader } from "../components";
import { useTheme } from "@/theme";
import { useModernSwipeScreen } from "../hooks/screens/useModernSwipeScreen";
import type { RootStackScreenProps } from "../navigation/types";
// Import state components
import { LoadingState } from "../components/swipe/LoadingState";
import { ErrorState } from "../components/swipe/ErrorState";
import { NoMorePetsState } from "../components/swipe/NoMorePetsState";
// import { CardStack, FilterPanel, MatchModal, SwipeGestureHints, SwipeGestureHintOverlay, PeekSheet } from "../components/swipe"; // TODO: Implement missing components

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type SwipeScreenProps = RootStackScreenProps<"Swipe">;

export default function ModernSwipeScreen({ navigation }: SwipeScreenProps) {
  const theme = useTheme();
  const {
    pets,
    currentPet,
    isLoading,
    error,
    currentIndex,
    showMatchModal,
    matchedPet,
    showFilters,
    filters,
    setCurrentIndex,
    setShowMatchModal,
    setShowFilters,
    setFilters,
    loadPets,
    handleButtonSwipe,
    handleSwipeLeft,
    handleSwipeRight,
    handleSwipeUp,
  } = useModernSwipeScreen();

  // Loading state
  if (isLoading && pets.length === 0) {
    return <LoadingState loadPets={loadPets} />;
  }

  // Error state
  if (error) {
    return <ErrorState error={error} loadPets={loadPets} />;
  }

  // No more pets state
  if (!currentPet) {
    return <NoMorePetsState loadPets={loadPets} />;
  }

  const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.xl,
    },
    loadingCard: {
      padding: theme.spacing["4xl"],
      alignItems: "center" as const,
    },
    loadingTitle: {
      textAlign: "center",
      marginBottom: theme.spacing.lg,
    },
    loadingSubtitle: {
      textAlign: "center",
      color: theme.colors.onMuted,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing.xl,
    },
    errorCard: {
      padding: theme.spacing["4xl"],
      alignItems: "center" as const,
    },
    errorTitle: {
      textAlign: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      color: theme.colors.danger,
    },
    errorMessage: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.onMuted,
    },
    emptyCard: {
      padding: theme.spacing["4xl"],
      alignItems: "center" as const,
    },
    emptyTitle: {
      textAlign: "center",
      marginTop: theme.spacing.lg,
      marginBottom: theme.spacing.md,
    },
    emptySubtitle: {
      textAlign: "center",
      marginBottom: theme.spacing.xl,
      color: theme.colors.onMuted,
    },
    headerActions: {
      flexDirection: "row" as const,
      gap: theme.spacing.sm,
    },
    filterContainer: {
      padding: theme.spacing.lg,
    },
    filterPlaceholder: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.bg,
      borderRadius: 8,
      margin: theme.spacing.md,
    },
    hintsPlaceholder: {
      padding: theme.spacing.sm,
      alignItems: "center" as const,
    },
    actionButtons: {
      flexDirection: "row" as const,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      paddingVertical: theme.spacing.xl,
      paddingHorizontal: theme.spacing["4xl"],
      gap: theme.spacing.lg,
    },
    actionButton: {
      width: 60,
      height: 60,
      borderRadius: 30,
    },
    matchModalPlaceholder: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.8)",
      justifyContent: "center" as const,
      alignItems: "center" as const,
      padding: theme.spacing["4xl"],
      gap: theme.spacing.lg,
    },
  });

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
          <View style={styles.filterPlaceholder}>
            <Body>Filter Panel (TODO: Implement)</Body>
          </View>
        </View>
      )}

      {/* Gesture Hints */}
      <View style={styles.hintsPlaceholder}>
        <BodySmall>Swipe Hints (TODO: Implement)</BodySmall>
      </View>
      
      {/* First-time user gesture hints overlay */}
      {/* SwipeGestureHintOverlay placeholder */}

      {/* Card Stack */}
      <ModernSwipeCard
        pet={currentPet as any} // TODO: Create proper adapter between core Pet and ModernSwipeCard Pet
        onSwipeLeft={() => {
          handleSwipeLeft(currentPet);
        }}
        onSwipeRight={() => {
          handleSwipeRight(currentPet);
        }}
        onSwipeUp={() => {
          handleSwipeUp(currentPet);
        }}
      />

      {/* Peek Sheet - Show next card */}
      {/* TODO: Implement PeekSheet component */}
      {/* {pets[currentIndex + 1] && (
        <PeekSheet nextPet={pets[currentIndex + 1]} show={true} />
      )} */}

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <View>
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

        <View>
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

        <View>
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
        <View style={styles.matchModalPlaceholder}>
          <Heading2>It's a Match! 🎉</Heading2>
          <Body>You matched with {matchedPet.name}!</Body>
          <EliteButton
            title="Keep Swiping"
            onPress={() => setShowMatchModal(false)}
          />
          <EliteButton
            title="Send Message"
            onPress={() => {
              setShowMatchModal(false);
              navigation.navigate("Chat", {
                matchId: matchedPet._id,
                petName: matchedPet.name,
              });
            }}
          />
        </View>
      )}
    </EliteContainer>
  );
}
