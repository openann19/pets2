import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@/theme';
import { useTheme } from '@/theme';
import { logger } from '@pawfectmatch/core';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { RootStackParamList } from '../navigation/types';
import { premiumAPI } from '../services/api';

type ManageSubscriptionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ManageSubscription'
>;

interface SubscriptionData {
  id?: string;
  status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  plan?:
    | string
    | {
        name?: string;
        duration?: string;
        price?: string;
      };
  nextBillingDate?: string;
}

const ManageSubscriptionScreen = ({
  navigation,
}: ManageSubscriptionScreenProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscriptionData();
  }, []);

  const loadSubscriptionData = async () => {
    try {
      const data = await premiumAPI.getCurrentSubscription();
      // Map API response to local format
      if (data) {
        const validStatuses: Array<
          'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'inactive'
        > = ['active', 'inactive', 'canceled', 'past_due', 'unpaid', 'incomplete'];
        const status =
          data.status && validStatuses.includes(data.status as any)
            ? (data.status as
                | 'active'
                | 'canceled'
                | 'past_due'
                | 'unpaid'
                | 'incomplete'
                | 'inactive')
            : undefined;
        setSubscription({
          id: data.id,
          status: status ?? 'inactive',
          plan: typeof data.plan === 'string' ? { name: data.plan } : (data.plan as any),
          nextBillingDate: data.currentPeriodEnd,
        });
      } else {
        setSubscription(null);
      }
    } catch (error) {
      logger.error('Error loading subscription data:', { error });
      Alert.alert('Error', 'Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = (): void => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your premium subscription? You will lose access to premium features at the end of your billing period.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            try {
              const success = await premiumAPI.cancelSubscription();

              if (success) {
                Alert.alert(
                  'Success',
                  'Your subscription has been canceled. You will retain access until the end of your current billing period.',
                );
                // Reload subscription data to reflect the cancellation
                await loadSubscriptionData();
                navigation.goBack();
              } else {
                throw new Error('Failed to cancel subscription');
              }
            } catch (error) {
              Alert.alert(
                'Error',
                'Failed to cancel subscription. Please try again or contact support.',
              );
              logger.error('Cancel subscription error:', { error });
            }
          },
        },
      ],
    );
  };

  const handleRestorePurchases = async () => {
    try {
      setLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Refresh subscription status from the server
      // This will restore any active subscriptions linked to the user's account
      const currentSubscription = await premiumAPI.getCurrentSubscription();

      if (currentSubscription && currentSubscription.status === 'active') {
        setSubscription({
          id: currentSubscription.id,
          status: 'active',
          plan: { name: currentSubscription.plan },
          nextBillingDate: currentSubscription.currentPeriodEnd,
        });
        Alert.alert(
          'Success',
          'Your subscription has been restored. You now have access to all premium features.',
        );
      } else {
        Alert.alert(
          'No Active Subscription',
          'No active subscription found linked to your account. If you believe this is an error, please contact support.',
        );
      }
    } catch (error) {
      Alert.alert(
        'Error',
        'Failed to restore purchases. Please check your internet connection and try again.',
      );
      logger.error('Restore purchases error:', { error });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: theme.colors.bg }, // Replaced theme.colors.background
        ])}
      >
        <View style={styles.loadingContainer}>
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: theme.colors.onSurface }, // Replaced theme.colors.text
            ])}
          >
            Loading subscription...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: theme.colors.bg }, // Replaced theme.colors.background
      ])}
    >
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View
          style={StyleSheet.flatten([
            styles.header,
            { backgroundColor: theme.colors.surface }, // Replaced theme.colors.card
          ])}
        >
          <TouchableOpacity
            testID="ManageSubscriptionScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>
          <Text
            style={StyleSheet.flatten([
              styles.headerTitle,
              { color: theme.colors.onSurface }, // Replaced theme.colors.text
            ])}
          >
            Manage Subscription
          </Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        {/* Subscription Info */}
        <View
          style={StyleSheet.flatten([
            styles.section,
            { backgroundColor: theme.colors.surface }, // Replaced theme.colors.card
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: theme.colors.onSurface }, // Replaced theme.colors.text
            ])}
          >
            Current Plan
          </Text>

          <View style={styles.planInfo}>
            <Ionicons
              name="star"
              size={30}
              color={theme.colors.primary}
            />
            <View style={styles.planDetails}>
              <Text
                style={StyleSheet.flatten([
                  styles.planName,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                {typeof subscription?.plan === 'object'
                  ? subscription.plan.name
                  : subscription?.plan || 'Free Plan'}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.planStatus,
                  {
                    color:
                      subscription?.status === 'active'
                        ? theme.colors.success
                        : theme.colors.danger, // Replaced theme.colors.error
                  },
                ])}
              >
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {subscription?.status === 'active' && (
            <>
              <View style={styles.billingInfo}>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingLabel,
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onMuted
                  ])}
                >
                  Billing Period:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingValue,
                    { color: theme.colors.onSurface }, // Replaced theme.colors.text
                  ])}
                >
                  {typeof subscription?.plan === 'object' ? subscription.plan.duration : 'monthly'}
                </Text>
              </View>

              <View style={styles.billingInfo}>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingLabel,
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onMuted
                  ])}
                >
                  Next Billing Date:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingValue,
                    { color: theme.colors.onSurface }, // Replaced theme.colors.text
                  ])}
                >
                  {subscription?.nextBillingDate || 'N/A'}
                </Text>
              </View>

              <View style={styles.billingInfo}>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingLabel,
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onMuted
                  ])}
                >
                  Amount:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.billingValue,
                    { color: theme.colors.onSurface }, // Replaced theme.colors.text
                  ])}
                >
                  ${typeof subscription?.plan === 'object' ? subscription.plan.price : '0.00'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View
          style={StyleSheet.flatten([
            styles.section,
            { backgroundColor: theme.colors.surface }, // Replaced theme.colors.card
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: theme.colors.onSurface }, // Replaced theme.colors.text
            ])}
          >
            Actions
          </Text>

          {subscription?.status === 'active' ? (
            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.cancelButton])}
              testID="ManageSubscriptionScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={handleCancelSubscription}
            >
              <Text
                style={StyleSheet.flatten([
                  styles.actionButtonText,
                  { color: theme.colors.danger }, // Replaced theme.colors.error
                ])}
              >
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                { backgroundColor: theme.colors.primary },
              ])}
              testID="ManageSubscriptionScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.actionButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={StyleSheet.flatten([styles.actionButton, styles.restoreButton])}
            testID="ManageSubscriptionScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleRestorePurchases}
          >
            <Text
              style={StyleSheet.flatten([
                styles.actionButtonText,
                { color: theme.colors.onSurface }, // Replaced theme.colors.text
              ])}
            >
              Restore Purchases
            </Text>
          </TouchableOpacity>

          {subscription?.status === 'active' && (
            <TouchableOpacity
              style={StyleSheet.flatten([styles.actionButton, styles.manageButton])}
              testID="ManageSubscriptionScreen-button-2"
              accessibilityLabel="Manage subscription in system settings"
              accessibilityRole="button"
              onPress={() => {
                // Open system subscription management
                if (Platform.OS === 'ios') {
                  Linking.openURL('https://apps.apple.com/account/subscriptions');
                } else {
                  Linking.openURL('https://play.google.com/store/account/subscriptions');
                }
              }}
            >
              <Ionicons
                name={Platform.OS === 'ios' ? 'settings-outline' : 'storefront-outline'}
                size={18}
                color={theme.colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ])}
              >
                Manage in {Platform.OS === 'ios' ? 'App Store' : 'Play Store'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Plan Features */}
        <View
          style={StyleSheet.flatten([
            styles.section,
            { backgroundColor: theme.colors.surface }, // Replaced theme.colors.card
          ])}
        >
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: theme.colors.onSurface }, // Replaced theme.colors.text
            ])}
          >
            Premium Features
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                Unlimited swipes
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                See who liked you
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                Priority matching
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                Advanced filters
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                AI bio generation
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                Photo analysis
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.featureText,
                  { color: theme.colors.onSurface }, // Replaced theme.colors.text
                ])}
              >
                Compatibility insights
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function makeStyles(theme: AppTheme) {
  // Helper for rgba with opacity
  const alpha = (color: string, opacity: number) => {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return StyleSheet.create({
    container: {
      flex: 1,
    },
    content: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    section: {
      margin: theme.spacing.lg,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size * 0.9,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.lg,
      color: theme.colors.onSurface,
    },
    planInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    planDetails: {
      marginStart: theme.spacing.md,
    },
    planName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.xs,
      color: theme.colors.onSurface,
    },
    planStatus: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    billingInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    billingLabel: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    billingValue: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
    },
    actionButton: {
      padding: theme.spacing.md,
      borderRadius: theme.radii.sm,
      alignItems: 'center',
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButton: {
      backgroundColor: alpha(theme.colors.danger, 0.1),
      borderColor: alpha(theme.colors.danger, 0.3),
    },
    restoreButton: {
      backgroundColor: alpha(theme.colors.bg, 0.05),
    },
    manageButton: {
      backgroundColor: alpha(theme.colors.primary, 0.1),
      borderColor: alpha(theme.colors.primary, 0.3),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    featuresList: {
      gap: theme.spacing.md,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    featureText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
  });
}

export default ManageSubscriptionScreen;
