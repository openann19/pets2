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

import { useCallback, useState, useRef } from 'react';
import {
  FlatList,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AdvancedHeader, HeaderConfigs } from '../components/Advanced/AdvancedHeader';
import { DoubleTapLikePlus } from '../components/Gestures/DoubleTapLikePlus';
import { PinchZoomPro } from '../components/Gestures/PinchZoomPro';
import { ReactionBarMagnetic } from '../components/chat';
import { Interactive } from '../components/primitives/Interactive';
import { useCommunityFeed } from '../hooks/useCommunityFeed';
import { useTheme } from '@mobile/theme';
import { getExtendedColors, type ExtendedColors } from '@mobile/theme/adapters';
import { CreatePostForm } from '../components/Community/CreatePostForm';
import {
  useDoubleTapMetrics,
  usePinchMetrics,
  useReactionMetrics,
} from '../hooks/useInteractionMetrics';
import { useScrollOffsetTracker } from '../hooks/navigation/useScrollOffsetTracker';
import { useTabReselectRefresh } from '../hooks/navigation/useTabReselectRefresh';
import type { CommunityPost } from '../services/communityAPI';
import { logger } from '../services/logger';
import type { FlatList as FlatListType } from 'react-native';

interface CommunityScreenProps {
  navigation?: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export default function CommunityScreen({ navigation: _navigation }: CommunityScreenProps = {}) {
  const theme = useTheme();
  const colors: ExtendedColors = getExtendedColors(theme);
  const listRef = useRef<FlatListType<CommunityPost>>(null);
  const { onScroll, getOffset } = useScrollOffsetTracker();

  const {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    refreshFeed,
    loadMore,
    createPost,
    likePost,
    addComment,
    deletePost: _deletePost,
    reportPost,
    blockUser,
    joinActivity,
  } = useCommunityFeed();

  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingPost, setSubmittingPost] = useState(false);
  const [showCreatePostForm, setShowCreatePostForm] = useState(false);
  const [likingPosts, setLikingPosts] = useState<Record<string, boolean>>({});
  const [commentingPosts, setCommentingPosts] = useState<Record<string, boolean>>({});
  const [showReactions, setShowReactions] = useState<Record<string, boolean>>({});

  const { startInteraction: startDoubleTap, endInteraction: endDoubleTap } = useDoubleTapMetrics();
  const { startInteraction: startPinch, endInteraction: endPinch } = usePinchMetrics();
  const { startInteraction: startReaction, endInteraction: endReaction } = useReactionMetrics();

  useTabReselectRefresh({
    listRef,
    onRefresh: refreshFeed,
    getOffset,
    topThreshold: 100,
    cooldownMs: 700,
  });

