import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  InteractionManager,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

type OnboardingStackParamList = {
  UserIntent: undefined;
  PetProfileSetup: { userIntent: string };
  PreferencesSetup: { userIntent: string };
  Welcome: undefined;
};

type UserIntentScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "UserIntent"
>;

const SPRING_CONFIG = {
  damping: 20,
  stiffness: 400,
  mass: 0.8,
};

const ELITE_TIMING_CONFIG = {
  duration: 600,
  easing: Easing.bezier(0.4, 0, 0.2, 1),
};

const UserIntentScreen = ({ navigation }: UserIntentScreenProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  // Enhanced animation values
  const scale1 = useSharedValue(0.8);
  const scale2 = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(100);
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-50);
  const card1Opacity = useSharedValue(0);
  const card2Opacity = useSharedValue(0);
  const footerOpacity = useSharedValue(0);

  useEffect(() => {
    StatusBar.setBarStyle("dark-content");

    // Staggered entrance animations
    InteractionManager.runAfterInteractions(() => {
      // Header animation
      headerOpacity.value = withTiming(1, ELITE_TIMING_CONFIG);
      headerTranslateY.value = withSpring(0, SPRING_CONFIG);

      // Cards staggered animation
      card1Opacity.value = withDelay(200, withTiming(1, ELITE_TIMING_CONFIG));
      scale1.value = withDelay(200, withSpring(1, SPRING_CONFIG));

      card2Opacity.value = withDelay(400, withTiming(1, ELITE_TIMING_CONFIG));
      scale2.value = withDelay(400, withSpring(1, SPRING_CONFIG));

      // Footer animation
      footerOpacity.value = withDelay(600, withTiming(1, ELITE_TIMING_CONFIG));

      // Container animation
      opacity.value = withTiming(1, { duration: 800 });
      translateY.value = withSpring(0, SPRING_CONFIG);
    });
  }, []);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const animatedCard1Style = useAnimatedStyle(() => ({
    opacity: card1Opacity.value,
    transform: [{ scale: scale1.value }],
  }));

  const animatedCard2Style = useAnimatedStyle(() => ({
    opacity: card2Opacity.value,
    transform: [{ scale: scale2.value }],
  }));

  const animatedHeaderStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const animatedFooterStyle = useAnimatedStyle(() => ({
    opacity: footerOpacity.value,
  }));

  const triggerHapticFeedback = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleIntentSelect = (intent: string, scaleValue: any) => {
    if (isNavigating) return;

    setSelectedIntent(intent);
    setIsNavigating(true);

    // Enhanced haptic feedback
    runOnJS(triggerHapticFeedback)();

    // Elite selection animation sequence
    scaleValue.value = withSequence(
      withTiming(0.92, { duration: 100 }),
      withSpring(1.05, { ...SPRING_CONFIG, damping: 15 }),
      withSpring(1, SPRING_CONFIG),
    );

    // Exit animation for non-selected card
    const otherScale = scaleValue === scale1 ? scale2 : scale1;
    const otherOpacity = scaleValue === scale1 ? card2Opacity : card1Opacity;

    otherScale.value = withTiming(0.9, ELITE_TIMING_CONFIG);
    otherOpacity.value = withTiming(0.3, ELITE_TIMING_CONFIG);

    // Navigate with delay for smooth animation
    setTimeout(() => {
      if (intent === "adopt") {
        navigation.navigate("PreferencesSetup", { userIntent: intent });
      } else {
        navigation.navigate("PetProfileSetup", { userIntent: intent });
      }
    }, 800);
  };

  return (
    <View style={styles.container}>
      {/* Elite Background Gradient */}
      <LinearGradient
        colors={theme.palette?.gradients?.primary ?? [theme.colors.bg, theme.colors.bg]}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={true}
        >
          <Animated.View
            style={StyleSheet.flatten([styles.content, animatedContainerStyle])}
          >
            {/* Elite Header with Glassmorphic Design */}
            <Animated.View
              style={StyleSheet.flatten([styles.header, animatedHeaderStyle])}
            >
              <BlurView intensity={20} style={styles.logoContainer}>
                <Text style={styles.logo}>🐾 PawfectMatch</Text>
              </BlurView>
              <Text style={styles.title}>Welcome to PawfectMatch!</Text>
              <Text style={styles.subtitle}>
                Let's get started by understanding what you're looking for
              </Text>
            </Animated.View>

            {/* Elite Intent Cards */}
            <View style={styles.intentCards}>
              {/* Adopt a Pet Card */}
              <Animated.View
                style={StyleSheet.flatten([
                  styles.intentCard,
                  animatedCard1Style,
                ])}
              >
                <TouchableOpacity
                  style={StyleSheet.flatten([
                    styles.cardButton,
                    selectedIntent === "adopt" && styles.selectedCard,
                  ])}
                   testID="UserIntentScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    handleIntentSelect("adopt", scale1);
                  }}
                  activeOpacity={0.9}
                  disabled={isNavigating}
                >
                  <LinearGradient
                    colors={
                      selectedIntent === "adopt"
                        ? theme.palette?.gradients?.primary ?? [theme.colors.primary, theme.colors.primary]
                        : [theme.colors.surface + "E6", theme.colors.surface + "B3"]
                    }
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <BlurView
                      intensity={selectedIntent === "adopt" ? 30 : 15}
                      style={styles.cardBlur}
                    >
                      <View style={styles.cardIcon}>
                        <LinearGradient
                          colors={theme.palette?.gradients?.primary ?? [theme.colors.primary, theme.colors.primary]}
                          style={styles.iconGradient}
                        >
                          <Text style={styles.cardEmoji}>🏠</Text>
                        </LinearGradient>
                      </View>
                      <Text style={styles.cardTitle}>
                        I want to adopt a pet
                      </Text>
                      <Text style={styles.cardDescription}>
                        Find your perfect companion from loving pets looking for
                        their forever home
                      </Text>
                      <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>✨</Text>
                          <Text style={styles.featureText}>
                            Browse available pets
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>💝</Text>
                          <Text style={styles.featureText}>
                            Connect with pet owners
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>🤝</Text>
                          <Text style={styles.featureText}>
                            Schedule meet & greets
                          </Text>
                        </View>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* List Pets Card */}
              <Animated.View
                style={StyleSheet.flatten([
                  styles.intentCard,
                  animatedCard2Style,
                ])}
              >
                <TouchableOpacity
                  style={StyleSheet.flatten([
                    styles.cardButton,
                    selectedIntent === "list" && styles.selectedCard,
                  ])}
                   testID="UserIntentScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    handleIntentSelect("list", scale2);
                  }}
                  activeOpacity={0.9}
                  disabled={isNavigating}
                >
                  <LinearGradient
                    colors={
                      selectedIntent === "list"
                        ? theme.palette?.gradients?.primary ?? [theme.colors.primary, theme.colors.primary]
                        : [theme.colors.surface + "E6", theme.colors.surface + "B3"]
                    }
                    style={styles.cardGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <BlurView
                      intensity={selectedIntent === "list" ? 30 : 15}
                      style={styles.cardBlur}
                    >
                      <View style={styles.cardIcon}>
                        <LinearGradient
                          colors={theme.palette?.gradients?.primary ?? [theme.colors.primary, theme.colors.primary]}
                          style={styles.iconGradient}
                        >
                          <Text style={styles.cardEmoji}>📝</Text>
                        </LinearGradient>
                      </View>
                      <Text style={styles.cardTitle}>I have pets to list</Text>
                      <Text style={styles.cardDescription}>
                        Share your pets for adoption, mating, or playdates with
                        other pet lovers
                      </Text>
                      <View style={styles.cardFeatures}>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>📋</Text>
                          <Text style={styles.featureText}>
                            Create pet profiles
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>⚡</Text>
                          <Text style={styles.featureText}>
                            Manage applications
                          </Text>
                        </View>
                        <View style={styles.featureItem}>
                          <Text style={styles.featureBullet}>🔍</Text>
                          <Text style={styles.featureText}>
                            Screen potential adopters
                          </Text>
                        </View>
                      </View>
                    </BlurView>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>

            {/* Elite Footer */}
            <Animated.View
              style={StyleSheet.flatten([
                styles.additionalOptions,
                animatedFooterStyle,
              ])}
            >
              <BlurView intensity={25} style={styles.footerBlur}>
                <Text style={styles.optionsTitle}>
                  You can always do both later!
                </Text>
                <Text style={styles.optionsSubtext}>
                  This helps us personalize your experience, but you can change
                  this anytime in settings
                </Text>
              </BlurView>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return {
    // === CONTAINER & LAYOUT ===
    container: {
      flex: 1,
      position: "relative" as const,
    },
    backgroundGradient: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    safeArea: {
      flex: 1,
    },
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    content: {
      flex: 1,
      justifyContent: "center" as const,
    },

    // === ELITE HEADER ===
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing["2xl"],
    },
    logoContainer: {
      borderRadius: theme.radii.lg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      marginBottom: theme.spacing.lg,
      overflow: "hidden" as const,
      backgroundColor: theme.colors.surface + "4D",
    },
    logo: {
      fontSize: 28,
      fontWeight: "800" as const,
      color: theme.colors.primary,
      textAlign: "center" as const,
    },
    title: {
      fontSize: 32,
      fontWeight: "800" as const,
      color: theme.colors.onSurface,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.onMuted,
      textAlign: "center" as const,
      lineHeight: 26,
      paddingHorizontal: theme.spacing.lg,
      fontWeight: "500" as const,
    },

    // === ELITE INTENT CARDS ===
    intentCards: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing.xl,
    },
    intentCard: {
      width: "100%" as const,
    },
    cardButton: {
      borderRadius: theme.radii.lg,
      overflow: "hidden" as const,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 24,
      elevation: 12,
    },
    selectedCard: {
      shadowOpacity: 0.25,
      shadowRadius: 32,
      elevation: 16,
    },
    cardGradient: {
      borderRadius: theme.radii.lg,
    },
    cardBlur: {
      padding: theme.spacing["2xl"],
      borderRadius: theme.radii.lg,
      borderWidth: 1,
      borderColor: theme.colors.border + "33",
    },

    // === CARD CONTENT ===
    cardIcon: {
      alignItems: "center" as const,
      marginBottom: theme.spacing.lg,
    },
    iconGradient: {
      width: 72,
      height: 72,
      borderRadius: theme.radii.full,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    cardEmoji: {
      fontSize: 32,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: "700" as const,
      color: theme.colors.onSurface,
      textAlign: "center" as const,
      marginBottom: theme.spacing.md,
      letterSpacing: -0.3,
    },
    cardDescription: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: "center" as const,
      lineHeight: 24,
      marginBottom: theme.spacing.lg,
      fontWeight: "500" as const,
      paddingHorizontal: theme.spacing.xs,
    },

    // === FEATURE LIST ===
    cardFeatures: {
      alignItems: "stretch" as const,
      gap: theme.spacing.sm,
    },
    featureItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      backgroundColor: theme.colors.surface + "66",
      borderRadius: theme.radii.md,
      borderWidth: 1,
      borderColor: theme.colors.border + "4D",
    },
    featureBullet: {
      fontSize: 16,
      marginRight: theme.spacing.sm,
      width: 20,
      textAlign: "center" as const,
    },
    featureText: {
      fontSize: 15,
      color: theme.colors.onSurface,
      fontWeight: "600" as const,
      flex: 1,
      lineHeight: 20,
    },

    // === ELITE FOOTER ===
    additionalOptions: {
      alignItems: "center" as const,
      marginTop: theme.spacing.lg,
    },
    footerBlur: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      backgroundColor: theme.colors.surface + "33",
      borderWidth: 1,
      borderColor: theme.colors.border + "4D",
      overflow: "hidden" as const,
    },
    optionsTitle: {
      fontSize: 18,
      fontWeight: "700" as const,
      color: theme.colors.primary,
      marginBottom: theme.spacing.sm,
      textAlign: "center" as const,
    },
    optionsSubtext: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: "center" as const,
      lineHeight: 22,
      fontWeight: "500" as const,
    },
  };
}

export default UserIntentScreen;
