/**
 * useWelcome Hook
 * Manages welcome screen state, animations, and navigation
 */
import { useCallback, useEffect, useState, useRef } from 'react';
import { InteractionManager, StatusBar, AppState } from 'react-native';
import { useSharedValue, withSpring, withTiming, withDelay } from 'react-native-reanimated';
import { logger } from '@pawfectmatch/core';
import { SPRING, DUR } from '../../../animation';

import type { WelcomeAnimationValues } from '../../../types/animations';

interface WelcomeStep {
  id: string;
  title: string;
  content: string;
  accessibilityLabel?: string;
}

interface WelcomeConfig {
  steps?: WelcomeStep[];
  initialStep?: number;
  canSkip?: boolean;
  animationType?: 'fade' | 'slide' | 'scale';
  styles?: {
    container?: any;
    title?: any;
    content?: any;
  };
  onComplete?: () => void;
  onSkip?: () => void;
  onStepChange?: (step: number) => void;
}

interface UseWelcomeReturn extends WelcomeAnimationValues {
  // State
  isReady: boolean;
  currentStep: number;
  isComplete: boolean;
  canSkip: boolean;
  totalSteps: number;
  steps: WelcomeStep[];
  progress: number;
  stepCompletion: boolean[];
  currentStepData: WelcomeStep | null;
  nextStepData: WelcomeStep | null;
  styles: WelcomeConfig['styles'];
  animationType: string;
  accessibility: {
    nextButton: string;
    previousButton: string;
    skipButton: string;
    currentStep: string;
  };
  keyboardNavigation: {
    nextKey: string;
    previousKey: string;
    skipKey: string;
  };
  onComplete: (() => void) | undefined;
  onSkip: (() => void) | undefined;
  interactions: any[];
  timeSpent: number;
  stepViews: number[];
  analytics: any;
  userPreferences: any;

  // Actions
  initializeAnimations: () => void;
  handleGetStarted: () => void;
  handleSkipOnboarding: () => void;
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (step: number) => void;
  completeWelcome: () => Promise<void>;
  skipWelcome: () => Promise<void>;
  trackInteraction: (type: string, data?: any) => void;
  trackTimeSpent: (duration: number) => void;
  trackStepView: (step: number) => void;
  loadPersistedProgress: () => Promise<void>;
  persistProgress: () => Promise<void>;
  trackEvent: (event: string, data?: any) => void;
  getNavigationTarget: () => string;
  setUserPreferences: (preferences: any) => void;
  handleAppStateChange: (state: string) => void;
}

const DEFAULT_STEPS: WelcomeStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to PawfectMatch!',
    content: 'Find your perfect pet companion with our intelligent matching system.',
  },
  {
    id: 'features',
    title: 'Smart Matching',
    content: 'Our AI analyzes your preferences to find pets that match your lifestyle.',
  },
  {
    id: 'community',
    title: 'Join the Community',
    content: 'Connect with other pet lovers and share your experiences.',
  },
];

