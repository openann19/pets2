/**
 * CardStack Component
 * Displays swipeable card stack with next card preview
 * Extracted from ModernSwipeScreen for better modularity
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { Pet } from '@pawfectmatch/core';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import ModernSwipeCard from '../ModernSwipeCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export interface CardStackProps {
  currentPet: Pet;
  nextPet?: Pet;
  currentIndex: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onSwipeUp: () => void;
}

export function CardStack({
  currentPet,
  nextPet,
  currentIndex: _currentIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: CardStackProps): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useTheme is properly typed to return AppTheme, throws if Provider missing
  const theme: AppTheme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={styles.container}>
      {/* Current Card */}
      <ModernSwipeCard
        pet={{
          _id: currentPet._id,
          name: currentPet.name,
          age: currentPet.age,
          breed: currentPet.breed,
          photos: currentPet.photos.map((p) => p.url),
          bio: currentPet.description || '',
          distance: 2.5,
          compatibility: 85,
          isVerified: true,
          tags: ['Friendly', 'Active', 'Playful'],
        }}
        onSwipeLeft={onSwipeLeft}
        onSwipeRight={onSwipeRight}
        onSwipeUp={onSwipeUp}
        isTopCard={true}
      />

      {/* Next Card Preview */}
      {nextPet && (
        <View style={styles.nextCardContainer}>
          <View style={styles.nextCard} />
        </View>
      )}
    </View>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    nextCardContainer: {
      position: 'absolute',
      zIndex: -1,
    },
    nextCard: {
      width: screenWidth - theme.spacing['4xl'] - theme.spacing.lg,
      height: screenHeight * 0.65,
      transform: [{ scale: 0.95 }],
      opacity: 0.8,
    },
  });
}
