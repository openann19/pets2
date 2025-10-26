import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  Dimensions,
  StyleSheet,
  Text,
  View,
  StatusBar,
  InteractionManager,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  runOnJS,
} from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useEffect } from "react";
import { EliteButton } from "../../components/EliteComponents";
import { useWelcomeScreen } from "../../hooks/screens/onboarding";
import { useTheme } from "../../contexts/ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { logger } from "@pawfectmatch/core";
import { BlurView } from "expo-blur";
import type { ViewStyle, TextStyle } from "react-native";
import React from "react";
import { lightTheme } from "../../theme/tokens";

// Create spacing object for backward compatibility
const Spacing = lightTheme.spacing;

// Animation configurations
const SPRING_BOUNCY = {
  damping: 8,
  stiffness: 300,
  mass: 1,
};

const SPRING = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const TIMING = {
  duration: 400,
};

const { width, height } = Dimensions.get("window");

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type WelcomeScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "Welcome"
>;

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const WelcomeScreen = ({ navigation }: WelcomeScreenProps) => {
  // Theme context
  const { colors, styles, isDark } = useTheme();
  const localStyles = createLocalStyles(colors);

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

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");

    // Elite staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      // Logo entrance with bounce
      logoScale.value = withSpring(1, SPRING_BOUNCY);
      logoOpacity.value = withTiming(1, TIMING);

      // Title with elegant slide-up
      titleOpacity.value = withDelay(300, withTiming(1, TIMING));
      titleTranslateY.value = withDelay(300, withSpring(0, SPRING));

      // Subtitle follows smoothly
      subtitleOpacity.value = withDelay(600, withTiming(1, TIMING));
      subtitleTranslateY.value = withDelay(600, withSpring(0, SPRING));

      // Features with subtle delay
      featuresOpacity.value = withDelay(900, withTiming(1, TIMING));
      featuresTranslateY.value = withDelay(900, withSpring(0, SPRING));

      // Button with satisfying scale
      buttonOpacity.value = withDelay(1200, withTiming(1, TIMING));
      buttonScale.value = withDelay(1200, withSpring(1, SPRING_BOUNCY));

      // Confetti celebration
      confettiScale.value = withDelay(
        500,
        withSequence(withSpring(1.3, SPRING_BOUNCY), withSpring(1, SPRING)),
      );
    });
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const featuresAnimatedStyle = useAnimatedStyle(() => ({
    opacity: featuresOpacity.value,
    transform: [{ translateY: featuresTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const confettiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: confettiScale.value }],
  }));

  const triggerHaptic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  };

  const handleGetStarted = async () => {
    try {
      // Elite haptic feedback
      runOnJS(triggerHaptic)();

      // Mark onboarding as complete
      await AsyncStorage.setItem("onboarding_complete", "true");

      // Celebration animation before navigation
      confettiScale.value = withSequence(
        withSpring(1.5, SPRING_BOUNCY),
        withSpring(1, SPRING),
      );

      logger.info("🎉 Onboarding completed! Welcome to PawfectMatch!");

      // Navigate to main app after celebration
      setTimeout(() => {
        require("react-native").DevSettings?.reload?.();
      }, 800);
    } catch (error) {
      logger.error("Error saving onboarding status:", { error });
    }
  };

  const containerStyle = React.useMemo(
    () => ({
      backgroundColor: colors.gray100,
    }),
    [colors.gray100],
  );

  return (
    <View
      style={StyleSheet.flatten([
        styles.container as ViewStyle,
        containerStyle,
      ])}
    >
      <LinearGradient
        colors={
          isDark
            ? [colors.primary, colors.primaryDark || colors.primary]
            : [colors.success, colors.success]
        }
        style={StyleSheet.absoluteFill}
      >
        {/* Elite Confetti Background */}
        <Animated.View
          style={StyleSheet.flatten([
            localStyles.confettiContainer,
            confettiAnimatedStyle,
          ])}
        >
          {Array.from({ length: 8 }).map((_, index) => (
            <Text
              key={index}
              style={StyleSheet.flatten([
                localStyles.confetti,
                {
                  top: `${10 + index * 5}%`,
                  left: `${20 + index * 10}%`,
                },
              ])}
            >
              {index % 2 === 0 ? "🎉" : "✨"}
            </Text>
          ))}
        </Animated.View>

        <View style={localStyles.container}>
          {/* Elite Logo with Glassmorphic Design */}
          <Animated.View
            style={StyleSheet.flatten([
              localStyles.logoContainer,
              logoAnimatedStyle,
            ])}
          >
            <BlurView intensity={30} style={localStyles.logoBlur}>
              <LinearGradient
                colors={[colors.success, `${colors.success}DD`]}
                style={localStyles.logoGradient}
              >
                <Text style={localStyles.logo}>🐾</Text>
              </LinearGradient>
            </BlurView>
          </Animated.View>

          {/* Elite Title */}
          <Animated.View style={titleAnimatedStyle}>
            <Text style={styles.title as TextStyle}>You're All Set!</Text>
            <View style={localStyles.titleAccent} />
          </Animated.View>

          {/* Elite Subtitle */}
          <Animated.View style={subtitleAnimatedStyle}>
            <Text
              style={StyleSheet.flatten([
                styles.subtitle as TextStyle,
                localStyles.subtitle,
                { color: colors.gray600 },
              ])}
            >
              Welcome to the PawfectMatch community! Your profile is ready and
              we're excited to help you find amazing connections.
            </Text>
          </Animated.View>

          {/* Elite Features */}
          <Animated.View
            style={StyleSheet.flatten([
              localStyles.eliteFeaturesContainer,
              featuresAnimatedStyle,
            ])}
          >
            <BlurView intensity={20} style={localStyles.eliteFeaturesBlur}>
              <View style={localStyles.eliteFeature}>
                <LinearGradient
                  colors={[colors.secondary, colors.secondaryLight]}
                  style={localStyles.eliteFeatureIconContainer}
                >
                  <Ionicons name="heart" size={24} color={colors.white} />
                </LinearGradient>
                <View style={localStyles.eliteFeatureText}>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureTitle,
                      { color: colors.gray800 },
                    ])}
                  >
                    Smart Matching
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureDescription,
                      { color: colors.gray600 },
                    ])}
                  >
                    AI-powered recommendations based on your preferences
                  </Text>
                </View>
              </View>

              <View style={localStyles.eliteFeature}>
                <LinearGradient
                  colors={[colors.primary, colors.primaryLight]}
                  style={localStyles.eliteFeatureIconContainer}
                >
                  <Ionicons name="chatbubbles" size={24} color={colors.white} />
                </LinearGradient>
                <View style={localStyles.eliteFeatureText}>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureTitle,
                      { color: colors.gray800 },
                    ])}
                  >
                    Safe Messaging
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureDescription,
                      { color: colors.gray600 },
                    ])}
                  >
                    Connect securely with other pet lovers
                  </Text>
                </View>
              </View>

              <View style={localStyles.eliteFeature}>
                <LinearGradient
                  colors={[colors.accent, colors.accentLight]}
                  style={localStyles.eliteFeatureIconContainer}
                >
                  <Ionicons name="location" size={24} color={colors.white} />
                </LinearGradient>
                <View style={localStyles.eliteFeatureText}>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureTitle,
                      { color: colors.gray800 },
                    ])}
                  >
                    Local Connections
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureDescription,
                      { color: colors.gray600 },
                    ])}
                  >
                    Find pets and owners in your area
                  </Text>
                </View>
              </View>

              <View style={localStyles.eliteFeature}>
                <LinearGradient
                  colors={[colors.warning, `${colors.warning}DD`]}
                  style={localStyles.eliteFeatureIconContainer}
                >
                  <Ionicons
                    name="shield-checkmark"
                    size={24}
                    color={colors.white}
                  />
                </LinearGradient>
                <View style={localStyles.eliteFeatureText}>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureTitle,
                      { color: colors.gray800 },
                    ])}
                  >
                    Verified Profiles
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteFeatureDescription,
                      { color: colors.gray600 },
                    ])}
                  >
                    Trust and safety are our top priorities
                  </Text>
                </View>
              </View>
            </BlurView>
          </Animated.View>

          {/* Elite Pro Tips */}
          <View style={localStyles.eliteTipsContainer}>
            <BlurView intensity={15} style={localStyles.eliteTipsBlur}>
              <View style={localStyles.eliteTipsHeader}>
                <Ionicons name="bulb" size={20} color={colors.warning} />
                <Text
                  style={StyleSheet.flatten([
                    localStyles.eliteTipsTitle,
                    { color: colors.gray800 },
                  ])}
                >
                  Pro Tips
                </Text>
              </View>
              <View style={localStyles.eliteTipsList}>
                <View style={localStyles.eliteTip}>
                  <Ionicons name="camera" size={16} color={colors.success} />
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteTipText,
                      { color: colors.gray700 },
                    ])}
                  >
                    Add photos to get 3x more matches
                  </Text>
                </View>
                <View style={localStyles.eliteTip}>
                  <Ionicons name="heart" size={16} color={colors.secondary} />
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteTipText,
                      { color: colors.gray700 },
                    ])}
                  >
                    Be honest about your pet's personality
                  </Text>
                </View>
                <View style={localStyles.eliteTip}>
                  <Ionicons name="time" size={16} color={colors.primary} />
                  <Text
                    style={StyleSheet.flatten([
                      localStyles.eliteTipText,
                      { color: colors.gray700 },
                    ])}
                  >
                    Respond to messages within 24 hours
                  </Text>
                </View>
              </View>
            </BlurView>
          </View>
        </View>

        {/* Elite Get Started Button */}
        <Animated.View
          style={StyleSheet.flatten([
            localStyles.eliteButtonContainer,
            buttonAnimatedStyle,
          ])}
        >
          <EliteButton
            title="Start Matching! 🚀"
            size="lg"
            icon="rocket"
            onPress={handleGetStarted}
            gradient={[colors.success, `${colors.success}DD`]}
            style={localStyles.eliteGetStartedButton}
          />

          <Text
            style={StyleSheet.flatten([
              localStyles.eliteFooterText,
              { color: colors.gray500 },
            ])}
          >
            You can update your preferences anytime in settings
          </Text>
        </Animated.View>
      </LinearGradient>
    </View>
  );
};

