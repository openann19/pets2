/**
 * MyPetCard Component
 * Displays a pet card in the MyPets screen with actions
 */

import { Ionicons } from '@expo/vector-icons';
import type { Pet } from '@pawfectmatch/core';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { DoubleTapLikePlus } from '../Gestures/DoubleTapLikePlus';
import { PinchZoomPro } from '../Gestures/PinchZoomPro';

interface MyPetCardProps {
  pet: Pet;
  index: number;
  reducedMotion: boolean;
  getSpeciesEmoji: (species: string) => string;
  getIntentColor: (intent: string) => string;
  getIntentLabel: (intent: string) => string;
  onPress: (pet: Pet) => void;
  onLike: (pet: Pet) => void;
  onView: (pet: Pet) => void;
  onEdit: (pet: Pet) => void;
  onDelete: (petId: string) => void;
  onPinchStart: (petId: string) => void;
  onPinchEnd: () => void;
}

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    petCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      marginBottom: theme.spacing.md,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      overflow: 'hidden',
    },
    petImageContainer: {
      position: 'relative',
      width: '100%',
      height: 200,
    },
    petImagePlaceholder: {
      width: '100%',
      height: 200,
      backgroundColor: theme.colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    petImageEmoji: {
      fontSize: 48,
    },
    statusBadge: {
      position: 'absolute',
      top: 12,
      right: 12,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 4,
    },
    statusBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    photoCountBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      backgroundColor: theme.colors.overlay || `${theme.palette.neutral[950]}B3`,
      borderRadius: theme.radii.md,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 4,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    photoCountText: {
      fontSize: 10,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    petInfo: {
      padding: theme.spacing.md,
    },
    petHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.xs,
    },
    petName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    petSpecies: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    petBreed: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    petDetails: {
      marginBottom: theme.spacing.sm,
    },
    petDetail: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    petStats: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: theme.spacing.md,
    },
    stat: {
      alignItems: 'center',
      gap: 4,
    },
    statText: {
      fontSize: 12,
      fontWeight: '500',
      color: theme.colors.onMuted,
    },
    petActions: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    actionButton: {
      flex: 1,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 6,
    },
    viewButton: {
      backgroundColor: theme.colors.primary,
    },
    viewButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onPrimary,
    },
    editButton: {
      backgroundColor: theme.colors.surface,
    },
    deleteButton: {
      backgroundColor: theme.colors.danger,
    },
  });
};

export const MyPetCard: React.FC<MyPetCardProps> = ({
  pet,
  index,
  reducedMotion,
  getSpeciesEmoji,
  getIntentColor,
  getIntentLabel,
  onPress,
  onLike,
  onView,
  onEdit,
  onDelete,
  onPinchStart,
  onPinchEnd,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const CardContent = (
    <TouchableOpacity
      style={styles.petCard}
      testID={`pet-card-${pet._id}`}
      accessibilityLabel={`Pet profile for ${pet.name}, ${pet.breed}`}
      accessibilityRole="button"
      onPress={() => onPress(pet)}
    >
      {/* Pet Photo with Gestures */}
      <View style={styles.petImageContainer}>
        {pet.photos && pet.photos.length > 0 ? (
          <DoubleTapLikePlus
            onDoubleTap={() => onLike(pet)}
            heartColor={theme.colors.danger}
            particles={4}
            haptics={{ enabled: true, style: 'light' }}
          >
            <PinchZoomPro
              source={{
                uri: pet.photos.find((p) => p.isPrimary)?.url ?? pet.photos[0]?.url ?? '',
              }}
              width={120}
              height={120}
              minScale={1}
              maxScale={2.5}
              enableMomentum={false}
              haptics={true}
              onScaleChange={(scale) => {
                if (scale > 1.1) {
                  onPinchStart(pet.id);
                } else {
                  onPinchEnd();
                }
              }}
              backgroundColor={theme.colors.surface}
            />
          </DoubleTapLikePlus>
        ) : (
          <View style={styles.petImagePlaceholder}>
            <Text style={styles.petImageEmoji}>{getSpeciesEmoji(pet.species)}</Text>
          </View>
        )}

        {/* Status badge */}
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getIntentColor(pet.intent) },
          ]}
        >
          <Text style={styles.statusBadgeText}>{getIntentLabel(pet.intent)}</Text>
        </View>

        {/* Photo count */}
        {pet.photos && pet.photos.length > 1 ? (
          <View style={styles.photoCountBadge}>
            <Ionicons name="camera" size={12} color={theme.colors.bg} />
            <Text style={styles.photoCountText}>{pet.photos.length}</Text>
          </View>
        ) : null}
      </View>

      {/* Pet Info */}
      <View style={styles.petInfo}>
        <View style={styles.petHeader}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petSpecies}>{getSpeciesEmoji(pet.species)}</Text>
        </View>

        <Text style={styles.petBreed}>{pet.breed}</Text>

        <View style={styles.petDetails}>
          <Text style={styles.petDetail}>
            {pet.age} years • {pet.gender} • {pet.size}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.petStats}>
          <View style={styles.stat}>
            <Ionicons name="eye" size={14} color={theme.colors.onMuted} />
            <Text style={styles.statText}>{pet.analytics.views}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="heart" size={14} color={theme.colors.danger} />
            <Text style={styles.statText}>{pet.analytics.likes}</Text>
          </View>
          <View style={styles.stat}>
            <Ionicons name="people" size={14} color={theme.colors.primary} />
            <Text style={styles.statText}>{pet.analytics.matches}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.petActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.viewButton]}
            testID={`view-button-${pet._id}`}
            accessibilityLabel={`View details for ${pet.name}`}
            accessibilityRole="button"
            onPress={() => onView(pet)}
          >
            <Ionicons name="eye" size={16} color={theme.colors.onPrimary} />
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            testID={`edit-button-${pet._id}`}
            accessibilityLabel={`Edit ${pet.name}`}
            accessibilityRole="button"
            onPress={() => onEdit(pet)}
          >
            <Ionicons name="pencil" size={16} color={theme.colors.onSurface} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            testID={`delete-button-${pet._id}`}
            accessibilityLabel={`Delete ${pet.name}`}
            accessibilityRole="button"
            onPress={() => onDelete(pet._id)}
          >
            <Ionicons name="trash" size={16} color={theme.colors.bg} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (reducedMotion) {
    return CardContent;
  }

  return <Animated.View entering={FadeInDown.duration(220).delay(index * 50)}>{CardContent}</Animated.View>;
};

