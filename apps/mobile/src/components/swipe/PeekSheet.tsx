/**
 * PeekSheet - Next card peek preview
 * Shows a preview of the next card with subtle animation
 */

import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Theme } from '../../theme/unified-theme';
import type { Pet } from '@pawfectmatch/core';
import ModernSwipeCard from '../ModernSwipeCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface PeekSheetProps {
  nextPet?: Pet | null;
  show?: boolean;
}

export function PeekSheet({ nextPet, show = false }: PeekSheetProps): React.JSX.Element {
  const [scale] = useState(() => new Animated.Value(0.9));
  const [opacity] = useState(() => new Animated.Value(0.3));

  useEffect(() => {
    if (show && nextPet) {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [show, nextPet, scale, opacity]);

  if (!nextPet || !show) return <View />;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: opacity,
          transform: [{ scale: scale }],
        },
      ]}
    >
      <View style={styles.cardWrapper}>
        <ModernSwipeCard
          pet={{
            _id: nextPet._id,
            name: nextPet.name,
            age: nextPet.age,
            breed: nextPet.breed,
            photos: nextPet.photos.map((p) => (typeof p === 'string' ? p : p.url)).filter((p): p is string => typeof p === 'string'),
            bio: nextPet.description || '',
            distance: 2.5,
            compatibility: 85,
            isVerified: true,
            tags: ['Next'],
          }}
          onSwipeLeft={() => {}}
          onSwipeRight={() => {}}
          onSwipeUp={() => {}}
          isTopCard={false}
          disabled={true}
          style={styles.nextCard}
        />
      </View>

      {/* Peek indicator */}
      <View style={styles.peekIndicator}>
        <View style={styles.peekDot} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: SCREEN_WIDTH / 2 - (SCREEN_WIDTH - Theme.spacing['4xl']) / 4,
    width: (SCREEN_WIDTH - Theme.spacing['4xl']) / 2,
    height: '50%',
    zIndex: 1,
    pointerEvents: 'none',
  },
  cardWrapper: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  nextCard: {
    width: '100%',
    height: '100%',
    borderRadius: Theme.borderRadius.xl,
  },
  peekIndicator: {
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -10,
    width: 20,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.neutral[400],
    opacity: 0.6,
  },
  peekDot: {
    width: '100%',
    height: '100%',
    borderRadius: 2,
    backgroundColor: Theme.colors.primary[500],
  },
});