interface WelcomeStyles {
  eliteContent: ViewStyle;
  eliteConfettiContainer: ViewStyle;
  eliteConfetti: TextStyle;
  eliteLogoContainer: ViewStyle;
  eliteLogoBlur: ViewStyle;
  eliteLogoGradient: ViewStyle;
  eliteLogo: TextStyle;
  eliteTitle: TextStyle;
  eliteSubtitle: TextStyle;
  eliteTitleAccent: ViewStyle;
  eliteFeaturesContainer: ViewStyle;
  eliteFeaturesBlur: ViewStyle;
  eliteFeatureRow: ViewStyle;
  eliteFeature: ViewStyle;
  eliteFeatureIcon: ViewStyle;
  eliteFeatureText: ViewStyle;
  eliteFeatureIconContainer: ViewStyle;
  eliteFeatureTitle: TextStyle;
  eliteFeatureDescription: TextStyle;
  eliteTipContainer: ViewStyle;
  eliteTipIcon: ViewStyle;
  eliteTipText: TextStyle;
  eliteButtonContainer: ViewStyle;
  eliteGetStartedButton: ViewStyle;
  eliteGetStartedButtonText: TextStyle;
  eliteFooterText: TextStyle;
  [key: string]: ViewStyle | TextStyle | undefined;
}

