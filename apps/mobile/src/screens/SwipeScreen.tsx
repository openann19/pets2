import React, { useCallback, useRef, useState, useEffect } from "react";
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Alert,
  StatusBar,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import * as Haptics from "expo-haptics";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { SwipeHeader } from "../components/swipe/SwipeHeader";
import { SwipeFilters } from "../components/swipe/SwipeFilters";
import { SwipeCard } from "../components/swipe/SwipeCard";
import { SwipeActions } from "../components/swipe/SwipeActions";
import { MatchModal } from "../components/swipe/MatchModal";
import { EmptyState } from "../components/swipe/EmptyState";
import { BoostModal } from "../components/Premium/BoostButton";
import { EliteContainer } from "../components/EliteComponents";
import { PremiumGate, UsageLimitIndicator } from "../components/Premium/PremiumGate";
import { useSwipeData } from "../hooks/useSwipeData";
import { usePremium, useSwipeLimits } from "../hooks/usePremium";
import { useAuthStore } from "@pawfectmatch/core";
import { logger } from "@pawfectmatch/core";
import type { Pet } from "@pawfectmatch/core";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

type RootStackParamList = {
  Swipe: undefined;
  Chat: { matchId: string; petName: string };
  Matches: undefined;
  Premium: undefined;
};

