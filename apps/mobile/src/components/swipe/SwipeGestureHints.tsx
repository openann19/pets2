/**
 * SwipeGestureHints - Onboarding gesture hints
 * Shows instructional hints for swipe gestures on first use
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme';

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
  const theme = useTheme();
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

  const resolveNumber = (value: unknown, fallback: number): number => {
    if (typeof value === 'number') return value;
    const parsed = Number.parseFloat(String(value ?? ''));
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const shadow = (theme.shadows?.md ?? (theme.shadows as any)?.depth?.md) as Record<string, unknown> | undefined;

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
          padding: resolveNumber(theme.spacing?.md, 16),
          borderRadius: resolveNumber(theme.radius?.lg, 16),
          gap: resolveNumber(theme.spacing?.sm, 8),
          ...(shadow ?? {}),
        },
        hintText: {
          fontSize: resolveNumber(theme.typography?.fontSize?.sm, 14),
          fontWeight: theme.typography?.fontWeight?.semibold ?? '600',
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
      }),
    [resolveNumber, shadow, theme]
  );

  return (
    <Animated.View style={[styles.container, { opacity }]} pointerEvents="box-none">
      {/* Left hint */}
      {leftHint && (
        <View style={styles.hintContainerLeft}>
          <View style={[styles.hint, { backgroundColor: leftHint.color + '20' }]}>
            <Ionicons name={leftHint.icon as any} size={24} color={leftHint.color} />
            <Text style={[styles.hintText, { color: leftHint.color }]}>{leftHint.text}</Text>
          </View>
        </View>
      )}

      {/* Right hint */}
      {rightHint && (
        <View style={styles.hintContainerRight}>
          <View style={[styles.hint, { backgroundColor: rightHint.color + '20' }]}>
            <Ionicons name={rightHint.icon as any} size={24} color={rightHint.color} />
            <Text style={[styles.hintText, { color: rightHint.color }]}>{rightHint.text}</Text>
          </View>
        </View>
      )}

      {/* Top hint */}
      {topHint && (
        <View style={styles.hintContainerTop}>
          <View style={[styles.hint, { backgroundColor: topHint.color + '20' }]}>
            <Ionicons name={topHint.icon as any} size={24} color={topHint.color} />
            <Text style={[styles.hintText, { color: topHint.color }]}>{topHint.text}</Text>
          </View>
        </View>
      )}

      {/* Dismiss button */}
      <Pressable style={styles.dismissButton} onPress={handleDismiss} testID="dismiss-button">
        <Ionicons name="close" size={20} color={theme.colors.onSurface} />
      </Pressable>
    </Animated.View>
  );
}
