/**
 * useBlockedUsers Hook
 * Manages blocked users list, blocking/unblocking operations
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { logger } from '@pawfectmatch/core';
import { matchesAPI } from '@/services/api';
import type { User } from '@/types';

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  blockedAt: string;
  reason?: string;
  avatar?: string;
}

// Map API User to BlockedUser format
function mapUserToBlockedUser(user: User): BlockedUser {
  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}`
    : user.firstName || user.email || 'Unknown';
    
  const blockedUserData = user as unknown as { blockedAt?: string; blockReason?: string };
    
  return {
    id: user.id || user._id,
    name: fullName,
    email: user.email || '',
    blockedAt: blockedUserData.blockedAt || new Date().toISOString(),
    ...(blockedUserData.blockReason ? { reason: blockedUserData.blockReason } : {}),
    ...(user.avatar ? { avatar: user.avatar } : {}),
  };
}

interface UseBlockedUsersReturn {
  // Data
  blockedUsers: BlockedUser[];
  isLoading: boolean;
  isRefreshing: boolean;

  // Actions
  loadBlockedUsers: (refresh?: boolean) => Promise<void>;
  unblockUser: (userId: string, userName: string) => Promise<void>;
  blockUser: (userId: string, reason?: string) => Promise<boolean>;
  refreshData: () => Promise<void>;

  // Computed
  totalBlocked: number;
}

export const useBlockedUsers = (): UseBlockedUsersReturn => {
  const [blockedUsers, setBlockedUsers] = useState<BlockedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadBlockedUsers = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);

      logger.info('Loading blocked users', { refresh });

      // Call real API service
      const users = await matchesAPI.getBlockedUsers();
      const blockedUsers = users.map(mapUserToBlockedUser);

      setBlockedUsers(blockedUsers);
      logger.info('Blocked users loaded successfully', { count: blockedUsers.length });
    } catch (error) {
      logger.error('Failed to load blocked users', { error });
      Alert.alert('Error', 'Failed to load blocked users. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const unblockUser = useCallback(async (userId: string, userName: string) => {
    Alert.alert('Unblock User', `Are you sure you want to unblock ${userName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Unblock',
        style: 'destructive',
        onPress: async () => {
          try {
            logger.info('Unblocking user', { userId, userName });

            // Call real API service
            const success = await matchesAPI.unblockUser(userId);
            if (success) {
              // Remove from local state
              setBlockedUsers((prev) => prev.filter((user) => user.id !== userId));
              Alert.alert('Success', `${userName} has been unblocked`);
              logger.info('User unblocked successfully', { userId });
            } else {
              throw new Error('Unblock operation returned false');
            }
          } catch (error) {
            logger.error('Failed to unblock user', { error, userId });
            Alert.alert('Error', 'Failed to unblock user. Please try again.');
          }
        },
      },
    ]);
  }, []);

  const blockUser = useCallback(async (userId: string, reason?: string): Promise<boolean> => {
    try {
      logger.info('Blocking user', { userId, reason });

      // Call real API service
      const success = await matchesAPI.blockUser(userId);
      if (success) {
        // Refresh the blocked users list
        await loadBlockedUsers(true);
        logger.info('User blocked successfully', { userId });
      }
      return success;
    } catch (error) {
      logger.error('Failed to block user', { error, userId });
      return false;
    }
  }, [loadBlockedUsers]);

  const refreshData = useCallback(async () => {
    await loadBlockedUsers(true);
  }, [loadBlockedUsers]);

  // Initial load
  useEffect(() => {
    void loadBlockedUsers();
  }, [loadBlockedUsers]);

  const totalBlocked = blockedUsers.length;

  return {
    // Data
    blockedUsers,
    isLoading,
    isRefreshing,

    // Actions
    loadBlockedUsers,
    unblockUser,
    blockUser,
    refreshData,

    // Computed
    totalBlocked,
  };
};
