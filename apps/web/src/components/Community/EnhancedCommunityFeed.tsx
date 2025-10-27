import React, { useState, useCallback } from 'react';
import { logger } from '@pawfectmatch/core';
;
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Send, Sparkles } from 'lucide-react';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedButton } from '@/components/ui/animated-button';
import { useConfetti } from '@/hooks/useConfetti';
import { useRealtimeFeed } from '@/hooks/useRealtimeFeed';
import { communityApi } from '@/services/apiClient';
export const EnhancedCommunityFeed = ({ userId }) => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { fireworks } = useConfetti();
    // Real-time updates
    useRealtimeFeed({
        userId,
        onUpdate: (data) => {
            switch (data.type) {
                case 'new_post':
                    if (data.post) {
                        setPosts((prev) => [data.post, ...prev]);
                    }
                    break;
                case 'like':
                    setPosts((prev) => prev.map((post) => post._id === data.postId
                        ? { ...post, likes: post.likes + 1 }
                        : post));
                    break;
                case 'comment':
                    if (data.comment && data.postId) {
                        setPosts((prev) => prev.map((post) => post._id === data.postId
                            ? { ...post, comments: [...post.comments, data.comment] }
                            : post));
                    }
                    break;
            }
        },
    });
    const handleCreatePost = useCallback(async () => {
        if (!newPostContent.trim() || isSubmitting)
            return;
        try {
            setIsSubmitting(true);
            const response = await communityApi.createPost({ content: newPostContent });
            setPosts((prev) => [response.post, ...prev]);
            setNewPostContent('');
            fireworks(); // Celebrate new post!
        }
        catch (error) {
            logger.error('Failed to create post:', { error });
        }
        finally {
            setIsSubmitting(false);
        }
    }, [newPostContent, isSubmitting, fireworks]);
    const handleLike = useCallback(async (postId) => {
        try {
            await communityApi.likePost(postId);
            setPosts((prev) => prev.map((post) => post._id === postId
                ? { ...post, likes: post.likes + 1, liked: true }
                : post));
        }
        catch (error) {
            logger.error('Failed to like post:', { error });
        }
    }, []);
    return (<div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Create Post Card */}
      <GlassCard variant="medium" blur="lg" className="p-6">
        <div className="space-y-4">
          <textarea value={newPostContent} onChange={(e) => { setNewPostContent(e.target.value); }} placeholder="Share something amazing with your pack..." className="w-full min-h-[120px] bg-transparent border border-white/20 rounded-lg p-4 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"/>
          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              <AnimatedButton variant="ghost" size="sm">
                <Sparkles className="h-4 w-4 mr-2"/>
                AI Enhance
              </AnimatedButton>
            </div>
            <AnimatedButton onClick={() => void handleCreatePost()} disabled={!newPostContent.trim() || isSubmitting} size="md">
              <Send className="h-4 w-4 mr-2"/>
              {isSubmitting ? 'Posting...' : 'Post'}
            </AnimatedButton>
          </div>
        </div>
      </GlassCard>

      {/* Posts Feed */}
      <AnimatePresence mode="popLayout">
        {posts.map((post, index) => (<motion.div key={post._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: index * 0.05,
            }}>
            <GlassCard variant="light" blur="md" className="p-6 hover:border-brand-primary/50 transition-all">
              {/* Post Header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold">
                  {post.author.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{post.author.name}</h3>
                  <p className="text-sm text-white/60">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <p className="text-white/90 mb-4 whitespace-pre-wrap">{post.content}</p>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (<div className="grid grid-cols-2 gap-2 mb-4">
                  {post.images.map((image, idx) => (<motion.img key={idx} src={image} alt={`Post image ${idx + 1}`} className="w-full h-48 object-cover rounded-lg" whileHover={{ scale: 1.02 }} transition={{ type: 'spring', stiffness: 400 }}/>))}
                </div>)}

              {/* Engagement Stats */}
              <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                <span>{post.likes} likes</span>
                <span>{post.comments.length} comments</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <AnimatedButton variant="ghost" size="sm" onClick={() => void handleLike(post._id)} className={post.liked ? 'text-red-500' : ''}>
                  <Heart className={`h-4 w-4 mr-2 ${post.liked ? 'fill-current' : ''}`}/>
                  Like
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2"/>
                  Comment
                </AnimatedButton>
                <AnimatedButton variant="ghost" size="sm">
                  <Share2 className="h-4 w-4 mr-2"/>
                  Share
                </AnimatedButton>
              </div>
            </GlassCard>
          </motion.div>))}
      </AnimatePresence>

      {/* Empty State */}
      {posts.length === 0 && (<GlassCard variant="light" blur="md" className="p-12 text-center">
          <Sparkles className="h-12 w-12 mx-auto mb-4 text-brand-primary"/>
          <h3 className="text-xl font-semibold text-white mb-2">No posts yet</h3>
          <p className="text-white/60">Be the first to share something with your pack!</p>
        </GlassCard>)}
    </div>);
};
//# sourceMappingURL=EnhancedCommunityFeed.jsx.map
//# sourceMappingURL=EnhancedCommunityFeed.jsx.map