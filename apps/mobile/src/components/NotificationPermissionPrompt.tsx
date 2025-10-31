/**
 * Notification Permission Prompt Component
 * Shows an in-app explanation before requesting system permission
 */

import React from 'react';
import { Alert, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import * as Haptics from 'expo-haptics';
import { notificationService } from '../services/notifications';
import { logger } from '@pawfectmatch/core';

interface NotificationPermissionPromptProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onDismiss?: () => void;
}

export function NotificationPermissionPrompt({
  onPermissionGranted,
  onPermissionDenied,
  onDismiss,
}: NotificationPermissionPromptProps): React.JSX.Element {
  const theme = useTheme();

  const handleAllow = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
      
      const result = await notificationService.requestPermission();
      
      if (result.status === 'granted') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        // Permission granted - notification service should have already initialized token
        // Small delay to ensure token is ready
        setTimeout(() => {
          onPermissionGranted?.();
        }, 100);
      } else if (result.status === 'denied') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        Alert.alert(
          'Notifications Disabled',
          'To enable notifications, please go to Settings and enable notifications for PawfectMatch.',
          [
            { text: 'Cancel', style: 'cancel', onPress: onPermissionDenied },
            {
              text: 'Open Settings',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ],
        );
        onPermissionDenied?.();
      }
    } catch (error) {
      logger.error('Failed to request notification permission', { error });
      Alert.alert('Error', 'Failed to request notification permission. Please try again.');
      onPermissionDenied?.();
    }
  };

  const handleNotNow = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onDismiss?.();
  };

  const styles = StyleSheet.create({
    container: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999,
    },
    card: {
      width: '85%',
      maxWidth: 400,
      borderRadius: 24,
      overflow: 'hidden',
    },
    blurView: {
      padding: 24,
    },
    iconContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      textAlign: 'center',
      marginBottom: 12,
    },
    description: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    benefits: {
      marginBottom: 24,
      gap: 12,
    },
    benefit: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    benefitText: {
      fontSize: 14,
      color: theme.colors.onSurface,
      flex: 1,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    button: {
      flex: 1,
      paddingVertical: 16,
      borderRadius: 12,
      alignItems: 'center',
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
    },
    secondaryButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    primaryButtonText: {
      color: theme.colors.onPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    secondaryButtonText: {
      color: theme.colors.onSurface,
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <BlurView
        intensity={20}
        style={styles.card}
      >
        <View style={styles.blurView}>
          <View style={styles.iconContainer}>
            <Ionicons
              name="notifications-circle"
              size={64}
              color={theme.colors.primary}
            />
          </View>

          <Text style={styles.title}>Stay Connected</Text>
          <Text style={styles.description}>
            Get notified about new matches, messages, and important updates to never miss a connection with your pet's perfect match.
          </Text>

          <View style={styles.benefits}>
            <View style={styles.benefit}>
              <Ionicons
                name="heart"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.benefitText}>New match notifications</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons
                name="chatbubbles"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.benefitText}>Message alerts</Text>
            </View>
            <View style={styles.benefit}>
              <Ionicons
                name="star"
                size={20}
                color={theme.colors.primary}
              />
              <Text style={styles.benefitText}>Profile likes & updates</Text>
            </View>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={handleNotNow}
              accessibilityLabel="Not now"
              accessibilityRole="button"
            >
              <Text style={styles.secondaryButtonText}>Not Now</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleAllow}
              accessibilityLabel="Allow notifications"
              accessibilityRole="button"
            >
              <Text style={styles.primaryButtonText}>Allow</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BlurView>
    </View>
  );
}