  // Dynamic styles that depend on theme
  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    listContent: {
      padding: theme.spacing.lg,
    },
    postCard: {
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing.lg,
      padding: theme.spacing.lg,
      borderWidth: 1,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    postHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    authorInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.full,
      marginEnd: theme.spacing.md,
    },
    authorName: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    timeAgo: {
      fontSize: theme.typography.body.size * 0.75,
    },
    postContent: {
      fontSize: theme.typography.body.size * 0.9375,
      lineHeight: theme.typography.body.lineHeight * 1.375,
      marginBottom: theme.spacing.md,
    },
    imagesContainer: {
      marginBottom: theme.spacing.md,
      position: 'relative',
    },
    postImage: {
      width: '100%',
      height: 200,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.sm,
    },
    reactionOverlay: {
      position: 'absolute',
      bottom: theme.spacing.lg + theme.spacing.xs,
      left: 0,
      right: 0,
      alignItems: 'center',
      zIndex: 1000,
    },
    activityBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
    },
    activityText: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
    },
    activityTextSmall: {
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs / 2,
    },
    joinButton: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.full,
    },
    joinButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h1.weight,
    },
    actions: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginEnd: theme.spacing.lg + theme.spacing.xs,
    },
    actionText: {
      marginStart: theme.spacing.xs + theme.spacing.xs / 2,
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.body.weight,
    },
    commentsSection: {
      marginTop: theme.spacing.md,
      paddingTop: theme.spacing.md,
      borderTopWidth: 1,
    },
    comment: {
      flexDirection: 'row',
      marginBottom: theme.spacing.sm,
    },
    commentAuthor: {
      fontWeight: theme.typography.h2.weight,
      marginEnd: theme.spacing.xs + theme.spacing.xs / 2,
    },
    commentText: {
      flex: 1,
    },
    emptyState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing['3xl'] + theme.spacing.xl,
    },
    emptyTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginTop: theme.spacing.lg,
    },
    emptyText: {
      fontSize: theme.typography.body.size * 0.875,
      marginTop: theme.spacing.sm,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: theme.typography.body.size * 0.875,
    },
    footerLoader: {
      paddingVertical: theme.spacing.lg + theme.spacing.xs,
      alignItems: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.card,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.xl,
      margin: theme.spacing.lg,
      maxWidth: '90%',
    },
    modalTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
      color: colors.onSurface,
    },
    modalSubtitle: {
      fontSize: theme.typography.body.size,
      color: colors.onMuted,
      marginBottom: theme.spacing.lg,
    },
    modalTextInput: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      minHeight: 120,
      fontSize: theme.typography.body.size,
      color: colors.onSurface,
      textAlignVertical: 'top',
      marginBottom: theme.spacing.lg,
    },
    modalActions: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    modalButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.md,
      alignItems: 'center',
    },
    modalButtonPrimary: {
      backgroundColor: colors.primary,
    },
    modalButtonSecondary: {
      backgroundColor: colors.border,
    },
    modalButtonText: {
      color: colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
    modalButtonTextSecondary: {
      color: colors.onSurface,
      fontWeight: theme.typography.h2.weight,
    },
  });

  // Handle post like with metrics
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

  // Handle post reaction
  const handlePostReaction = useCallback(
    (postId: string, emoji: string) => {
      startReaction('postReaction', { postId, emoji });
      logger.info('Post reaction', { postId, emoji });
      setShowReactions((prev) => ({ ...prev, [postId]: false }));
      endReaction('postReaction', true);
    },
    [startReaction, endReaction],
  );

  // Handle long press for reactions
  const handlePostLongPress = useCallback((postId: string) => {
    setShowReactions((prev) => ({ ...prev, [postId]: true }));
  }, []);

  // Handle comment submission
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

  // Handle report post
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

  // Handle block user
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

  // Handle join activity
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

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return date.toLocaleDateString();
  }, []);

  // Render post item
  const renderPost = useCallback(
    ({ item: post }: { item: CommunityPost }) => (
      <View
        style={StyleSheet.flatten([
          styles.postCard,
          { backgroundColor: colors.card, borderColor: colors.border },
        ])}
      >
        {/* Header */}
        <View style={styles.postHeader}>
          <TouchableOpacity
            style={styles.authorInfo}
            testID="CommunityScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              // Navigate to user profile
            }}
          >
            <Image
              source={{ uri: post.author.avatar || 'https://i.pravatar.cc/150' }}
              style={styles.avatar}
              accessibilityLabel={`${post.author.name}'s profile picture`}
              accessibilityRole="image"
            />
            <View>
              <Text style={StyleSheet.flatten([styles.authorName, { color: colors.onSurface }])}>
                {post.author.name}
              </Text>
              <Text
                style={StyleSheet.flatten([styles.timeAgo, { color: colors.onMuted }])}
              >
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            testID="CommunityScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              Alert.alert('Options', '', [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Report',
                  style: 'destructive',
                  onPress: () => {
                    handleReport(post);
                  },
                },
                {
                  text: 'Block User',
                  style: 'destructive',
                  onPress: () => {
                    handleBlockUser(post.author._id, post.author.name);
                  },
                },
              ]);
            }}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={colors.onMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={StyleSheet.flatten([styles.postContent, { color: colors.onSurface }])}>
          {post.content}
        </Text>

        {/* Images with Gestures */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.images.map((image, idx) => (
              <DoubleTapLikePlus
                key={idx}
                onDoubleTap={() => handleLike(post._id)}
                onSingleTap={() => {
                  handlePostLongPress(post._id);
                }}
                heartColor={theme.colors.primary}
                particles={6}
                haptics={{ enabled: true, style: 'medium' }}
              >
                <PinchZoomPro
                  source={{ uri: image }}
                  width={300}
                  height={200}
                  minScale={1}
                  maxScale={3}
                  enableMomentum={true}
                  haptics={true}
                  onScaleChange={(scale) => {
                    if (scale > 1.1) {
                      startPinch('postImage', { postId: post._id, imageIndex: idx });
                    } else {
                      endPinch('postImage', true);
                    }
                  }}
                  backgroundColor={theme.colors.surface}
                />
              </DoubleTapLikePlus>
            ))}

            {/* Reaction Bar Overlay */}
            {showReactions[post._id] && (
              <View style={styles.reactionOverlay}>
                <ReactionBarMagnetic
                  onSelect={(emoji) => {
                    handlePostReaction(post._id, emoji);
                  }}
                  onCancel={() => {
                    setShowReactions((prev) => ({ ...prev, [post._id]: false }));
                  }}
                  influenceRadius={80}
                  baseSize={28}
                  backgroundColor={colors.card || theme.colors.surface}
                  borderColor={colors.border || theme.colors.border}
                />
              </View>
            )}
          </View>
        )}

        {/* Activity Details */}
        {post.type === 'activity' && post.activityDetails && (
          <View
            style={StyleSheet.flatten([
              styles.activityBanner,
              { backgroundColor: colors.accentLight },
            ])}
          >
            <Ionicons
              name="calendar"
              size={20}
              color={colors.accent}
            />
            <View style={{ flex: 1, marginStart: theme.spacing.sm }}>
              <Text style={StyleSheet.flatten([styles.activityText, { color: colors.accent }])}>
                {new Date(post.activityDetails.date).toLocaleDateString()} at{' '}
                {post.activityDetails.location}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.activityTextSmall,
                  { color: colors.onMuted },
                ])}
              >
                {post.activityDetails.currentAttendees} of {post.activityDetails.maxAttendees}{' '}
                attending
              </Text>
            </View>
            {!post.activityDetails.attending && (
              <Interactive
                onPress={() => handleJoinActivity(post._id)}
                accessibilityLabel="Join activity"
                accessibilityRole="button"
              >
                <View style={StyleSheet.flatten([styles.joinButton, { backgroundColor: colors.accent }])}>
                  <Text style={styles.joinButtonText}>Join</Text>
                </View>
              </Interactive>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Interactive
            onPress={() => handleLike(post._id)}
            disabled={likingPosts[post._id]}
            accessibilityLabel="Like post"
            accessibilityRole="button"
            accessibilityState={{ selected: post.liked }}
          >
            <View style={styles.actionButton}>
              <Ionicons
                name={post.liked ? 'heart' : 'heart-outline'}
                size={24}
                color={post.liked ? theme.colors.primary : colors.onMuted}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.actionText,
                  { color: post.liked ? theme.colors.primary : colors.onMuted },
                ])}
              >
                {post.likes}
              </Text>
            </View>
          </Interactive>

          <Interactive
            onPress={() => {
              setSelectedPost(post);
            }}
            accessibilityLabel="View comments"
            accessibilityRole="button"
          >
            <View style={styles.actionButton}>
              <Ionicons
                name="chatbubble-outline"
                size={24}
                color={colors.onMuted}
              />
              <Text
                style={StyleSheet.flatten([styles.actionText, { color: colors.onMuted }])}
              >
                {post.comments.length}
              </Text>
            </View>
          </Interactive>

          <Interactive
            accessibilityLabel="Share post"
            accessibilityRole="button"
          >
            <View style={styles.actionButton}>
              <Ionicons
                name="share-outline"
                size={24}
                color={colors.onMuted}
              />
            </View>
          </Interactive>
        </View>

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <View style={styles.commentsSection}>
            {post.comments.slice(0, 3).map((comment) => (
              <View
                key={comment._id}
                style={styles.comment}
              >
                <Text
                  style={StyleSheet.flatten([styles.commentAuthor, { color: colors.onSurface }])}
                >
                  {comment.author.name}
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.commentText,
                    { color: colors.onMuted },
                  ])}
                >
                  {comment.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    ),
    [
      colors,
      formatTimeAgo,
      handleLike,
      handleReport,
      handleBlockUser,
      handleJoinActivity,
      likingPosts,
    ],
  );

  // Memoized key extractor for FlatList performance
  const keyExtractor = useCallback((item: CommunityPost) => item._id, []);

  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons
        name="people-outline"
        size={64}
        color={colors.onMuted}
      />
      <Text style={StyleSheet.flatten([styles.emptyTitle, { color: colors.onSurface }])}>
        No posts yet
      </Text>
      <Text style={StyleSheet.flatten([styles.emptyText, { color: colors.onMuted }])}>
        Be the first to share something!
      </Text>
    </View>
  );

  // Render loading state
  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
      >
        <AdvancedHeader {...HeaderConfigs.glass({ title: 'Community' })} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color={colors.primary}
          />
          <Text
            style={StyleSheet.flatten([styles.loadingText, { color: colors.onMuted }])}
          >
            Loading community...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}
    >
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
      <FlatList
        ref={listRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onEndReached={() => {
          if (hasNextPage && !isLoadingMore) {
            loadMore();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={renderEmptyState}
        ListFooterComponent={renderFooter}
        removeClippedSubviews
        initialNumToRender={8}
        windowSize={7}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor={colors.primary}
          />
        }
      />
      
      {/* Create Post Form Modal */}
      <Modal
        visible={showCreatePostForm}
        animationType="slide"
        onRequestClose={() => setShowCreatePostForm(false)}
        presentationStyle="pageSheet"
        accessibilityViewIsModal
      >
        <CreatePostForm
          onSubmit={async (data) => {
            setSubmittingPost(true);
            try {
              await createPost(data);
              setShowCreatePostForm(false);
              Alert.alert('Success', 'Your post has been created!');
            } catch (error) {
              Alert.alert('Error', 'Failed to create post. Please try again.');
            } finally {
              setSubmittingPost(false);
            }
          }}
          onCancel={() => setShowCreatePostForm(false)}
          isSubmitting={submittingPost}
        />
      </Modal>
    </SafeAreaView>
  );
}
