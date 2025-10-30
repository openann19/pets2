/**
 * Swipe Gesture Hint Overlay
 * Shows first-time users how to use swipe gestures
 */

import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../../services/logger';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

const STORAGE_KEY = '@PawfectMatch:swipe_hints_shown';

interface SwipeGestureHintOverlayProps {
  onDismiss?: () => void;
}

export function SwipeGestureHintOverlay({
  onDismiss,
}: SwipeGestureHintOverlayProps): React.JSX.Element | null {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [showHints, setShowHints] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    checkIfShown();
  }, []);

  useEffect(() => {
    if (showHints) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          damping: 20,
          stiffness: 90,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showHints, fadeAnim, slideAnim]);

  const checkIfShown = async () => {
    try {
      const shown = await AsyncStorage.getItem(STORAGE_KEY);
      if (!shown) {
        setShowHints(true);
      }
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error checking hints status', { error: err });
    }
  };

  const handleDismiss = async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'true');
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowHints(false);
        onDismiss?.();
      });
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Error dismissing hints', { error: err });
    }
  };

  if (!showHints) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: fadeAnim,
        },
      ]}
    >
      <Pressable
        style={styles.backdrop}
        onPress={handleDismiss}
      />
      <Animated.View
        style={[
          styles.hintCard,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Swipe to Connect</Text>
          <Pressable onPress={handleDismiss}>
            <Ionicons
              name="close"
              size={24}
              color={theme.colors.onMuted}
            />
          </Pressable>
        </View>

        <View style={styles.hints}>
          {/* Like */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.success }]}>
              <Ionicons
                name="heart"
                size={24}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>RIGHT</Text> to like
            </Text>
          </View>

          {/* Pass */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.danger }]}>
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>LEFT</Text> to pass
            </Text>
          </View>

          {/* Super Like */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.info }]}>
              <Ionicons
                name="star"
                size={24}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text style={styles.hintText}>
              Swipe <Text style={styles.bold}>UP</Text> to super like
            </Text>
          </View>

          {/* Double Tap */}
          <View style={styles.hintItem}>
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.primary }]}>
              <Ionicons
                name="heart-circle"
                size={24}
                color={theme.colors.onPrimary}
              />
            </View>
            <Text style={styles.hintText}>
              <Text style={styles.bold}>DOUBLE TAP</Text> to like instantly
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.gotItButton}
          onPress={handleDismiss}
        >
          <Text style={styles.gotItText}>Got it!</Text>
        </Pressable>
      </Animated.View>
    </Animated.View>
  );
}

function createStyles(theme: AppTheme) {
  return StyleSheet.create({
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1000,
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    hintCard: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.radii.xl,
      borderTopRightRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      ...theme.shadows.elevation2,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    hints: {
      gap: theme.spacing.md,
    },
    hintItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    iconContainer: {
      width: theme.spacing['3xl'],
      height: theme.spacing['3xl'],
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    hintText: {
      flex: 1,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
    bold: {
      fontWeight: 'bold',
      color: theme.colors.onSurface,
    },
    gotItButton: {
      marginTop: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.lg,
      alignItems: 'center',
    },
    gotItText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: '600',
    },
  });
}
