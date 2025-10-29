/**
 * SWIPE SCREEN (FULLY MODULARIZED)
 *
 * Completely decomposed swipe screen with:
 * - useSwipeData for data fetching
 * - useSwipeGestures for gesture handling
 * - useSwipeAnimations for animations
 * - SwipeCard component for presentational UI
 * - SwipeActions component for action buttons
 */

import React, { useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import type { RootStackScreenProps } from "../navigation/types";
import { useSwipeData } from "../hooks/useSwipeData";
import { useTabDoublePress } from "../hooks/navigation/useTabDoublePress";
import { useSwipeUndo } from "../hooks/useSwipeUndo";
import { useSwipeGestures } from "../hooks/useSwipeGestures";
import { useSwipeAnimations } from "../hooks/useSwipeAnimations";
import UndoPill from "../components/feedback/UndoPill";
import { SwipeCard, SwipeActions } from "../components/swipe";
import { ScreenShell } from "../ui/layout/ScreenShell";
import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { haptic } from "../ui/haptics";
import { useTheme } from "@mobile/src/theme";
import { useTranslation } from 'react-i18next';

const { width: screenWidth } = Dimensions.get("window");

type SwipeScreenProps = RootStackScreenProps<"Swipe">;

export default function SwipeScreen({ navigation }: SwipeScreenProps) {
  const theme = useTheme();
  const { t } = useTranslation('common');
  
  // Data management hook
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
  const { capture, undo } = useSwipeUndo();

  // Animation hook
  const { position, rotate, swipeRight, swipeLeft, snapBack, resetPosition } = useSwipeAnimations();

  // Capture swipe with undo support
  const onSwipeWithCapture = useCallback(
    async (gestureDir: "left" | "right", actionDir: "like" | "pass" | "superlike", petId: string, index: number) => {
      if (actionDir === "like") {
        haptic.confirm();
      } else if (actionDir === "superlike") {
        haptic.super();
      } else {
        haptic.tap();
      }
      capture({ petId, direction: gestureDir, index });
      await handleSwipe(actionDir);
      resetPosition();
    },
    [capture, handleSwipe, resetPosition]
  );

  // Gesture handlers for swipe actions
  const handleGestureSwipeRight = useCallback(
    async (petId: string, index: number) => {
      await swipeRight(async () => {
        await onSwipeWithCapture("right", "like", petId, index);
      });
    },
    [swipeRight, onSwipeWithCapture]
  );

  const handleGestureSwipeLeft = useCallback(
    async (petId: string, index: number) => {
      await swipeLeft(async () => {
        await onSwipeWithCapture("left", "pass", petId, index);
      });
    },
    [swipeLeft, onSwipeWithCapture]
  );

  // Pan responder with gestures
  const currentPet = pets[currentIndex];
  const { panHandlers } = useSwipeGestures({
    currentPetId: currentPet?._id,
    currentIndex,
    onSwipeRight: handleGestureSwipeRight,
    onSwipeLeft: handleGestureSwipeLeft,
  });

  const styles = StyleSheet.create({
    cardContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 20,
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
      color: theme.colors.onSurface
      marginBottom: 16,
    },
    emptySubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: "center",
      marginBottom: 32,
    },
  });

  // Show error if exists
  if (error) {
    Alert.alert(t('swipe.error'), error);
  }

  // Show loading state
  if (isLoading && pets.length === 0) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
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
          <Text style={styles.emptySubtitle}>{t('swipe.loading_pets')}</Text>
        </View>
      </ScreenShell>
    );
  }

  // Show no pets state
  if (!currentPet) {
    return (
      <ScreenShell
        header={
          <AdvancedHeader
            {...HeaderConfigs.glass({
              title: t('swipe.title'),
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
          <Text style={styles.emptyTitle}>{t('swipe.no_more_pets')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('swipe.check_back_later')}
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
            title: t('swipe.title'),
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
        <SwipeCard
          pet={currentPet}
          panHandlers={panHandlers}
          testID={`swipe-card-${currentIndex}`}
          style={{
            transform: [
              { translateX: position.x },
              { translateY: position.y },
              { rotate },
            ],
          }}
        />
      </View>

      <SwipeActions
        onPass={() => {
          haptic.tap();
          handleButtonSwipe("pass");
        }}
        onLike={() => {
          haptic.confirm();
          handleButtonSwipe("like");
        }}
        onSuperlike={() => {
          haptic.super();
          handleButtonSwipe("superlike");
        }}
      />

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
