/**
 * 🎯 NOTIFICATION CENTER SHEET
 * 
 * Pull from top-right action → sheet that stacks cards with 3D layering
 * Mark-read animates out with a poof (5-8 particles)
 * 
 * DoD: Open <120ms; dismiss <180ms; screen reader announces counts & changes
 */

import React, { useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { GestureDetector } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { useReduceMotion } from '@/hooks/useReducedMotion';
import { haptic } from '@/foundation/haptics';
import { springs } from '@/foundation/motion';
import { useMagneticGesture } from '@/hooks/gestures/useMagneticGesture';
import { makePool, spawn, step, reset } from './particles/ParticlePool';
import { createParticle } from './particles/createParticle';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationCenterSheetProps {
  /** Whether sheet is visible */
  visible: boolean;
  /** Notifications to display */
  notifications: Notification[];
  /** Callback when sheet should close */
  onClose: () => void;
  /** Callback when notification is marked as read */
  onMarkRead: (id: string) => void;
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.utils.alpha(theme.colors.bg, 0.5),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.utils.alpha(theme.colors.onSurface, 0.1),
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      flex: 1,
    },
    badge: {
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.md,
      minWidth: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: theme.spacing.sm,
      marginRight: theme.spacing.md,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '700',
    },
    closeButton: {
      padding: theme.spacing.sm,
    },
    list: {
      flex: 1,
      padding: theme.spacing.md,
    },
    card: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 80,
    },
    cardContent: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    cardMessage: {
      fontSize: 14,
      color: theme.utils.alpha(theme.colors.onSurface, 0.7),
      marginBottom: theme.spacing.xs,
    },
    cardTime: {
      fontSize: 12,
      color: theme.utils.alpha(theme.colors.onSurface, 0.5),
    },
    unreadDot: {
      width: theme.spacing.sm,
      height: theme.spacing.sm,
      borderRadius: theme.radii.xs,
      backgroundColor: theme.colors.danger,
      marginLeft: theme.spacing.md,
    },
  });

/**
 * Notification Center Sheet component
 */
export function NotificationCenterSheet({
  visible,
  notifications,
  onClose,
  onMarkRead,
}: NotificationCenterSheetProps) {
  const theme = useTheme() as AppTheme;
  const reducedMotion = useReduceMotion();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);
  
  const opacity = useSharedValue(0);
  const poofPoolRef = React.useRef(makePool(8));

  // Magnetic gesture with snap points (top, middle, bottom)
  const { gesture, animatedStyle: gestureStyle, position } = useMagneticGesture({
    snapPoints: [0, SCREEN_HEIGHT * 0.5, SCREEN_HEIGHT],
    snapThreshold: 50,
    velocityThreshold: 500,
    hapticOnSnap: true,
    axis: 'y',
    springConfig: springs.standard,
  });

  // Sync opacity and position with visibility
  React.useEffect(() => {
    if (visible) {
      position.value = withSpring(0, springs.standard);
      opacity.value = withTiming(1, { duration: 120 });
      haptic.tap();
    } else {
      position.value = withSpring(SCREEN_HEIGHT, springs.standard);
      opacity.value = withTiming(0, { duration: 180 });
    }
  }, [visible, position]);

  // Animated sheet style combining gesture and opacity
  const sheetStyle = useAnimatedStyle(() => ({
    transform: gestureStyle.value.transform,
    opacity: opacity.value,
  }));

  // Handle mark as read with poof effect
  const handleMarkRead = useCallback((notification: Notification, index: number) => {
    if (notification.read) return;
    
    haptic.confirm();
    onMarkRead(notification.id);
    
    // Poof effect at card position
    if (!reducedMotion) {
      const cardY = insets.top + 60 + index * 80;
      const cardX = SCREEN_HEIGHT / 2;
      
      reset(poofPoolRef.current);
      spawn(
        poofPoolRef.current,
        cardX,
        cardY,
        8,
        (id) => createParticle(id, {
          colors: [theme.utils.alpha(theme.colors.primary, 0.5)],
          minSize: 4,
          maxSize: 8,
          minSpeed: 1,
          maxSpeed: 3,
          ttl: 400,
        })
      );
      
      // Animate poof particles
      let frameId: number;
      const animate = (_timestamp: number) => {
        step(poofPoolRef.current, 16);
        if (poofPoolRef.current.alive > 0) {
          frameId = requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
      
      setTimeout(() => {
        if (frameId) {
          cancelAnimationFrame(frameId);
        }
        reset(poofPoolRef.current);
      }, 400);
    }
  }, [reducedMotion, theme, insets, onMarkRead]);

  // Monitor position for auto-close when dragged to bottom
  React.useEffect(() => {
    if (!visible) return;
    
    const interval = setInterval(() => {
      if (position.value >= SCREEN_HEIGHT * 0.95) {
        onClose();
      }
    }, 100);
    
    return () => clearInterval(interval);
  }, [visible, position, onClose]);

  if (!visible && position.value >= SCREEN_HEIGHT * 0.95) {
    return null;
  }

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, sheetStyle] as any}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        
        <View style={[styles.container, { paddingTop: insets.top }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount}</Text>
              </View>
            )}
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={theme.colors.onSurface} />
            </Pressable>
          </View>

          {/* Notifications list */}
          <View style={styles.list}>
            {notifications.map((notification, index) => (
              <Pressable
                key={notification.id}
                onPress={() => handleMarkRead(notification, index)}
                style={[
                  styles.card,
                  { backgroundColor: notification.read ? theme.colors.surface : theme.utils.alpha(theme.colors.primary, 0.2) },
                ]}
                accessibilityRole="button"
                accessibilityLabel={`${notification.title}: ${notification.message}`}
                accessibilityHint={notification.read ? 'Already read' : 'Double tap to mark as read'}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>{notification.title}</Text>
                  <Text style={styles.cardMessage}>{notification.message}</Text>
                  <Text style={styles.cardTime}>{notification.timestamp}</Text>
                </View>
                {!notification.read && (
                  <View style={styles.unreadDot} />
                )}
              </Pressable>
            ))}
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}

