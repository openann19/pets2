/**
 * LikedUserItem Component
 * Displays a single user who liked your pet profile
 */

import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useCallback, useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useTheme } from '@mobile/theme';
import type { ReceivedLike } from '../../services/api';

interface LikedUserItemProps {
  like: ReceivedLike;
  onPress: (like: ReceivedLike) => void;
}

export function LikedUserItem({ like, onPress }: LikedUserItemProps): React.JSX.Element {
  const theme = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          borderWidth: 1,
          borderColor: theme.colors.border,
          shadowColor: theme.colors.bg,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 2,
        },
        avatarContainer: {
          width: 60,
          height: 60,
          borderRadius: 30,
          overflow: 'hidden',
          backgroundColor: theme.colors.border,
          marginRight: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
        },
        avatar: {
          width: 60,
          height: 60,
        },
        avatarPlaceholder: {
          width: 60,
          height: 60,
          alignItems: 'center',
          justifyContent: 'center',
        },
        infoContainer: {
          flex: 1,
        },
        name: {
          fontSize: 16,
          fontWeight: '600',
          color: theme.colors.onSurface,
          marginBottom: 4,
        },
        location: {
          fontSize: 14,
          color: theme.colors.onMuted,
          marginBottom: 4,
        },
        likedAt: {
          fontSize: 12,
          color: theme.colors.onMuted,
        },
        superLikeBadge: {
          backgroundColor: theme.colors.primary + '20',
          borderRadius: theme.radii.sm,
          paddingHorizontal: theme.spacing.xs,
          paddingVertical: 2,
          marginLeft: theme.spacing.xs,
        },
        superLikeText: {
          fontSize: 10,
          fontWeight: '600',
          color: theme.colors.primary,
        },
        actionButton: {
          padding: theme.spacing.sm,
          borderRadius: theme.radii.md,
          backgroundColor: theme.colors.primary + '20',
        },
      }),
    [theme],
  );

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(like);
  }, [like, onPress]);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${like.name} liked your pet`}
      testID={`liked-user-item-${like.userId}`}
    >
      {/* Avatar */}
      <View style={styles.avatarContainer}>
        {like.profilePicture ? (
          <Image source={{ uri: like.profilePicture }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={30} color={theme.colors.onMuted} />
          </View>
        )}
      </View>

      {/* Info */}
      <View style={styles.infoContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={styles.name}>{like.name}</Text>
          {like.isSuperLike && (
            <View style={styles.superLikeBadge}>
              <Text style={styles.superLikeText}>⭐ Super Like</Text>
            </View>
          )}
        </View>
        {like.location && <Text style={styles.location}>{like.location}</Text>}
        <Text style={styles.likedAt}>Liked {formatDate(like.likedAt)}</Text>
        {like.petsLiked.length > 0 && (
          <Text style={[styles.likedAt, { marginTop: 4 }]}>
            {like.petsLiked.length} pet{like.petsLiked.length > 1 ? 's' : ''} liked
          </Text>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={handlePress}
        accessibilityLabel="View profile"
        accessibilityRole="button"
      >
        <Ionicons name="chevron-forward" size={20} color={theme.colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

