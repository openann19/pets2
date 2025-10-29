/**
 * useStories Hook
 * Manages stories feed, navigation, progress tracking, and viewing interactions
 */
import { useCallback, useEffect, useRef, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { useQuery, useMutation } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';
import { useSocket } from '../../useSocket';
import apiClient from '../../../services/apiClient';

interface Story {
  _id: string;
  userId: string;
  mediaType: 'photo' | 'video';
  mediaUrl: string;
  caption?: string;
  duration: number;
  viewCount: number;
  createdAt: string;
}

interface StoryUser {
  _id: string;
  username: string;
  profilePhoto?: string;
}

interface StoryGroup {
  userId: string;
  user: StoryUser;
  stories: Story[];
  storyCount: number;
}

interface StoriesFeedResponse {
  stories: StoryGroup[];
  success: boolean;
}

interface ViewStoryResponse {
  success: boolean;
  viewCount: number;
}

interface UseStoriesReturn {
  // Data
  storyGroups: StoryGroup[] | undefined;
  isLoading: boolean;
  error: string | null;

  // Current navigation state
  currentGroupIndex: number;
  currentStoryIndex: number;
  currentGroup: StoryGroup | undefined;
  currentStory: Story | undefined;
  progress: number;
  viewCount: number;

  // Controls
  isPaused: boolean;
  isMuted: boolean;
  setPaused: (paused: boolean) => void;
  setMuted: (muted: boolean) => void;

  // Navigation
  goToNextStory: () => void;
  goToPreviousStory: () => void;
  goToGroup: (groupIndex: number) => void;
  goToStory: (groupIndex: number, storyIndex: number) => void;

  // Actions
  markAsViewed: (storyId: string) => Promise<void>;
  refreshStories: () => Promise<void>;

  // Refs for external use (video, timers, etc.)
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  progressIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  longPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;
}

export const useStories = (initialGroupIndex: number = 0): UseStoriesReturn => {
  const [currentGroupIndex, setCurrentGroupIndex] = useState(initialGroupIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [viewCount, setViewCount] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const socket = useSocket();

  // Fetch stories feed
  const {
    data: storyGroups,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['stories-feed'],
    queryFn: async () => {
      const response = await apiClient.get<StoriesFeedResponse>('/stories');
      return response.stories;
    },
  });

  const currentGroup = storyGroups?.[currentGroupIndex];

  // Wrapper function to match expected interface
  const refreshStories = useCallback(async (): Promise<void> => {
    await refetch();
  }, [refetch]);

  const currentStory = currentGroup?.stories[currentStoryIndex];

  // Mark story as viewed mutation
  const viewStoryMutation = useMutation({
    mutationFn: async (storyId: string) => {
      const response = await apiClient.post<ViewStoryResponse>(`/stories/${storyId}/view`);
      return response;
    },
    onSuccess: (data: ViewStoryResponse) => {
      setViewCount(data.viewCount);
    },
  });

  // Navigation functions
  const goToNextStory = useCallback(() => {
    if (!currentGroup) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStoryIndex < currentGroup.stories.length - 1) {
      setCurrentStoryIndex((prev) => prev + 1);
      setProgress(0);
    } else if (storyGroups && currentGroupIndex < storyGroups.length - 1) {
      setCurrentGroupIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
      setProgress(0);
    } else {
      // End of stories - could emit event for parent to handle navigation
      logger.info('Reached end of stories');
    }
  }, [currentGroup, currentStoryIndex, currentGroupIndex, storyGroups]);

  const goToPreviousStory = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (currentStoryIndex > 0) {
      setCurrentStoryIndex((prev) => prev - 1);
      setProgress(0);
    } else if (currentGroupIndex > 0 && storyGroups) {
      const prevGroupIndex = currentGroupIndex - 1;
      const prevGroup = storyGroups[prevGroupIndex];
      if (prevGroup) {
        setCurrentGroupIndex(prevGroupIndex);
        setCurrentStoryIndex(prevGroup.stories.length - 1);
        setProgress(0);
      }
    }
  }, [currentStoryIndex, currentGroupIndex, storyGroups]);

  const goToGroup = useCallback(
    (groupIndex: number) => {
      if (groupIndex >= 0 && storyGroups && groupIndex < storyGroups.length) {
        setCurrentGroupIndex(groupIndex);
        setCurrentStoryIndex(0);
        setProgress(0);
      }
    },
    [storyGroups],
  );

  const goToStory = useCallback(
    (groupIndex: number, storyIndex: number) => {
      if (groupIndex >= 0 && storyGroups && groupIndex < storyGroups.length) {
        const group = storyGroups[groupIndex];
        if (group && storyIndex >= 0 && storyIndex < group.stories.length) {
          setCurrentGroupIndex(groupIndex);
          setCurrentStoryIndex(storyIndex);
          setProgress(0);
        }
      }
    },
    [storyGroups],
  );

  // Auto-advance timer
  useEffect(() => {
    if (!currentStory || isPaused) return;

    const duration = currentStory.duration * 1000;
    const startTime = Date.now();

    // Progress update interval
    progressIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      setProgress(newProgress);
    }, 16); // ~60fps

    // Auto-advance timer
    timerRef.current = setTimeout(() => {
      goToNextStory();
    }, duration);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [currentStory, isPaused, goToNextStory]);

  // Mark story as viewed
  useEffect(() => {
    if (currentStory) {
      viewStoryMutation.mutate(currentStory._id);
    }
  }, [currentStory?._id]);

  // Socket.io real-time view updates
  useEffect(() => {
    if (!socket || !currentStory) return;

    const handleStoryViewed = (data: { storyId: string; viewCount: number }) => {
      if (data.storyId === currentStory._id) {
        setViewCount(data.viewCount);
      }
    };

    socket.on('story:viewed', handleStoryViewed);
    return () => {
      socket.off('story:viewed', handleStoryViewed);
    };
  }, [socket, currentStory?._id]);

  const markAsViewed = useCallback(
    async (storyId: string) => {
      try {
        await viewStoryMutation.mutateAsync(storyId);
      } catch (error) {
        logger.error('Failed to mark story as viewed', { error, storyId });
      }
    },
    [viewStoryMutation],
  );

  const setPaused = useCallback((paused: boolean) => {
    setIsPaused(paused);
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    setIsMuted(muted);
  }, []);

  return {
    // Data
    storyGroups,
    isLoading,
    error: error?.message || null,

    // Current navigation state
    currentGroupIndex,
    currentStoryIndex,
    currentGroup,
    currentStory,
    progress,
    viewCount,

    // Controls
    isPaused,
    isMuted,
    setPaused,
    setMuted,

    // Navigation
    goToNextStory,
    goToPreviousStory,
    goToGroup,
    goToStory,

    // Actions
    markAsViewed,
    refreshStories,

    // Refs for external use
    timerRef,
    progressIntervalRef,
    longPressTimer,
  };
};