// Helper function to create type-safe styles
const createStyles = <T extends Record<string, any>>(styles: T): T => styles;

const createLocalStyles = (colors: any): WelcomeStyles =>
  createStyles({
    // === ELITE WELCOME STYLES ===
    eliteContent: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: Spacing["4xl"],
      paddingVertical: Spacing["4xl"],
    },

    // === ELITE CONFETTI ===
    eliteConfettiContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
    },
    eliteConfetti: {
      fontSize: 32,
      opacity: 0.8,
      // Position will be set inline since it's different for each confetti
    } as const,

    // === ELITE LOGO ===
    eliteLogoContainer: {
      alignItems: "center" as const,
      marginBottom: Spacing["3xl"],
    },
    eliteLogoBlur: {
      borderRadius: 40,
      overflow: "hidden",
      padding: Spacing.md,
    },
    eliteLogoGradient: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
    } as const,
    eliteLogo: {
      fontSize: 40,
    },
    eliteTitle: {
      fontSize: 32,
      fontWeight: "bold" as const,
      textAlign: "center" as const,
      marginBottom: Spacing.md,
      color: colors.text,
    } as const,
    eliteSubtitle: {
      fontSize: 16,
      textAlign: "center" as const,
      color: colors.gray500,
      marginBottom: Spacing["4xl"],
    } as const,
    eliteFeaturesContainer: {
      marginBottom: Spacing["4xl"],
    },
    eliteFeatureRow: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: Spacing.lg,
    } as const,
    eliteFeatureIcon: {
      marginRight: Spacing.md,
    },
    eliteFeatureText: {
      flex: 1,
    },
    eliteTipContainer: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      borderRadius: 12,
      padding: Spacing.md,
      marginBottom: Spacing["4xl"],
    } as const,
    eliteTipIcon: {
      marginRight: Spacing.sm,
    },
    eliteButtonContainer: {
      marginBottom: Spacing["4xl"],
    },
    eliteGetStartedButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: Spacing.lg,
      alignItems: "center" as const,
    } as const,
    eliteGetStartedButtonText: {
      color: "white",
      fontSize: 16,
      fontWeight: "600" as const,
    } as const,
    eliteFooterText: {
      fontSize: 12,
      textAlign: "center" as const,
      color: colors.gray500,
      marginTop: Spacing["4xl"],
    } as const,

    // === ELITE TITLE ===
    eliteTitleAccent: {
      width: 60,
      height: 4,
      backgroundColor: colors.success,
      borderRadius: 2,
      alignSelf: "center" as const,
      marginTop: Spacing.md,
    } as const,
    // === ELITE FEATURES ===
    eliteFeaturesBlur: {
      borderRadius: 20,
      padding: Spacing["4xl"],
      overflow: "hidden" as const,
      backgroundColor: colors.glassWhiteLight,
      borderWidth: 1,
      borderColor: colors.glassWhiteDark,
    },
    eliteFeature: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: Spacing.xl,
    },
    eliteFeatureIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: Spacing.lg,
    },
    eliteFeatureTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: colors.gray800,
      marginBottom: Spacing.xs,
    },
    eliteFeatureDescription: {
      fontSize: 14,
      color: colors.gray600,
      lineHeight: 20,
    },

    // === ELITE TIPS ===
    eliteTipsContainer: {
      marginBottom: Spacing["4xl"],
    },
    eliteTipsBlur: {
      borderRadius: 16,
      padding: Spacing.xl,
      overflow: "hidden" as const,
      backgroundColor: colors.glassWhiteLight,
      borderWidth: 1,
      borderColor: colors.glassWhiteDark,
    },
    eliteTipsHeader: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      marginBottom: Spacing.lg,
    },
    eliteTipsTitle: {
      fontSize: 16,
      fontWeight: "700" as const,
      color: colors.gray800,
      marginLeft: Spacing.sm,
    },
    eliteTipsList: {
      gap: Spacing.md,
    },
    eliteTip: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingVertical: Spacing.sm,
    },
    eliteTipText: {
      fontSize: 14,
      color: colors.gray600,
      marginLeft: Spacing.md,
      flex: 1,
    },
  });

export default WelcomeScreen;
