/**
 * useMatchesData Hook - Web Version
 * Matches mobile useMatchesData exactly
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';
import { useEffect, useRef, useState } from 'react';
import apiClient from '@/lib/api-client';

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

export interface MatchesFilter {
  sort?: 'newest' | 'oldest' | 'recent';
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
  loadMatches: () => Promise<void>;
  onRefresh: () => Promise<void>;
  setSelectedTab: (tab: 'matches' | 'likedYou') => void;
  setFilter: (filter: MatchesFilter) => void;
  handleScroll: (offset: number) => Promise<void>;
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

export function useMatchesData(): UseMatchesDataReturn {
  const [selectedTab, setSelectedTab] = useState<'matches' | 'likedYou'>('matches');
  const [refreshing, setRefreshing] = useState(false);
  const [initialOffset, setInitialOffset] = useState<number>(0);
  const [filter, setFilter] = useState<MatchesFilter>({ sort: 'newest' });
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
        const matches = await apiClient.getMatches();
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

  // Mutation for refreshing matches
  const refreshMutation = useMutation({
    mutationFn: async () => {
      const realMatches = await apiClient.getMatches();
      return Array.isArray(realMatches) ? realMatches.map(normalizeMatch) : [];
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['matches'], data);
    },
  });

  // Restore scroll position from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('web_matches_scroll');
      if (saved) setInitialOffset(Number(saved));
    } catch {
      // Ignore storage errors
    }
  }, []);

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
      sessionStorage.setItem('web_matches_scroll', String(offset));
    } catch {
      // Ignore storage errors
    }
  };

  // Query for liked you data
  const { data: likedYouData } = useQuery({
    queryKey: ['liked-you'],
    queryFn: async () => {
      try {
        const likedYouMatches = await apiClient.getLikedYou();
        return Array.isArray(likedYouMatches) ? likedYouMatches.map(normalizeMatch) : [];
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
    loadMatches,
    onRefresh,
    setSelectedTab,
    setFilter,
    handleScroll,
  };
}

