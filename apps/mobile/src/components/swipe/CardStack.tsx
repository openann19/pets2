/**
 * CardStack Component
 * Displays swipeable card stack with next card preview
 * Extracted from ModernSwipeScreen for better modularity
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import type { Pet } from '@pawfectmatch/core';
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
  currentIndex,
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
}: CardStackProps): JSX.Element {
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
        onSwipeLeft={onSwipeLeft as any}
        onSwipeRight={onSwipeRight as any}
        onSwipeUp={onSwipeUp as any}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.xl,
  },
  nextCardContainer: {
    position: 'absolute',
    zIndex: -1,
  },
  nextCard: {
    width: screenWidth - Theme.spacing['4xl'] - Theme.spacing.lg,
    height: screenHeight * 0.65,
    transform: [{ scale: 0.95 }],
    opacity: 0.8,
  },
});
