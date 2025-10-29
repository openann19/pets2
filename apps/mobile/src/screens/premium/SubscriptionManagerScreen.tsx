import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { logger } from '@pawfectmatch/core';
import type { NavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { RootStackParamList } from '../../navigation/types';
import { _subscriptionAPI as subscriptionApi } from '../../services/api';

type SubscriptionManagerNavigationProp = NavigationProp<RootStackParamList>;

interface Subscription {
  id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: {
    id: string;
    name: string;
    interval: 'month' | 'year';
    amount: number;
    currency: string;
  };
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt?: string;
  trialEnd?: string;
}

interface UsageStats {
  swipesRemaining: number;
  totalSwipes: number;
  superLikesRemaining: number;
  totalSuperLikes: number;
  boostsRemaining: number;
  totalBoosts: number;
  resetDate: string;
}

/**
 * Temporary helper until the core SDK exposes `createCheckoutSession`.
 * It returns the Stripe Checkout URL needed to update the payment method.
 */
const createCheckoutSession = async <T extends { url: string }>(payload: {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  metadata?: Record<string, unknown>;
}): Promise<T> => {
  const response = await fetch(
    `${String(process.env['EXPO_PUBLIC_API_BASE_URL'])}/subscriptions/checkout-session`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  return response.json() as Promise<T>;
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.surface,
    },
    contentContainer: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing['2xl'],
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
    },
    loadingText: {
      marginTop: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.primary,
    },
    header: {
      padding: theme.spacing.lg,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.md,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    errorContainer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.danger + '15',
      borderRadius: theme.radii.md,
      alignItems: 'center',
    },
    errorText: {
      fontSize: 16,
      color: theme.colors.danger,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
      marginBottom: theme.spacing.md,
    },
    retryButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.danger,
      borderRadius: theme.radii.sm,
    },
    retryButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
    },
    noSubscriptionContainer: {
      padding: theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      elevation: 2,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    noSubscriptionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.sm,
    },
    noSubscriptionText: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    upgradeButton: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      borderRadius: theme.radii.sm,
    },
    upgradeButtonText: {
      color: theme.colors.onPrimary,
      fontWeight: '600',
      fontSize: 16,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      elevation: 2,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    statusBadge: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.xl,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '500',
    },
    planDetails: {
      marginBottom: theme.spacing.md,
    },
    planName: {
      fontSize: 22,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    planPrice: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    detailLabel: {
      fontSize: 16,
      color: theme.colors.onMuted,
    },
    detailValue: {
      fontSize: 16,
      color: theme.colors.onSurface,
      fontWeight: '500',
    },
    detailValueHighlight: {
      fontSize: 16,
      color: theme.colors.warning,
      fontWeight: '500',
    },
    usageItem: {
      marginBottom: theme.spacing.md,
    },
    usageLabel: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginBottom: theme.spacing.sm,
    },
    usageBar: {
      height: 8,
      backgroundColor: theme.colors.border,
      borderRadius: theme.radii.xs,
      overflow: 'hidden',
      marginBottom: theme.spacing.xs,
    },
    usageProgress: {
      height: '100%',
      borderRadius: theme.radii.xs,
    },
    usageText: {
      fontSize: 14,
      color: theme.colors.onMuted,
    },
    usageResetText: {
      fontSize: 14,
      color: theme.colors.onMuted,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.sm,
      marginBottom: theme.spacing.sm,
    },
    reactivateButton: {
      backgroundColor: theme.colors.primary,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '500',
      marginLeft: theme.spacing.sm,
      color: theme.colors.onSurface,
    },
  });
}

