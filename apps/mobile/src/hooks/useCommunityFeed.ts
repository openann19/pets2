/**
 * Community Feed Hook
 * Manages community feed state, pagination, and interactions
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Alert } from "react-native";
import {
  communityAPI,
  CommunityPost,
  CommunityComment,
  CreatePostPayload,
} from "../services/communityAPI";
import { logger } from "@pawfectmatch/core";

const POSTS_PER_PAGE = 20;

export interface UseCommunityFeedReturn {
  // Data
  posts: CommunityPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasNextPage: boolean;
  error: string | null;

  // Post creation
  newPostContent: string;
  isSubmittingPost: boolean;
  setNewPostContent: (content: string) => void;
  handleCreatePost: (payload: CreatePostPayload) => Promise<void>;

  // Interactions
  likeSubmitting: Record<string, boolean>;
  commentSubmitting: Record<string, boolean>;
  handleLike: (postId: string) => Promise<void>;
  handleComment: (postId: string, content: string) => Promise<void>;

  // Comments
  commentInputs: Record<string, string>;
  setCommentInput: (postId: string, content: string) => void;

  // Moderation
  showReportDialog: boolean;
  reportingTarget: { type: string; id: string; userId: string } | null;
  moderation: {
    blockedUsers: Set<string>;
    reportedContent: Set<string>;
    isReporting: boolean;
    reportReason: string;
    reportDetails: string;
  };
  handleReport: (targetType: string, targetId: string, userId: string) => void;
  submitReport: (reason: string, details?: string) => Promise<void>;
  handleBlockUser: (userId: string) => Promise<void>;
  setShowReportDialog: (show: boolean) => void;
  updateModeration: (
    updates: Partial<{
      blockedUsers: Set<string>;
      reportedContent: Set<string>;
      isReporting: boolean;
      reportReason: string;
      reportDetails: string;
    }>,
  ) => void;

  // Feed management
  refreshFeed: () => Promise<void>;
  loadMorePosts: () => Promise<void>;
  currentPage: number;
  setCurrentPage: (page: number) => void;

  // Filters
  selectedPackId: string | null;
  setSelectedPackId: (packId: string | null) => void;
  selectedType: string | null;
  setSelectedType: (type: string | null) => void;
}

export function useCommunityFeed(): UseCommunityFeedReturn {
  // State
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Post creation
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // Interactions
  const [likeSubmitting, setLikeSubmitting] = useState<Record<string, boolean>>(
    {},
  );
  const [commentSubmitting, setCommentSubmitting] = useState<
    Record<string, boolean>
  >({});
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>(
    {},
  );

  // Moderation
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportingTarget, setReportingTarget] = useState<{
    type: string;
    id: string;
    userId: string;
  } | null>(null);
  const [moderation, setModeration] = useState({
    blockedUsers: new Set<string>(),
    reportedContent: new Set<string>(),
    isReporting: false,
    reportReason: "",
    reportDetails: "",
  });

  // Filters
  const [selectedPackId, setSelectedPackId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Refs
  const loadMoreRef = useRef<boolean>(false);

  // Load posts
  const loadPosts = useCallback(
    async (page: number = 1, append: boolean = false) => {
      try {
        if (page === 1) {
          setIsLoading(true);
        } else {
          setIsLoadingMore(true);
        }
        setError(null);

        const params: any = {
          page,
          limit: POSTS_PER_PAGE,
        };

        if (selectedPackId) {
          params.packId = selectedPackId;
        }
        if (selectedType) {
          params.type = selectedType;
        }

        const response = await communityAPI.getFeed(params);

        if (append) {
          setPosts((prev) => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }

        setHasNextPage(response.posts.length === POSTS_PER_PAGE);
        setCurrentPage(page);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load posts";
        setError(errorMessage);
        logger.error("Failed to load community posts", {
          error: err,
          page,
          append,
        });
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [selectedPackId, selectedType],
  );

  // Initial load
  useEffect(() => {
    loadPosts(1, false);
  }, [loadPosts]);

  // Refresh feed
  const refreshFeed = useCallback(async () => {
    setIsRefreshing(true);
    await loadPosts(1, false);
    setIsRefreshing(false);
  }, [loadPosts]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (isLoadingMore || !hasNextPage || loadMoreRef.current) return;

    loadMoreRef.current = true;
    await loadPosts(currentPage + 1, true);
    loadMoreRef.current = false;
  }, [loadPosts, currentPage, isLoadingMore, hasNextPage]);

  // Create post
  const handleCreatePost = useCallback(async (payload: CreatePostPayload) => {
    try {
      setIsSubmittingPost(true);
      const response = await communityAPI.createPost(payload);

      // Add new post to the beginning of the feed
      setPosts((prev) => [response.post, ...prev]);
      setNewPostContent("");

      Alert.alert("Success", "Post created successfully!");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create post";
      Alert.alert("Error", errorMessage);
      logger.error("Failed to create community post", { error: err, payload });
    } finally {
      setIsSubmittingPost(false);
    }
  }, []);

  // Like post
  const handleLike = useCallback(
    async (postId: string) => {
      if (likeSubmitting[postId]) return;

      try {
        setLikeSubmitting((prev) => ({ ...prev, [postId]: true }));
        const response = await communityAPI.likePost(postId);

        // Update post likes count
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId ? { ...post, likes: response.likes } : post,
          ),
        );
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to like post";
        Alert.alert("Error", errorMessage);
        logger.error("Failed to like post", { error: err, postId });
      } finally {
        setLikeSubmitting((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [likeSubmitting],
  );

  // Add comment
  const handleComment = useCallback(
    async (postId: string, content: string) => {
      if (commentSubmitting[postId] || !content.trim()) return;

      try {
        setCommentSubmitting((prev) => ({ ...prev, [postId]: true }));
        const response = await communityAPI.addComment(postId, content);

        // Add comment to post
        setPosts((prev) =>
          prev.map((post) =>
            post._id === postId
              ? { ...post, comments: [...post.comments, response.comment] }
              : post,
          ),
        );

        // Clear comment input
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to add comment";
        Alert.alert("Error", errorMessage);
        logger.error("Failed to add comment", { error: err, postId, content });
      } finally {
        setCommentSubmitting((prev) => ({ ...prev, [postId]: false }));
      }
    },
    [commentSubmitting],
  );

  // Set comment input
  const setCommentInput = useCallback((postId: string, content: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: content }));
  }, []);

  // Handle report
  const handleReport = useCallback(
    (targetType: string, targetId: string, userId: string) => {
      setReportingTarget({ type: targetType, id: targetId, userId });
      setShowReportDialog(true);
    },
    [],
  );

  // Submit report
  const submitReport = useCallback(
    async (reason: string, details?: string) => {
      if (!reportingTarget) return;

      try {
        setModeration((prev) => ({ ...prev, isReporting: true }));

        await communityAPI.reportContent({
          targetType: reportingTarget.type as "post" | "user" | "comment",
          targetId: reportingTarget.id,
          reason,
          details,
        });

        // Add to reported content
        setModeration((prev) => ({
          ...prev,
          reportedContent: new Set([
            ...prev.reportedContent,
            reportingTarget.id,
          ]),
          isReporting: false,
          reportReason: "",
          reportDetails: "",
        }));

        setShowReportDialog(false);
        setReportingTarget(null);

        Alert.alert("Success", "Content reported successfully");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to report content";
        Alert.alert("Error", errorMessage);
        logger.error("Failed to report content", {
          error: err,
          reportingTarget,
          reason,
          details,
        });
      } finally {
        setModeration((prev) => ({ ...prev, isReporting: false }));
      }
    },
    [reportingTarget],
  );

  // Block user
  const handleBlockUser = useCallback(async (userId: string) => {
    try {
      await communityAPI.blockUser(userId);

      // Add to blocked users
      setModeration((prev) => ({
        ...prev,
        blockedUsers: new Set([...prev.blockedUsers, userId]),
      }));

      // Remove posts from blocked user
      setPosts((prev) => prev.filter((post) => post.author._id !== userId));

      Alert.alert("Success", "User blocked successfully");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to block user";
      Alert.alert("Error", errorMessage);
      logger.error("Failed to block user", { error: err, userId });
    }
  }, []);

  // Update moderation
  const updateModeration = useCallback(
    (updates: Partial<typeof moderation>) => {
      setModeration((prev) => ({ ...prev, ...updates }));
    },
    [],
  );

  return {
    // Data
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    error,

    // Post creation
    newPostContent,
    isSubmittingPost,
    setNewPostContent,
    handleCreatePost,

    // Interactions
    likeSubmitting,
    commentSubmitting,
    handleLike,
    handleComment,

    // Comments
    commentInputs,
    setCommentInput,

    // Moderation
    showReportDialog,
    reportingTarget,
    moderation,
    handleReport,
    submitReport,
    handleBlockUser,
    setShowReportDialog,
    updateModeration,

    // Feed management
    refreshFeed,
    loadMorePosts,
    currentPage,
    setCurrentPage,

    // Filters
    selectedPackId,
    setSelectedPackId,
    selectedType,
    setSelectedType,
  };
}
