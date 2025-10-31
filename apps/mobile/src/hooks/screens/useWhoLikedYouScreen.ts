/**
 * Who Liked You Screen Hook
 * Business logic for Who Liked You screen
 */

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { logger } from '@pawfectmatch/core';
import { likesAPI, type ReceivedLike } from '../../../services/api';
import { useSeeWhoLikedGate } from '../../../utils/featureGates';
import type { RootStackScreenProps } from '../../../navigation/types';

type WhoLikedYouScreenProps = RootStackScreenProps<'WhoLikedYou'>;

export interface UseWhoLikedYouScreenReturn {
  // Premium gate
  canUse: boolean;
  reason?: string;
  upgradeRequired: boolean;

  // Data
  likes: ReceivedLike[];
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;

  // Actions
  refetch: () => void;
  handleUserPress: (like: ReceivedLike) => void;
  handleUpgrade: () => void;
  navigation: WhoLikedYouScreenProps['navigation'];
}

export function useWhoLikedYouScreen(
  navigation: WhoLikedYouScreenProps['navigation'],
): UseWhoLikedYouScreenReturn {
  // Check premium access using feature gate hook
  const { canUse, reason, upgradeRequired } = useSeeWhoLikedGate();

  // Fetch received likes
  const {
    data: likes = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery<ReceivedLike[]>({
    queryKey: ['received-likes'],
    queryFn: async () => {
      try {
        return await likesAPI.getReceivedLikes();
      } catch (err) {
        logger.error('Failed to fetch received likes', { error: err });
        throw err;
      }
    },
    enabled: canUse, // Only fetch if user has premium access
    staleTime: 60000, // 1 minute
    retry: 2,
  });

  const handleUserPress = useCallback(
    (like: ReceivedLike) => {
      // Navigate to user profile or pet profile
      // For now, navigate to matches to view potential match
      navigation.navigate('Matches');
    },
    [navigation],
  );

  const handleUpgrade = useCallback(() => {
    navigation.goBack();
    navigation.navigate('Premium');
  }, [navigation]);

  return {
    canUse,
    reason,
    upgradeRequired,
    likes,
    isLoading,
    error: error as Error | null,
    isRefetching,
    refetch,
    handleUserPress,
    handleUpgrade,
    navigation,
  };
}

