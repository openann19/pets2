/**
 * useBlockedUsersScreen Hook
 * Manages Blocked Users screen state and interactions
 */
import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import { matchesAPI } from "../../services/api";

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  blockedAt: string;
  reason?: string;
  avatar?: string;
}

interface UseBlockedUsersScreenReturn {
  blockedUsers: BlockedUser[];
  loading: boolean;
  refreshing: boolean;
  loadBlockedUsers: () => Promise<void>;
  refreshBlockedUsers: () => Promise<void>;
  unblockUser: (userId: string) => Promise<void>;
}

export const useBlockedUsersScreen = (): UseBlockedUsersScreenReturn => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadBlockedUsers = useCallback(async (refresh = false) => {
    try {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      // Fetch real blocked users from API
      const users = await matchesAPI.getBlockedUsers();

      // Transform API response to BlockedUser format
      const transformedUsers: BlockedUser[] = users.map((user) => ({
        id: user._id || user.id || "",
        name: user.firstName && user.lastName 
          ? `${user.firstName} ${user.lastName}`.trim() 
          : user.firstName || "Unknown",
        email: user.email || "",
        blockedAt: user.createdAt || new Date().toISOString(),
        reason: "User blocked",
      }));

      setBlockedUsers(transformedUsers);
    } catch (error) {
      logger.error("Failed to load blocked users:", { error });
      Alert.alert("Error", "Failed to load blocked users. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refreshBlockedUsers = useCallback(async () => {
    await loadBlockedUsers(true);
  }, [loadBlockedUsers]);

  const unblockUser = useCallback(async (userId: string) => {
    try {
      await matchesAPI.unblockUser(userId);
      
      // Remove user from list
      setBlockedUsers(prev => prev.filter(user => user.id !== userId));
      
      logger.info("User unblocked successfully", { userId });
      Alert.alert("Success", "User has been unblocked");
    } catch (error) {
      logger.error("Failed to unblock user:", { error, userId });
      Alert.alert("Error", "Failed to unblock user. Please try again.");
    }
  }, []);

  return {
    blockedUsers,
    loading,
    refreshing,
    loadBlockedUsers,
    refreshBlockedUsers,
    unblockUser,
  };
};
