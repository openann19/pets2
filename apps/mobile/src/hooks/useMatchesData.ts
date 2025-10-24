import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { FlatList } from 'react-native';

import { matchesAPI } from '../services/api';

export interface Match {
  _id: string;
  petId: string;
  petName: string;
  petPhoto: string;
  petAge: number;
  petBreed: string;
  lastMessage: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  isOnline: boolean;
  matchedAt: string;
  unreadCount: number;
}

export interface UseMatchesDataReturn {
  matches: Match[];
  likedYou: Match[];
  selectedTab: 'matches' | 'likedYou';
  refreshing: boolean;
  isLoading: boolean;
  initialOffset: number;
  listRef: React.RefObject<FlatList<Match>>;
  loadMatches: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setSelectedTab: (tab: 'matches' | 'likedYou') => void;
  handleScroll: (offset: number) => Promise<void>;
}

export function useMatchesData(): UseMatchesDataReturn {
  const [selectedTab, setSelectedTab] = useState<'matches' | 'likedYou'>('matches');
  const [refreshing, setRefreshing] = useState(false);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const listRef = useRef<FlatList<Match>>(null);
  const queryClient = useQueryClient();

  // Query for matches data
  const {
    data: matchesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => {
      try {
        const realMatches = await matchesAPI.getMatches();
        return realMatches as Match[];
      } catch (error) {
        logger.error('Failed to load matches:', { error });
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Handle query errors
  useEffect(() => {
    if (error) {
      Alert.alert(
        'Connection Error',
        'Unable to load matches. Please check your connection and try again.',
        [
          {
            text: 'Retry',
            onPress: () => refetch(),
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ]
      );
    }
  }, [error, refetch]);

  // Mutation for refreshing matches
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const realMatches = await matchesAPI.getMatches();
      return realMatches as Match[];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['matches'], data);
    },
  });

  // Restore scroll position
  useEffect(() => {
    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem('mobile_matches_scroll');
        if (saved) setInitialOffset(Number(saved));
      } catch {
        // Ignore storage errors
      }
    };
    restore();
  }, []);

  // Scroll to initial position when data loads
  useEffect(() => {
    if (!isLoading && initialOffset > 0) {
      requestAnimationFrame(() => {
        listRef.current?.scrollToOffset({ offset: initialOffset, animated: false });
      });
    }
  }, [isLoading, initialOffset]);

  const loadMatches = async () => {
    await refetch();
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshMutation.mutateAsync();
    } finally {
      setRefreshing(false);
    }
  };

  const handleScroll = async (offset: number) => {
    try {
      await AsyncStorage.setItem('mobile_matches_scroll', String(offset));
    } catch {
      // Ignore storage errors
    }
  };

  // Query for liked you data
  const {
    data: likedYouData,
    isLoading: isLoadingLikedYou,
  } = useQuery({
    queryKey: ['liked-you'],
    queryFn: async () => {
      try {
        const likedYouMatches = await matchesAPI.getLikedYou();
        return likedYouMatches as Match[];
      } catch (error) {
        logger.error('Failed to load liked you:', { error });
        return [];
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const matches = matchesData || [];
  const likedYou = likedYouData || [];

  return {
    matches,
    likedYou,
    selectedTab,
    refreshing: refreshing || refreshMutation.isPending,
    isLoading,
    initialOffset,
    listRef,
    loadMatches,
    onRefresh,
    setSelectedTab,
    handleScroll,
  };
}