export const useWelcome = (config: WelcomeConfig = {}): UseWelcomeReturn => {
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

  // State
  const [isReady, setIsReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(config.initialStep || 0);
  const [isComplete, setIsComplete] = useState(false);
  const [stepCompletion, setStepCompletion] = useState<boolean[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [interactions, setInteractions] = useState<any[]>([]);
  const [stepViews, setStepViews] = useState<number[]>([]);
  const [analytics, setAnalytics] = useState<any>({});
  const [userPreferences, setUserPrefsState] = useState<any>({});
  const startTimeRef = useRef(Date.now());

  // Configuration
  const steps = config.steps || DEFAULT_STEPS;
  const canSkip = config.canSkip !== false;
  const animationType = config.animationType || 'slide';
  const styles = config.styles || {};
  const onComplete = config.onComplete;
  const onSkip = config.onSkip;
  const onStepChange = config.onStepChange;

  // Computed values
  const totalSteps = steps.length;
  const progress = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;
  const currentStepData = steps[currentStep] || null;
  const nextStepData = steps[currentStep + 1] || null;

  // Initialize step completion array
  useEffect(() => {
    setStepCompletion(new Array(totalSteps).fill(false));
  }, [totalSteps]);

  // Track time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Date.now() - startTimeRef.current);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle empty steps case
  useEffect(() => {
    if (totalSteps === 0) {
      setIsComplete(true);
    }
  }, [totalSteps]);

  const initializeAnimations = useCallback(() => {
    StatusBar.setBarStyle('dark-content');

    // Elite staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      try {
        // Logo entrance with bounce
        logoScale.value = withSpring(1, SPRING.stiff);
        logoOpacity.value = withTiming(1, { duration: DUR.normal });

        // Title with elegant slide-up
        titleOpacity.value = withDelay(300, withTiming(1, { duration: DUR.normal }));
        titleTranslateY.value = withDelay(300, withSpring(0, SPRING.soft));

        // Subtitle follows smoothly
        subtitleOpacity.value = withDelay(600, withTiming(1, { duration: DUR.normal }));
        subtitleTranslateY.value = withDelay(600, withSpring(0, SPRING.soft));

        // Features with subtle delay
        featuresOpacity.value = withDelay(900, withTiming(1, { duration: DUR.normal }));
        featuresTranslateY.value = withDelay(900, withSpring(0, SPRING.soft));

        // Button with scale animation
        buttonOpacity.value = withDelay(1200, withTiming(1, { duration: DUR.normal }));
        buttonScale.value = withDelay(1200, withSpring(1, SPRING.soft));

        // Confetti effect
        confettiScale.value = withDelay(1500, withSpring(1, SPRING.soft));

        setIsReady(true);
        logger.info('Welcome screen animations initialized');
      } catch (error) {
        logger.error('Failed to initialize welcome animations', { error });
      }
    });
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(current => {
      if (current < totalSteps - 1) {
        const newStep = current + 1;
        trackStepView(newStep);
        onStepChange?.(newStep);
        return newStep;
      } else if (current === totalSteps - 1) {
        // Complete on last step
        setIsComplete(true);
        trackEvent('welcome_completed', { totalTime: timeSpent });
        onComplete?.();
        logger.info('Welcome flow completed');
        return current;
      }
      return current;
    });
  }, [totalSteps, onStepChange, onComplete, timeSpent]);

  const previousStep = useCallback(() => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      trackStepView(newStep);
      onStepChange?.(newStep);
    }
  }, [currentStep, onStepChange]);

  const goToStep = useCallback((step: number) => {
    if (step >= 0 && step < totalSteps) {
      setCurrentStep(step);
      trackStepView(step);
      onStepChange?.(step);
    } else if (step < 0) {
      // Go to first step for negative values
      setCurrentStep(0);
      trackStepView(0);
      onStepChange?.(0);
    } else if (step >= totalSteps) {
      // Go to last step for values beyond total
      const lastStep = totalSteps - 1;
      setCurrentStep(lastStep);
      trackStepView(lastStep);
      onStepChange?.(lastStep);
    }
  }, [totalSteps, onStepChange]);

  const completeWelcome = useCallback(async () => {
    try {
      setIsComplete(true);
      await persistProgress();
      trackEvent('welcome_completed', { totalTime: timeSpent });
      onComplete?.();
      logger.info('Welcome flow completed');
    } catch (error) {
      logger.error('Failed to complete welcome', { error });
      throw error;
    }
  }, [onComplete, timeSpent]);

  const skipWelcome = useCallback(async () => {
    try {
      setIsComplete(true);
      await persistProgress();
      trackEvent('welcome_skipped', { totalTime: timeSpent });
      onSkip?.();
      logger.info('Welcome flow skipped');
    } catch (error) {
      logger.error('Failed to skip welcome', { error });
      throw error;
    }
  }, [onSkip, timeSpent]);

  const trackInteraction = useCallback((type: string, data?: any) => {
    setInteractions(prev => [...prev, { type, data, timestamp: Date.now() }]);
    logger.info('Welcome interaction tracked', { type, data, step: currentStep });
  }, [currentStep]);

  const trackTimeSpent = useCallback((duration: number) => {
    setTimeSpent(duration);
    logger.info('Time spent tracked', { duration, step: currentStep });
  }, [currentStep]);

  const trackStepView = useCallback((step: number) => {
    setStepViews(prev => [...prev, step]);
    logger.info('Step view tracked', { step });
  }, []);

  const loadPersistedProgress = useCallback(async () => {
    try {
      // Load from storage (mock implementation)
      logger.info('Loading persisted progress');
    } catch (error) {
      logger.error('Failed to load persisted progress', { error });
      throw error;
    }
  }, []);

  const persistProgress = useCallback(async () => {
    try {
      // Save to storage (mock implementation)
      logger.info('Persisting progress', { currentStep, isComplete });
    } catch (error) {
      logger.error('Failed to persist progress', { error });
      throw error;
    }
  }, [currentStep, isComplete]);

  const trackEvent = useCallback((event: string, data?: any) => {
    setAnalytics((prev: any) => ({ ...prev, [event]: data }));
    logger.info('Analytics event tracked', { event, data, step: currentStep });
  }, [currentStep]);

  const getNavigationTarget = useCallback(() => {
    return isComplete ? 'MainTabs' : 'Welcome';
  }, [isComplete]);

  const setUserPreferences = useCallback((preferences: any) => {
    setUserPrefsState(preferences);
    logger.info('User preferences set', { preferences });
  }, []);

  const handleAppStateChange = useCallback((state: string) => {
    if (state === 'background') {
      persistProgress();
    }
    logger.info('App state changed', { state });
  }, [persistProgress]);

  const handleGetStarted = useCallback(() => {
    logger.info('User started onboarding flow');
    // Navigation will be handled by parent component
  }, []);

  const handleSkipOnboarding = useCallback(() => {
    logger.info('User skipped onboarding');
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
    currentStep,
    isComplete,
    canSkip,
    totalSteps,
    steps,
    progress,
    stepCompletion,
    currentStepData,
    nextStepData,
    styles,
    animationType,
    accessibility: {
      nextButton: 'Next step',
      previousButton: 'Previous step',
      skipButton: 'Skip welcome',
      currentStep: `Step ${currentStep + 1} of ${totalSteps}`,
    },
    keyboardNavigation: {
      nextKey: 'ArrowRight',
      previousKey: 'ArrowLeft',
      skipKey: 'Escape',
    },
    onComplete: onComplete || (() => {}),
    onSkip: onSkip || (() => {}),
    interactions,
    timeSpent,
    stepViews,
    analytics,
    userPreferences,

    // Actions
    initializeAnimations,
    handleGetStarted,
    handleSkipOnboarding,
    nextStep,
    previousStep,
    goToStep,
    completeWelcome,
    skipWelcome,
    trackInteraction,
    trackTimeSpent,
    trackStepView,
    loadPersistedProgress,
    persistProgress,
    trackEvent,
    getNavigationTarget,
    setUserPreferences,
    handleAppStateChange,
  };
};
