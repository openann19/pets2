/**
 * Post Interactions Hook
 * Handles like, comment, report, block, and activity interactions
 */

import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import { logger } from '../services/logger';
import type { CommunityPost } from '../services/communityAPI';
import {
  useDoubleTapMetrics,
  usePinchMetrics,
  useReactionMetrics,
} from '../hooks/useInteractionMetrics';

interface UsePostInteractionsProps {
  likePost: (postId: string) => Promise<void>;
  addComment: (postId: string, data: { content: string }) => Promise<void>;
  reportPost: (postId: string, reason: string) => Promise<void>;
  blockUser: (userId: string) => Promise<void>;
  joinActivity: (postId: string) => Promise<void>;
}

export const usePostInteractions = ({
  likePost,
  addComment,
  reportPost,
  blockUser,
  joinActivity,
}: UsePostInteractionsProps) => {
  const [likingPosts, setLikingPosts] = useState<Record<string, boolean>>({});
  const [commentingPosts, setCommentingPosts] = useState<Record<string, boolean>>({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [showReactions, setShowReactions] = useState<Record<string, boolean>>({});

  const { startInteraction: startDoubleTap, endInteraction: endDoubleTap } = useDoubleTapMetrics();
  const { startInteraction: startPinch, endInteraction: endPinch } = usePinchMetrics();
  const { startInteraction: startReaction, endInteraction: endReaction } = useReactionMetrics();

  const handleLike = useCallback(
    async (postId: string) => {
      if (likingPosts[postId]) return;

      startDoubleTap('postLike', { postId });
      setLikingPosts((prev) => ({ ...prev, [postId]: true }));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      try {
        await likePost(postId);
        endDoubleTap('postLike', true);
      } catch (error) {
        logger.error('Error liking post:', { error: error as Error, postId });
        endDoubleTap('postLike', false);
      } finally {
        setLikingPosts((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [likePost, likingPosts, startDoubleTap, endDoubleTap],
  );

  const handleComment = useCallback(
    async (postId: string) => {
      const content = commentInputs[postId]?.trim();
      if (!content || commentingPosts[postId]) return;

      setCommentingPosts((prev) => ({ ...prev, [postId]: true }));

      try {
        await addComment(postId, { content });
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error('Error adding comment:', { error: error as Error, postId });
        Alert.alert('Error', 'Failed to add comment. Please try again.');
      } finally {
        setCommentingPosts((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [addComment, commentInputs, commentingPosts],
  );

  const handleReport = useCallback(
    (post: CommunityPost) => {
      Alert.alert('Report Post', 'Why are you reporting this post?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Spam',
          onPress: () => reportPost(post._id, 'spam'),
        },
        {
          text: 'Inappropriate',
          onPress: () => reportPost(post._id, 'inappropriate'),
        },
        {
          text: 'Harassment',
          onPress: () => reportPost(post._id, 'harassment'),
        },
      ]);
    },
    [reportPost],
  );

  const handleBlockUser = useCallback(
    (userId: string, userName: string) => {
      Alert.alert('Block User', `Are you sure you want to block ${userName}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            try {
              await blockUser(userId);
              Alert.alert('Success', 'User has been blocked.');
            } catch (error) {
              Alert.alert('Error', 'Failed to block user.');
            }
          },
        },
      ]);
    },
    [blockUser],
  );

  const handleJoinActivity = useCallback(
    async (postId: string) => {
      try {
        await joinActivity(postId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('Success', "You've joined this activity!");
      } catch (error) {
        Alert.alert('Error', 'Failed to join activity.');
      }
    },
    [joinActivity],
  );

  const handlePostReaction = useCallback(
    (postId: string, emoji: string) => {
      startReaction('postReaction', { postId, emoji });
      logger.info('Post reaction', { postId, emoji });
      setShowReactions((prev) => ({ ...prev, [postId]: false }));
      endReaction('postReaction', true);
    },
    [startReaction, endReaction],
  );

  const handlePostLongPress = useCallback((postId: string) => {
    setShowReactions((prev) => ({ ...prev, [postId]: true }));
  }, []);

  const handleScaleChange = useCallback(
    (postId: string, imageIndex: number, scale: number) => {
      if (scale > 1.1) {
        startPinch('postImage', { postId, imageIndex });
      } else {
        endPinch('postImage', true);
      }
    },
    [startPinch, endPinch],
  );

  return {
    likingPosts,
    commentingPosts,
    commentInputs,
    showReactions,
    setCommentInputs,
    setShowReactions,
    handleLike,
    handleComment,
    handleReport,
    handleBlockUser,
    handleJoinActivity,
    handlePostReaction,
    handlePostLongPress,
    handleScaleChange,
  };
};

