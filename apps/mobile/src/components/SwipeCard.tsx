/**
 * Professional SwipeCard Component for React Native
 * Enterprise-grade implementation with proper architecture
 *
 * Features:
 * - Gesture-based swiping with haptic feedback
 * - Smooth animations with spring physics
 * - Photo carousel with navigation
 * - Real-time swipe overlays
 * - Accessibility support
 * - Performance optimized
 * - TypeScript strict mode
 */

import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
  AccessibilityInfo,
  type AnimatedInterpolation,
} from "react-native";

import { useTheme } from "../contexts/ThemeContext";
// Local types until core package is properly configured
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
  style?: Record<string, unknown>;
}

const DEFAULT_SWIPE_CONFIG = {
  threshold: 120,
  rotationMultiplier: 0.1,
  velocityThreshold: 0.3,
  directionalOffset: 80,
};

const DEFAULT_ANIMATION_CONFIG = {
  duration: 300,
  tension: 100,
  friction: 8,
  useNativeDriver: false, // Set to false for transform animations
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const SwipeCard = React.memo(function SwipeCard({
  pet,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  isTopCard = false,
  disabled = false,
  style,
}: SwipeCardProps): JSX.Element {
  const { colors, isDark } = useTheme();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);

  // Swipe processing state
  const [isProcessing, setIsProcessing] = useState(false);

  // Swipe handlers
  const handleLike = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      // eslint-disable-next-line no-console
      logger.info("Liked pet:", { petName: pet.name });
      // API call would go here
    } catch (error) {
      logger.error("Error liking pet:", { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handlePass = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      // eslint-disable-next-line no-console
      logger.info("Passed pet:", { petName: pet.name });
      // API call would go here
    } catch (error) {
      logger.error("Error passing pet:", { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleSuperLike = useCallback(async (pet: Pet) => {
    setIsProcessing(true);
    try {
      // eslint-disable-next-line no-console
      logger.info("Super liked pet:", { petName: pet.name });
      // API call would go here
    } catch (error) {
      logger.error("Error super liking pet:", { error });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Animation values - memoized for performance
  const animationValues = useMemo(
    () => ({
      pan: new Animated.ValueXY(),
      scale: new Animated.Value(isTopCard ? 1 : 0.95),
      opacity: new Animated.Value(isTopCard ? 1 : 0.8),
      likeOpacity: new Animated.Value(0),
      nopeOpacity: new Animated.Value(0),
      superLikeOpacity: new Animated.Value(0),
    }),
    [isTopCard],
  );

  const { pan, scale, opacity, likeOpacity, nopeOpacity, superLikeOpacity } =
    animationValues;

  // Check accessibility settings
  React.useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(
      setIsAccessibilityEnabled,
    );
  }, []);

  // Pan responder for gesture handling
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const xValue = (pan.x as Animated.Value & { _value: number })._value || 0;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const yValue = (pan.y as Animated.Value & { _value: number })._value || 0;
        pan.setOffset({
          x: xValue,
          y: yValue,
        });
        pan.setValue({ x: 0, y: 0 });

        // Haptic feedback on touch
        if (Platform.OS === "ios") {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },
      onPanResponderMove: (evt, gestureState) => {
        // Update pan values
        pan.setValue({ x: gestureState.dx, y: gestureState.dy });

        // Show appropriate overlay based on swipe direction
        if (gestureState.dx > 50) {
          // Swiping right - show like
          const progress = Math.min(
            gestureState.dx / DEFAULT_SWIPE_CONFIG.threshold,
            1,
          );
          likeOpacity.setValue(progress);
          nopeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        } else if (gestureState.dx < -50) {
          // Swiping left - show nope
          const progress = Math.min(
            Math.abs(gestureState.dx) / DEFAULT_SWIPE_CONFIG.threshold,
            1,
          );
          nopeOpacity.setValue(progress);
          likeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        } else if (gestureState.dy < -50) {
          // Swiping up - show super like
          const progress = Math.min(
            Math.abs(gestureState.dy) / DEFAULT_SWIPE_CONFIG.threshold,
            1,
          );
          superLikeOpacity.setValue(progress);
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
        } else {
          // Reset all overlays
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
          superLikeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        pan.flattenOffset();

        const { dx, dy } = gestureState;
        const absDx = Math.abs(dx);
        const absDy = Math.abs(dy);

        // Determine swipe direction and trigger appropriate action
        if (absDx > DEFAULT_SWIPE_CONFIG.threshold && absDx > absDy) {
          // Horizontal swipe
          if (dx > 0) {
            // Swipe right - like
            animateSwipeRight();
          } else {
            // Swipe left - pass
            animateSwipeLeft();
          }
        } else if (absDy > DEFAULT_SWIPE_CONFIG.threshold && dy < 0) {
          // Swipe up - super like
          animateSwipeUp();
        } else {
          // Return to center
          animateReturn();
        }
      },
    }),
  ).current;

  const animateSwipeRight = useCallback(() => {
    if (disabled || isProcessing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const animations = [
      Animated.timing(pan, {
        toValue: { x: SCREEN_WIDTH + 100, y: 0 },
        duration: isAccessibilityEnabled
          ? 150
          : DEFAULT_ANIMATION_CONFIG.duration,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isAccessibilityEnabled
          ? 150
          : DEFAULT_ANIMATION_CONFIG.duration,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
    ];

    Animated.parallel(animations).start(async () => {
      try {
        await handleLike(pet);
        onSwipeRight(pet);
      } catch (error) {
        logger.error("Error handling like:", { error });
      }
    });
  }, [
    disabled,
    isProcessing,
    isAccessibilityEnabled,
    pet,
    handleLike,
    onSwipeRight,
  ]);

  const animateSwipeLeft = useCallback(() => {
    if (disabled || isProcessing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const animations = [
      Animated.timing(pan, {
        toValue: { x: -SCREEN_WIDTH - 100, y: 0 },
        duration: isAccessibilityEnabled
          ? 150
          : DEFAULT_ANIMATION_CONFIG.duration,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isAccessibilityEnabled
          ? 150
          : DEFAULT_ANIMATION_CONFIG.duration,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
    ];

    Animated.parallel(animations).start(async () => {
      try {
        await handlePass(pet);
        onSwipeLeft(pet);
      } catch (error) {
        logger.error("Error handling pass:", { error });
      }
    });
  }, [
    disabled,
    isProcessing,
    isAccessibilityEnabled,
    pet,
    handlePass,
    onSwipeLeft,
  ]);

  const animateSwipeUp = useCallback(() => {
    if (disabled || isProcessing) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const animations = [
      Animated.timing(pan, {
        toValue: { x: 0, y: -SCREEN_HEIGHT - 100 },
        duration: isAccessibilityEnabled ? 200 : 400,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: isAccessibilityEnabled ? 200 : 400,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(scale, {
        toValue: 1.1,
        duration: isAccessibilityEnabled ? 100 : 200,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
    ];

    Animated.parallel(animations).start(async () => {
      try {
        await handleSuperLike(pet);
        onSwipeUp(pet);
      } catch (error) {
        logger.error("Error handling super like:", { error });
      }
    });
  }, [
    disabled,
    isProcessing,
    isAccessibilityEnabled,
    pet,
    handleSuperLike,
    onSwipeUp,
  ]);

  const animateReturn = useCallback(() => {
    const animations = [
      Animated.spring(pan, {
        toValue: { x: 0, y: 0 },
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
        tension: DEFAULT_ANIMATION_CONFIG.tension,
        friction: DEFAULT_ANIMATION_CONFIG.friction,
      }),
      Animated.timing(likeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(nopeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
      Animated.timing(superLikeOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: DEFAULT_ANIMATION_CONFIG.useNativeDriver,
      }),
    ];

    Animated.parallel(animations).start();
  }, [pan, likeOpacity, nopeOpacity, superLikeOpacity]);

  // Calculate rotation based on pan position - memoized for performance
  const rotate = useMemo(
    () =>
      (pan.x.interpolate({
        inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
        outputRange: ["-10deg", "0deg", "10deg"],
        extrapolate: "clamp",
      }) as unknown as Animated.AnimatedInterpolation<string>),
    [pan.x],
  );

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
  return (
    <Animated.View
      style={[
        styles.card,
        disabled && styles.cardDisabled,
        {
          transform: [
            { translateX: pan.x },
            { translateY: pan.y },
            { rotate: rotate },
            { scale: scale },
          ],
          opacity,
        },
      ]}
      {...panResponder.panHandlers}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${pet.name}, ${pet.age} year old ${pet.breed}, ${pet.distance}km away, ${pet.compatibility}% compatibility match`}
      accessibilityHint="Swipe right to like, left to pass, or up for super like. Double tap to view more details."
      accessibilityActions={[
        { name: "like", label: "Like this pet" },
        { name: "pass", label: "Pass on this pet" },
        { name: "superlike", label: "Super like this pet" },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case "like":
            animateSwipeRight();
            break;
          case "pass":
            animateSwipeLeft();
            break;
          case "superlike":
            animateSwipeUp();
            break;
        }
      }}
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
                      ? "#fff"
                      : "rgba(255,255,255,0.4)",
                },
              ]}
            />
          ))}
        </View>

        {/* Photo Navigation Areas */}
        <View style={styles.photoNavigation}>
          <View
            style={styles.photoNavLeft}
            onTouchEnd={prevPhoto}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Previous photo"
            accessibilityHint="Tap to view previous photo"
          />
          <View
            style={styles.photoNavRight}
            onTouchEnd={nextPhoto}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Next photo"
            accessibilityHint="Tap to view next photo"
          />
        </View>

        {/* Verification Badge */}
        {pet.isVerified && (
          <View
            style={styles.verifiedBadge}
            accessible={true}
            accessibilityLabel="Verified pet profile"
            accessibilityRole="image"
          >
            <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
          </View>
        )}

        {/* Distance Badge */}
        <View
          style={styles.distanceBadge}
          accessible={true}
          accessibilityLabel={`${pet.distance} kilometers away`}
          accessibilityRole="text"
        >
          <Text style={styles.distanceText}>{pet.distance}km away</Text>
        </View>

        {/* Swipe Overlays */}
        <Animated.View
          style={[styles.overlay, styles.likeOverlay, { opacity: likeOpacity }]}
        >
          <Text style={styles.overlayText}>LIKE</Text>
        </Animated.View>

        <Animated.View
          style={[styles.overlay, styles.nopeOverlay, { opacity: nopeOpacity }]}
        >
          <Text style={styles.overlayText}>NOPE</Text>
        </Animated.View>

        <Animated.View
          style={[
            styles.overlay,
            styles.superLikeOverlay,
            { opacity: superLikeOpacity },
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
                    backgroundColor: colors.primary,
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
                style={[styles.tag, { backgroundColor: `${colors.primary}20` }]}
              >
                <Text style={[styles.tagText, { color: colors.primary }]}>
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
  );
});

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT * 0.75,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  photoContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoIndicators: {
    position: "absolute",
    top: 20,
    left: 20,
    right: 20,
    flexDirection: "row",
    gap: 8,
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
    top: 20,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 4,
  },
  distanceBadge: {
    position: "absolute",
    bottom: 120,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  distanceText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
  },
  likeOverlay: {
    backgroundColor: "rgba(76, 175, 80, 0.8)",
  },
  nopeOverlay: {
    backgroundColor: "rgba(244, 67, 54, 0.8)",
  },
  superLikeOverlay: {
    backgroundColor: "rgba(33, 150, 243, 0.8)",
  },
  overlayText: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "800",
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginRight: 8,
  },
  age: {
    fontSize: 24,
    fontWeight: "400",
    color: "#fff",
  },
  breed: {
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  compatibilityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  compatibilityBar: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginRight: 8,
  },
  compatibilityFill: {
    height: "100%",
    borderRadius: 2,
  },
  compatibilityText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  tagsContainer: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  bio: {
    fontSize: 14,
    color: "rgba(255,255,255,0.9)",
    lineHeight: 18,
  },
});

// Display name for debugging
SwipeCard.displayName = "SwipeCard";

// Export as default
export default SwipeCard;
