/**
 * Post Card Component
 * Displays a single community post with all interactions
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DoubleTapLikePlus } from '../Gestures/DoubleTapLikePlus';
import { PinchZoomPro } from '../Gestures/PinchZoomPro';
import { ReactionBarMagnetic } from '../chat';
import { ActivityBanner } from './ActivityBanner';
import { CommentsSection } from './CommentsSection';
import { PostActions } from './PostActions';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { CommunityPost } from '../../services/communityAPI';
import { formatTimeAgo } from '../../utils/timeAgo';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
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
  });
}

interface PostCardProps {
  post: CommunityPost;
  onLike: () => void;
  onComment: () => void;
  onJoinActivity?: () => void;
  onReport: () => void;
  onBlockUser: () => void;
  onPostLongPress: () => void;
  onPostReaction: (emoji: string) => void;
  onScaleChange: (imageIndex: number, scale: number) => void;
  onReactionCancel?: () => void;
  isLiking?: boolean;
  showReactions?: boolean;
  onViewComments?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onJoinActivity,
  onReport,
  onBlockUser,
  onPostLongPress,
  onPostReaction,
  onScaleChange,
  onReactionCancel,
  isLiking = false,
  showReactions = false,
  onViewComments,
}) => {
  const theme = useTheme();
  const styles = __makeStyles_styles(theme);

  const handleOptionsPress = () => {
    Alert.alert('Options', '', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Report',
        style: 'destructive',
        onPress: onReport,
      },
      {
        text: 'Block User',
        style: 'destructive',
        onPress: onBlockUser,
      },
    ]);
  };

  return (
    <View style={[styles.postCard, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity
          style={styles.authorInfo}
          onPress={() => {
            // Navigate to user profile
          }}
          testID={`post-author-${post._id}`}
          accessibilityLabel={`View ${post.author.name}'s profile`}
          accessibilityRole="button"
        >
          <Image
            source={{ uri: post.author.avatar || 'https://i.pravatar.cc/150' }}
            style={styles.avatar}
            accessibilityLabel={`${post.author.name}'s profile picture`}
            accessibilityRole="image"
          />
          <View>
            <Text style={[styles.authorName, { color: theme.colors.onSurface }]}>
              {post.author.name}
            </Text>
            <Text style={[styles.timeAgo, { color: theme.colors.onMuted }]}>
              {formatTimeAgo(post.createdAt)}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleOptionsPress}
          testID={`post-options-${post._id}`}
          accessibilityLabel="Post options"
          accessibilityRole="button"
        >
          <Ionicons
            name="ellipsis-horizontal"
            size={20}
            color={theme.colors.onMuted}
          />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Text style={[styles.postContent, { color: theme.colors.onSurface }]}>
        {post.content}
      </Text>

      {/* Images with Gestures */}
      {post.images && post.images.length > 0 && (
        <View style={styles.imagesContainer}>
          {post.images.map((image, idx) => (
            <DoubleTapLikePlus
              key={idx}
              onDoubleTap={onLike}
              onSingleTap={onPostLongPress}
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
                onScaleChange={(scale) => onScaleChange(idx, scale)}
                backgroundColor={theme.colors.surface}
              />
            </DoubleTapLikePlus>
          ))}

          {/* Reaction Bar Overlay */}
          {showReactions && (
            <View style={styles.reactionOverlay}>
              <ReactionBarMagnetic
                onSelect={onPostReaction}
                onCancel={onReactionCancel || (() => {})}
                influenceRadius={80}
                baseSize={28}
                backgroundColor={theme.colors.surface}
                borderColor={theme.colors.border}
              />
            </View>
          )}
        </View>
      )}

      {/* Activity Details */}
      {post.type === 'activity' && post.activityDetails && onJoinActivity && (
        <ActivityBanner
          activityDetails={post.activityDetails}
          onJoin={onJoinActivity}
        />
      )}

      {/* Actions */}
      <PostActions
        postId={post._id}
        liked={post.liked}
        likes={post.likes}
        commentsCount={post.comments.length}
        onLike={onLike}
        onComment={onViewComments || onComment}
        isLiking={isLiking}
      />

      {/* Comments Section */}
      {post.comments.length > 0 && <CommentsSection comments={post.comments} />}
    </View>
  );
};

