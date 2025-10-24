import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { logger } from '@pawfectmatch/core';
;
import { Button } from '@/components/ui/button';
import { ErrorBoundary, useErrorHandler } from '@/components/ErrorBoundary';
import { RefreshCw, Users, Heart, Send } from 'lucide-react';
import React, { memo, useCallback, useMemo, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { useCommunityFeed } from '@/hooks/useCommunityFeed';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPrompt } from './NotificationPrompt';
import { OptimizedImage } from './OptimizedImage';
import { PostCard } from './PostCard';
import { PostCreation } from './PostCreation';
import { ReportDialog } from './ReportDialog';
const reportReasons = [
    { id: 'spam', label: 'Spam', description: 'Unsolicited commercial content or repetitive posts' },
    { id: 'harassment', label: 'Harassment', description: 'Bullying, threats, or abusive behavior' },
    { id: 'inappropriate', label: 'Inappropriate Content', description: 'Nudity, violence, or offensive material' },
    { id: 'misinformation', label: 'Misinformation', description: 'False information about pets or health' },
    { id: 'copyright', label: 'Copyright Violation', description: 'Unauthorized use of copyrighted content' },
    { id: 'other', label: 'Other', description: 'Other violation of community guidelines' },
];
export const CommunityFeed = ({ userId: _userId, onCreatePost, onLikePost, onCommentOnPost, onSharePost, onJoinActivity }) => {
    const { posts, isLoading, isRefreshing, isLoadingMore, hasNextPage, error, newPostContent, selectedPost, commentInputs, isSubmittingPost, likeSubmitting, commentSubmitting, showReportDialog, reportingTarget, moderation, setNewPostContent, setSelectedPost, setCommentInput, handleCreatePost, handleLike, handleComment, refreshFeed, loadMorePosts, handleReport, submitReport, handleBlockUser, setShowReportDialog, updateModeration, } = useCommunityFeed();
    const { showNotificationPrompt, checkNotificationSupport, requestNotificationPermission, dismissNotificationPrompt, } = useNotifications();
    const { handleError } = useErrorHandler();
    const loadMoreRef = useRef(null);
    // Keyboard shortcuts
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
    const formatTimeAgo = useCallback((dateString) => {
        const now = new Date();
        const date = new Date(dateString);
        const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
        if (diffInMinutes < 1)
            return 'Just now';
        if (diffInMinutes < 60)
            return `${diffInMinutes}m ago`;
        if (diffInMinutes < 1440)
            return `${Math.floor(diffInMinutes / 60)}h ago`;
        return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }, []);
    // Follow functions (simplified for this refactor)
    const handleFollow = useCallback(async (userId) => {
        logger.info('Follow user:', { userId });
        try {
            // Implement follow logic
            const response = await fetch('/api/community/follow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            if (response.ok) {
                logger.info('Successfully followed user:', { userId });
                refreshFeed(); // Refresh to update follow status
            } else {
                throw new Error('Failed to follow user');
            }
        } catch (error) {
            logger.error('Follow user failed:', { error, userId });
            handleError(error);
        }
    }, [refreshFeed, handleError]);
    const handleUnfollow = useCallback(async (userId) => {
        logger.info('Unfollow user:', { userId });
        try {
            // Implement unfollow logic
            const response = await fetch('/api/community/unfollow', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            
            if (response.ok) {
                logger.info('Successfully unfollowed user:', { userId });
                refreshFeed(); // Refresh to update follow status
            } else {
                throw new Error('Failed to unfollow user');
            }
        } catch (error) {
            logger.error('Unfollow user failed:', { error, userId });
            handleError(error);
        }
    }, [refreshFeed, handleError]);
    // Memoize post cards for performance
    const postCards = useMemo(() => {
        return posts.map((post) => (<PostCard key={post._id} post={post} showFullContent={selectedPost?._id === post._id} likeSubmitting={likeSubmitting[post._id]} commentSubmitting={commentSubmitting[post._id] || false} followSubmitting={false} onLike={handleLike} onComment={() => setSelectedPost(post)} onShare={(postId) => onSharePost?.(postId)} onJoinActivity={(activityId) => onJoinActivity?.(activityId)} onFollow={handleFollow} onUnfollow={handleUnfollow} onReport={handleReport} onBlock={handleBlockUser} onSelectPost={setSelectedPost} formatTimeAgo={formatTimeAgo}/>));
    }, [
        posts,
        selectedPost,
        likeSubmitting,
        handleLike,
        onSharePost,
        onJoinActivity,
        handleFollow,
        handleUnfollow,
        handleReport,
        handleBlockUser,
        setSelectedPost,
        formatTimeAgo,
    ]);
    if (isLoading) {
        return (<div className="space-y-6">
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          Loading community feed...
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (<div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"/>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"/>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"/>
            </div>))}
        </div>
      </div>);
    }
    return (<ErrorBoundary>
      <div className="space-y-6" role="main" aria-labelledby="community-feed-heading">
        {/* Skip Link for Accessibility */}
        <a href="#community-post-creation" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50 focus:outline-none focus:ring-2 focus:ring-blue-300">
          Skip to create post
        </a>

        <Card>
          <CardHeader>
            <CardTitle id="community-feed-heading" className="flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-500" aria-hidden="true"/>
              Community Feed
            </CardTitle>
            <CardDescription>Stay connected with your pack groups and fellow pet lovers</CardDescription>
          </CardHeader>
        </Card>

        {/* Notification Permission Prompt */}
        {showNotificationPrompt && checkNotificationSupport() && (<NotificationPrompt onEnable={requestNotificationPermission} onDismiss={dismissNotificationPrompt}/>)}

        {/* Error Display */}
        {error && (<Card role="alert" aria-live="assertive">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                <Button variant="outline" size="sm" onClick={() => refreshFeed()} aria-label="Retry loading community posts">
                  <RefreshCw className="h-4 w-4 mr-2"/>
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>)}

        {/* Post Creation */}
        <PostCreation value={newPostContent} onChange={setNewPostContent} onSubmit={() => {
            handleCreatePost();
            onCreatePost?.(newPostContent);
        }} isSubmitting={isSubmittingPost}/>

        {/* Posts Feed */}
        <div className="space-y-4">
          {postCards}
        </div>

      {/* Intersection observer target */}
      {hasNextPage && !isLoadingMore && (<div ref={loadMoreRef} className="h-10 flex justify-center items-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Scroll for more posts
          </div>
        </div>)}

      {/* End of feed indicator */}
      {!hasNextPage && posts.length > 0 && (<div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-center gap-2">
            <Heart className="h-5 w-5"/>
            <span>You've seen all posts!</span>
          </div>
        </div>)}

      {selectedPost && (<AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Dialog open={!!selectedPost} onOpenChange={() => setSelectedPost(null)}>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Post Details</DialogTitle>
                </DialogHeader>

                <PostCard post={selectedPost} showFullContent/>

                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Comments</h4>

                  {selectedPost.comments.length > 0 ? (<div className="space-y-3 mb-4">
                      {selectedPost.comments.map((comment) => (<div key={comment._id} className="flex gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.author.avatar || ''}/>
                            <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="bg-gray-100 rounded-lg p-3">
                              <div className="font-semibold text-sm">{comment.author.name}</div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</div>
                          </div>
                        </div>))}
                    </div>) : (<p className="text-gray-500 text-sm mb-4">No comments yet.</p>)}

                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 flex gap-2">
                      <Textarea placeholder="Write a comment..." value={commentInputs[selectedPost._id] || ''} onChange={(e) => setCommentInputs((prev) => ({
                ...prev,
                [selectedPost._id]: e.target.value,
            }))} className="min-h-[60px] resize-none"/>
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button onClick={() => void handleComment(selectedPost._id)} disabled={!commentInputs[selectedPost._id]?.trim() || Boolean(commentSubmitting[selectedPost._id])} className="self-end">
                          <Send className="h-4 w-4"/>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>)}

      {/* Report Dialog */}
      {showReportDialog && reportingTarget && (<AnimatePresence>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2, ease: "easeOut" }}>
            <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report {reportingTarget.type}</DialogTitle>
                  <DialogDescription>
                    Help us keep the community safe by reporting inappropriate content.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Reason for report</label>
                    <select value={moderation.reportReason} onChange={(e) => setModeration(prev => ({ ...prev, reportReason: e.target.value }))} className="w-full p-2 border rounded-lg">
                      <option value="">Select a reason...</option>
                      {reportReasons.map((reason) => (<option key={reason.id} value={reason.id}>
                          {reason.label}
                        </option>))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Additional details (optional)</label>
                    <Textarea value={moderation.reportDetails} onChange={(e) => setModeration(prev => ({ ...prev, reportDetails: e.target.value }))} placeholder="Provide more context about this report..." className="min-h-[80px]"/>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button onClick={submitReport} disabled={!moderation.reportReason.trim() || moderation.isReporting}>
                        {moderation.isReporting ? 'Reporting...' : 'Submit Report'}
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>
        </AnimatePresence>)}
    </div>
  </ErrorBoundary>);
};
//# sourceMappingURL=CommunityFeed.jsx.map