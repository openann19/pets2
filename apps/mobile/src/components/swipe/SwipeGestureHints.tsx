/**
 * SwipeGestureHints - Onboarding gesture hints
 * Shows instructional hints for swipe gestures on first use
 */

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HINTS_STORAGE_KEY = 'swipe_hints_dismissed';

export interface SwipeGestureHintsProps {
  onDismiss?: () => void;
  initialDismissed?: boolean; // For testing purposes
}

interface Hint {
  icon: string;
  text: string;
  position: 'left' | 'right' | 'top';
  color: string;
}

const hints: Hint[] = [
  { icon: 'arrow-back', text: 'Swipe left to pass', position: 'left', color: '#EF4444' },
  { icon: 'arrow-forward', text: 'Swipe right to like', position: 'right', color: '#10B981' },
  { icon: 'arrow-up', text: 'Swipe up to super like', position: 'top', color: '#3B82F6' },
];

export function SwipeGestureHints({ onDismiss, initialDismissed }: SwipeGestureHintsProps): React.JSX.Element {
  const [visible, setVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(initialDismissed ?? false);
  const opacity = useRef(new Animated.Value(0)).current;
  const autoDismissTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip if already dismissed (for testing)
    if (initialDismissed) {
      return;
    }

    const checkDismissed = async () => {
      try {
        const dismissed = await AsyncStorage.getItem(HINTS_STORAGE_KEY);
        if (!dismissed) {
          setVisible(true);
          Animated.timing(opacity, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();

          // Auto-dismiss after 5 seconds
          autoDismissTimeoutRef.current = setTimeout(() => {
            handleDismiss();
          }, 5000);
        }
      } catch (error) {
        logger.error('Error checking hints status', { error });
      }
    };

    checkDismissed();

    // Cleanup timeout on unmount
    return () => {
      if (autoDismissTimeoutRef.current) {
        clearTimeout(autoDismissTimeoutRef.current);
      }
    };
  }, []);

  const handleDismiss = async () => {
    // Clear auto-dismiss timeout if still pending
    if (autoDismissTimeoutRef.current) {
      clearTimeout(autoDismissTimeoutRef.current);
      autoDismissTimeoutRef.current = null;
    }

    try {
      await AsyncStorage.setItem(HINTS_STORAGE_KEY, 'true');
      setIsDismissed(true);
      
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    } catch (error) {
      logger.error('Error dismissing hints', { error });
    }
  };

  if (!visible || isDismissed) return <View />;

  const leftHint = hints[0];
  const rightHint = hints[1];
  const topHint = hints[2];

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="box-none">
      {/* Left hint */}
      {leftHint && (
        <View style={styles.hintContainerLeft}>
          <View style={[styles.hint, { backgroundColor: leftHint.color + '20' }]}>
            <Ionicons name={leftHint.icon} size={24} color={leftHint.color} />
            <Text style={[styles.hintText, { color: leftHint.color }]}>{leftHint.text}</Text>
          </View>
        </View>
      )}

      {/* Right hint */}
      {rightHint && (
        <View style={styles.hintContainerRight}>
          <View style={[styles.hint, { backgroundColor: rightHint.color + '20' }]}>
            <Ionicons name={rightHint.icon} size={24} color={rightHint.color} />
            <Text style={[styles.hintText, { color: rightHint.color }]}>{rightHint.text}</Text>
          </View>
        </View>
      )}

      {/* Top hint */}
      {topHint && (
        <View style={styles.hintContainerTop}>
          <View style={[styles.hint, { backgroundColor: topHint.color + '20' }]}>
            <Ionicons name={topHint.icon} size={24} color={topHint.color} />
            <Text style={[styles.hintText, { color: topHint.color }]}>{topHint.text}</Text>
          </View>
        </View>
      )}

      {/* Dismiss button */}
      <Pressable style={styles.dismissButton} onPress={handleDismiss} testID="dismiss-button">
        <Ionicons name="close" size={20} color="#666" />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  hintContainerLeft: {
    position: 'absolute',
    left: 20,
    top: '45%',
    alignItems: 'flex-start',
  },
  hintContainerRight: {
    position: 'absolute',
    right: 20,
    top: '45%',
    alignItems: 'flex-end',
  },
  hintContainerTop: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    alignItems: 'center',
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.sm,
    ...Theme.shadows.depth.md,
  },
  hintText: {
    fontSize: Theme.typography.fontSize.sm,
    fontWeight: Theme.typography.fontWeight.semibold,
  },
  dismissButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
