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

import React, { useCallback, useState, useRef } from "react";
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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { AdvancedHeader, HeaderConfigs } from "../components/Advanced/AdvancedHeader";
import { DoubleTapLikePlus } from "../components/Gestures/DoubleTapLikePlus";
import { PinchZoomPro } from "../components/Gestures/PinchZoomPro";
import { ReactionBarMagnetic } from "../components/chat";
import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { useTheme } from "../theme/Provider";
import { getExtendedColors, type ExtendedColors } from "../theme/adapters";
import { useDoubleTapMetrics, usePinchMetrics, useReactionMetrics } from "../hooks/useInteractionMetrics";
import { useScrollOffsetTracker } from "../hooks/navigation/useScrollOffsetTracker";
import { useTabReselectRefresh } from "../hooks/navigation/useTabReselectRefresh";
import type { CommunityPost } from "../services/communityAPI";
import { logger } from "../services/logger";
import { Theme } from '../theme/unified-theme';
import type { FlatList as FlatListType } from "react-native";

interface CommunityScreenProps {
  navigation: {
    navigate: (screen: string, params?: Record<string, unknown>) => void;
    goBack: () => void;
  };
}

export default function CommunityScreen({ navigation }: CommunityScreenProps) {
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
    deletePost,
    reportPost,
    blockUser,
    joinActivity,
  } = useCommunityFeed();

  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingPost, setSubmittingPost] = useState(false);
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
        logger.error("Error liking post:", { error: error as Error, postId });
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
      console.log(`Reacted with ${emoji} to post ${postId}`);
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
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (error) {
        logger.error("Error adding comment:", { error: error as Error, postId });
        Alert.alert("Error", "Failed to add comment. Please try again.");
      } finally {
        setCommentingPosts((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [addComment, commentInputs, commentingPosts],
  );

  // Handle report post
  const handleReport = useCallback(
    (post: CommunityPost) => {
      Alert.alert(
        "Report Post",
        "Why are you reporting this post?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Spam",
            onPress: () => reportPost(post._id, "spam"),
          },
          {
            text: "Inappropriate",
            onPress: () => reportPost(post._id, "inappropriate"),
          },
          {
            text: "Harassment",
            onPress: () => reportPost(post._id, "harassment"),
          },
        ],
      );
    },
    [reportPost],
  );

  // Handle block user
  const handleBlockUser = useCallback(
    (userId: string, userName: string) => {
      Alert.alert(
        "Block User",
        `Are you sure you want to block ${userName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: async () => {
              try {
                await blockUser(userId);
                Alert.alert("Success", "User has been blocked.");
              } catch (error) {
                Alert.alert("Error", "Failed to block user.");
              }
            },
          },
        ],
      );
    },
    [blockUser],
  );

  // Handle join activity
  const handleJoinActivity = useCallback(
    async (postId: string) => {
      try {
        await joinActivity(postId);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert("Success", "You've joined this activity!");
      } catch (error) {
        Alert.alert("Error", "Failed to join activity.");
      }
    },
    [joinActivity],
  );

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "now";
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
            onPress={() => {
              // Navigate to user profile
            }}
          >
            <Image
              source={{ uri: post.author.avatar || "https://i.pravatar.cc/150" }}
              style={styles.avatar}
            />
            <View>
              <Text style={StyleSheet.flatten([styles.authorName, { color: colors.text }])}>
                {post.author.name}
              </Text>
              <Text style={StyleSheet.flatten([styles.timeAgo, { color: colors.textSecondary }])}>
                {formatTimeAgo(post.createdAt)}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                "Options",
                "",
                [
                  { text: "Cancel", style: "cancel" },
                  { text: "Report", style: "destructive", onPress: () => handleReport(post) },
                  {
                    text: "Block User",
                    style: "destructive",
                    onPress: () => handleBlockUser(post.author._id, post.author.name),
                  },
                ],
              );
            }}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <Text style={StyleSheet.flatten([styles.postContent, { color: colors.text }])}>
          {post.content}
        </Text>

        {/* Images with Gestures */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imagesContainer}>
            {post.images.map((image, idx) => (
              <DoubleTapLikePlus
                key={idx}
                onDoubleTap={() => handleLike(post._id)}
                onSingleTap={() => handlePostLongPress(post._id)}
                heartColor="#ff3b5c"
                particles={6}
                haptics={{ enabled: true, style: "medium" }}
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
                  backgroundColor="#f5f5f5"
                />
              </DoubleTapLikePlus>
            ))}
            
            {/* Reaction Bar Overlay */}
            {showReactions[post._id] && (
              <View style={styles.reactionOverlay}>
                <ReactionBarMagnetic
                  onSelect={(emoji) => handlePostReaction(post._id, emoji)}
                  onCancel={() => setShowReactions((prev) => ({ ...prev, [post._id]: false }))}
                  influenceRadius={80}
                  baseSize={28}
                  backgroundColor={colors.card || "#ffffff"}
                  borderColor={colors.border || "rgba(0,0,0,0.1)"}
                />
              </View>
            )}
          </View>
        )}

        {/* Activity Details */}
        {post.type === "activity" && post.activityDetails && (
          <View
            style={StyleSheet.flatten([
              styles.activityBanner,
              { backgroundColor: colors.accentLight },
            ])}
          >
            <Ionicons name="calendar" size={20} color={colors.accent} />
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={StyleSheet.flatten([styles.activityText, { color: colors.accent }])}>
                {new Date(post.activityDetails.date).toLocaleDateString()} at{" "}
                {post.activityDetails.location}
              </Text>
              <Text style={StyleSheet.flatten([styles.activityTextSmall, { color: colors.textSecondary }])}>
                {post.activityDetails.currentAttendees} of {post.activityDetails.maxAttendees} attending
              </Text>
            </View>
            {!post.activityDetails.attending && (
              <TouchableOpacity
                style={StyleSheet.flatten([styles.joinButton, { backgroundColor: colors.accent }])}
                onPress={() => handleJoinActivity(post._id)}
              >
                <Text style={styles.joinButtonText}>Join</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(post._id)}
            disabled={likingPosts[post._id]}
          >
            <Ionicons
              name={post.liked ? "heart" : "heart-outline"}
              size={24}
              color={post.liked ? Theme.colors.primary[500] : colors.textSecondary}
            />
            <Text
              style={StyleSheet.flatten([
                styles.actionText,
                { color: post.liked ? Theme.colors.primary[500] : colors.textSecondary },
              ])}
            >
              {post.likes}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setSelectedPost(post)}
          >
            <Ionicons name="chatbubble-outline" size={24} color={colors.textSecondary} />
            <Text style={StyleSheet.flatten([styles.actionText, { color: colors.textSecondary }])}>
              {post.comments.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        {post.comments.length > 0 && (
          <View style={styles.commentsSection}>
            {post.comments.slice(0, 3).map((comment) => (
              <View key={comment._id} style={styles.comment}>
                <Text style={StyleSheet.flatten([styles.commentAuthor, { color: colors.text }])}>
                  {comment.author.name}
                </Text>
                <Text style={StyleSheet.flatten([styles.commentText, { color: colors.textSecondary }])}>
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

  // Render footer for loading more
  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="people-outline" size={64} color={colors.textSecondary} />
      <Text style={StyleSheet.flatten([styles.emptyTitle, { color: colors.text }])}>
        No posts yet
      </Text>
      <Text style={StyleSheet.flatten([styles.emptyText, { color: colors.textSecondary }])}>
        Be the first to share something!
      </Text>
    </View>
  );

  // Render loading state
  if (isLoading && posts.length === 0) {
    return (
      <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}>
        <AdvancedHeader {...HeaderConfigs.glass({ title: "Community" })} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={StyleSheet.flatten([styles.loadingText, { color: colors.textSecondary }])}>
            Loading community...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={StyleSheet.flatten([styles.container, { backgroundColor: colors.background }])}>
      {/* Header */}
      <AdvancedHeader
        {...HeaderConfigs.glass({
          title: "Community",
          rightButtons: [
            {
              type: "add",
              onPress: () => {
                // TODO: Open create post modal
                logger.info("Create post button pressed");
              },
              variant: "primary",
              haptic: "light",
            },
          ],
        })}
      />

      {/* Feed */}
      <FlatList
        ref={listRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
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
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor={colors.primary}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  postCard: {
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: Theme.colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  authorName: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeAgo: {
    fontSize: 12,
  },
  postContent: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  imagesContainer: {
    marginBottom: 12,
    position: 'relative',
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  reactionOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  activityBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityText: {
    fontSize: 14,
    fontWeight: "600",
  },
  activityTextSmall: {
    fontSize: 12,
    marginTop: 2,
  },
  joinButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  joinButtonText: {
    color: Theme.colors.neutral[0],
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 24,
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },
  commentsSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  comment: {
    flexDirection: "row",
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: "600",
    marginRight: 6,
  },
  commentText: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});

