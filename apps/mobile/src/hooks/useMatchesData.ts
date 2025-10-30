import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import type { FlatList } from 'react-native';

import { matchesAPI } from '../services/api';
import type { MatchesFilter } from '../components/matches/MatchesFilterModal';

// Raw API match data type
interface RawMatchData {
  _id: string;
  petId?: string;
  pet?: {
    _id: string;
    name: string;
    age: number;
    breed: string;
    photos?: string[];
  };
  petName?: string;
  petPhoto?: string;
  petAge?: number;
  petBreed?: string;
  lastMessage?: {
    content: string;
    timestamp: string;
    senderId: string;
  };
  isOnline?: boolean;
  matchedAt?: string;
  createdAt?: string;
  unreadCount?: number;
}

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

// Helper to normalize API data to Match type
function normalizeMatch(raw: RawMatchData): Match {
  return {
    _id: raw._id,
    petId: raw.petId || raw.pet?._id || '',
    petName: raw.petName || raw.pet?.name || '',
    petPhoto: raw.petPhoto || raw.pet?.photos?.[0] || '',
    petAge: raw.petAge || raw.pet?.age || 0,
    petBreed: raw.petBreed || raw.pet?.breed || '',
    lastMessage: raw.lastMessage || { content: '', timestamp: '', senderId: '' },
    isOnline: raw.isOnline || false,
    matchedAt: raw.matchedAt || raw.createdAt || '',
    unreadCount: raw.unreadCount || 0,
  };
}

export interface UseMatchesDataReturn {
  matches: Match[];
  likedYou: Match[];
  selectedTab: 'matches' | 'likedYou';
  refreshing: boolean;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<unknown>;
  initialOffset: number;
  filter: MatchesFilter;
  listRef: React.RefObject<FlatList<Match>>;
  loadMatches: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setSelectedTab: (tab: 'matches' | 'likedYou') => void;
  setFilter: (filter: MatchesFilter) => void;
  handleScroll: (offset: number) => Promise<void>;
}

export function useMatchesData(): UseMatchesDataReturn {
  const [selectedTab, setSelectedTab] = useState<'matches' | 'likedYou'>('matches');
  const [refreshing, setRefreshing] = useState(false);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const [filter, setFilter] = useState<MatchesFilter>({ sort: 'newest' });
  const listRef = useRef<FlatList<Match>>(null);
  const queryClient = useQueryClient();

  // Query for matches data with filter
  const {
    data: matchesData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['matches', filter],
    queryFn: async () => {
      try {
        const params = new URLSearchParams();
        Object.entries(filter).forEach(([k, v]) => {
          if (v !== undefined && v !== '') params.append(k, String(v));
        });
        const { data } = await matchesAPI.getMatchesWithFilter(params.toString());
        const matches = (data.matches || data) as unknown as RawMatchData[];
        // Map core Match to local Match type if needed
        return Array.isArray(matches) ? matches.map(normalizeMatch) : [];
      } catch (error) {
        logger.error('Failed to load matches:', { error });
        throw error;
      }
    },
    staleTime: 120_000,
    gcTime: 600_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  // Errors are now handled by the screen component using useErrorHandling hook

  // Mutation for refreshing matches
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const realMatches = (await matchesAPI.getMatches()) as unknown as RawMatchData[];
      // Map core Match to local Match type if needed
      return realMatches.map(normalizeMatch);
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
        listRef.current?.scrollToOffset({
          offset: initialOffset,
          animated: false,
        });
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
  const { data: likedYouData } = useQuery({
    queryKey: ['liked-you'],
    queryFn: async () => {
      try {
        const likedYouMatches = (await matchesAPI.getLikedYou()) as unknown as RawMatchData[];
        // Map core Match to local Match type if needed
        return likedYouMatches.map(normalizeMatch);
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
    error: error as Error | null,
    refetch,
    initialOffset,
    filter,
    listRef,
    loadMatches,
    onRefresh,
    setSelectedTab,
    setFilter,
    handleScroll,
  };
}
