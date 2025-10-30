/**
 * useStoriesScreen Hook
 * Manages Stories screen state and gesture handling
 */
import { useNavigation } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { Dimensions, PanResponder } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useStories } from '../domains/social/useStories';
import { useReduceMotion } from '../../hooks/useReducedMotion';
import { telemetry } from '../../lib/telemetry';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UseStoriesScreenReturn {
  // From domain hook
  storyGroups: any;
  isLoading: boolean;
  error: string | null;
  currentGroupIndex: number;
  currentStoryIndex: number;
  currentGroup: any;
  currentStory: any;
  progress: number;
  viewCount: number;
  isPaused: boolean;
  isMuted: boolean;
  goToNextStory: () => void;
  goToPreviousStory: () => void;
  goToGroup: (groupIndex: number) => void;
  goToStory: (groupIndex: number, storyIndex: number) => void;
  markAsViewed: (storyId: string) => Promise<void>;
  refreshStories: () => Promise<void>;
  timerRef: React.MutableRefObject<NodeJS.Timeout | null>;
  progressIntervalRef: React.MutableRefObject<NodeJS.Timeout | null>;
  longPressTimer: React.MutableRefObject<NodeJS.Timeout | null>;

  // Screen-specific
  panResponder: React.RefObject<any>;
  handleGoBack: () => void;
  setPaused: (paused: boolean) => void;
  setMuted: (muted: boolean) => void;
}

export const useStoriesScreen = (initialGroupIndex: number = 0): UseStoriesScreenReturn => {
  const navigation = useNavigation();
  const reducedMotion = useReduceMotion();

  const {
    storyGroups,
    isLoading,
    error,
    currentGroupIndex,
    currentStoryIndex,
    currentGroup,
    currentStory,
    progress,
    viewCount,
    isPaused,
    isMuted,
    goToNextStory,
    goToPreviousStory,
    goToGroup,
    goToStory,
    markAsViewed,
    refreshStories,
    setPaused,
    setMuted,
    timerRef,
    progressIntervalRef,
    longPressTimer,
  } = useStories(initialGroupIndex);

  // Pan responder for swipe gestures
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (_evt) => {
        // Long press detection
        longPressTimer.current = setTimeout(() => {
          setPaused(true);
          telemetry.trackStoriesPause(
            currentStory?._id
              ? {
                  storyId: currentStory._id,
                  storyIndex: currentStoryIndex,
                  groupIndex: currentGroupIndex,
                }
              : undefined,
          );
          if (!reducedMotion) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
        }, 200);
      },
      onPanResponderRelease: (evt, gestureState) => {
        // Clear long press timer
        if (longPressTimer.current) {
          clearTimeout(longPressTimer.current);
          longPressTimer.current = null;
        }
        const wasPaused = isPaused;
        setPaused(false);
        if (wasPaused) {
          telemetry.trackStoriesResume(
            currentStory?._id
              ? {
                  storyId: currentStory._id,
                  storyIndex: currentStoryIndex,
                  groupIndex: currentGroupIndex,
                }
              : undefined,
          );
        }

        const { locationX } = evt.nativeEvent;
        const { dx, dy } = gestureState;

        // Swipe down to close
        if (dy > 100) {
          handleGoBack();
          return;
        }

        // Swipe up for reply (future feature)
        if (dy < -100) {
          telemetry.trackStoriesSwipeUp(
            currentStory?._id
              ? {
                  storyId: currentStory._id,
                  storyIndex: currentStoryIndex,
                  groupIndex: currentGroupIndex,
                }
              : undefined,
          );
          // setShowReplyInput(true);
          return;
        }

        // Horizontal swipe or tap
        if (Math.abs(dx) > 50) {
          if (dx > 0) {
            telemetry.trackStoriesPrev(
              currentStory?._id
                ? {
                    storyId: currentStory._id,
                    storyIndex: currentStoryIndex,
                    groupIndex: currentGroupIndex,
                  }
                : undefined,
            );
            goToPreviousStory();
          } else {
            telemetry.trackStoriesNext(
              currentStory?._id
                ? {
                    storyId: currentStory._id,
                    storyIndex: currentStoryIndex,
                    groupIndex: currentGroupIndex,
                  }
                : undefined,
            );
            goToNextStory();
          }
        } else {
          // Tap navigation
          if (locationX < SCREEN_WIDTH / 3) {
            telemetry.trackStoriesPrev(
              currentStory?._id
                ? {
                    storyId: currentStory._id,
                    storyIndex: currentStoryIndex,
                    groupIndex: currentGroupIndex,
                  }
                : undefined,
            );
            goToPreviousStory();
          } else {
            telemetry.trackStoriesNext(
              currentStory?._id
                ? {
                    storyId: currentStory._id,
                    storyIndex: currentStoryIndex,
                    groupIndex: currentGroupIndex,
                  }
                : undefined,
            );
            goToNextStory();
          }
        }
      },
    }),
  );

  const handleGoBack = useCallback(() => {
    telemetry.trackStoriesClose();
    navigation.goBack();
  }, [navigation]);

  const handleSetPaused = (paused: boolean) => {
    setPaused(paused);
    if (paused) {
      telemetry.trackStoriesPause(
        currentStory?._id
          ? {
              storyId: currentStory._id,
              storyIndex: currentStoryIndex,
              groupIndex: currentGroupIndex,
            }
          : undefined,
      );
    } else {
      telemetry.trackStoriesResume(
        currentStory?._id
          ? {
              storyId: currentStory._id,
              storyIndex: currentStoryIndex,
              groupIndex: currentGroupIndex,
            }
          : undefined,
      );
    }
  };

  const handleSetMuted = (muted: boolean) => {
    setMuted(muted);
    telemetry.trackStoriesMuteToggle(
      currentStory?._id
        ? {
            storyId: currentStory._id,
            storyIndex: currentStoryIndex,
            groupIndex: currentGroupIndex,
          }
        : undefined,
    );
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    };
  }, []);

  return {
    // From domain hook
    storyGroups,
    isLoading,
    error,
    currentGroupIndex,
    currentStoryIndex,
    currentGroup,
    currentStory,
    progress,
    viewCount,
    isPaused,
    isMuted,
    goToNextStory,
    goToPreviousStory,
    goToGroup,
    goToStory,
    markAsViewed,
    refreshStories,
    timerRef,
    progressIntervalRef,
    longPressTimer,

    // Screen-specific
    panResponder,
    handleGoBack,
    setPaused: handleSetPaused,
    setMuted: handleSetMuted,
  };
};
