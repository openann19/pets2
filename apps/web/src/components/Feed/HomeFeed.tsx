/**
 * 📰 HOME FEED COMPONENT
 * Instagram-style feed of matched pets' posts with infinite scroll
 */
'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react'
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftRightIcon, ShareIcon, BookmarkIcon, EllipsisHorizontalIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import { useInView } from 'react-intersection-observer';
const SENTIMENT_COLORS = {
    happy: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    training: 'bg-blue-100 text-blue-800 border-blue-200',
    adventure: 'bg-green-100 text-green-800 border-green-200',
    relaxed: 'bg-purple-100 text-purple-800 border-purple-200',
    playful: 'bg-pink-100 text-pink-800 border-pink-200'
};
export default function HomeFeed({ posts, onLoadMore, onLike, onComment, onShare, onBookmark, className = '' }) {
    const [feedPosts, setFeedPosts] = useState(posts);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [playingVideos, setPlayingVideos] = useState(new Set());
    const [currentMediaIndex, setCurrentMediaIndex] = useState({});
    const { ref: loadMoreRef, inView } = useInView({
        threshold: 0.1,
        triggerOnce: false
    });
    // Load more posts when in view
    useEffect(() => {
        if (inView && hasMore && !isLoading) {
            loadMorePosts();
        }
    }, [inView, hasMore, isLoading]);
    const loadMorePosts = useCallback(async () => {
        if (isLoading || !hasMore)
            return;
        setIsLoading(true);
        try {
            const newPosts = await onLoadMore();
            if (newPosts.length === 0) {
                setHasMore(false);
            }
            else {
                setFeedPosts(prev => [...prev, ...newPosts]);
            }
        }
        catch (error) {
            logger.error('Failed to load more posts:', { error });
        }
        finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, onLoadMore]);
    const handleLike = useCallback((postId) => {
        onLike(postId);
        setFeedPosts(prev => prev.map(post => post.id === postId
            ? {
                ...post,
                isLiked: !post.isLiked,
                likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
            : post));
    }, [onLike]);
    const handleBookmark = useCallback((postId) => {
        onBookmark(postId);
        setFeedPosts(prev => prev.map(post => post.id === postId
            ? { ...post, isBookmarked: !post.isBookmarked }
            : post));
    }, [onBookmark]);
    const toggleVideoPlay = useCallback((postId, mediaId) => {
        setPlayingVideos(prev => {
            const newSet = new Set(prev);
            if (newSet.has(mediaId)) {
                newSet.delete(mediaId);
            }
            else {
                newSet.add(mediaId);
            }
            return newSet;
        });
    }, []);
    const nextMedia = useCallback((postId) => {
        setCurrentMediaIndex(prev => {
            const post = feedPosts.find(p => p.id === postId);
            if (!post)
                return prev;
            const currentIndex = prev[postId] || 0;
            const nextIndex = (currentIndex + 1) % post.media.length;
            return { ...prev, [postId]: nextIndex };
        });
    }, [feedPosts]);
    const prevMedia = useCallback((postId) => {
        setCurrentMediaIndex(prev => {
            const post = feedPosts.find(p => p.id === postId);
            if (!post)
                return prev;
            const currentIndex = prev[postId] || 0;
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : post.media.length - 1;
            return { ...prev, [postId]: prevIndex };
        });
    }, [feedPosts]);
    return (<div className={`space-y-6 ${className}`}>
      {feedPosts.map((post, index) => (<PostCard key={post.id} post={post} index={index} onLike={handleLike} onComment={onComment} onShare={onShare} onBookmark={handleBookmark} onVideoToggle={toggleVideoPlay} onNextMedia={nextMedia} onPrevMedia={prevMedia} currentMediaIndex={currentMediaIndex[post.id] || 0} isVideoPlaying={playingVideos.has(post.media[currentMediaIndex[post.id] || 0]?.id)}/>))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-8">
        {isLoading && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center space-x-2 text-neutral-600">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"/>
            <span>Loading more posts...</span>
          </motion.div>)}
        
        {!hasMore && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-neutral-500">
            <p>You've reached the end of your feed!</p>
            <p className="text-sm mt-2">Check back later for more adorable content 🐾</p>
          </motion.div>)}
      </div>
    </div>);
}
function PostCard({ post, index, onLike, onComment, onShare, onBookmark, onVideoToggle, onNextMedia, onPrevMedia, currentMediaIndex, isVideoPlaying }) {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const currentMedia = post.media[currentMediaIndex];
    const handleComment = () => {
        if (commentText.trim()) {
            onComment(post.id, commentText);
            setCommentText('');
        }
    };
    return (<motion.article initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className="bg-white dark:bg-neutral-900 rounded-2xl shadow-lg overflow-hidden">
      {/* Post header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <Image src={post.petAvatar} alt={post.petName} width={40} height={40} className="w-full h-full object-cover"/>
          </div>
          <div>
            <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
              {post.petName}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-neutral-500">
              <span>{post.timestamp.toLocaleDateString()}</span>
              {post.location && (<>
                  <span>•</span>
                  <span>{post.location}</span>
                </>)}
            </div>
          </div>
        </div>
        
        <button className="p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          <EllipsisHorizontalIcon className="w-5 h-5 text-neutral-600"/>
        </button>
      </div>

      {/* Media */}
      <div className="relative">
        {currentMedia.type === 'photo' ? (<Image src={currentMedia.url} alt={post.caption} width={400} height={400} className="w-full aspect-square object-cover"/>) : (<div className="relative w-full aspect-square bg-black">
            <video src={currentMedia.url} className="w-full h-full object-cover" muted loop autoPlay={isVideoPlaying}/>
            
            {/* Video controls */}
            <button onClick={() => onVideoToggle(post.id, currentMedia.id)} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
              {isVideoPlaying ? (<PauseIcon className="w-12 h-12 text-white"/>) : (<PlayIcon className="w-12 h-12 text-white"/>)}
            </button>
          </div>)}

        {/* Carousel indicators */}
        {post.media.length > 1 && (<div className="absolute top-4 right-4 flex space-x-1">
            {post.media.map((_, index) => (<button key={index} onClick={() => setCurrentMediaIndex(prev => ({ ...prev, [post.id]: index }))} className={`w-2 h-2 rounded-full ${index === currentMediaIndex ? 'bg-white' : 'bg-white/50'}`}/>))}
          </div>)}

        {/* Carousel navigation */}
        {post.media.length > 1 && (<>
            <button onClick={() => onPrevMedia(post.id)} className="absolute left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
              ←
            </button>
            <button onClick={() => onNextMedia(post.id)} className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 rounded-full flex items-center justify-center text-white hover:bg-black/50 transition-colors">
              →
            </button>
          </>)}

        {/* Sentiment badge */}
        <div className={`absolute top-4 left-4 px-2 py-1 rounded-full text-xs font-medium border ${SENTIMENT_COLORS[post.sentiment]}`}>
          {post.sentiment}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-4">
            <button onClick={() => onLike(post.id)} className={`p-2 rounded-full transition-colors ${post.isLiked
            ? 'text-red-500 hover:bg-red-50'
            : 'text-neutral-600 hover:bg-neutral-100'}`}>
              {post.isLiked ? (<HeartSolidIcon className="w-6 h-6"/>) : (<HeartIcon className="w-6 h-6"/>)}
            </button>

            <button onClick={() => { setShowComments(!showComments); }} className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors">
              <ChatBubbleLeftRightIcon className="w-6 h-6"/>
            </button>

            <button onClick={() => onShare(post.id)} className="p-2 rounded-full text-neutral-600 hover:bg-neutral-100 transition-colors">
              <ShareIcon className="w-6 h-6"/>
            </button>
          </div>

          <button onClick={() => onBookmark(post.id)} className={`p-2 rounded-full transition-colors ${post.isBookmarked
            ? 'text-yellow-500 hover:bg-yellow-50'
            : 'text-neutral-600 hover:bg-neutral-100'}`}>
            {post.isBookmarked ? (<BookmarkSolidIcon className="w-6 h-6"/>) : (<BookmarkIcon className="w-6 h-6"/>)}
          </button>
        </div>

        {/* Likes count */}
        {post.likes > 0 && (<p className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
            {post.likes} {post.likes === 1 ? 'like' : 'likes'}
          </p>)}

        {/* Caption */}
        <div className="mb-2">
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">
            {post.petName}
          </span>
          <span className="text-neutral-900 dark:text-neutral-100 ml-2">
            {post.caption}
          </span>
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (<div className="flex flex-wrap gap-1 mb-2">
            {post.tags.map((tag) => (<span key={tag} className="text-sm text-primary-600 dark:text-primary-400">
                #{tag}
              </span>))}
          </div>)}

        {/* Comments */}
        {post.comments > 0 && (<button onClick={() => { setShowComments(!showComments); }} className="text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors">
            View all {post.comments} {post.comments === 1 ? 'comment' : 'comments'}
          </button>)}

        {/* Comment input */}
        <AnimatePresence>
          {showComments && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center space-x-3">
                <input type="text" value={commentText} onChange={(e) => { setCommentText(e.target.value); }} placeholder="Add a comment..." className="flex-1 px-3 py-2 bg-neutral-100 dark:bg-neutral-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" onKeyPress={(e) => {
                if (e.key === 'Enter') {
                    handleComment();
                }
            }}/>
                <button onClick={handleComment} disabled={!commentText.trim()} className="px-4 py-2 bg-primary-500 text-white rounded-full text-sm font-semibold hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                  Post
                </button>
              </div>
            </motion.div>)}
        </AnimatePresence>
      </div>
    </motion.article>);
}
// Hook for feed management
export function useHomeFeed() {
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const loadMorePosts = useCallback(async () => {
        if (isLoading || !hasMore)
            return [];
        setIsLoading(true);
        try {
            const response = await fetch(`/api/feed?page=${page}&limit=10`);
            const data = await response.json();
            if (data.posts.length === 0) {
                setHasMore(false);
                return [];
            }
            setPosts(prev => [...prev, ...data.posts]);
            setPage(prev => prev + 1);
            return data.posts;
        }
        catch (error) {
            logger.error('Failed to load posts:', { error });
            return [];
        }
        finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, page]);
    const refreshFeed = useCallback(async () => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
        await loadMorePosts();
    }, [loadMorePosts]);
    return {
        posts,
        isLoading,
        hasMore,
        loadMorePosts,
        refreshFeed
    };
}
//# sourceMappingURL=HomeFeed.jsx.map