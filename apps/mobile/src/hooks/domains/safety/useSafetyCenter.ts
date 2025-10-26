/**
 * useSafetyCenter Hook
 * Manages safety center operations including emergency mode, reporting, and safety tools
 */
import { useCallback, useState } from "react";
import * as Haptics from "expo-haptics";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";

interface SafetyOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  action: () => void;
}

interface UseSafetyCenterReturn {
  // Emergency mode
  emergencyMode: boolean;
  setEmergencyMode: (mode: boolean) => void;
  toggleEmergencyMode: () => Promise<void>;

  // Safety options
  safetyOptions: SafetyOption[];
  handleSafetyOption: (option: SafetyOption) => void;

  // Actions
  reportUser: (userId: string, reason: string) => Promise<boolean>;
  contactSupport: () => void;
  viewSafetyGuidelines: () => void;
  navigateToPrivacySettings: () => void;
  setupEmergencyContacts: () => void;
  viewSafetyTips: () => void;

  // State
  isReporting: boolean;
}

export const useSafetyCenter = (): UseSafetyCenterReturn => {
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [isReporting, setIsReporting] = useState(false);

  const toggleEmergencyMode = useCallback(async (): Promise<void> => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    const newMode = !emergencyMode;

    Alert.alert(
      newMode ? "Enable Emergency Mode" : "Disable Emergency Mode",
      newMode
        ? "Emergency mode will limit interactions and enhance safety features."
        : "This will restore normal app functionality.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: newMode ? "Enable" : "Disable",
          style: newMode ? "destructive" : "default",
          onPress: () => {
            setEmergencyMode(newMode);
            Alert.alert(
              "Emergency Mode",
              newMode
                ? "Emergency mode enabled. Stay safe!"
                : "Emergency mode disabled",
            );
          },
        },
      ],
    );
  }, [emergencyMode]);

  const reportUser = useCallback(
    async (userId: string, reason: string): Promise<boolean> => {
      setIsReporting(true);
      try {
        // In a real implementation, this would call the API
        logger.info("Reporting user", { userId, reason });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        Alert.alert(
          "Report Submitted",
          "Thank you for your report. We will review it shortly.",
        );
        return true;
      } catch (error) {
        logger.error("Failed to report user", { error, userId });
        Alert.alert("Error", "Failed to submit report. Please try again.");
        return false;
      } finally {
        setIsReporting(false);
      }
    },
    [],
  );

  const contactSupport = useCallback(() => {
    Alert.alert("Contact Support", "Support contact options coming soon!");
  }, []);

  const viewSafetyGuidelines = useCallback(() => {
    Alert.alert(
      "Safety Guidelines",
      "Safety guidelines will be available soon!",
    );
  }, []);

  const navigateToPrivacySettings = useCallback(() => {
    Alert.alert(
      "Privacy Settings",
      "Navigate to Privacy Settings screen (coming soon)",
    );
  }, []);

  const setupEmergencyContacts = useCallback(() => {
    Alert.alert("Emergency Contacts", "Emergency contact setup coming soon");
  }, []);

  const viewSafetyTips = useCallback(() => {
    Alert.alert(
      "Safety Tips",
      "Safety tips and guidelines will be available soon",
    );
  }, []);

  const handleSafetyOption = useCallback((option: SafetyOption) => {
    Haptics.selectionAsync().catch(() => {});
    option.action();
  }, []);

  const safetyOptions: SafetyOption[] = [
    {
      id: "report",
      title: "Report User",
      description: "Report inappropriate behavior or content",
      icon: "flag-outline",
      color: "#EF4444",
      action: () => {
        Alert.alert(
          "Report User",
          "This feature is coming soon. Please contact support for urgent issues.",
        );
      },
    },
    {
      id: "block",
      title: "Block & Report",
      description: "Block a user and report their behavior",
      icon: "person-remove-outline",
      color: "#F59E0B",
      action: () => {
        // This would navigate back to profile where blocking is handled
        logger.info("Navigate back to profile for blocking");
      },
    },
    {
      id: "privacy",
      title: "Privacy Settings",
      description: "Control who can see your profile and contact you",
      icon: "lock-closed-outline",
      color: "#10B981",
      action: navigateToPrivacySettings,
    },
    {
      id: "emergency",
      title: "Emergency Contacts",
      description: "Set up emergency contacts for safety",
      icon: "call-outline",
      color: "#8B5CF6",
      action: setupEmergencyContacts,
    },
    {
      id: "safety-tips",
      title: "Safety Tips",
      description: "Learn about online safety and best practices",
      icon: "shield-checkmark-outline",
      color: "#06B6D4",
      action: viewSafetyTips,
    },
  ];

  return {
    // Emergency mode
    emergencyMode,
    setEmergencyMode,
    toggleEmergencyMode,

    // Safety options
    safetyOptions,
    handleSafetyOption,

    // Actions
    reportUser,
    contactSupport,
    viewSafetyGuidelines,
    navigateToPrivacySettings,
    setupEmergencyContacts,
    viewSafetyTips,

    // State
    isReporting,
  };
};
