import { INTENT_OPTIONS, SPECIES_OPTIONS } from "../../constants/options";
import { logger } from "@pawfectmatch/core";
import Slider from "@react-native-community/slider";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useState } from "react";
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
import { Theme } from '../theme/unified-theme';

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
                minimumTrackTintColor="Theme.colors.primary[500]"
                maximumTrackTintColor="Theme.colors.neutral[200]"
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
                  minimumTrackTintColor="Theme.colors.primary[500]"
                  maximumTrackTintColor="Theme.colors.neutral[200]"
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
                  minimumTrackTintColor="Theme.colors.primary[500]"
                  maximumTrackTintColor="Theme.colors.neutral[200]"
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
                  onPress={() => {
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
                  onPress={() => {
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
                    trackColor={{ false: "Theme.colors.neutral[200]", true: "#fce7f3" }}
                    thumbColor={
                      preferences.notifications[
                        option.key as keyof typeof preferences.notifications
                      ]
                        ? "Theme.colors.primary[500]"
                        : "Theme.colors.neutral[400]"
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
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.completeButton}
          onPress={handleComplete}
        >
          <Text style={styles.completeButtonText}>Complete Setup</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.neutral[0]",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  animatedContainer: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
    textAlign: "center",
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    marginBottom: 16,
    lineHeight: 20,
  },
  sliderContainer: {
    paddingHorizontal: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderThumb: {
    backgroundColor: "Theme.colors.primary[500]",
    width: 20,
    height: 20,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: "Theme.colors.neutral[400]",
  },
  ageRangeContainer: {
    gap: 16,
  },
  ageSlider: {
    paddingHorizontal: 16,
  },
  ageLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "Theme.colors.neutral[700]",
    marginBottom: 8,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionButton: {
    backgroundColor: "Theme.colors.background.secondary",
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 100,
    alignItems: "center",
  },
  selectedOption: {
    backgroundColor: "#fdf2f8",
    borderColor: "Theme.colors.primary[500]",
  },
  optionText: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    fontWeight: "500",
    textAlign: "center",
  },
  selectedOptionText: {
    color: "Theme.colors.primary[500]",
    fontWeight: "600",
  },
  notificationOptions: {
    gap: 16,
  },
  notificationOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "Theme.colors.background.secondary",
    borderRadius: 12,
    padding: 16,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 16,
  },
  notificationLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
  },
  privacyNote: {
    backgroundColor: "#f0f9ff",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
  },
  privacyText: {
    fontSize: 14,
    color: "#0369a1",
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "Theme.colors.neutral[100]",
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
  },
  backButtonText: {
    fontSize: 16,
    color: "Theme.colors.neutral[500]",
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "Theme.colors.primary[500]",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 140,
    alignItems: "center",
  },
  completeButtonText: {
    fontSize: 16,
    color: "Theme.colors.neutral[0]",
    fontWeight: "600",
  },
});

export default PreferencesSetupScreen;
