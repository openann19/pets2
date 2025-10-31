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
import React, { useCallback, useMemo } from 'react';
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
import { useNavigation } from '@react-navigation/native';

import { useTheme } from '@/theme';
import { SHARED_ELEMENT_IDS, prefetchPetImage } from '@/foundation/shared-element';
import type { AppTheme } from '@/theme';
import { useDoubleTapMetrics } from '../hooks/useInteractionMetrics';
import { useLikeWithUndo } from '../hooks/useLikeWithUndo';
import { useSwipeGesturesRNGH } from '../hooks/useSwipeGesturesRNGH';
import { useEntranceAnimation } from '../hooks/useUnifiedAnimations';
import { usePhotoNavigation, useSwipeActions, type Pet as SwipePet } from '../hooks/swipe';
import { DoubleTapLikePlus } from './Gestures/DoubleTapLikePlus';
import LikeArbitrator from './Gestures/LikeArbitrator';
import UndoPill from './feedback/UndoPill';
import MicroPressable from './micro/MicroPressable';

// Lazy load dimensions to support test mocking
const getDimensions = () => {
  try {
    const dims = Dimensions.get('window');
    return { width: dims?.width ?? 375, height: dims?.height ?? 812 };
  } catch {
    return { width: 375, height: 812 };
  }
};
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = getDimensions();
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
  onViewProfile?: () => void;
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
  onViewProfile,
  isTopCard = false,
  disabled = false,
  style,
}: SwipeCardProps): React.JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const styles = makeStyles(theme);
  const navigation = useNavigation();
  
  // Handle card tap to view profile with shared-element transition
  const handleViewProfile = async () => {
    if (disabled || !isTopCard) return;
    
    // Prefetch image before navigation
    if (pet.photos.length > 0 && pet.photos[0]) {
      await prefetchPetImage(pet.photos[0]);
    }
    
    if (onViewProfile) {
      onViewProfile();
    } else {
      (navigation as any).navigate('PetProfile', { petId: pet._id });
    }
  };

  // Photo navigation hook
  const photoNav = usePhotoNavigation({
    totalPhotos: pet.photos.length,
    initialIndex: 0,
  });

  // Swipe actions hook
  const { isProcessing, handleLike, handlePass, handleSuperLike } = useSwipeActions({
    onLike: async (p: SwipePet) => {
      logger.info('Liked pet:', { petName: p.name });
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
    onPass: async (p: SwipePet) => {
      logger.info('Passed pet:', { petName: p.name });
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
    onSuperLike: async (p: SwipePet) => {
      logger.info('Super liked pet:', { petName: p.name });
      await new Promise((resolve) => setTimeout(resolve, 100));
    },
  });

  const { startInteraction, endInteraction } = useDoubleTapMetrics();

  // Like with undo integration
  const { likeNow, triggerUndoPill, undoNow } = useLikeWithUndo({
    onLike: () => {
      const cleanup = () => {
        // Optimistic like toggle
        startInteraction('doubleTap', { petId: pet._id });
        onSwipeRight?.();
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
    AccessibilityInfo.isReduceMotionEnabled().then(() => {
      // Handle reduced motion if needed
    });
  }, []);

  // Swipe gesture handlers
  const handleSwipeLeft = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handlePass(pet as SwipePet).then(() => {
      onSwipeLeft?.();
    });
  }, [disabled, isProcessing, pet, handlePass, onSwipeLeft]);

  const handleSwipeRight = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    handleLike(pet as SwipePet).then(() => {
      onSwipeRight?.();
    });
  }, [disabled, isProcessing, pet, handleLike, onSwipeRight]);

  const handleSwipeUp = useCallback(() => {
    if (disabled || isProcessing) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    handleSuperLike(pet as SwipePet).then(() => {
      onSwipeUp?.();
    });
  }, [disabled, isProcessing, pet, handleSuperLike, onSwipeUp]);

  // Swipe gesture hook with RNGH
  const {
    gesture,
    cardStyle: panStyle,
    likeStyle,
    nopeStyle,
    superStyle,
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
    if (photoNav.currentIndex < pet.photos.length - 1) {
      photoNav.nextPhoto();
    }
  }, [photoNav, pet.photos.length]);

  const prevPhoto = useCallback(() => {
    if (photoNav.currentIndex > 0) {
      photoNav.prevPhoto();
    }
  }, [photoNav]);

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
        accessibilityHint="Swipe right to like, left to pass, or up for super like. Tap info button to view full profile."
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
            heartColor={colors.danger}
            particles={6}
            haptics={{ enabled: true, style: 'medium' }}
            disabled={disabled || !isTopCard}
          >
            <View style={styles.photoContainer}>
              <Animated.Image
                source={{ uri: pet.photos[photoNav.currentIndex] }}
                style={styles.photo}
                resizeMode="cover"
                sharedTransitionTag={`${SHARED_ELEMENT_IDS.PET_IMAGE}-${pet._id}`}
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
                          index === photoNav.currentIndex
                            ? colors.onSurface
                            : theme.utils.alpha(colors.onSurface, 0.4),
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

              {/* View Profile Button - Long press to navigate */}
            <MicroPressable
              style={styles.viewProfileButton}
              haptics={true}
              onPress={handleViewProfile}
            >
              <Ionicons name="information-circle-outline" size={24} color={colors.onSurface} />
            </MicroPressable>
            
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
          colors={['transparent', theme.utils.alpha(theme.palette.neutral[900], 0.8)]}
          style={styles.infoGradient}
        >
          <View style={styles.infoContainer}>
            <Animated.View
              style={styles.nameRow}
              sharedTransitionTag={`${SHARED_ELEMENT_IDS.PET_NAME}-${pet._id}`}
            >
              <Text style={styles.name}>{pet.name}</Text>
              <Text style={styles.age}>{pet.age}</Text>
            </Animated.View>

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

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      width: SCREEN_WIDTH - 40,
      height: SCREEN_HEIGHT * 0.7,
      borderRadius: theme.radii['2xl'],
      backgroundColor: theme.colors.surface,
      overflow: 'hidden',
      shadowColor: theme.palette.neutral[900],
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    cardDisabled: {
      opacity: 0.5,
    },
    photoContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    photoIndicators: {
      position: 'absolute',
      bottom: 100,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: theme.spacing.md,
    },
    photoDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    photoNavigation: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      flexDirection: 'row',
    },
    photoNavLeft: {
      flex: 1,
    },
    photoNavRight: {
      flex: 1,
    },
    verifiedBadge: {
      position: 'absolute',
      top: theme.spacing.md,
      right: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.full,
      padding: 4,
    },
    viewProfileButton: {
      position: 'absolute',
      top: theme.spacing.md,
      left: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.full,
      padding: theme.spacing.xs,
    },
    distanceBadge: {
      position: 'absolute',
      bottom: theme.spacing.md,
      left: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
    },
    distanceText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      fontWeight: '600',
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: theme.radii['2xl'],
    },
    likeOverlay: {
      backgroundColor: theme.colors.success + '40',
    },
    nopeOverlay: {
      backgroundColor: theme.colors.danger + '40',
    },
    superLikeOverlay: {
      backgroundColor: theme.colors.primary + '40',
    },
    overlayText: {
      fontSize: 48,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textTransform: 'uppercase',
      letterSpacing: 4,
    },
    infoGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 200,
      justifyContent: 'flex-end',
    },
    infoContainer: {
      padding: theme.spacing.lg,
      paddingBottom: theme.spacing.xl,
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: theme.spacing.sm,
      marginBottom: theme.spacing.xs,
    },
    name: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    age: {
      fontSize: 24,
      fontWeight: '600',
      color: theme.colors.onMuted,
    },
    breed: {
      fontSize: 18,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.sm,
    },
    compatibilityContainer: {
      marginBottom: theme.spacing.md,
    },
    compatibilityBar: {
      height: 4,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.full,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    compatibilityFill: {
      height: '100%',
    },
    compatibilityText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onMuted,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.xs,
      marginBottom: theme.spacing.md,
    },
    tag: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.full,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '600',
    },
    bio: {
      fontSize: 14,
      color: theme.colors.onMuted,
      lineHeight: 20,
    },
  });
}

// Display name for debugging
ModernSwipeCard.displayName = 'ModernSwipeCard';

export default ModernSwipeCard;