type SwipeScreenProps = NativeStackScreenProps<RootStackParamList, "Swipe">;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const swipeData = useSwipeData();
  const { user } = useAuthStore();
  const { canUseFeature, trackUsage, isActive: isPremium } = usePremium();
  const { canSwipe, canLike, canSuperLike, trackSwipe, counts } = useSwipeLimits();

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

  // State for premium features
  const [lastSwipedPet, setLastSwipedPet] = useState<Pet | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [boostActive, setBoostActive] = useState(false);
  const [boostExpiresAt, setBoostExpiresAt] = useState<string | undefined>(undefined);

  // Gesture handling with react-native-gesture-handler
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      position.setValue({ x: event.translationX, y: event.translationY });
    })
    .onEnd((event) => {
      const { translationX, translationY, velocityX, velocityY } = event;
      const swipeThreshold = screenWidth * 0.3;
      const velocityThreshold = 500;

      // Determine swipe direction based on translation and velocity
      if (translationX > swipeThreshold || velocityX > velocityThreshold) {
        // Swipe right - like
        handleSwipeWithAnimation("like");
      } else if (
        translationX < -swipeThreshold ||
        velocityX < -velocityThreshold
      ) {
        // Swipe left - pass
        handleSwipeWithAnimation("pass");
      } else if (
        translationY < -swipeThreshold ||
        velocityY < -velocityThreshold
      ) {
        // Swipe up - super like
        handleSwipeWithAnimation("superlike");
      } else {
        // Snap back
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }).start();
      }
    });

  // Handle swipe with animation and haptic feedback
  const handleSwipeWithAnimation = useCallback(
    async (action: "like" | "pass" | "superlike") => {
      const currentPet = data.pets[0];
      if (!currentPet) return;

      // Store for undo functionality
      setLastSwipedPet(currentPet);
      setCanUndo(true);

      // Haptic feedback based on action
      switch (action) {
        case "like":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case "pass":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case "superlike":
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
      }

      const toValue =
        action === "like" ? screenWidth : action === "pass" ? -screenWidth : 0;
      const yValue = action === "superlike" ? -screenHeight : 0;

      Animated.timing(position, {
        toValue: { x: toValue, y: yValue },
        duration: 300,
        useNativeDriver: false,
      }).start(() => {
        // Reset position for next card
        position.setValue({ x: 0, y: 0 });

        // Execute swipe action
        actions.handleSwipe(action);

        // Check for match
        if (
          action === "like" &&
          currentPet.compatibilityScore &&
          currentPet.compatibilityScore > 80
        ) {
          // High compatibility - show match modal
          actions.setMatchedPet(currentPet);
          actions.setShowMatchModal(true);
        }
      });
    },
    [position, actions, data.pets],
  );

  // Handle undo functionality
  const handleUndo = useCallback(() => {
    if (!canUseFeature("canUndoSwipes")) {
      Alert.alert(
        "Premium Feature",
        "Undo swipe is a premium feature. Upgrade to PawfectMatch Premium to unlock this feature.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Upgrade", onPress: () => navigation.navigate("Premium") },
        ],
      );
      return;
    }

    if (lastSwipedPet && canUndo) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);

      // Add the pet back to the front of the queue
      actions.undoSwipe(lastSwipedPet);
      setCanUndo(false);
      setLastSwipedPet(null);

      // Track usage
      void trackUsage("undo_swipe");

      logger.info("Undo swipe successful", { petId: lastSwipedPet.id });
    }
  }, [canUseFeature, lastSwipedPet, canUndo, actions, navigation, trackUsage]);

  // Handle button swipe
  const handleButtonSwipe = useCallback(
    (action: "like" | "pass" | "superlike") => {
      void handleSwipeWithAnimation(action);
    },
    [handleSwipeWithAnimation],
  );

  // Handle filter toggle
  const handleFilterToggle = useCallback(() => {
    swipeData.setShowFilters(!swipeData.showFilters);
  }, [swipeData.showFilters, swipeData.setShowFilters]);

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
    swipeData.setShowMatchModal(false);
  }, [swipeData.setShowMatchModal]);

  const handleSendMessage = useCallback(() => {
    swipeData.setShowMatchModal(false);
    if (swipeData.matchedPet) {
      navigation.navigate("Chat", {
        matchId: swipeData.matchedPet._id,
        petName: swipeData.matchedPet.name,
      });
    }
  }, [swipeData.setShowMatchModal, swipeData.matchedPet, navigation]);

  // Handle filter application
  const handleApplyFilters = useCallback(() => {
    swipeData.loadPets();
    swipeData.setShowFilters(false);
  }, [swipeData.loadPets, swipeData.setShowFilters]);

  // Handle boost activation
  const handleBoostActivated = useCallback((expiresAt: string) => {
    setBoostActive(true);
    setBoostExpiresAt(expiresAt);
    logger.info("Boost activated in SwipeScreen", { expiresAt });
  }, []);

  // Load pets on mount
  useEffect(() => {
    actions.loadPets();
  }, [actions]);

  // Auto-hide undo after 5 seconds
  useEffect(() => {
    if (canUndo) {
      const timer = setTimeout(() => {
        setCanUndo(false);
        setLastSwipedPet(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [canUndo]);

  // Show loading state
  if (data.isLoading) {
    return (
      <EliteContainer gradient="primary">
        <StatusBar barStyle="light-content" />
        <EliteLoading message="Finding perfect matches..." />
      </EliteContainer>
    );
  }

  // Show empty state
  if (swipeData.pets.length === 0) {
    return (
      <EliteContainer gradient="primary">
        <StatusBar barStyle="light-content" />
        <SwipeHeader
          onBack={handleBack}
          onMatches={handleMatchesPress}
          onFilter={handleFilterToggle}
          showFilters={swipeData.showFilters}
        />
        <EmptyState />
      </EliteContainer>
    );
  }

  const currentPet = swipeData.pets[0];
  const nextPet = swipeData.pets[1];

  return (
    <EliteContainer gradient="primary">
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <SwipeHeader
        onBack={handleBack}
        onMatches={handleMatchesPress}
        onFilter={handleFilterToggle}
        onBoost={() => {
          setShowBoostModal(true);
        }}
        showFilters={swipeData.showFilters}
        canUndo={canUndo && isPremium}
        onUndo={handleUndo}
        isPremium={isPremium}
        boostActive={boostActive}
        boostExpiresAt={boostExpiresAt || ""}
      />

      {/* Filters */}
      {swipeData.showFilters && (
        <SwipeFilters
          filters={swipeData.filters}
          onApplyFilters={handleApplyFilters}
        />
      )}

      {/* Swipe Cards */}
      <View style={styles.cardContainer}>
        <GestureDetector gesture={panGesture}>
          <View style={styles.cardWrapper}>
            {/* Next card (background) */}
            {nextPet && (
              <SwipeCard
                pet={nextPet}
                position={new Animated.ValueXY()}
                rotate={new Animated.Value(0)}
                likeOpacity={new Animated.Value(0)}
                nopeOpacity={new Animated.Value(0)}
                isPremium={isPremium}
                showCompatibility={true}
              />
            )}

            {/* Current card (foreground) */}
            <SwipeCard
              pet={currentPet}
              position={position}
              rotate={rotate}
              likeOpacity={likeOpacity}
              nopeOpacity={nopeOpacity}
              onLike={() => handleButtonSwipe("like")}
              onPass={() => handleButtonSwipe("pass")}
              onSuperLike={() => handleButtonSwipe("superlike")}
              onUndo={handleUndo}
              isPremium={isPremium}
              showCompatibility={true}
            />
          </View>
        </GestureDetector>
      </View>

      {/* Action Buttons */}
      <SwipeActions
        onLike={() => handleButtonSwipe("like")}
        onPass={() => handleButtonSwipe("pass")}
        onSuperLike={() => handleButtonSwipe("superlike")}
        onUndo={handleUndo}
        canUndo={canUndo && isPremium}
        isPremium={isPremium}
      />

      {/* Usage Limit Indicators */}
      <View style={styles.usageContainer}>
        <UsageLimitIndicator feature="likesPerDay" currentUsage={counts.likes} />
        <UsageLimitIndicator feature="superLikesPerDay" currentUsage={counts.superLikes} />
        <UsageLimitIndicator feature="swipesPerDay" currentUsage={counts.swipes} />
      </View>

      {/* Match Modal */}
      <MatchModal
        isVisible={swipeData.showMatchModal}
        pet={swipeData.matchedPet}
        onKeepSwiping={handleKeepSwiping}
        onSendMessage={handleSendMessage}
      />

      {/* Boost Modal */}
      <BoostModal
        visible={showBoostModal}
        onClose={() => {
          setShowBoostModal(false);
        }}
        isPremium={isPremium}
        onBoostActivated={handleBoostActivated}
      />
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
  cardWrapper: {
    width: "100%",
    height: screenHeight * 0.7,
    justifyContent: "center",
    alignItems: "center",
  },
  usageContainer: {
    position: "absolute",
    bottom: 120,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 8,
    padding: 12,
  },
});
