import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useCallback, useState, useEffect } from "react";
import { Alert } from "react-native";
import { request } from "../../services/api";

export interface PrivacySettings {
  profileVisibility: "public" | "friends" | "nobody";
  showOnlineStatus: boolean;
  showDistance: boolean;
  showLastActive: boolean;
  allowMessages: "everyone" | "matches" | "nobody";
  showReadReceipts: boolean;
  incognitoMode: boolean;
  shareLocation: boolean;
  dataSharing: boolean;
  analyticsTracking: boolean;
}

export function usePrivacySettingsScreen() {
  const { user: _user } = useAuthStore();
  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: "nobody",
    showOnlineStatus: true,
    showDistance: true,
    showLastActive: true,
    allowMessages: "nobody",
    showReadReceipts: true,
    incognitoMode: false,
    shareLocation: true,
    dataSharing: false,
    analyticsTracking: true,
  });
  const [loading, setLoading] = useState(false);

  const loadPrivacySettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await request<PrivacySettings>(
        "/api/profile/privacy",
        {
          method: "GET",
        },
      );

      if (response) {
        setSettings(response);
      }

      logger.info("Privacy settings loaded");
    } catch (error) {
      logger.error("Failed to load privacy settings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrivacySettings();
  }, [loadPrivacySettings]);

  const updateSetting = useCallback(
    async <K extends keyof PrivacySettings>(
      key: K,
      value: PrivacySettings[K],
    ) => {
      try {
        setLoading(true);
        await Haptics.selectionAsync();

        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        await request("/api/profile/privacy", {
          method: "PUT",
          body: newSettings,
        });

        logger.info("Privacy setting updated", { key, value });
      } catch (error) {
        logger.error("Failed to update privacy setting:", error);
        Alert.alert("Error", "Failed to update setting");
      } finally {
        setLoading(false);
      }
    },
    [settings],
  );

  return {
    settings,
    loading,
    updateSetting,
  };
}

