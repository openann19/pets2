/**
 * SWIPE SCREEN (MODULARIZED)
 *
 * Modernized swipe screen using useSwipeData hook for data and gestures
 * extracted to improve modularity and testability.
 */

import React, { useRef } from "react";
import {
  Animated,
  Dimensions,
  PanResponder,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { useSwipeData } from "../hooks/useSwipeData";
import { useTabDoublePress } from "../hooks/navigation/useTabDoublePress";
import { useSwipeUndo } from "../hooks/useSwipeUndo";
import UndoPill from "../components/feedback/UndoPill";
import { ScreenShell } from "../ui/layout/ScreenShell";
import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { haptic } from "../ui/haptics";
import { Theme } from '../theme/unified-theme';

const { width: screenWidth } = Dimensions.get("window");

type SwipeScreenProps = RootStackScreenProps<"Swipe">;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  // Use the extracted swipe data hook
  const {
    pets,
    isLoading,
    error,
    currentIndex,
    handleSwipe,
    handleButtonSwipe,
    refreshPets,
  } = useSwipeData();

  // Handle double-tap to refresh pets
  useTabDoublePress(() => {
    refreshPets();
  });

  // Undo functionality
  const { capture, undo, busy } = useSwipeUndo();

  const onSwipeWithCapture = async (gestureDir: "left" | "right" | "up", actionDir: "like" | "pass" | "superlike", petId: string, index: number) => {
    if (actionDir === "like") {
      haptic.confirm();
    } else if (actionDir === "superlike") {
      haptic.super();
    } else {
      haptic.tap();
    }
    capture({ petId, direction: gestureDir, index });
    await handleSwipe(actionDir);
  };

  // Animation values for gestures
  const position = useRef(new Animated.ValueXY()).current;
  const rotate = position.x.interpolate({
    inputRange: [-screenWidth / 2, 0, screenWidth / 2],
    outputRange: ["-10deg", "0deg", "10deg"],
    extrapolate: "clamp",
  });

  // Pan responder for swipe gestures
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: Animated.event(
      [null, { dx: position.x, dy: position.y }],
      { useNativeDriver: false },
    ) as any,
    onPanResponderRelease: async (evt, gestureState) => {
      if (gestureState.dx > 120) {
        // Swipe right - like
        const direction = screenWidth;
        Animated.timing(position, {
          toValue: { x: direction, y: 0 },
          duration: 300,
          useNativeDriver: false,
        }).start(async () => {
          if (currentPet) {
            await onSwipeWithCapture("right", "like", currentPet._id, currentIndex);
          }
          position.setValue({ x: 0, y: 0 });
        });
      } else if (gestureState.dx < -120) {
        // Swipe left - pass
        const direction = -screenWidth;
        Animated.timing(position, {
          toValue: { x: direction, y: 0 },
          duration: 300,
          useNativeDriver: false,
        }).start(async () => {
          if (currentPet) {
            await onSwipeWithCapture("left", "pass", currentPet._id, currentIndex);
          }
          position.setValue({ x: 0, y: 0 });
        });
      } else {
        // Snap back
        Animated.spring(position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      }
    },
  });

  // Show error if exists
  if (error) {
    Alert.alert("Error", error);
  }

  // Show loading state
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: "Swipe",
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: "custom",
                  icon: "people-outline",
                  onPress: () => navigation.navigate("Matches"),
                  variant: "glass",
                  haptic: "light",
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.emptySubtitle}>Loading pets...</Text>
        </View>
      </ScreenShell>
    );
  }

  const currentPet = pets[currentIndex];

  if (!currentPet) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: "Swipe",
              showBackButton: true,
              onBackPress: () => navigation.goBack(),
              rightButtons: [
                {
                  type: "custom",
                  icon: "people-outline",
                  onPress: () => navigation.navigate("Matches"),
                  variant: "glass",
                  haptic: "light",
                  customComponent: undefined,
                },
              ],
            })}
          />
        }
      >
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No more pets!</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for more matches
          </Text>
        </View>
      </ScreenShell>
    );
  }

  return (
    <ScreenShell
      header={
        <AdvancedHeader
          {...HeaderConfigs.glass({
            title: "Swipe",
            showBackButton: true,
            onBackPress: () => {
              haptic.tap();
              navigation.goBack();
            },
            rightButtons: [
              {
                type: "custom",
                icon: "people-outline",
                onPress: () => {
                  haptic.tap();
                  navigation.navigate("Matches");
                },
                variant: "glass",
                haptic: "light",
                customComponent: undefined,
              },
            ],
          })}
        />
      }
    >
      <View style={styles.cardContainer}>
        <Animated.View
          testID={`swipe-card-${currentIndex}`}
          style={StyleSheet.flatten([
            styles.card,
            {
              transform: [
                { translateX: position.x },
                { translateY: position.y },
                { rotate },
              ],
            },
          ])}
          {...panResponder.panHandlers}
        >
          <View style={styles.petInfo}>
            <Text style={styles.petName}>{currentPet.name}</Text>
            <Text style={styles.petBreed}>{currentPet.breed}</Text>
            {currentPet.description && (
              <Text style={styles.petDescription}>
                {currentPet.description}
              </Text>
            )}
          </View>
        </Animated.View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.passButton])}
          onPress={() => {
            haptic.tap();
            handleButtonSwipe("pass");
          }}
        >
          <Text style={styles.actionButtonText}>Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.actionButton,
            styles.superLikeButton,
          ])}
          onPress={() => {
            haptic.super();
            handleButtonSwipe("superlike");
          }}
        >
          <Text style={styles.actionButtonText}>★</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.likeButton])}
          onPress={() => {
            haptic.confirm();
            handleButtonSwipe("like");
          }}
        >
          <Text style={styles.actionButtonText}>Like</Text>
        </TouchableOpacity>
      </View>

      <UndoPill
        onUndo={async () => {
          haptic.selection();
          const restoredPet = await undo();
          if (restoredPet) {
            // put the card back to front of stack
            // Note: This would require updating pets state
            // You'd need to add this capability to useSwipeData
          }
        }}
        testID="undo-pill"
      />
    </ScreenShell>
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
    height: 400,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: "flex-end",
  },
  petInfo: {
    alignItems: "center",
  },
  petName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  petBreed: {
    fontSize: 18,
    color: "#666",
  },
  petDescription: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: "white",
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  passButton: {
    backgroundColor: "#ff4458",
  },
  likeButton: {
    backgroundColor: "#42c767",
  },
  superLikeButton: {
    backgroundColor: "#007AFF",
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  refreshButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
