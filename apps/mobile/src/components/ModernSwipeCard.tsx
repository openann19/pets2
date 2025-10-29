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

import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useMemo, useState } from 'react';
import {
  AccessibilityInfo,
  Dimensions,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { type AnimatedStyleProp } from 'react-native-reanimated';

import { useTheme } from '@mobile/src/theme';
import { useDoubleTapMetrics } from '../hooks/useInteractionMetrics';
import { useLikeWithUndo } from '../hooks/useLikeWithUndo';
import { useSwipeGesturesRNGH } from '../hooks/useSwipeGesturesRNGH';
import { useEntranceAnimation } from '../hooks/useUnifiedAnimations';
import { DoubleTapLikePlus } from './Gestures/DoubleTapLikePlus';
import LikeArbitrator from './Gestures/LikeArbitrator';
import SmartImage from './common/SmartImage';
import UndoPill from './feedback/UndoPill';
import MicroPressable from './micro/MicroPressable';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// === TYPES ===
interface Pet {
  _id: string;
  name: string;
  age: number;
  breed: string;
  photos: string[];
  bio: string;
  tags: string[];
  distance: number;
  compatibility: number;
  isVerified: boolean;
}

interface SwipeCardProps {
  pet: Pet;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  isTopCard?: boolean;
  disabled?: boolean;
  style?: AnimatedStyleProp<ViewStyle>;
}

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
  const theme = useTheme();
  const { colors, spacing, radius, typography, shadows } = theme;
  const styles = makeStyles(theme);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { startInteraction, endInteraction } = useDoubleTapMetrics();
  const [isAccessibilityEnabled, setIsAccessibilityEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Like with undo integration
  const { likeNow, triggerUndoPill, undoNow } = useLikeWithUndo({
    onLike: () => {
      const cleanup = () => {
        // Optimistic like toggle
        startInteraction('doubleTap', { petId: pet._id });
        onSwipeRight(pet);
        endInteraction('doubleTap', true, { method: 'doubleTap' });
      };
      cleanup();
      return () => {
        // Return cleanup function for undo
        logger.info('Like undone for:', { petName: pet.name });
      };
    },
    onUndo: () => {
      logger.info('Undo like for:', { petName: pet.name });
    },
  });

  // Handle double-tap like
  const handleDoubleTapLike = useCallback(() => {
    likeNow();
    triggerUndoPill();
  }, [likeNow, triggerUndoPill]);

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
        logger.info('Liked pet:', { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error('Error liking pet:', { error });
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
        logger.info('Passed pet:', { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error('Error passing pet:', { error });
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
        logger.info('Super liked pet:', { petName: pet.name });
        // API call would go here
        await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate API call
      } catch (error) {
        logger.error('Error super liking pet:', { error });
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

  // Swipe gesture hook with RNGH
  const {
    gesture,
    cardStyle: panStyle,
    likeStyle,
    nopeStyle,
    superStyle,
    tx: translateX,
    ty: translateY,
  } = useSwipeGesturesRNGH({
    onSwipeLeft: () => {
      handleSwipeLeft();
    },
    onSwipeRight: () => {
      handleSwipeRight();
    },
    onSwipeUp: () => {
      handleSwipeUp();
    },
    swipeThreshold: 0.3,
    enabled: !disabled && isTopCard,
  });

  // Entrance animation for non-top cards
  const { start: startEntrance, animatedStyle: entranceStyle } = useEntranceAnimation('slideIn', 0);

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
    () => (!isTopCard && entranceStyle ? [panStyle, entranceStyle] : panStyle),
    [panStyle, isTopCard, entranceStyle],
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View
        style={[
          ...cardStyle,
          ...((Array.isArray(combinedAnimatedStyle)
            ? combinedAnimatedStyle
            : [combinedAnimatedStyle]) as AnimatedStyleProp<ViewStyle>[]), // Fix iterator issue
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Pet profile for ${pet.name}, ${pet.age} years old ${pet.breed}`}
        accessibilityHint="Swipe right to like, left to pass, or up for super like"
      >
        {/* Photo Section with Like Arbitration */}
        <LikeArbitrator
          onLike={likeNow}
          triggerUndo={triggerUndoPill}
          onReact={(emoji) => {
            logger.info('Reaction:', { emoji, petName: pet.name });
          }}
        >
          <DoubleTapLikePlus
            onDoubleTap={handleDoubleTapLike}
            heartColor="#ff3b5c"
            particles={6}
            haptics={{ enabled: true, style: 'medium' }}
            disabled={disabled || !isTopCard}
          >
            <View style={styles.photoContainer}>
              <SmartImage
                source={{ uri: pet.photos[currentPhotoIndex] }}
                style={styles.photo}
                resizeMode="cover"
              />

              {/* Photo Navigation Dots */}
              <View style={styles.photoIndicators}>
                {pet.photos.map((_, index) => (
                  <View
                    key={index}
                    style={StyleSheet.flatten([
                      styles.photoDot,
                      {
                        backgroundColor:
                          index === currentPhotoIndex
                            ? colors.onSurfacenverse
                            : 'rgba(255,255,255,0.4)',
                      },
                    ])}
                  />
                ))}
              </View>

              {/* Photo Navigation Areas */}
              <View style={styles.photoNavigation}>
                <View
                  style={styles.photoNavLeft}
                  onTouchEnd={prevPhoto}
                />
                <View
                  style={styles.photoNavRight}
                  onTouchEnd={nextPhoto}
                />
              </View>

              {/* Verification Badge */}
              {pet.isVerified && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={colors.success}
                  />
                </View>
              )}

              {/* Distance Badge */}
              <MicroPressable
                style={styles.distanceBadge}
                haptics={true}
                onPress={() => {
                  logger.info('Distance badge pressed:', {
                    petName: pet.name,
                    distance: pet.distance,
                  });
                  // TODO: Navigate to Map screen when implemented
                  // navigation?.navigate('Map', {
                  //   pet: pet,
                  //   location: { lat: pet.lat, lng: pet.lng }
                  // });
                }}
              >
                <Text style={styles.distanceText}>{pet.distance}km away</Text>
              </MicroPressable>

              {/* Swipe Overlays */}
              <Animated.View
                style={StyleSheet.flatten([styles.overlay, styles.likeOverlay, likeStyle])}
              >
                <Text style={styles.overlayText}>LIKE</Text>
              </Animated.View>

              <Animated.View
                style={StyleSheet.flatten([styles.overlay, styles.nopeOverlay, nopeStyle])}
              >
                <Text style={styles.overlayText}>NOPE</Text>
              </Animated.View>

              <Animated.View
                style={StyleSheet.flatten([styles.overlay, styles.superLikeOverlay, superStyle])}
              >
                <Text style={styles.overlayText}>SUPER LIKE</Text>
              </Animated.View>
            </View>
          </DoubleTapLikePlus>
        </LikeArbitrator>

        {/* Info Section */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
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
                  style={StyleSheet.flatten([
                    styles.compatibilityFill,
                    {
                      width: `${pet.compatibility}%`,
                      backgroundColor: colors.primary,
                    },
                  ])}
                />
              </View>
              <Text style={styles.compatibilityText}>{pet.compatibility}% match</Text>
            </View>

            {/* Tags */}
            <View style={styles.tagsContainer}>
              {pet.tags.slice(0, 3).map((tag, index) => (
                <View
                  key={index}
                  style={StyleSheet.flatten([
                    styles.tag,
                    { backgroundColor: `${colors.primary}20` },
                  ])}
                >
                  <Text style={StyleSheet.flatten([styles.tagText, { color: colors.primary }])}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>

            {/* Bio Preview */}
            <Text
              style={styles.bio}
              numberOfLines={2}
            >
              {pet.bio}
            </Text>
          </View>
        </LinearGradient>

        {/* Undo Pill */}
        <UndoPill onUndo={undoNow} />
      </Animated.View>
    </GestureDetector>
  );
}

const ModernSwipeCard = React.memo(ModernSwipeCardComponent);

// === STYLES ===

// Display name for debugging
ModernSwipeCard.displayName = 'ModernSwipeCard';

export default ModernSwipeCard;
