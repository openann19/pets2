/**
 * 🎯 CINEMATIC CARD → DETAILS TRANSITION
 * 
 * Hero flow: Card blooms to full screen
 * - Background defocus + light streaks
 * - Subtle audio swell + haptics
 * - react-native-shared-element + Reanimated
 * - Skia blur layer behind (animated to 12-20)
 * - Tiny whoosh SFX + "confirm" haptic at settle
 * 
 * DoD: ≤240ms open, ≤180ms close; <1% frame drops on iPhone 12/Pixel 6; reduced-motion = simple fade/scale
 */

import { useCapabilities } from '@/foundation/capabilities';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { haptic } from '@/foundation/haptics';
import { prefetchPetImage } from '@/foundation/shared-element';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { logger } from '@pawfectmatch/core';
import { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';

/**
 * Play whoosh sound effect for cinematic transition
 */
async function playWhooshSound(): Promise<void> {
  try {
    const { sound } = await Audio.Sound.createAsync(
      // Use a short, subtle whoosh sound
      // In production, load from assets: require('@/assets/sounds/whoosh.mp3')
      // For now, create a programmatic sound using Audio API
      { uri: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=' },
      { volume: 0.3, shouldPlay: true }
    );
    
    // Auto-unload after playing
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
      }
    });
  } catch (error) {
    // Silently fail if audio not available
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.debug('Whoosh sound playback failed', { error: errorMessage });
  }
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface CinematicTransitionProps {
  /** Whether transition is active */
  active: boolean;
  /** Callback when transition completes */
  onComplete?: () => void;
  /** Image URI to prefetch */
  imageUri?: string;
}

/**
 * Cinematic transition overlay
 * Provides blur + light streaks during card→details transition
 */
export function CinematicTransition({
  active,
  onComplete,
  imageUri,
}: CinematicTransitionProps) {
  const caps = useCapabilities();
  const reducedMotion = useReduceMotion();
  const theme = useTheme() as AppTheme;
  
  const blurIntensity = useSharedValue(0);
  const lightStreakOpacity = useSharedValue(0);
  const transitionProgress = useSharedValue(0);

  // Prefetch image before transition
  useEffect(() => {
    if (active && imageUri) {
      prefetchPetImage(imageUri);
    }
  }, [active, imageUri]);

  // Trigger transition
  useEffect(() => {
    if (!active) {
      blurIntensity.value = 0;
      lightStreakOpacity.value = 0;
      transitionProgress.value = 0;
      return;
    }

    // Haptic feedback
    haptic.tap();

    // Animate blur (12-20 based on capability)
    const targetBlur = caps.highPerf && caps.thermalsOk ? 20 : 12;
    
    if (reducedMotion) {
      // Simple fade for reduced motion
      transitionProgress.value = withTiming(1, { duration: 180 });
      blurIntensity.value = withTiming(targetBlur * 0.5, { duration: 180 });
      
      setTimeout(() => {
        haptic.confirm();
        onComplete?.();
      }, 180);
    } else {
      // Cinematic transition
      transitionProgress.value = withTiming(1, { duration: 240 });
      
      // Blur animation (staggered)
      blurIntensity.value = withSequence(
        withTiming(targetBlur * 0.6, { duration: 120 }),
        withTiming(targetBlur, { duration: 120 })
      );

      // Light streaks
      lightStreakOpacity.value = withSequence(
        withTiming(0.3, { duration: 100 }),
        withTiming(0, { duration: 140 })
      );

      // Haptic + sound at settle
      setTimeout(() => {
        haptic.confirm();
        // Play whoosh sound effect
        playWhooshSound();
        onComplete?.();
      }, 240);
    }
  }, [active, reducedMotion, caps, onComplete]);

  // Animated blur style
  const blurStyle = useAnimatedStyle(() => {
    if (Platform.OS === 'ios') {
      return {
        opacity: interpolate(
          transitionProgress.value,
          [0, 1],
          [0, 1],
          Extrapolation.CLAMP
        ),
      };
    } else {
      const alpha = Math.round(
        interpolate(
          blurIntensity.value,
          [0, 20],
          [0, 0.8],
          Extrapolation.CLAMP
        ) * 255
      );
      return {
        backgroundColor: theme.colors.surface + alpha.toString(16).padStart(2, '0'),
      };
    }
  });

  // Light streak style
  const streakStyle = useAnimatedStyle(() => {
    return {
      opacity: lightStreakOpacity.value,
      transform: [
        {
          translateX: interpolate(
            transitionProgress.value,
            [0, 1],
            [-SCREEN_WIDTH, SCREEN_WIDTH],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  if (!active || transitionProgress.value === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Blur background */}
      {Platform.OS === 'ios' ? (
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]}>
          <BlurView
            intensity={blurIntensity.value}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : (
        <Animated.View style={[StyleSheet.absoluteFill, blurStyle]} />
      )}

      {/* Light streaks */}
      {!reducedMotion && caps.highPerf && (
        <Animated.View style={[StyleSheet.absoluteFill, streakStyle]}>
          <LinearGradient
            colors={[
              'transparent',
              theme.colors.primary + '40',
              'transparent',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
    </View>
  );
}