export const SubscriptionManagerScreen = () => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const navigation = useNavigation<SubscriptionManagerNavigationProp>();

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptionData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch current subscription using the core SDK
      const subscriptionData = await (
        subscriptionApi as unknown as {
          getCurrentSubscription: () => Promise<Subscription | null>;
        }
      ).getCurrentSubscription();
      setSubscription(subscriptionData);

      // Fetch usage stats
      const usageData = (await fetch(
        `${String(process.env['EXPO_PUBLIC_API_BASE_URL'])}/subscriptions/usage`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        },
      ).then((res) => res.json())) as UsageStats;
      setUsageStats(usageData);
    } catch (err) {
      logger.error('Failed to fetch subscription data:', { error: err });
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    void fetchSubscriptionData();
  }, []);

  const handleRefresh = (): void => {
    setIsRefreshing(true);
    void fetchSubscriptionData();
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You can continue to use premium features until the end of your billing period.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              try {
                setIsLoading(true);
                if (subscription?.id !== undefined && subscription.id !== '') {
                  await fetch(
                    `${String(process.env['EXPO_PUBLIC_API_BASE_URL'])}/subscriptions/cancel`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ subscriptionId: subscription.id }),
                    },
                  );
                  Alert.alert(
                    'Subscription Canceled',
                    'Your subscription has been canceled. You can continue using premium features until the end of your current billing period.',
                  );
                  // Refresh data to show updated status
                  void fetchSubscriptionData();
                }
              } catch (err) {
                logger.error('Failed to cancel subscription:', { error: err });
                Alert.alert('Error', 'Failed to cancel your subscription. Please try again later.');
              } finally {
                setIsLoading(false);
              }
            })();
          },
        },
      ],
    );
  };

  const handleReactivateSubscription = async () => {
    try {
      setIsLoading(true);
      if (subscription?.id !== undefined && subscription.id !== '') {
        await fetch(`${String(process.env['EXPO_PUBLIC_API_BASE_URL'])}/subscriptions/reactivate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscriptionId: subscription.id }),
        });
        Alert.alert(
          'Subscription Reactivated',
          'Your subscription has been successfully reactivated.',
        );
        // Refresh data to show updated status
        void fetchSubscriptionData();
      }
    } catch (err) {
      logger.error('Failed to reactivate subscription:', { error: err });
      Alert.alert('Error', 'Failed to reactivate your subscription. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePaymentMethod = async () => {
    try {
      setIsLoading(true);

      // Create checkout session for updating payment method
      const session = await createCheckoutSession<{ url: string }>({
        priceId:
          subscription?.plan.id !== undefined && subscription.plan.id !== ''
            ? subscription.plan.id
            : '',
        successUrl: 'pawfectmatch://subscription/update-success',
        cancelUrl: 'pawfectmatch://subscription/update-cancel',
        metadata: {
          action: 'update_payment',
          subscriptionId: subscription?.id !== undefined ? subscription.id : undefined,
        },
      });

      // Open Stripe checkout in browser
      if (session.url !== '') {
        await Linking.openURL(session.url);
      }
    } catch (err) {
      logger.error('Failed to update payment method:', { error: err });
      Alert.alert('Error', 'Failed to update payment method. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Format date string
  const formatDate = (dateString?: string): string => {
    if (dateString === undefined || dateString === '') return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get status badge color using theme colors
  const getStatusColor = (status?: Subscription['status']): { bg: string; text: string } => {
    switch (status) {
      case 'active':
        return { bg: theme.colors.success + '20', text: theme.colors.success };
      case 'canceled':
        return { bg: theme.colors.danger + '20', text: theme.colors.danger };
      case 'past_due':
        return { bg: theme.colors.warning + '20', text: theme.colors.warning };
      case 'trialing':
        return { bg: theme.colors.info + '20', text: theme.colors.info };
      default:
        return { bg: theme.colors.border, text: theme.colors.onMuted };
    }
  };

  // Get gradient colors from theme palette
  const gradientColors = useMemo(() => {
    return (
      (theme as any).palette?.gradients?.primary ?? [theme.colors.primary, theme.colors.primary]
    );
  }, [theme]);

  if (isLoading && !isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
        <Text style={styles.loadingText}>Loading subscription details...</Text>
      </View>
    );
  }

  const statusColors = getStatusColor(subscription?.status);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
        />
      }
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Subscription Details</Text>
      </LinearGradient>

      {error !== null && error !== '' ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={24}
            color={theme.colors.danger}
          />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            testID="SubscriptionManagerScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => void fetchSubscriptionData()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : subscription === null ? (
        <View style={styles.noSubscriptionContainer}>
          <Ionicons
            name="information-circle-outline"
            size={64}
            color={theme.colors.primary}
          />
          <Text style={styles.noSubscriptionTitle}>No Active Subscription</Text>
          <Text style={styles.noSubscriptionText}>
            You don&apos;t have an active subscription. Upgrade to Premium to unlock exclusive
            features!
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            testID="SubscriptionManagerScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              navigation.navigate('Premium');
            }}
          >
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Subscription Details Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Current Plan</Text>
              <View
                style={StyleSheet.flatten([
                  styles.statusBadge,
                  { backgroundColor: statusColors.bg },
                ])}
              >
                <Text style={StyleSheet.flatten([styles.statusText, { color: statusColors.text }])}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
            </View>

            <View style={styles.planDetails}>
              <Text style={styles.planName}>{subscription.plan.name}</Text>
              <Text style={styles.planPrice}>
                ${subscription.plan.amount / 100} / {subscription.plan.interval}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Current Period</Text>
              <Text style={styles.detailValue}>
                {formatDate(subscription.currentPeriodStart)} to{' '}
                {formatDate(subscription.currentPeriodEnd)}
              </Text>
            </View>

            {subscription.cancelAtPeriodEnd ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cancellation</Text>
                <Text style={styles.detailValueHighlight}>
                  Ends on {formatDate(subscription.currentPeriodEnd)}
                </Text>
              </View>
            ) : null}

            {subscription.trialEnd !== undefined ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Trial Ends</Text>
                <Text style={styles.detailValueHighlight}>{formatDate(subscription.trialEnd)}</Text>
              </View>
            ) : null}
          </View>

          {/* Usage Stats Card */}
          {usageStats !== null ? (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Usage</Text>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Swipes</Text>
                <View style={styles.usageBar}>
                  <View
                    style={StyleSheet.flatten([
                      styles.usageProgress,
                      {
                        width: `${Math.round((usageStats.swipesRemaining / usageStats.totalSwipes) * 100)}%`,
                        backgroundColor: theme.colors.primary,
                      },
                    ])}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.swipesRemaining} / {usageStats.totalSwipes} remaining
                </Text>
              </View>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Super Likes</Text>
                <View style={styles.usageBar}>
                  <View
                    style={StyleSheet.flatten([
                      styles.usageProgress,
                      {
                        width: `${Math.round((usageStats.superLikesRemaining / usageStats.totalSuperLikes) * 100)}%`,
                        backgroundColor: theme.colors.info,
                      },
                    ])}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.superLikesRemaining} / {usageStats.totalSuperLikes} remaining
                </Text>
              </View>

              <View style={styles.usageItem}>
                <Text style={styles.usageLabel}>Boosts</Text>
                <View style={styles.usageBar}>
                  <View
                    style={StyleSheet.flatten([
                      styles.usageProgress,
                      {
                        width: `${Math.round((usageStats.boostsRemaining / usageStats.totalBoosts) * 100)}%`,
                        backgroundColor: theme.colors.warning,
                      },
                    ])}
                  />
                </View>
                <Text style={styles.usageText}>
                  {usageStats.boostsRemaining} / {usageStats.totalBoosts} remaining
                </Text>
              </View>

              <Text style={styles.usageResetText}>
                Resets on {formatDate(usageStats.resetDate)}
              </Text>
            </View>
          ) : null}

          {/* Actions Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Manage Subscription</Text>

            {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <TouchableOpacity
                style={styles.actionButton}
                testID="SubscriptionManagerScreen-button-2"
                accessibilityLabel="Interactive element"
                accessibilityRole="button"
                onPress={() => {
                  handleCancelSubscription();
                }}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={24}
                  color={theme.colors.danger}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.actionButtonText,
                    { color: theme.colors.danger },
                  ])}
                >
                  Cancel Subscription
                </Text>
              </TouchableOpacity>
            )}

            {subscription.status === 'canceled' || subscription.cancelAtPeriodEnd ? (
              <TouchableOpacity
                style={StyleSheet.flatten([styles.actionButton, styles.reactivateButton])}
                testID="SubscriptionManagerScreen-button-2"
                accessibilityLabel="Interactive element"
                accessibilityRole="button"
                onPress={() => void handleReactivateSubscription()}
              >
                <Ionicons
                  name="refresh-outline"
                  size={24}
                  color={theme.colors.onPrimary}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.actionButtonText,
                    { color: theme.colors.onPrimary },
                  ])}
                >
                  Reactivate Subscription
                </Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={styles.actionButton}
              testID="SubscriptionManagerScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => void handleUpdatePaymentMethod()}
            >
              <Ionicons
                name="card-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ])}
              >
                Update Payment Method
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              testID="SubscriptionManagerScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                navigation.navigate('Premium');
              }}
            >
              <Ionicons
                name="pricetag-outline"
                size={24}
                color={theme.colors.primary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.actionButtonText,
                  { color: theme.colors.primary },
                ])}
              >
                Change Plan
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default SubscriptionManagerScreen;
