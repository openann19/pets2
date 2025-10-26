/**
 * useSettingsScreen Hook
 * Manages SettingsScreen state and business logic
 */
import { useCallback, useEffect, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import { gdprService } from "../../services/gdprService";

interface Notifications {
  email: boolean;
  push: boolean;
  matches: boolean;
  messages: boolean;
}

interface Preferences {
  maxDistance: number;
  ageRange: { min: number; max: number };
  species: string[];
  intents: string[];
}

interface DeletionStatus {
  isPending: boolean;
  daysRemaining: number | null;
}

interface UseSettingsScreenReturn {
  notifications: Notifications;
  preferences: Preferences;
  deletionStatus: DeletionStatus;
  setNotifications: (notifications: Notifications) => void;
  setPreferences: (preferences: Preferences) => void;
  handleLogout: () => void;
  handleDeleteAccount: () => void;
  handleExportData: () => Promise<void>;
  handleExportDataComplete: () => void;
}

export const useSettingsScreen = (): UseSettingsScreenReturn => {
  const { logout, user } = useAuthStore();

  const [notifications, setNotifications] = useState<Notifications>({
    email: true,
    push: true,
    matches: true,
    messages: true,
  });

  const [preferences, setPreferences] = useState<Preferences>({
    maxDistance: 50,
    ageRange: { min: 0, max: 30 },
    species: [],
    intents: [],
  });

  const [deletionStatus, setDeletionStatus] = useState<DeletionStatus>({
    isPending: false,
    daysRemaining: null,
  });

  // Check deletion status on mount
  useEffect(() => {
    const checkDeletionStatus = async () => {
      try {
        const isPending = await gdprService.isDeletionPending();
        const daysRemaining = await gdprService.getDaysUntilDeletion();
        setDeletionStatus({
          isPending,
          daysRemaining: daysRemaining ?? null,
        });
      } catch (error) {
        logger.error("Failed to check deletion status:", { error });
      }
    };

    void checkDeletionStatus();
  }, []);

  const handleLogout = useCallback(() => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
        },
      },
    ]);
  }, [logout]);

  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      "Delete Account",
      "This action cannot be undone. Your account will be deleted in 30 days.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await gdprService.requestAccountDeletion({
                feedback: "User requested account deletion from settings",
              });
              setDeletionStatus({ isPending: true, daysRemaining: 30             });
            Alert.alert(
              "Account Deletion Requested",
              "Your account will be deleted in 30 days. You can cancel this anytime.",
            );
            } catch (error) {
              logger.error("Failed to request account deletion:", { error });
              Alert.alert("Error", "Failed to delete account. Please try again.");
            }
          },
        },
      ],
    );
  }, []);

  const handleExportData = useCallback(async () => {
    try {
      const data = await gdprService.exportUserData();
      // In a real app, you would download or share the data
      Alert.alert("Data Exported", "Your data has been exported successfully.");
    } catch (error) {
      logger.error("Failed to export data:", { error });
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  }, []);

  const handleExportDataComplete = useCallback(() => {
    Alert.alert("Export Complete", "Your data has been exported successfully.");
  }, []);

  return {
    notifications,
    preferences,
    deletionStatus,
    setNotifications,
    setPreferences,
    handleLogout,
    handleDeleteAccount,
    handleExportData,
    handleExportDataComplete,
  };
};
