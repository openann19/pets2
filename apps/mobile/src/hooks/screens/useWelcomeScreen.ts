/**
 * useWelcomeScreen Hook
 * Manages Welcome screen with navigation and theme integration
 */
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../theme/Provider";
import { getIsDark } from "../../theme/adapters";
import { useWelcome } from "../domains/onboarding/useWelcome";

interface UseWelcomeScreenReturn {
  // From domain hook
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
  isReady: boolean;

  // Screen-specific
  colors: any;
  styles: any;
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
