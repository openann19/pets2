/**
 * PROJECT HYPERION: MODERN SWIPE CARD COMPONENT
 *
 * Enterprise-grade swipe card implementation using:
 * - react-native-gesture-handler for performant gestures
 * - react-native-reanimated for 60fps animations
 * - Unified design system for consistent styling
 * - Accessibility support with proper ARIA labels
 * - Performance optimized with proper memoization
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
  AccessibilityInfo,
  type ViewStyle,
} from "react-native";
import { PanGestureHandler } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";

import {
  useSwipeGesture,
  useEntranceAnimation,
} from "../hooks/useUnifiedAnimations";
import { Theme } from "../theme/unified-theme";
import { useTheme } from "../contexts/ThemeContext";
import { getPrimaryColor, getStatusColor } from "../../theme/helpers";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// === TYPES ===
interface Pet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  photos: string[];
  bio: string;
  distance: number;
  compatibility: number;
  isVerified: boolean;
  tags: string[];
}

interface SwipeCardProps {
  pet: Pet;
  onSwipeLeft: (pet: Pet) => void;
  onSwipeRight: (pet: Pet) => void;
  onSwipeUp: (pet: Pet) => void;
  isTopCard?: boolean;
  disabled?: boolean;
  style?: ViewStyle | ViewStyle[];
}

// === SWIPE CONFIGURATION ===
const SWIPE_CONFIG = {
  threshold: 120,
  rotationMultiplier: 0.1,
  velocityThreshold: 0.3,
  directionalOffset: 80,
};

// === MAIN COMPONENT ===
function ModernSwipeCardComponent({
  pet,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTopCard = false,
  disabled = false,
  style,
}: SwipeCardProps): React.JSX.Element {
  const { colors } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Check accessibility settings
  React.useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setIsAccessibilityEnabled);
  }, []);

  // Swipe handlers with proper error handling
  const handleLike = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info("Liked pet:", { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error("Error liking pet:", { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const handlePass = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info("Passed pet:", { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error("Error passing pet:", { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  const handleSuperLike = useCallback(
    async (pet: Pet) => {
      if (isProcessing) return;

      setIsProcessing(true);
      try {
        logger.info("Super liked pet:", { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error("Error super liking pet:", { error });
      } finally {
        setIsProcessing(false);
      }
    },
    [isProcessing],
  );

  // Swipe gesture handlers
  const handleSwipeLeft = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handlePass(pet).then(() => {
      onSwipeLeft(pet);
    });
  }, [disabled, isProcessing, pet, handlePass, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleLike(pet).then(() => {
      onSwipeRight(pet);
    });
  }, [disabled, isProcessing, pet, handleLike, onSwipeRight]);

  const handleSwipeUp = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    handleSuperLike(pet).then(() => {
      onSwipeUp(pet);
    });
  }, [disabled, isProcessing, pet, handleSuperLike, onSwipeUp]);

  // Swipe gesture hook
  const { gestureHandler, animatedStyle, translateX, translateY } =
    useSwipeGesture(
      handleSwipeLeft,
      handleSwipeRight,
      handleSwipeUp,
      SWIPE_CONFIG.threshold,
    );

  // Entrance animation for non-top cards
  const { start: startEntrance, animatedStyle: entranceStyle } =
    useEntranceAnimation("fadeInUp", 0, "gentle");

  // Start entrance animation for non-top cards
  React.useEffect(() => {
    if (!isTopCard) {
      startEntrance();
    }
  }, [isTopCard, startEntrance]);

  // Photo navigation handlers
  const nextPhoto = useCallback(() => {
    if (currentPhotoIndex < pet.photos.length - 1) {
      setCurrentPhotoIndex((prev) => prev + 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentPhotoIndex, pet.photos.length]);

  const prevPhoto = useCallback(() => {
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex((prev) => prev - 1);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  }, [currentPhotoIndex]);

  // Swipe overlay styles
  const swipeOverlayStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [-SWIPE_CONFIG.threshold, 0, SWIPE_CONFIG.threshold],
      [0, 0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity: progress,
    };
  });

  const nopeOverlayStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateX.value,
      [SWIPE_CONFIG.threshold, 0, -SWIPE_CONFIG.threshold],
      [0, 0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity: progress,
    };
  });

  const superLikeOverlayStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      translateY.value,
      [0, -SWIPE_CONFIG.threshold],
      [0, 1],
      Extrapolate.CLAMP,
    );

    return {
      opacity: progress,
    };
  });

  // Memoized styles for performance
  const cardStyle = useMemo(
    () => [
      styles.card,
      {
        opacity: isTopCard ? 1 : 0.8,
        transform: [{ scale: isTopCard ? 1 : 0.95 }],
      },
      disabled && styles.cardDisabled,
      style,
    ],
    [isTopCard, disabled, style],
  );

  const combinedAnimatedStyle = useMemo(
    () => [animatedStyle, !isTopCard && entranceStyle],
    [animatedStyle, isTopCard, entranceStyle],
  );

  return (
    <PanGestureHandler
      onGestureEvent={gestureHandler}
      enabled={!disabled && isTopCard}
    >
      <Animated.View
        style={[...cardStyle, ...combinedAnimatedStyle]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Pet profile for ${pet.name}, ${pet.age} years old ${pet.breed}`}
        accessibilityHint="Swipe right to like, left to pass, or up for super like"
      >
        {/* Photo Section */}
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: pet.photos[currentPhotoIndex] }}
            style={styles.photo}
            resizeMode="cover"
          />

          {/* Photo Navigation Dots */}
          <View style={styles.photoIndicators}>
            {pet.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoDot,
                  {
                    backgroundColor:
                      index === currentPhotoIndex
                        ? Theme.colors.neutral[0]
                        : "rgba(255,255,255,0.4)",
                  },
                ]}
              />
            ))}
          </View>

          {/* Photo Navigation Areas */}
          <View style={styles.photoNavigation}>
            <View style={styles.photoNavLeft} onTouchEnd={prevPhoto} />
            <View style={styles.photoNavRight} onTouchEnd={nextPhoto} />
          </View>

          {/* Verification Badge */}
          {pet.isVerified && (
            <View style={styles.verifiedBadge}>
              <Ionicons
                name="checkmark-circle"
                size={24}
                color={getStatusColor("success")}
              />
            </View>
          )}

          {/* Distance Badge */}
          <View style={styles.distanceBadge}>
            <Text style={styles.distanceText}>{pet.distance}km away</Text>
          </View>

          {/* Swipe Overlays */}
          <Animated.View
            style={[styles.overlay, styles.likeOverlay, swipeOverlayStyle]}
          >
            <Text style={styles.overlayText}>LIKE</Text>
          </Animated.View>

          <Animated.View
            style={[styles.overlay, styles.nopeOverlay, nopeOverlayStyle]}
          >
            <Text style={styles.overlayText}>NOPE</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.overlay,
              styles.superLikeOverlay,
              superLikeOverlayStyle,
            ]}
          >
            <Text style={styles.overlayText}>SUPER LIKE</Text>
          </Animated.View>
        </View>

        {/* Info Section */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.8)"]}
          style={styles.infoGradient}
        >
          <View style={styles.infoContainer}>
            <View style={styles.nameRow}>
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.age}>{pet.age}</Text>
            </View>

            <Text style={styles.breed}>{pet.breed}</Text>

            {/* Compatibility Score */}
            <View style={styles.compatibilityContainer}>
              <View style={styles.compatibilityBar}>
                <View
                  style={[
                    styles.compatibilityFill,
                    {
                      width: `${pet.compatibility}%`,
                      backgroundColor: getPrimaryColor(500),
                    },
                  ]}
                />
              </View>
              <Text style={styles.compatibilityText}>
                {pet.compatibility}% match
              </Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {pet.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    { backgroundColor: `${getPrimaryColor(500)}20` },
                  ]}
                >
                  <Text
                    style={[styles.tagText, { color: getPrimaryColor(500) }]}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bio Preview */}
            <Text style={styles.bio} numberOfLines={2}>
              {pet.bio}
            </Text>
          </View>
        </LinearGradient>
      </Animated.View>
    </PanGestureHandler>
  );
}

