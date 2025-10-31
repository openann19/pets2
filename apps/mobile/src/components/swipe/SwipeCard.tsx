/**
 * SwipeCard Component
 *
 * Presentational component for displaying a swipeable pet card.
 * Handles visual rendering only - no business logic.
 *
 * @example
 * ```typescript
 * <SwipeCard
 *   pet={currentPet}
 *   style={{ transform: [{ translateX: position.x }] }}
 *   panHandlers={panHandlers}
 * />
 * ```
 */

import React from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useTheme } from '@mobile/theme';

export interface Pet {
  _id: string;
  name: string;
  breed: string;
  description?: string;
}

export interface SwipeCardProps {
  /**
   * Pet data to display
   */
  pet: Pet;

  /**
   * Animated style for position/rotation
   */
  style?: StyleProp<ViewStyle>;

  /**
   * Pan responder handlers for gestures
   */
  panHandlers?: any;

  /**
   * Test ID for E2E testing
   */
  testID?: string;
}

/**
 * SwipeCard - Displays a pet card with swipeable gestures
 */
export const SwipeCard: React.FC<SwipeCardProps> = ({ pet, style, panHandlers, testID }) => {
  const theme = useTheme();
  
  const styles = StyleSheet.create({
    card: {
      width: '100%',
      maxWidth: 400,
      height: 400,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.md,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      justifyContent: 'flex-end',
    },
    petInfo: {
      alignItems: 'center',
    },
    petName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    petBreed: {
      fontSize: 18,
      color: theme.colors.onMuted,
    },
    petDescription: {
      fontSize: 14,
      color: theme.colors.onMuted,
      marginTop: theme.spacing.sm,
      textAlign: 'center',
    },
  });

  return (
    <Animated.View
      testID={testID || `swipe-card-${pet._id}`}
      style={[styles.card, style]}
      {...panHandlers}
    >
      <View style={styles.petInfo}>
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petBreed}>{pet.breed}</Text>
        {pet.description && <Text style={styles.petDescription}>{pet.description}</Text>}
      </View>
    </Animated.View>
  );
};

