import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { Calendar, Flag, Heart, MapPin, MessageCircle, Share2, UserX, Users } from 'lucide-react';
import React, { useCallback } from 'react';
import {} from '@/services/apiClient';
import { OptimizedImage } from './OptimizedImage';
export const PostCard = ({ post, showFullContent = false, likeSubmitting = false, commentSubmitting = false, followSubmitting = false, onLike, onComment, onShare, onJoinActivity, onFollow, onUnfollow, onReport, onBlock, onSelectPost, formatTimeAgo, }) => {
    const handleLike = useCallback(() => {
        onLike(post._id);
    }, [onLike, post._id]);
    const handleComment = useCallback(() => {
        onSelectPost(post);
    }, [onSelectPost, post]);
    const handleShare = useCallback(() => {
        onShare(post._id);
    }, [onShare, post._id]);
    const handleJoinActivity = useCallback(() => {
        onJoinActivity(post._id);
    }, [onJoinActivity, post._id]);
    const handleFollow = useCallback(() => {
        onFollow(post.author._id);
    }, [onFollow, post.author._id]);
    const handleUnfollow = useCallback(() => {
        onUnfollow(post.author._id);
    }, [onUnfollow, post.author._id]);
    const handleReport = useCallback(() => {
        onReport('post', post._id, post.author._id);
    }, [onReport, post._id, post.author._id]);
    const handleBlock = useCallback(() => {
        onBlock(post.author._id);
    }, [onBlock, post.author._id]);
    return (<Card className="mb-4">
      <CardContent className="p-4">
        <header className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={post.author.avatar || ''} alt={`${post.author.name}'s profile picture`}/>
              <AvatarFallback aria-label={`${post.author.name}'s avatar`}>
                {post.author.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{post.author.name}</h3>
                {post.packName && (<>
                    <span className="text-gray-400" aria-hidden="true">in</span>
                    <Badge variant="outline" className="text-xs">
                      {post.packName}
                    </Badge>
                  </>)}
              </div>
              <time className="text-sm text-gray-500" dateTime={post.createdAt} aria-label={`Posted ${formatTimeAgo(post.createdAt)}`}>
                {formatTimeAgo(post.createdAt)}
              </time>
            </div>
          </div>

          <div className="flex gap-1">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={handleReport} title="Report post" aria-label={`Report post by ${post.author.name}`}>
                <Flag className="h-4 w-4" aria-hidden="true"/>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="ghost" size="sm" onClick={handleBlock} title="Block user" aria-label={`Block ${post.author.name}`}>
                <UserX className="h-4 w-4" aria-hidden="true"/>
              </Button>
            </motion.div>
          </div>
        </header>

        <section aria-label="Post content">
          <p className="text-gray-900 whitespace-pre-wrap">
            {showFullContent
            ? post.content
            : post.content.slice(0, 200) + (post.content.length > 200 ? '...' : '')}
          </p>
        </section>

        {post.images && post.images.length > 0 && (<section aria-label={`Photo gallery with ${post.images.length} image${post.images.length > 1 ? 's' : ''}`}>
            <div className={`grid gap-2 mb-3 ${post.images.length === 1
                ? 'grid-cols-1'
                : post.images.length === 2
                    ? 'grid-cols-2'
                    : 'grid-cols-2 md:grid-cols-3'}`}>
              {post.images.map((image, index) => (<OptimizedImage key={index} src={image} alt={`Post image ${index + 1} by ${post.author.name}`} className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-90 transition-opacity" priority={index === 0} // Only prioritize the first image
             sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"/>))}
            </div>
          </section>)}

        {post.type === 'activity' && post.activityDetails && (<section aria-labelledby={`activity-${post._id}`} className="mb-3">
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" aria-hidden="true"/>
                    <h4 id={`activity-${post._id}`} className="font-medium text-blue-900">
                      Upcoming Activity
                    </h4>
                  </div>
                  <Badge variant="secondary" aria-label={`${post.activityDetails.currentAttendees} out of ${post.activityDetails.maxAttendees} attendees`}>
                    {post.activityDetails.currentAttendees}/{post.activityDetails.maxAttendees} attending
                  </Badge>
                </div>

                <div className="space-y-1 text-sm text-blue-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" aria-hidden="true"/>
                    <time dateTime={post.activityDetails.date}>
                      {new Date(post.activityDetails.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            })}
                    </time>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" aria-hidden="true"/>
                    <address className="not-italic">{post.activityDetails.location}</address>
                  </div>
                </div>

                <Button size="sm" className="mt-3 w-full" onClick={handleJoinActivity} aria-label={`Join ${post.activityDetails.currentAttendees + 1} of ${post.activityDetails.maxAttendees} attendees for this activity`}>
                  <Users className="h-4 w-4 mr-2" aria-hidden="true"/>
                  Join Activity
                </Button>
              </CardContent>
            </Card>
          </section>)}

        <section aria-label="Post statistics">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
            <div className="flex items-center gap-4">
              <span aria-label={`${post.likes} people liked this post`}>{post.likes} likes</span>
              <span aria-label={`${post.comments.length} comments on this post`}>{post.comments.length} comments</span>
            </div>
          </div>
        </section>

        <nav aria-label="Post actions">
          <div className="flex items-center gap-1 border-t pt-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button variant="ghost" size="sm" onClick={handleLike} className="w-full" disabled={likeSubmitting} aria-label={likeSubmitting ? "Liking post..." : "Like this post"} aria-pressed={post.liked}>
                <Heart className="h-4 w-4 mr-2" aria-hidden="true"/>
                Like
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button variant="ghost" size="sm" onClick={handleComment} className="w-full" aria-label="View and add comments to this post" aria-expanded={showFullContent}>
                <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true"/>
                Comment
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button variant="ghost" size="sm" onClick={handleShare} className="w-full" aria-label="Share this post">
                <Share2 className="h-4 w-4 mr-2" aria-hidden="true"/>
                Share
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
              <Button variant={post.authorFollowed ? "secondary" : "outline"} size="sm" onClick={post.authorFollowed ? handleUnfollow : handleFollow} disabled={followSubmitting} className="w-full" aria-label={post.authorFollowed ? `Unfollow ${post.author.name}` : `Follow ${post.author.name} to see their posts`} aria-pressed={post.authorFollowed}>
                {post.authorFollowed ? 'Following' : 'Follow'}
              </Button>
            </motion.div>
          </div>
        </nav>
      </CardContent>
    </Card>);
};
//# sourceMappingURL=PostCard.jsx.map
//# sourceMappingURL=PostCard.jsx.map