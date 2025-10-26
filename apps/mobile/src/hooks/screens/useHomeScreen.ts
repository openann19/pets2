/**
 * useHomeScreen Hook
 * Manages HomeScreen state and business logic
 */
import { useCallback, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import { matchesAPI } from "../../services/api";
import type { RootStackParamList } from "../../navigation/types";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Stats {
  matches: number;
  messages: number;
  pets: number;
}

interface UseHomeScreenReturn {
  stats: Stats;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
  handleQuickAction: (action: string) => void;
  handleProfilePress: () => void;
  handleSettingsPress: () => void;
  handleSwipePress: () => void;
  handleMatchesPress: () => void;
  handleMessagesPress: () => void;
  handleMyPetsPress: () => void;
  handleCreatePetPress: () => void;
  handleCommunityPress: () => void;
}

export const useHomeScreen = (): UseHomeScreenReturn => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<Stats>({
    matches: 0,
    messages: 0,
    pets: 0,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Use real home stats API endpoint
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/home/stats`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      
      setStats({
        matches: data.matches || 0,
        messages: data.messages || 0,
        pets: 0, // Not included in new API
      });
    } catch (error) {
      logger.error("Failed to refresh data:", { error });
    } finally {
      setRefreshing(false);
    }
  }, [user?.token]);

  const handleQuickAction = useCallback(
    (action: string) => {
      try {
        switch (action) {
          case "swipe":
            navigation.navigate("Swipe");
            break;
          case "matches":
            navigation.navigate("Matches");
            break;
          case "messages":
            navigation.navigate("Matches");
            break;
          case "profile":
            navigation.navigate("Profile");
            break;
          case "settings":
            navigation.navigate("Settings");
            break;
          case "my-pets":
            navigation.navigate("MyPets");
            break;
          case "create-pet":
            navigation.navigate("CreatePet");
            break;
          case "community":
            navigation.navigate("Community");
            break;
          case "premium":
            navigation.navigate("Profile");
            break;
          default:
            logger.warn(`Unknown action: ${action}`);
        }
      } catch (error) {
        logger.error("Navigation error:", { error });
      }
    },
    [navigation],
  );

  const handleProfilePress = useCallback(() => {
    handleQuickAction("profile");
  }, [handleQuickAction]);

  const handleSettingsPress = useCallback(() => {
    handleQuickAction("settings");
  }, [handleQuickAction]);

  const handleSwipePress = useCallback(() => {
    handleQuickAction("swipe");
  }, [handleQuickAction]);

  const handleMatchesPress = useCallback(() => {
    handleQuickAction("matches");
  }, [handleQuickAction]);

  const handleMessagesPress = useCallback(() => {
    handleQuickAction("messages");
  }, [handleQuickAction]);

  const handleMyPetsPress = useCallback(() => {
    handleQuickAction("my-pets");
  }, [handleQuickAction]);

  const handleCreatePetPress = useCallback(() => {
    handleQuickAction("create-pet");
  }, [handleQuickAction]);

  const handleCommunityPress = useCallback(() => {
    handleQuickAction("community");
  }, [handleQuickAction]);

  return {
    stats,
    refreshing,
    onRefresh,
    handleQuickAction,
    handleProfilePress,
    handleSettingsPress,
    handleSwipePress,
    handleMatchesPress,
    handleMessagesPress,
    handleMyPetsPress,
    handleCreatePetPress,
    handleCommunityPress,
  };
};
