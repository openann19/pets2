/**
 * MatchModal Component
 * Displays match celebration modal with confetti burst
 * Extracted from ModernSwipeScreen for better modularity
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, Modal, Platform } from 'react-native';
import { EliteButtonPresets, FXContainerPresets, Heading1, Body } from '../';
import type { Pet } from '@pawfectmatch/core';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { ConfettiBurst } from './ConfettiBurst';
import { shouldSkipHeavyEffects } from '../../utils/PerfManager';
import { useReducedMotion } from '../../utils/A11yHelpers';

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
}: MatchModalProps): React.JSX.Element {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- useTheme is properly typed to return AppTheme, throws if Provider missing
  const theme: AppTheme = useTheme();
  const [showConfetti, setShowConfetti] = useState(false);
  const titleRef = useRef<View>(null);
  const skipHeavyEffects = shouldSkipHeavyEffects();
  const prefersReducedMotion = useReducedMotion();
  const shouldShowConfetti = !skipHeavyEffects && !prefersReducedMotion;

  useEffect(() => {
    if (show && shouldShowConfetti) {
      // Use setTimeout to avoid synchronous setState in effect
      const timer = setTimeout(() => {
        setShowConfetti(true);
        // Stop confetti after 4 seconds
        const stopTimer = setTimeout(() => {
          setShowConfetti(false);
        }, 4000);
        return () => {
          clearTimeout(stopTimer);
        };
      }, 0);
      return () => {
        clearTimeout(timer);
      };
    }
    return undefined;
  }, [show, shouldShowConfetti]);

  // Focus on title when modal opens (accessibility)
  useEffect(() => {
    if (show && titleRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        if (Platform.OS === 'ios') {
          // iOS VoiceOver will read the accessible element
          titleRef.current?.setNativeProps({ accessibilityViewIsModal: true });
        }
      }, 100);
    }
  }, [show]);

  if (!show) return <View />;

  const styles = makeStyles(theme);

  return (
    <Modal
      visible={show}
      transparent
      animationType="fade"
      accessibilityViewIsModal
      presentationStyle="overFullScreen"
      onRequestClose={onKeepSwiping}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        {/* Confetti burst for match celebration - skipped on low-end or reduced motion */}
        {shouldShowConfetti && (
          <ConfettiBurst
            show={showConfetti}
            intensity="heavy"
            duration={4000}
            onComplete={() => {
              setShowConfetti(false);
            }}
          />
        )}

        <FXContainerPresets.premium style={styles.content}>
          <View
            ref={titleRef}
            accessible
            accessibilityRole="header"
            accessibilityLabel="It's a Match!"
            accessibilityViewIsModal={true}
          >
            <Heading1 style={styles.title}>It&apos;s a Match! 🎉</Heading1>
          </View>

          <View style={styles.photos}>
            <View style={styles.photoContainer}>{/* Match photo would go here */}</View>
          </View>

          <Body style={styles.text}>You and {pet.name} liked each other!</Body>

          <View style={styles.buttons}>
            <EliteButtonPresets.glass
              title="Keep Swiping"
              onPress={onKeepSwiping}
              accessibilityLabel="Keep swiping"
            />
            <EliteButtonPresets.premium
              title="Send Message"
              leftIcon="chatbubble"
              onPress={onSendMessage}
              accessibilityLabel="Send message to matched pet"
            />
          </View>
        </FXContainerPresets.premium>
      </View>
    </Modal>
  );
}

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
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
      width: screenWidth - theme.spacing['4xl'],
      padding: theme.spacing['4xl'],
      alignItems: 'center',
    },
    title: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
    },
    photos: {
      flexDirection: 'row',
      marginBottom: theme.spacing.xl,
      gap: theme.spacing.lg,
    },
    photoContainer: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },
    text: {
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
      color: theme.colors.onMuted,
    },
    buttons: {
      flexDirection: 'row',
      gap: theme.spacing.lg,
    },
  });
}
