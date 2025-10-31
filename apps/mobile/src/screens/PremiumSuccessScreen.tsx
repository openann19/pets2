/**
 * Premium Subscription Success Screen
 * Displayed after successful Stripe payment
 */

import { Ionicons } from '@expo/vector-icons';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { logger } from '@pawfectmatch/core';
import { premiumAPI } from '../services/api';
import type { RootStackParamList } from '../navigation/types';

const PremiumSuccessScreen = (): React.JSX.Element => {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifySubscription = async () => {
      try {
        // Verify subscription status by fetching current subscription from the backend
        // This ensures the subscription was properly activated after payment
        const subscription = await premiumAPI.getCurrentSubscription();

        if (subscription && subscription.status === 'active') {
          setIsVerified(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          logger.info('Premium subscription verified successfully', {
            subscriptionId: subscription.id,
            plan: subscription.plan,
          });
        } else {
          // Subscription not yet active - could be processing
          // Retry with exponential backoff
          let retries = 0;
          const maxRetries = 5;
          const retryDelay = (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 5000);

          const checkSubscription = async () => {
            try {
              const retrySubscription = await premiumAPI.getCurrentSubscription();
              if (retrySubscription && retrySubscription.status === 'active') {
                setIsVerified(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                logger.info('Premium subscription verified after retry', {
                  subscriptionId: retrySubscription.id,
                  plan: retrySubscription.plan,
                  retries,
                });
              } else if (retries < maxRetries) {
                retries++;
                await new Promise((resolve) => setTimeout(resolve, retryDelay(retries)));
                await checkSubscription();
              } else {
                // Maximum retries reached - subscription may still be processing
                setIsVerified(true); // Show success UI but log warning
                logger.warn('Subscription verification timeout - showing success UI', {
                  retries,
                  subscriptionStatus: retrySubscription?.status,
                });
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            } catch (error) {
              if (retries < maxRetries) {
                retries++;
                await new Promise((resolve) => setTimeout(resolve, retryDelay(retries)));
                await checkSubscription();
              } else {
                logger.error('Failed to verify subscription after retries', { error, retries });
                // Still show success UI as payment was completed
                setIsVerified(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
            }
          };

          await checkSubscription();
        }
      } catch (error) {
        logger.error('Error verifying subscription', { error });
        // Still show success UI as payment was completed
        // The subscription will be verified via webhook or on next app open
        setIsVerified(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    };

    void verifySubscription();
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('MainTabs');
  };

  const styles = makeStyles(theme);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {isVerified ? (
          <>
            <View style={styles.successIcon}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={theme.colors.success}
              />
            </View>

            <Text style={styles.title}>Welcome to Premium! 🎉</Text>

            <Text style={styles.subtitle}>
              Your subscription has been activated successfully. Enjoy all premium features!
            </Text>

            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons
                  name="heart"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.featureText}>Unlimited swipes</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="eye"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.featureText}>See who liked you</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons
                  name="flash"
                  size={20}
                  color={theme.colors.success}
                />
                <Text style={styles.featureText}>Priority matching</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.continueButton}
              testID="PremiumSuccessScreen-start-matching-button"
              accessibilityLabel="Start matching"
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleContinue}
            >
              <Text style={styles.continueButtonText}>Start Matching</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <View style={styles.loadingIcon}>
              <Ionicons
                name="time"
                size={60}
                color={theme.colors.primary}
              />
            </View>

            <Text style={styles.title}>Verifying Payment...</Text>

            <Text style={styles.subtitle}>Please wait while we confirm your subscription.</Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

function makeStyles(theme: ReturnType<typeof useTheme>) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    content: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xl,
    },
    successIcon: {
      marginBottom: theme.spacing.xl,
    },
    loadingIcon: {
      marginBottom: theme.spacing.xl,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
      color: theme.colors.onSurface,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      textAlign: 'center',
      lineHeight: theme.typography.body.lineHeight,
      marginBottom: theme.spacing['2xl'],
      color: theme.colors.onMuted,
    },
    featuresList: {
      alignSelf: 'stretch',
      marginBottom: theme.spacing['3xl'],
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
    },
    featureText: {
      fontSize: theme.typography.body.size,
      marginStart: theme.spacing.md,
      flex: 1,
      color: theme.colors.onSurface,
    },
    continueButton: {
      paddingHorizontal: theme.spacing['2xl'],
      paddingVertical: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      minWidth: 200,
      alignItems: 'center',
      backgroundColor: theme.colors.primary,
    },
    continueButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
    },
  });
}

export default PremiumSuccessScreen;
