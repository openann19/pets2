import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SwipeWidgetProps {
  pet: {
    id: string;
    name: string;
    age: number;
    breed: string;
    photos: string[];
  };
  onSwipe: (direction: 'left' | 'right') => void;
  onViewProfile: () => void;
}

export function SwipeWidget({ pet, onSwipe, onViewProfile }: SwipeWidgetProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Swipe</Text>
        <TouchableOpacity
          onPress={onViewProfile}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="open-outline"
            size={20}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.petCard}>
        <Image
          source={{ uri: pet.photos[0] }}
          style={styles.petImage}
          resizeMode="cover"
        />
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{pet.name}</Text>
          <Text style={styles.petDetails}>
            {pet.age} • {pet.breed}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.passButton])}
          onPress={() => {
            onSwipe('left');
          }}
        >
          <Ionicons
            name="close"
            size={24}
            color={theme.colors.danger}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={StyleSheet.flatten([styles.actionButton, styles.likeButton])}
          onPress={() => {
            onSwipe('right');
          }}
        >
          <Ionicons
            name="heart"
            size={24}
            color={theme.colors.success}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      margin: theme.spacing.sm,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    petCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    petImage: {
      width: '100%',
      height: 120,
      borderRadius: theme.radii.sm,
      marginBottom: theme.spacing.xs,
    },
    petInfo: {
      alignItems: 'center',
    },
    petName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    petDetails: {
      fontSize: 12,
      color: theme.colors.onMuted,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    actionButton: {
      width: 48,
      height: 48,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    passButton: {
      backgroundColor: theme.colors.danger + '15',
    },
    likeButton: {
      backgroundColor: theme.colors.success + '15',
    },
  });
}
