/**
 * useWelcome Hook
 * Manages welcome screen state, animations, and navigation
 */
import { useCallback, useEffect } from "react";
import { InteractionManager, StatusBar } from "react-native";
import {
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from "react-native-reanimated";
import { logger } from "@pawfectmatch/core";
import { AnimationConfigs } from "../../../styles/GlobalStyles";

interface UseWelcomeReturn {
  // Animation values
  logoScale: any;
  logoOpacity: any;
  titleOpacity: any;
  titleTranslateY: any;
  subtitleOpacity: any;
  subtitleTranslateY: any;
  featuresOpacity: any;
  featuresTranslateY: any;
  buttonOpacity: any;
  buttonScale: any;
  confettiScale: any;

  // State
  isReady: boolean;

  // Actions
  initializeAnimations: () => void;
  handleGetStarted: () => void;
  handleSkipOnboarding: () => void;
}

export const useWelcome = (): UseWelcomeReturn => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(30);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const featuresOpacity = useSharedValue(0);
  const featuresTranslateY = useSharedValue(30);
  const buttonOpacity = useSharedValue(0);
  const buttonScale = useSharedValue(0.8);
  const confettiScale = useSharedValue(0);

  const isReady = false; // Will be set to true after animations complete

  const initializeAnimations = useCallback(() => {
    StatusBar.setBarStyle("dark-content");

    // Elite staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      try {
        // Logo entrance with bounce
        logoScale.value = withSpring(1, AnimationConfigs.springBouncy);
        logoOpacity.value = withTiming(1, AnimationConfigs.timing);

        // Title with elegant slide-up
        titleOpacity.value = withDelay(
          300,
          withTiming(1, AnimationConfigs.timing),
        );
        titleTranslateY.value = withDelay(
          300,
          withSpring(0, AnimationConfigs.spring),
        );

        // Subtitle follows smoothly
        subtitleOpacity.value = withDelay(
          600,
          withTiming(1, AnimationConfigs.timing),
        );
        subtitleTranslateY.value = withDelay(
          600,
          withSpring(0, AnimationConfigs.spring),
        );

        // Features with subtle delay
        featuresOpacity.value = withDelay(
          900,
          withTiming(1, AnimationConfigs.timing),
        );
        featuresTranslateY.value = withDelay(
          900,
          withSpring(0, AnimationConfigs.spring),
        );

        // Button with scale animation
        buttonOpacity.value = withDelay(
          1200,
          withTiming(1, AnimationConfigs.timing),
        );
        buttonScale.value = withDelay(
          1200,
          withSpring(1, AnimationConfigs.spring),
        );

        // Confetti effect
        confettiScale.value = withDelay(
          1500,
          withSpring(1, AnimationConfigs.spring),
        );

        logger.info("Welcome screen animations initialized");
      } catch (error) {
        logger.error("Failed to initialize welcome animations", { error });
      }
    });
  }, []);

  const handleGetStarted = useCallback(() => {
    logger.info("User started onboarding flow");
    // Navigation will be handled by parent component
  }, []);

  const handleSkipOnboarding = useCallback(() => {
    logger.info("User skipped onboarding");
    // Navigation will be handled by parent component
  }, []);

  // Initialize animations on mount
  useEffect(() => {
    initializeAnimations();
  }, [initializeAnimations]);

  return {
    // Animation values
    logoScale,
    logoOpacity,
    titleOpacity,
    titleTranslateY,
    subtitleOpacity,
    subtitleTranslateY,
    featuresOpacity,
    featuresTranslateY,
    buttonOpacity,
    buttonScale,
    confettiScale,

    // State
    isReady,

    // Actions
    initializeAnimations,
    handleGetStarted,
    handleSkipOnboarding,
  };
};
