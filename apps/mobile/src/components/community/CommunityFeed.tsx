/**
 * Community Feed Component
 * Main community feed with posts, interactions, and AI suggestions
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "@react-navigation/native";
import {
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  EllipsisHorizontalIcon,
} from "react-native-heroicons/outline";
import { HeartIcon as HeartSolidIcon } from "react-native-heroicons/solid";
import { useCommunityFeed } from "../hooks/useCommunityFeed";
import { CommunityPost } from "../services/communityAPI";
import { logger } from "@pawfectmatch/core";

interface CommunityFeedProps {
  userId: string;
  onCreatePost?: (post: CommunityPost) => void;
  onLikePost?: (postId: string) => void;
  onCommentOnPost?: (postId: string, comment: string) => void;
  onSharePost?: (postId: string) => void;
}

export function CommunityFeed({
  userId: _userId,
  onCreatePost,
  onLikePost,
  onCommentOnPost,
  onSharePost,
}: CommunityFeedProps) {
  const { colors } = useTheme();
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [commentText, setCommentText] = useState("");

  const {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage: _hasNextPage,
    error,
    newPostContent,
    isSubmittingPost,
    likeSubmitting,
    commentSubmitting: _commentSubmitting,
    commentInputs: _commentInputs,
    showReportDialog: _showReportDialog,
    reportingTarget: _reportingTarget,
    moderation,
    setNewPostContent,
    handleCreatePost,
    handleLike,
    handleComment,
    setCommentInput: _setCommentInput,
    handleReport,
    submitReport: _submitReport,
    handleBlockUser,
    setShowReportDialog: _setShowReportDialog,
    refreshFeed,
    loadMorePosts,
    selectedPackId: _selectedPackId,
    setSelectedPackId: _setSelectedPackId,
    selectedType: _selectedType,
    setSelectedType: _setSelectedType,
  } = useCommunityFeed();

  // Format time ago
  const formatTimeAgo = useCallback((dateString: string): string => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor(
      (now.getTime() - postDate.getTime()) / 1000,
    );

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  }, []);

  // Handle post creation
  const handleCreatePostPress = useCallback(async () => {
    if (!newPostContent.trim()) {
      Alert.alert("Error", "Please enter some content for your post");
      return;
    }

    try {
      await handleCreatePost({
        content: newPostContent.trim(),
        type: "post",
      });

      onCreatePost?.(posts[0]); // Pass the newly created post
    } catch (error) {
      logger.error("Failed to create post", { error });
    }
  }, [newPostContent, handleCreatePost, onCreatePost, posts]);

  // Handle like press
  const handleLikePress = useCallback(
    async (postId: string) => {
      try {
        await handleLike(postId);
        onLikePost?.(postId);
      } catch (error) {
        logger.error("Failed to like post", { error });
      }
    },
    [handleLike, onLikePost],
  );

  // Handle comment press
  const handleCommentPress = useCallback((post: CommunityPost) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  }, []);

  // Handle comment submit
  const handleCommentSubmit = useCallback(async () => {
    if (!selectedPost || !commentText.trim()) return;

    try {
      await handleComment(selectedPost._id, commentText.trim());
      onCommentOnPost?.(selectedPost._id, commentText.trim());
      setCommentText("");
      setShowCommentModal(false);
      setSelectedPost(null);
    } catch (error) {
      logger.error("Failed to add comment", { error });
    }
  }, [selectedPost, commentText, handleComment, onCommentOnPost]);

  // Handle share press
  const handleSharePress = useCallback(
    (postId: string) => {
      onSharePost?.(postId);
      Alert.alert("Share", "Post shared successfully!");
    },
    [onSharePost],
  );

  // Handle report press
  const handleReportPress = useCallback(
    (post: CommunityPost) => {
      Alert.alert(
        "Report Post",
        "What would you like to report this post for?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Spam",
            onPress: () => handleReport("post", post._id, post.author._id),
          },
          {
            text: "Inappropriate",
            onPress: () => handleReport("post", post._id, post.author._id),
          },
          {
            text: "Harassment",
            onPress: () => handleReport("post", post._id, post.author._id),
          },
        ],
      );
    },
    [handleReport],
  );

  // Handle block user
  const handleBlockUserPress = useCallback(
    (post: CommunityPost) => {
      Alert.alert(
        "Block User",
        `Are you sure you want to block ${post.author.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Block",
            style: "destructive",
            onPress: () => handleBlockUser(post.author._id),
          },
        ],
      );
    },
    [handleBlockUser],
  );

  // Render post item
  const renderPost = useCallback(
    ({ item }: { item: CommunityPost }) => {
      const isLiked = false; // TODO: Implement liked state tracking
      const isBlocked = moderation.blockedUsers.has(item.author._id);
      const isReported = moderation.reportedContent.has(item._id);

      if (isBlocked || isReported) {
        return null; // Don't render blocked/reported content
      }

      return (
        <View style={[styles.postCard, { backgroundColor: colors.card }]}>
          {/* Post Header */}
          <View style={styles.postHeader}>
            <Image source={{ uri: item.author.avatar }} style={styles.avatar} />
            <View style={styles.postHeaderInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {item.author.name}
              </Text>
              <Text
                style={[styles.postTime, { color: colors.text, opacity: 0.6 }]}
              >
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => handleReportPress(item)}
            >
              <EllipsisHorizontalIcon size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Post Content */}
          <Text style={[styles.postContent, { color: colors.text }]}>
            {item.content}
          </Text>

          {/* Post Images */}
          {item.images && item.images.length > 0 && (
            <View style={styles.postImages}>
              {item.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.postImage}
                />
              ))}
            </View>
          )}

          {/* Activity Details */}
          {item.type === "activity" && item.activityDetails && (
            <View
              style={[
                styles.activityCard,
                { backgroundColor: colors.background },
              ]}
            >
              <Text style={[styles.activityTitle, { color: colors.primary }]}>
                📅 Pack Activity
              </Text>
              <Text style={[styles.activityDate, { color: colors.text }]}>
                {new Date(item.activityDetails.date).toLocaleDateString()}
              </Text>
              <Text style={[styles.activityLocation, { color: colors.text }]}>
                📍 {item.activityDetails.location}
              </Text>
              <Text style={[styles.activityAttendees, { color: colors.text }]}>
                👥 {item.activityDetails.currentAttendees}/
                {item.activityDetails.maxAttendees} attending
              </Text>
            </View>
          )}

          {/* Post Actions */}
          <View style={styles.postActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleLikePress(item._id)}
              disabled={likeSubmitting[item._id]}
            >
              {isLiked ? (
                <HeartSolidIcon size={24} color="#EF4444" />
              ) : (
                <HeartIcon size={24} color={colors.text} />
              )}
              <Text style={[styles.actionText, { color: colors.text }]}>
                {item.likes}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleCommentPress(item)}
            >
              <ChatBubbleLeftIcon size={24} color={colors.text} />
              <Text style={[styles.actionText, { color: colors.text }]}>
                {item.comments.length}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleSharePress(item._id)}
            >
              <ShareIcon size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Comments Preview */}
          {item.comments.length > 0 && (
            <View style={styles.commentsPreview}>
              {item.comments.slice(0, 2).map((comment: any) => (
                <View key={comment._id} style={styles.commentItem}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>
                    {comment.author.name}
                  </Text>
                  <Text style={[styles.commentText, { color: colors.text }]}>
                    {comment.content}
                  </Text>
                </View>
              ))}
              {item.comments.length > 2 && (
                <TouchableOpacity onPress={() => handleCommentPress(item)}>
                  <Text
                    style={[styles.viewAllComments, { color: colors.primary }]}
                  >
                    View all {item.comments.length} comments
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      );
    },
    [
      colors,
      formatTimeAgo,
      moderation,
      likeSubmitting,
      handleLikePress,
      handleCommentPress,
      handleSharePress,
      handleReportPress,
    ],
  );

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.text }]}>
          Loading more posts...
        </Text>
      </View>
    );
  }, [isLoadingMore, colors]);

  // Render empty state
  const renderEmpty = useCallback(() => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyState}>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>
          No posts yet
        </Text>
        <Text
          style={[styles.emptySubtitle, { color: colors.text, opacity: 0.6 }]}
        >
          Be the first to share something with the community!
        </Text>
      </View>
    );
  }, [isLoading, colors]);

  // Render error state
  const renderError = useCallback(() => {
    if (!error) return null;

    return (
      <View style={styles.errorState}>
        <Text style={[styles.errorText, { color: "#EF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={refreshFeed}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }, [error, colors, refreshFeed]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Post Creation */}
      <View style={[styles.createPostCard, { backgroundColor: colors.card }]}>
        <TextInput
          style={[
            styles.createPostInput,
            { color: colors.text, borderColor: colors.border },
          ]}
          placeholder="What's happening with your pet?"
          placeholderTextColor={colors.text + "80"}
          value={newPostContent}
          onChangeText={setNewPostContent}
          multiline
          maxLength={500}
        />
        <View style={styles.createPostActions}>
          <Text
            style={[
              styles.characterCount,
              { color: colors.text, opacity: 0.6 },
            ]}
          >
            {newPostContent.length}/500
          </Text>
          <TouchableOpacity
            style={[
              styles.postButton,
              { backgroundColor: colors.primary },
              (!newPostContent.trim() || isSubmittingPost) &&
                styles.postButtonDisabled,
            ]}
            onPress={handleCreatePostPress}
            disabled={!newPostContent.trim() || isSubmittingPost}
          >
            {isSubmittingPost ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Posts Feed */}
      {renderError()}
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />

      {/* Comment Modal */}
      <Modal
        visible={showCommentModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[styles.commentModal, { backgroundColor: colors.background }]}
        >
          <View
            style={[
              styles.commentModalHeader,
              { borderBottomColor: colors.border },
            ]}
          >
            <TouchableOpacity onPress={() => setShowCommentModal(false)}>
              <Text style={[styles.cancelButton, { color: colors.primary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <Text style={[styles.commentModalTitle, { color: colors.text }]}>
              Comments
            </Text>
            <TouchableOpacity onPress={handleCommentSubmit}>
              <Text style={[styles.postButton, { color: colors.primary }]}>
                Post
              </Text>
            </TouchableOpacity>
          </View>

          {selectedPost && (
            <ScrollView style={styles.commentModalContent}>
              <View
                style={[styles.selectedPost, { backgroundColor: colors.card }]}
              >
                <View style={styles.postHeader}>
                  <Image
                    source={{ uri: selectedPost.author.avatar }}
                    style={styles.avatar}
                  />
                  <View style={styles.postHeaderInfo}>
                    <Text style={[styles.authorName, { color: colors.text }]}>
                      {selectedPost.author.name}
                    </Text>
                    <Text
                      style={[
                        styles.postTime,
                        { color: colors.text, opacity: 0.6 },
                      ]}
                    >
                      {formatTimeAgo(selectedPost.createdAt)}
                    </Text>
                  </View>
                </View>
                <Text style={[styles.postContent, { color: colors.text }]}>
                  {selectedPost.content}
                </Text>
              </View>

              <View style={styles.commentsList}>
                {selectedPost.comments.map((comment: any) => (
                  <View
                    key={comment._id}
                    style={[
                      styles.commentItem,
                      { backgroundColor: colors.card },
                    ]}
                  >
                    <Image
                      source={{ uri: comment.author.avatar }}
                      style={styles.commentAvatar}
                    />
                    <View style={styles.commentContent}>
                      <Text
                        style={[styles.commentAuthor, { color: colors.text }]}
                      >
                        {comment.author.name}
                      </Text>
                      <Text
                        style={[styles.commentText, { color: colors.text }]}
                      >
                        {comment.content}
                      </Text>
                      <Text
                        style={[
                          styles.commentTime,
                          { color: colors.text, opacity: 0.6 },
                        ]}
                      >
                        {formatTimeAgo(comment.createdAt)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          <View
            style={[
              styles.commentInputContainer,
              { backgroundColor: colors.card },
            ]}
          >
            <TextInput
              style={[styles.commentInput, { color: colors.text }]}
              placeholder="Add a comment..."
              placeholderTextColor={colors.text + "80"}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  createPostCard: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  createPostInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  createPostActions: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
  },
  characterCount: { fontSize: 12 },
  postButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: { opacity: 0.5 },
  postButtonText: { color: "#FFFFFF", fontWeight: "bold" as const },
  feedContent: { paddingBottom: 20 },
  postCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  postHeaderInfo: { flex: 1 },
  authorName: { fontSize: 16, fontWeight: "bold" as const },
  postTime: { fontSize: 12 },
  moreButton: { padding: 4 },
  postContent: { fontSize: 16, lineHeight: 22, marginBottom: 12 },
  postImages: { marginBottom: 12 },
  postImage: {
    width: "100%" as const,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  activityCard: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  activityTitle: { fontSize: 16, fontWeight: "bold" as const, marginBottom: 4 },
  activityDate: { fontSize: 14, marginBottom: 2 },
  activityLocation: { fontSize: 14, marginBottom: 2 },
  activityAttendees: { fontSize: 14 },
  postActions: {
    flexDirection: "row" as const,
    justifyContent: "space-around" as const,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  actionButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    padding: 8,
  },
  actionText: { marginLeft: 4, fontSize: 14 },
  commentsPreview: { marginTop: 12 },
  commentItem: { marginBottom: 8 },
  commentAuthor: { fontSize: 14, fontWeight: "bold" as const, marginBottom: 2 },
  commentText: { fontSize: 14 },
  viewAllComments: { fontSize: 14, fontWeight: "bold" as const, marginTop: 4 },
  loadingFooter: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 20,
  },
  loadingText: { marginLeft: 8, fontSize: 14 },
  emptyState: {
    alignItems: "center" as const,
    padding: 40,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold" as const, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: "center" as const },
  errorState: {
    alignItems: "center" as const,
    padding: 20,
  },
  errorText: { fontSize: 16, marginBottom: 16, textAlign: "center" as const },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: { color: "#FFFFFF", fontWeight: "bold" as const },
  commentModal: { flex: 1 },
  commentModalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    padding: 16,
    borderBottomWidth: 1,
  },
  cancelButton: { fontSize: 16 },
  commentModalTitle: { fontSize: 18, fontWeight: "bold" as const },
  commentModalContent: { flex: 1 },
  selectedPost: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  commentsList: { padding: 16 },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: { flex: 1 },
  commentTime: { fontSize: 12, marginTop: 4 },
  commentInputContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 40,
  },
});
