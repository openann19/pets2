import { INTENT_OPTIONS, SPECIES_OPTIONS } from "../../constants/options";
import { logger } from "@pawfectmatch/core";
import Slider from "@react-native-community/slider";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState, useMemo } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
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

type PreferencesSetupScreenProps = NativeStackScreenProps<
  OnboardingStackParamList,
  "PreferencesSetup"
>;

interface PreferencesData {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
  species: string[];
  intents: string[];
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
}

const SPRING_CONFIG = {
  damping: 15,
  stiffness: 300,
  mass: 1,
};

const PreferencesSetupScreen = ({
  navigation,
  route,
}: PreferencesSetupScreenProps) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { userIntent } = route.params;
  const [preferences, setPreferences] = useState<PreferencesData>({
    maxDistance: 25,
    ageRange: {
      min: 0,
      max: 15,
    },
    species: [],
    intents: userIntent === "adopt" ? ["adoption"] : ["adoption", "playdate"],
    notifications: {
      email: true,
      push: true,
      matches: true,
      messages: true,
    },
  });

  const scaleValue = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withTiming(1, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scaleValue.value }],
  }));

  const updatePreferences = (
    field: string,
    value: import("../../types/forms").FormFieldValue,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNotifications = (field: string, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const toggleSpecies = (species: string) => {
    setPreferences((prev) => ({
      ...prev,
      species: prev.species.includes(species)
        ? prev.species.filter((s) => s !== species)
        : [...prev.species, species],
    }));
  };

  const toggleIntent = (intent: string) => {
    setPreferences((prev) => ({
      ...prev,
      intents: prev.intents.includes(intent)
        ? prev.intents.filter((i) => i !== intent)
        : [...prev.intents, intent],
    }));
  };

  const handleComplete = async () => {
    if (preferences.species.length === 0) {
      Alert.alert(
        "Missing Information",
        "Please select at least one species you're interested in.",
      );
      return;
    }

    if (preferences.intents.length === 0) {
      Alert.alert("Missing Information", "Please select at least one intent.");
      return;
    }

    try {
      // Save preferences to backend
      logger.info("Saving preferences:", { preferences });

      // Animate completion
      scaleValue.value = withSpring(0.95, SPRING_CONFIG, () => {
        scaleValue.value = withSpring(1, SPRING_CONFIG);
      });

      // Navigate to welcome screen
      setTimeout(() => {
        navigation.navigate("Welcome");
      }, 500);
    } catch (error) {
      Alert.alert("Error", "Failed to save preferences. Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={StyleSheet.flatten([styles.animatedContainer, animatedStyle])}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Set Your Preferences</Text>
            <Text style={styles.subtitle}>
              Help us find the perfect matches for you
            </Text>
          </View>

          {/* Distance Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Search Distance</Text>
            <Text style={styles.sectionSubtitle}>
              How far are you willing to travel? ({preferences.maxDistance}{" "}
              miles)
            </Text>
            <View style={styles.sliderContainer}>
              <Slider
                style={styles.slider}
                minimumValue={5}
                maximumValue={100}
                value={preferences.maxDistance}
                onValueChange={(value) => {
                  updatePreferences("maxDistance", Math.round(value));
                }}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.border}
              />
              <View style={styles.sliderLabels}>
                <Text style={styles.sliderLabel}>5 mi</Text>
                <Text style={styles.sliderLabel}>100 mi</Text>
              </View>
            </View>
          </View>

          {/* Age Range */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎂 Pet Age Range</Text>
            <Text style={styles.sectionSubtitle}>
              What age range interests you? ({preferences.ageRange.min} -{" "}
              {preferences.ageRange.max} years)
            </Text>
            <View style={styles.ageRangeContainer}>
              <View style={styles.ageSlider}>
                <Text style={styles.ageLabel}>Min Age</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={0}
                  maximumValue={15}
                  value={preferences.ageRange?.min || 1}
                  onValueChange={(value) => {
                    updatePreferences("ageRange", {
                      ...preferences.ageRange,
                      min: Math.round(value),
                    });
                  }}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                />
              </View>
              <View style={styles.ageSlider}>
                <Text style={styles.ageLabel}>Max Age</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={preferences.ageRange?.min || 1}
                  maximumValue={20}
                  value={preferences.ageRange?.max || 10}
                  onValueChange={(value) => {
                    updatePreferences("ageRange", {
                      ...preferences.ageRange,
                      max: Math.round(value),
                    });
                  }}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.border}
                />
              </View>
            </View>
          </View>

          {/* Species Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🐾 Species Interest</Text>
            <Text style={styles.sectionSubtitle}>
              What types of pets are you interested in? (Select at least one)
            </Text>
            <View style={styles.optionsGrid}>
              {SPECIES_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={StyleSheet.flatten([
                    styles.optionButton,
                    preferences.species.includes(option.value) &&
                      styles.selectedOption,
                  ])}
                   testID="PreferencesSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    toggleSpecies(option.value);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.optionText,
                      preferences.species.includes(option.value) &&
                        styles.selectedOptionText,
                    ])}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Intent Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💝 What You're Looking For</Text>
            <Text style={styles.sectionSubtitle}>
              Select all that interest you
            </Text>
            <View style={styles.optionsGrid}>
              {INTENT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={StyleSheet.flatten([
                    styles.optionButton,
                    preferences.intents.includes(option.value) &&
                      styles.selectedOption,
                  ])}
                   testID="PreferencesSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    toggleIntent(option.value);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.optionText,
                      preferences.intents.includes(option.value) &&
                        styles.selectedOptionText,
                    ])}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔔 Notifications</Text>
            <Text style={styles.sectionSubtitle}>
              Stay updated with your matches and messages
            </Text>
            <View style={styles.notificationOptions}>
              {[
                {
                  key: "push",
                  label: "Push Notifications",
                  description: "Get notified instantly",
                },
                {
                  key: "email",
                  label: "Email Updates",
                  description: "Weekly summaries and important updates",
                },
                {
                  key: "matches",
                  label: "New Matches",
                  description: "When you get a new match",
                },
                {
                  key: "messages",
                  label: "New Messages",
                  description: "When someone messages you",
                },
              ].map((option) => (
                <View key={option.key} style={styles.notificationOption}>
                  <View style={styles.notificationInfo}>
                    <Text style={styles.notificationLabel}>{option.label}</Text>
                    <Text style={styles.notificationDescription}>
                      {option.description}
                    </Text>
                  </View>
                  <Switch
                    value={
                      preferences.notifications[
                        option.key as keyof typeof preferences.notifications
                      ]
                    }
                    onValueChange={(value) => {
                      updateNotifications(option.key, value);
                    }}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primary + "33" }}
                    thumbColor={
                      preferences.notifications[
                        option.key as keyof typeof preferences.notifications
                      ]
                        ? theme.colors.primary
                        : theme.colors.border
                    }
                  />
                </View>
              ))}
            </View>
          </View>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Text style={styles.privacyText}>
              🔒 Your privacy is important to us. You can change these
              preferences anytime in settings.
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
           testID="PreferencesSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
           testID="PreferencesSetupScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    animatedContainer: {
      flex: 1,
    },
    header: {
      alignItems: "center" as const,
      marginBottom: theme.spacing["2xl"],
    },
    title: {
      fontSize: 28,
      fontWeight: "700" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: "center" as const,
    },
    section: {
      marginBottom: theme.spacing["2xl"],
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "700" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    sectionSubtitle: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.md,
      lineHeight: 20,
    },
    sliderContainer: {
      paddingHorizontal: theme.spacing.md,
    },
    slider: {
      width: "100%" as const,
      height: 40,
    },
    sliderThumb: {
      backgroundColor: theme.colors.primary,
      width: 20,
      height: 20,
    },
    sliderLabels: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      marginTop: theme.spacing.xs,
    },
    sliderLabel: {
      fontSize: 12,
      color: theme.colors.onMuted,
    },
    ageRangeContainer: {
      gap: theme.spacing.md,
    },
    ageSlider: {
      paddingHorizontal: theme.spacing.md,
    },
    ageLabel: {
      fontSize: 14,
      fontWeight: "600" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    optionsGrid: {
      flexDirection: "row" as const,
      flexWrap: "wrap" as const,
      gap: theme.spacing.sm,
    },
    optionButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      minWidth: 100,
      alignItems: "center" as const,
    },
    selectedOption: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.primary,
      borderWidth: 2,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      fontWeight: "500" as const,
      textAlign: "center" as const,
    },
    selectedOptionText: {
      color: theme.colors.primary,
      fontWeight: "600" as const,
    },
    notificationOptions: {
      gap: theme.spacing.md,
    },
    notificationOption: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
    },
    notificationInfo: {
      flex: 1,
      marginRight: theme.spacing.md,
    },
    notificationLabel: {
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    notificationDescription: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    privacyNote: {
      backgroundColor: theme.colors.info + "1A",
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing["2xl"],
    },
    privacyText: {
      fontSize: 14,
      color: theme.colors.info,
      lineHeight: 20,
      textAlign: "center" as const,
    },
    footer: {
      flexDirection: "row" as const,
      justifyContent: "space-between" as const,
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    backButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: "600" as const,
    },
    completeButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.sm,
      minWidth: 140,
      alignItems: "center" as const,
    },
    completeButtonText: {
      fontSize: 16,
      color: theme.colors.onPrimary,
      fontWeight: "600" as const,
    },
  };
}

export default PreferencesSetupScreen;