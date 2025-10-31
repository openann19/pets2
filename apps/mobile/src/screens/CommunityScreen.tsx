/**
 * Community Feed Screen
 *
 * Production-grade community feed with:
 * - Infinite scroll pagination
 * - Pull-to-refresh
 * - Like/comment interactions
 * - Activity participation
 * - Report and block functionality
 * - Real-time updates
 * - Offline support
 */

import { useCallback, useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import {
  CommunityEmptyState,
  CommunityListFooter,
  CommunityLoadingState,
  PostCard,
  PostCreationModal,
  PostPreviewModal,
} from '../components/Community';
import { useCommunityFeed } from '../hooks/useCommunityFeed';
import { usePostInteractions } from '../hooks/usePostInteractions';
import { useTheme } from '@mobile/theme';
import {
  PostCreationService,
  type PostCreationData,
  type UploadProgress,
} from '../services/postCreationService';
import { useScrollOffsetTracker } from '../hooks/navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../hooks/navigation/useTabReselectRefresh';
import type { CommunityPost } from '../services/communityAPI';
import type { CreatePostRequest } from '../services/communityAPI';
import { logger } from '../services/logger';
import type { FlashList as FlashListType } from '@shopify/flash-list';

interface CommunityScreenProps {
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export default function CommunityScreen({ navigation: _navigation }: CommunityScreenProps = {}) {
  const theme = useTheme();
  const listRef = useRef<FlashListType<CommunityPost>>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  const {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    refreshFeed,
    loadMore,
    likePost,
    addComment,
    reportPost,
    blockUser,
    joinActivity,
  } = useCommunityFeed();

  const [submittingPost, setSubmittingPost] = useState(false);
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [showPostPreview, setShowPostPreview] = useState(false);
  const [pendingPostData, setPendingPostData] = useState<PostCreationData | null>(null);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  const {
    likingPosts,
    showReactions,
    setShowReactions,
    handleLike,
    handleReport,
    handleBlockUser,
    handleJoinActivity,
    handlePostReaction,
    handlePostLongPress,
    handleScaleChange,
  } = usePostInteractions({
    likePost,
    addComment,
    reportPost,
    blockUser,
    joinActivity,
  });

  // Enhanced post creation with preview and progress tracking
  const handleCreatePost = useCallback(async (data: CreatePostRequest) => {
    // Convert CreatePostRequest to PostCreationData
    const postCreationData: PostCreationData = {
      content: data.content,
      ...(data.images && data.images.length > 0 && {
        images: data.images.map((uri) => ({
          uri,
          fileName: uri.split('/').pop() || 'image.jpg',
          mimeType: 'image/jpeg',
        })),
      }),
      ...(data.activityDetails && {
        activityDetails: {
          title: data.content,
          description: data.content,
          date: data.activityDetails.date,
          location: data.activityDetails.location,
          maxParticipants: data.activityDetails.maxAttendees,
        },
      }),
      tags: [],
    };
    setPendingPostData(postCreationData);
    setShowPostPreview(true);
  }, []);

  const handlePostSubmit = useCallback(
    async () => {
      if (!pendingPostData) return;

      setSubmittingPost(true);
      setShowPostPreview(false);

      try {
        const result = await PostCreationService.createPost(pendingPostData, {
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
          enableOffline: true,
        });

        if (result.success) {
          setShowCreatePostForm(false);
          Alert.alert('Success', 'Your post has been created!');
          await refreshFeed();
        } else {
          Alert.alert('Error', result.error || 'Failed to create post. Please try again.');
        }
      } catch (error) {
        logger.error('Post creation failed', { error: error instanceof Error ? error : new Error(String(error)) });
        Alert.alert('Error', 'Failed to create post. Please try again.');
      } finally {
        setSubmittingPost(false);
        setUploadProgress(null);
        setPendingPostData(null);
      }
    },
    [pendingPostData, refreshFeed],
  );

  // Initialize post creation service
  useEffect(() => {
    PostCreationService.initialize();
  }, []);

  useTabReselectRefresh({
    listRef,
    onRefresh: refreshFeed,
    getOffset,
    topThreshold: 100,
    cooldownMs: 700,
  });

  // Styles
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.lg,
    },
  });

  // Render post item
  const renderPost = useCallback(
    ({ item: post }: { item: CommunityPost }) => {
      const joinActivityHandler =
        post.type === 'activity' && post.activityDetails && !post.activityDetails.attending
          ? () => {
              void handleJoinActivity(post._id);
            }
          : undefined;

      return (
        <PostCard
          post={post}
          onLike={() => handleLike(post._id)}
          onComment={() => {
            // Handle comment view
          }}
          {...(joinActivityHandler && { onJoinActivity: joinActivityHandler })}
          onReport={() => handleReport(post)}
          onBlockUser={() => handleBlockUser(post.author._id, post.author.name)}
          onPostLongPress={() => handlePostLongPress(post._id)}
          onPostReaction={(emoji) => handlePostReaction(post._id, emoji)}
          onScaleChange={(imageIndex, scale) => handleScaleChange(post._id, imageIndex, scale)}
          onReactionCancel={() => setShowReactions((prev) => ({ ...prev, [post._id]: false }))}
          isLiking={!!likingPosts[post._id]}
          showReactions={!!showReactions[post._id]}
          onViewComments={() => {
            // Handle view comments
          }}
        />
      );
    },
    [
      handleLike,
      handleReport,
      handleBlockUser,
      handleJoinActivity,
      handlePostLongPress,
      handlePostReaction,
      handleScaleChange,
      likingPosts,
      showReactions,
      setShowReactions,
    ],
  );

  // Memoized key extractor for FlatList performance
  const keyExtractor = useCallback((item: CommunityPost) => item._id, []);

  // Render loading state
  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
        <AdvancedHeader {...HeaderConfigs.glass({ title: 'Community' })} />
        <CommunityLoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.bg }]}>
      {/* Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: 'Community',
          rightButtons: [
            {
              type: 'add',
              onPress: () => {
                setShowCreatePostForm(true);
                logger.info('Create post button pressed');
              },
              variant: 'primary',
              haptic: 'light',
            },
          ],
        })}
      />

      {/* Feed */}
      <FlashList
        ref={listRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        estimatedItemSize={400} // Estimated post card height
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        drawDistance={400} // Render items within 400px of viewport
        estimatedListSize={{ height: 800, width: 400 }}
        onEndReached={() => {
          if (hasNextPage && !isLoadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={CommunityEmptyState}
        ListFooterComponent={() => <CommunityListFooter isLoading={isLoadingMore} />}
        removeClippedSubviews={true}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor={theme.colors.primary}
          />
        }
      />

      {/* Create Post Form Modal */}
      <PostCreationModal
        visible={showCreatePostForm}
        onClose={() => setShowCreatePostForm(false)}
        onSubmit={handleCreatePost}
        isSubmitting={submittingPost}
        uploadProgress={uploadProgress}
      />

      {/* Post Preview Modal */}
      <PostPreviewModal
        visible={showPostPreview}
        postData={pendingPostData}
        onClose={() => setShowPostPreview(false)}
        onSubmit={handlePostSubmit}
        isLoading={submittingPost}
      />
    </SafeAreaView>
  );
}
