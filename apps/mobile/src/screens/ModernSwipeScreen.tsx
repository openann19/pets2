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
import React, { useEffect } from "react";
import { View, StyleSheet, Dimensions } from "react-native";

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
} from "../components";

// Import legacy components for gradual migration
import { EliteContainer, EliteHeader } from "../components";
import { useTheme } from "../theme/Provider";
import { useModernSwipeScreen } from "../hooks/screens/useModernSwipeScreen";
import type { RootStackScreenProps } from "../navigation/types";
import { CardStack, FilterPanel, MatchModal, SwipeGestureHints, SwipeGestureHintOverlay, PeekSheet } from "../components/swipe";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type SwipeScreenProps = RootStackScreenProps<"Swipe">;

export default function ModernSwipeScreen({ navigation }: SwipeScreenProps) {
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
          <FilterPanel
            filters={filters}
            onFilterChange={(newFilters) => {
              setFilters({ ...filters, ...newFilters });
            }}
          />
        </View>
      )}

      {/* Gesture Hints */}
      <SwipeGestureHints />
      
      {/* First-time user gesture hints overlay */}
      <SwipeGestureHintOverlay />

      {/* Card Stack */}
      <CardStack
        currentPet={currentPet}
        nextPet={pets[currentIndex + 1]}
        currentIndex={currentIndex}
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
      {pets[currentIndex + 1] && (
        <PeekSheet nextPet={pets[currentIndex + 1]} show={true} />
      )}

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
        <MatchModal
          pet={matchedPet}
          show={showMatchModal}
          onKeepSwiping={() => setShowMatchModal(false)}
          onSendMessage={() => {
            setShowMatchModal(false);
            navigation.navigate("Chat", {
              matchId: matchedPet._id,
              petName: matchedPet.name,
            });
          }}
        />
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
    color: Theme.colors.text.secondary,
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
    color: Theme.colors.text.secondary,
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
    color: Theme.colors.text.secondary,
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
    color: Theme.colors.text.secondary,
  },
  matchButtons: {
    flexDirection: "row",
    gap: Theme.spacing.lg,
  },
});
