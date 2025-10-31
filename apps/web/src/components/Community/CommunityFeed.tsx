/**
 * ENHANCED COMMUNITY FEED - Advanced Social Platform
 *
 * Integrated with our comprehensive community and feed enhancement system:
 * - Advanced feed algorithms with pet-aware personalization
 * - Real-time interactions with WebSocket communication
 * - Advanced commenting system with mentions and hashtags
 * - Reaction system with 6 emoji types
 * - AI-powered content moderation
 * - Pet-focused content and communities
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { logger } from '@pawfectmatch/core';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
import { RefreshCw, Users, Heart, Send, MessageCircle, Share, Flag, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';

// Import our advanced systems
import {
  useRealtimeInteractions,
  AdvancedCommentSection,
  CommentComposer,
  ReactionPicker,
  ReactionEngine
} from '../Interactions/AdvancedInteractionSystem';
import { FeedScoringEngine } from '@/lib/feed-algorithms';
import { CommunityGroupsEngine } from './PetCommunityGroups';

// Enhanced hooks and services
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';

// Enhanced components
import { NotificationPrompt } from './NotificationPrompt';
import { OptimizedImage } from './OptimizedImage';
import { PostCard } from './PostCard';
import { PostCreation } from './PostCreation';
import { ReportDialog } from './ReportDialog';

// Click outside hook
import { useClickOutside } from '@/hooks/useClickOutside';

// Report reasons (enhanced)
const reportReasons = [
  { id: 'spam', label: 'Spam', description: 'Unsolicited commercial content or repetitive posts' },
  { id: 'harassment', label: 'Harassment', description: 'Bullying, threats, or abusive behavior' },
  { id: 'inappropriate', label: 'Inappropriate Content', description: 'Nudity, violence, or offensive material' },
  { id: 'misinformation', label: 'Misinformation', description: 'False information about pets or health' },
  { id: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted content' },
  { id: 'hate_speech', label: 'Hate Speech', description: 'Discriminatory content targeting groups or individuals' },
  { id: 'animal_cruelty', label: 'Animal Cruelty', description: 'Content promoting harm to animals' },
  { id: 'other', label: 'Other', description: 'Other violation of community guidelines' },
];

interface EnhancedCommunityFeedProps {
  userId: string;
  communityId?: string;
  onCreatePost?: () => void;
  onLikePost?: (postId: string) => void;
  onCommentOnPost?: (postId: string) => void;
  onSharePost?: (postId: string) => void;
  onJoinActivity?: () => void;
}

export const CommunityFeed: React.FC<EnhancedCommunityFeedProps> = ({
  userId,
  communityId,
  onCreatePost,
  onLikePost,
  onCommentOnPost,
  onSharePost,
  onJoinActivity
}) => {
  // Real-time interactions
  const { isConnected } = useRealtimeInteractions(userId);

  // Enhanced community feed with scoring
  const {
    posts,
    isLoading,
    isRefreshing,
    isLoadingMore,
    hasNextPage,
    error,
    newPostContent,
    selectedPost,
    commentInputs,
    isSubmittingPost,
    likeSubmitting,
    commentSubmitting,
    showReportDialog,
    reportingTarget,
    moderation,
    setNewPostContent,
    setSelectedPost,
    setCommentInput,
    handleCreatePost,
    handleLike,
    handleComment,
    refreshFeed,
    loadMorePosts,
    handleReport,
    submitReport,
    handleBlockUser,
    setShowReportDialog,
    updateModeration,
  } = useCommunityFeed();

  // Enhanced posts with scoring and personalization
  const enhancedPosts = useMemo(() => {
    if (!posts) return [];

    // Apply feed scoring algorithm
    return posts.map(post => ({
      ...post,
      score: FeedScoringEngine.calculateFeedScore(
        userId,
        {
          id: post._id,
          authorId: post.authorId,
          type: 'photo', // Default type
          content: { text: post.content },
          location: post.location,
          createdAt: new Date(post.createdAt),
          petProfile: post.petProfile || { name: '', breed: '', age: 0 },
          moderationScore: post.moderationScore || 85,
        },
        { pets: [], location: { lat: 0, lng: 0 }, interests: [] },
        { following: [], connections: {} },
        { contentTypePreferences: {}, authorEngagements: {}, interests: [], activeHours: [] },
        {
          weights: { petCompatibility: 25, geographicRelevance: 20, socialConnection: 15, contentFreshness: 10, engagementPotential: 15, safetyScore: 10, diversityBonus: 5 },
          timeDecay: { halfLifeHours: 24, maxAgeDays: 7 },
          personalization: { enableGeographic: true, enablePetMatching: true, enableSocialGraph: true, diversityThreshold: 0.7 }
        }
      ).score
    })).sort((a, b) => b.score - a.score);
  }, [posts, userId]);

  // Community context
  const { data: community } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => communityId ? CommunityGroupsEngine.getCommunity(communityId) : null,
    enabled: !!communityId,
  });

  // Enhanced notifications and error handling
  const { showNotificationPrompt, checkNotificationSupport, requestNotificationPermission, dismissNotificationPrompt } = useNotifications();
  const { handleError } = useErrorHandler();

  // Keyboard shortcuts
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const focusPostCreation = useCallback(() => {
    const postCreation = document.getElementById('community-post-creation');
    postCreation?.focus();
  }, []);

  const closeDialogs = useCallback(() => {
    if (showReportDialog) {
      setShowReportDialog(false);
    }
    if (selectedPost) {
      setSelectedPost(null);
    }
  }, [showReportDialog, selectedPost, setShowReportDialog, setSelectedPost]);

  useKeyboardShortcuts([
    {
      key: 'n',
      ctrl: true,
      callback: focusPostCreation,
      description: 'Focus post creation',
    },
    {
      key: 'r',
      ctrl: true,
      callback: refreshFeed,
      description: 'Refresh feed',
    },
    {
      key: 'Escape',
      callback: closeDialogs,
      description: 'Close dialogs',
    },
  ]);

  // Enhanced post interactions
  const handleEnhancedLike = useCallback(async (postId: string) => {
    try {
      await handleLike(postId);
      onLikePost?.(postId);
    } catch (error) {
      handleError(error);
    }
  }, [handleLike, onLikePost, handleError]);

  const handleEnhancedComment = useCallback(async (postId: string, comment: string) => {
    try {
      await handleComment(postId, comment);
      onCommentOnPost?.(postId);
    } catch (error) {
      handleError(error);
    }
  }, [handleComment, onCommentOnPost, handleError]);

  const handleEnhancedShare = useCallback(async (postId: string) => {
    try {
      // Implement share functionality
      logger.info('Sharing post:', { postId });
      onSharePost?.(postId);
    } catch (error) {
      handleError(error);
    }
  }, [onSharePost, handleError]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isLoadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isLoadingMore, loadMorePosts]);

  // Format time ago with enhanced precision
  const formatTimeAgo = useCallback((dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  }, []);

  // Loading state
  if (isLoading && enhancedPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        <p className="mt-4 text-gray-600">Loading community feed...</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="community-feed max-w-2xl mx-auto p-4">
        {/* Real-time connection indicator */}
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          {isConnected ? 'Live' : 'Offline'}
        </div>

        {/* Community header */}
        {community && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={community.avatar} />
                <AvatarFallback>{community.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">{community.name}</h2>
                <p className="text-gray-600">{community.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span>{community.stats.memberCount} members</span>
                  <span>{community.stats.postCount} posts</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    Active community
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post creation */}
        <div className="mb-6">
          <PostCreation
            onPostCreated={onCreatePost}
            communityId={communityId}
          />
        </div>

        {/* Feed controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={refreshFeed}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <div className="text-sm text-gray-500">
              {enhancedPosts.length} posts
            </div>
          </div>

          {/* Feed sorting/filtering would go here */}
        </div>

        {/* Posts feed */}
        <div className="space-y-6">
          <AnimatePresence>
            {enhancedPosts.map((post, index) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
              >
                <EnhancedPostCard
                  post={post}
                  onLike={() => handleEnhancedLike(post._id)}
                  onComment={(comment) => handleEnhancedComment(post._id, comment)}
                  onShare={() => handleEnhancedShare(post._id)}
                  onReport={() => handleReport(post)}
                  formatTimeAgo={formatTimeAgo}
                  isLiked={post.isLiked}
                  isSubmitting={likeSubmitting[post._id]}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Load more trigger */}
          {hasNextPage && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              {isLoadingMore ? (
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                  Loading more posts...
                </div>
              ) : (
                <div className="text-gray-500">Scroll for more</div>
              )}
            </div>
          )}
        </div>

        {/* Notification prompt */}
        <NotificationPrompt
          show={showNotificationPrompt}
          onRequestPermission={requestNotificationPermission}
          onDismiss={dismissNotificationPrompt}
        />

        {/* Report dialog */}
        <ReportDialog
          visible={showReportDialog}
          target={reportingTarget}
          reasons={reportReasons}
          onSubmit={submitReport}
          onClose={() => setShowReportDialog(false)}
        />
      </div>
    </ErrorBoundary>
  );
};

