/**
 * MatchModal Component
 * Displays match celebration modal with confetti burst
 * Extracted from ModernSwipeScreen for better modularity
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { EliteButtonPresets, FXContainerPresets, Heading1, Body } from '../';
import { Theme } from '../../theme/unified-theme';
import type { Pet } from '@pawfectmatch/core';
import { ConfettiBurst } from './ConfettiBurst';

const { width: screenWidth } = Dimensions.get('window');

export interface MatchModalProps {
  pet: Pet;
  onKeepSwiping: () => void;
  onSendMessage: () => void;
  show?: boolean;
}

export function MatchModal({
  pet,
  onKeepSwiping,
  onSendMessage,
  show = true,
}: MatchModalProps): JSX.Element {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);
      // Stop confetti after 4 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!show) return <View />;

  return (
    <View style={styles.overlay}>
      {/* Confetti burst for match celebration */}
      <ConfettiBurst
        show={showConfetti}
        intensity="heavy"
        duration={4000}
        onComplete={() => setShowConfetti(false)}
      />

      <FXContainerPresets.premium style={styles.content}>
        <Heading1 style={styles.title}>It's a Match! 🎉</Heading1>

        <View style={styles.photos}>
          <View style={styles.photoContainer}>
            {/* Match photo would go here */}
          </View>
        </View>

        <Body style={styles.text}>
          You and {pet.name} liked each other!
        </Body>

        <View style={styles.buttons}>
          <EliteButtonPresets.glass
            title="Keep Swiping"
            onPress={onKeepSwiping}
          />
          <EliteButtonPresets.premium
            title="Send Message"
            leftIcon="chatbubble"
            onPress={onSendMessage}
          />
        </View>
      </FXContainerPresets.premium>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10000,
  },
  content: {
    width: screenWidth - Theme.spacing['4xl'],
    padding: Theme.spacing['4xl'],
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  photos: {
    flexDirection: 'row',
    marginBottom: Theme.spacing.xl,
    gap: Theme.spacing.lg,
  },
  photoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  text: {
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
    color: Theme.colors.text.secondary,
  },
  buttons: {
    flexDirection: 'row',
    gap: Theme.spacing.lg,
  },
});
