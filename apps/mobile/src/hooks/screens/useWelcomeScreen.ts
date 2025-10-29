/**
 * useWelcomeScreen Hook
 * Manages Welcome screen with navigation and theme integration
 */
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "@/theme";
import { getIsDark } from "../../theme/adapters";
import { useWelcome } from "../domains/onboarding/useWelcome";
import type { WelcomeAnimationValues } from "../../types/animations";
import type { Theme } from "../../theme/types";

interface UseWelcomeScreenReturn {
  // From domain hook
  logoScale: WelcomeAnimationValues['logoScale'];
  logoOpacity: WelcomeAnimationValues['logoOpacity'];
  titleOpacity: WelcomeAnimationValues['titleOpacity'];
  titleTranslateY: WelcomeAnimationValues['titleTranslateY'];
  subtitleOpacity: WelcomeAnimationValues['subtitleOpacity'];
  subtitleTranslateY: WelcomeAnimationValues['subtitleTranslateY'];
  featuresOpacity: WelcomeAnimationValues['featuresOpacity'];
  featuresTranslateY: WelcomeAnimationValues['featuresTranslateY'];
  buttonOpacity: WelcomeAnimationValues['buttonOpacity'];
  buttonScale: WelcomeAnimationValues['buttonScale'];
  confettiScale: WelcomeAnimationValues['confettiScale'];
  isReady: boolean;

  // Screen-specific
  colors: Theme['colors'];
  styles: Theme['styles'];
  isDark: boolean;

  // Navigation
  handleGetStarted: () => void;
  handleSkipOnboarding: () => void;
}

export const useWelcomeScreen = (): UseWelcomeScreenReturn => {
  const navigation = useNavigation();
  const theme = useTheme();
  const { colors, styles } = theme;
  const isDark = getIsDark(theme);

  const {
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
    isReady,
    handleGetStarted: domainHandleGetStarted,
    handleSkipOnboarding: domainHandleSkipOnboarding,
  } = useWelcome();

  const handleGetStarted = () => {
    domainHandleGetStarted();
    navigation.navigate("UserIntent" as never);
  };

  const handleSkipOnboarding = () => {
    domainHandleSkipOnboarding();
    // Navigate to main app or skip to end of onboarding
    navigation.navigate("Main" as never);
  };

  return {
    // From domain hook
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
    isReady,

    // Screen-specific
    colors,
    styles,
    isDark,

    // Navigation
    handleGetStarted,
    handleSkipOnboarding,
  };
};
