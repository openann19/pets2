import React, { useCallback } from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/theme';
import type { Pet } from '@pawfectmatch/core';
import { haptic } from '../../ui/haptics';

interface FeedCardProps {
  pet: Pet;
  onLike: () => void;
  onPass: () => void;
  onSuperlike: () => void;
  onPress?: () => void;
  style?: any;
  testID?: string;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  pet,
  onLike,
  onPass,
  onSuperlike,
  onPress,
  style,
  testID
}) => {
  const theme = useTheme();

  const handleLike = useCallback(() => {
    haptic.confirm();
    onLike();
  }, [onLike]);

  const handlePass = useCallback(() => {
    haptic.tap();
    onPass();
  }, [onPass]);

  const handleSuperlike = useCallback(() => {
    haptic.super();
    onSuperlike();
  }, [onSuperlike]);

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.colors.surface, shadowColor: theme.colors.border }, style]}
      onPress={handlePress}
      testID={testID}
      accessibilityLabel={`Pet card for ${pet.name}`}
      accessibilityRole="button"
    >
      {/* Pet Image/Photo Placeholder */}
      <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.imagePlaceholder, { color: theme.colors.onSurface }]}>
          🐾
        </Text>
        <Text style={[styles.petName, { color: theme.colors.onPrimary, textShadowColor: theme.colors.border }]}>
          {pet.name}
        </Text>
      </View>

      {/* Pet Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.petName, { color: theme.colors.onSurface }]}>
          {pet.name}
        </Text>
        <Text style={[styles.petBreed, { color: theme.colors.onMuted }]}>
          {pet.breed || 'Mixed Breed'}
        </Text>
        {pet.description && (
          <Text
            style={[styles.petDescription, { color: theme.colors.onMuted }]}
            numberOfLines={2}
          >
            {pet.description}
          </Text>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.passButton, { backgroundColor: theme.colors.danger, borderColor: theme.colors.border, shadowColor: theme.colors.border }]}
          onPress={handlePass}
          testID={`${testID}-pass`}
          accessibilityLabel="Pass on this pet"
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            ✕
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.superlikeButton, { backgroundColor: theme.colors.primary, shadowColor: theme.colors.border }]}
          onPress={handleSuperlike}
          testID={`${testID}-superlike`}
          accessibilityLabel="Super like this pet"
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            ★
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.likeButton, { backgroundColor: theme.colors.success, shadowColor: theme.colors.border }]}
          onPress={handleLike}
          testID={`${testID}-like`}
          accessibilityLabel="Like this pet"
          accessibilityRole="button"
        >
          <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
            ♥
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  imageContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  imagePlaceholder: {
    fontSize: 48,
  },
  petName: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    fontSize: 24,
    fontWeight: 'bold',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  infoContainer: {
    padding: 16,
  },
  petBreed: {
    fontSize: 16,
    marginTop: 4,
  },
  petDescription: {
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    paddingTop: 0,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  passButton: {
    borderWidth: 2,
  },
  superlikeButton: {
    // Background color set via style prop
  },
  likeButton: {
    // Background color set via style prop
  },
  actionButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default FeedCard;