const ModernSwipeCard = React.memo(ModernSwipeCardComponent);

// === STYLES ===
const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - Theme.spacing["4xl"],
    height: SCREEN_HEIGHT * 0.75,
    borderRadius: Theme.borderRadius["2xl"],
    backgroundColor: Theme.colors.neutral[0],
    ...Theme.shadows.depth.lg,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  photoContainer: {
    flex: 1,
    borderRadius: Theme.borderRadius["2xl"],
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoIndicators: {
    position: "absolute",
    top: Theme.spacing.xl,
    left: Theme.spacing.xl,
    right: Theme.spacing.xl,
    flexDirection: "row",
    gap: Theme.spacing.sm,
  },
  photoDot: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  photoNavigation: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
  },
  photoNavLeft: {
    flex: 1,
  },
  photoNavRight: {
    flex: 1,
  },
  verifiedBadge: {
    position: "absolute",
    top: Theme.spacing.xl,
    right: Theme.spacing.xl,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.xs,
  },
  distanceBadge: {
    position: "absolute",
    bottom: 120,
    right: Theme.spacing.xl,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
  },
  distanceText: {
    color: Theme.colors.neutral[0],
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: Theme.borderRadius["2xl"],
  },
  likeOverlay: {
    backgroundColor: "rgba(16, 185, 129, 0.8)",
  },
  nopeOverlay: {
    backgroundColor: "rgba(239, 68, 68, 0.8)",
  },
  superLikeOverlay: {
    backgroundColor: "rgba(14, 165, 233, 0.8)",
  },
  overlayText: {
    color: Theme.colors.neutral[0],
    fontSize: Theme.typography.fontSize["5xl"],
    fontWeight: Theme.typography.fontWeight.black,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  infoGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    borderBottomLeftRadius: Theme.borderRadius["2xl"],
    borderBottomRightRadius: Theme.borderRadius["2xl"],
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: Theme.spacing.xl,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: Theme.spacing.xs,
  },
  name: {
    fontSize: Theme.typography.fontSize["3xl"],
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.neutral[0],
    marginRight: Theme.spacing.sm,
  },
  age: {
    fontSize: Theme.typography.fontSize["2xl"],
    fontWeight: Theme.typography.fontWeight.normal,
    color: Theme.colors.neutral[0],
  },
  breed: {
    fontSize: Theme.typography.fontSize.lg,
    color: "rgba(255,255,255,0.9)",
    marginBottom: Theme.spacing.sm,
  },
  compatibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Theme.spacing.sm,
  },
  compatibilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginRight: Theme.spacing.sm,
  },
  compatibilityFill: {
    height: "100%",
    borderRadius: 2,
  },
  compatibilityText: {
    color: Theme.colors.neutral[0],
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: Theme.spacing.sm,
    gap: Theme.spacing.sm,
  },
  tag: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  tagText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  bio: {
    fontSize: Theme.typography.fontSize.sm,
    color: "rgba(255,255,255,0.9)",
    lineHeight:
      Theme.typography.fontSize.sm * Theme.typography.lineHeight.normal,
  },
});

// Display name for debugging
ModernSwipeCard.displayName = "ModernSwipeCard";

export default ModernSwipeCard;
