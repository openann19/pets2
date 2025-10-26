import React, { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { EliteContainer, EliteLoading } from "../components/EliteComponents";
import { SwipeHeader } from "../components/swipe/SwipeHeader";
import { SwipeFilters } from "../components/swipe/SwipeFilters";
import { SwipeCard } from "../components/swipe/SwipeCard";
import { SwipeActions } from "../components/swipe/SwipeActions";
import { MatchModal } from "../components/swipe/MatchModal";
import { EmptyState } from "../components/swipe/EmptyState";
import { GlassContainer } from "../components/GlassMorphism";
import { useSwipeData } from "../hooks/useSwipeData";
import { tokens } from "@pawfectmatch/design-tokens";

import type { RootStackScreenProps } from "../navigation/types";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type SwipeScreenProps = RootStackScreenProps<"Swipe">;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const { data, actions } = useSwipeData();

  // Animation values
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-30deg", "0deg", "30deg"],
    extrapolate: "clamp",
  });

  const likeOpacity = position.x.interpolate({
    inputRange: [0, screenWidth / 4],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-screenWidth / 4, 0],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      {
        useNativeDriver: false,
      },
    ),
    onPanResponderRelease: (_evt, gestureState) => {
      const { dx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.3;

      if (dx > swipeThreshold) {
        // Swipe right - like
        actions.handleButtonSwipe("like");
      } else if (dx < -swipeThreshold) {
        // Swipe left - pass
        actions.handleButtonSwipe("pass");
      } else if (dy < -swipeThreshold) {
        // Swipe up - super like
        actions.handleButtonSwipe("superlike");
      } else {
        // Snap back
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Handle swipe with animation
  const handleSwipeWithAnimation = useCallback(
    async (action: "like" | "pass" | "superlike") => {
      const toValue =
        action === "like" ? screenWidth : action === "pass" ? -screenWidth : 0;

      Animated.timing(position, {
        toValue: { x: toValue, y: action === "superlike" ? -screenHeight : 0 },
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Reset position for next card
        position.setValue({ x: 0, y: 0 });

        // Execute swipe action
        actions.handleSwipe(action);
      });
    },
    [position, actions],
  );

  // Handle button swipe
  const handleButtonSwipe = useCallback(
    (action: "like" | "pass" | "superlike") => {
      void handleSwipeWithAnimation(action);
    },
    [handleSwipeWithAnimation],
  );

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    actions.setShowFilters(!data.showFilters);
  }, [data.showFilters, actions]);

  // Handle matches navigation
  const handleMatchesPress = useCallback(() => {
    navigation.navigate("Matches");
  }, [navigation]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  // Handle match modal actions
  const handleKeepSwiping = useCallback(() => {
    actions.setShowMatchModal(false);
  }, [actions]);

  const handleSendMessage = useCallback(() => {
    actions.setShowMatchModal(false);
    if (data.matchedPet) {
      navigation.navigate("Chat", {
        matchId: data.matchedPet._id,
        petName: data.matchedPet.name,
      });
    }
  }, [actions, data.matchedPet, navigation]);

  // Handle filter application
  const handleApplyFilters = useCallback(() => {
    actions.loadPets();
  }, [actions]);

  // Loading state
  if (data.isLoading && data.pets.length === 0) {
    return (
      <EliteContainer gradient="primary">
        <EliteLoading
          title="Loading pets..."
          subtitle="Finding your perfect matches"
          variant="paws"
        />
      </EliteContainer>
    );
  }

  // Error state
  if (data.error) {
    return (
      <EliteContainer gradient="primary">
        <EmptyState
          type="error"
          title="Error loading pets"
          subtitle={data.error}
          buttonTitle="Try Again"
          onButtonPress={actions.refreshPets}
        />
      </EliteContainer>
    );
  }

  // Empty state
  if (!data.pets[data.currentIndex]) {
    return (
      <EliteContainer gradient="primary">
        <EmptyState
          type="empty"
          title="No more pets!"
          subtitle="Check back later for more matches"
          buttonTitle="Refresh"
          onButtonPress={actions.loadPets}
        />
      </EliteContainer>
    );
  }

  const currentPet = data.pets[data.currentIndex];

  return (
    <EliteContainer gradient="primary">
      {/* Header */}
      <SwipeHeader
        onBack={handleBack}
        onFilterPress={handleFilterToggle}
        onMatchesPress={handleMatchesPress}
      />

      {/* Filter Panel */}
      {data.showFilters && (
        <SwipeFilters
          filters={data.filters}
          onFiltersChange={actions.setFilters}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {/* Card Stack */}
      <View style={styles.cardContainer}>
        <SwipeCard
          pet={currentPet}
          position={position}
          rotate={rotate}
          likeOpacity={likeOpacity}
          nopeOpacity={nopeOpacity}
          panHandlers={panResponder.panHandlers}
        />

        {/* Next card preview */}
        {data.pets[data.currentIndex + 1] && (
          <GlassContainer
            intensity="light"
            transparency="light"
            border="light"
            shadow="light"
          >
            <View style={[styles.card, styles.nextCard]}>
              <SwipeCard
                pet={data.pets[data.currentIndex + 1]}
                position={new Animated.ValueXY()}
                rotate={new Animated.Value(0)}
                likeOpacity={new Animated.Value(0)}
                nopeOpacity={new Animated.Value(0)}
                panHandlers={{}}
              />
            </View>
          </GlassContainer>
        )}
      </View>

      {/* Action Buttons */}
      <SwipeActions
        onPass={() => {
          handleButtonSwipe("pass");
        }}
        onSuperLike={() => {
          handleButtonSwipe("superlike");
        }}
        onLike={() => {
          handleButtonSwipe("like");
        }}
      />

      {/* Match Modal */}
      {data.showMatchModal && data.matchedPet && (
        <MatchModal
          matchedPet={data.matchedPet}
          onKeepSwiping={handleKeepSwiping}
          onSendMessage={handleSendMessage}
        />
      )}
    </EliteContainer>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  card: {
    width: screenWidth - 40,
    height: screenHeight * 0.65,
    backgroundColor: "#fff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    position: "absolute",
  },
  nextCard: {
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
    zIndex: -1,
  },
});