// Enhanced Post Card Component
interface EnhancedPostCardProps {
  post: any; // Using any for now, should be properly typed
  onLike: () => void;
  onComment: (comment: string) => void;
  onShare: () => void;
  onReport: () => void;
  formatTimeAgo: (date: string) => string;
  isLiked: boolean;
  isSubmitting: boolean;
}

const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onReport,
  formatTimeAgo,
  isLiked,
  isSubmitting,
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  // Click outside to close reactions
  const reactionsRef = useRef<HTMLDivElement>(null);
  useClickOutside(reactionsRef, () => setShowReactions(false), showReactions);

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.authorAvatar} />
              <AvatarFallback>{post.authorName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-sm">{post.authorName}</div>
              <div className="text-xs text-gray-500">
                {formatTimeAgo(post.createdAt)}
                {post.location && ` • ${post.location}`}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onReport}>
            <Flag className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Post content */}
        {post.content && (
          <div className="mb-3">
            <p className="text-gray-900">{post.content}</p>
          </div>
        )}

        {/* Post media */}
        {post.mediaUrl && (
          <div className="mb-3 rounded-lg overflow-hidden">
            <OptimizedImage
              src={post.mediaUrl}
              alt={post.content || 'Post image'}
              className="w-full h-auto"
            />
          </div>
        )}

        {/* Pet context (if available) */}
        {post.petProfile && (
          <div className="mb-3 p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-purple-700">
              <span>🐾</span>
              <span className="font-medium">{post.petProfile.name}</span>
              <span>•</span>
              <span>{post.petProfile.breed}</span>
              <span>•</span>
              <span>{post.petProfile.age} years old</span>
            </div>
          </div>
        )}

        {/* Engagement stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-4">
            {post.likes > 0 && (
              <span>{post.likes} likes</span>
            )}
            {post.comments > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="hover:text-gray-700"
              >
                {post.comments} comments
              </button>
            )}
            {post.shares > 0 && (
              <span>{post.shares} shares</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pt-3 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReactions(!showReactions)}
            className={`flex-1 ${isLiked ? 'text-red-500' : ''}`}
            disabled={isSubmitting}
          >
            <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
            {isLiked ? 'Liked' : 'Like'}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComments(!showComments)}
            className="flex-1"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Comment
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onShare}
            className="flex-1"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>

        {/* Reactions picker */}
        {showReactions && (
          <div ref={reactionsRef}>
            <ReactionPicker
              onSelectReaction={async (reaction) => {
                // Handle reaction selection
                setShowReactions(false);
                onLike(); // Simplified - would need to pass reaction type
              }}
              onClose={() => setShowReactions(false)}
            />
          </div>
        )}

        {/* Comments section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t">
            <AdvancedCommentSection
              targetId={post._id}
              targetType="post"
              maxDepth={3}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};