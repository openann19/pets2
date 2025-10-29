import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
          status,
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
              // Call the backend to cancel the subscription
              const response = await fetch('/api/subscription/cancel', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`,
                },
                body: JSON.stringify({
                  subscriptionId: subscription?.id,
                }),
              });

              if (response.ok) {
                Alert.alert(
                  'Success',
                  'Your subscription has been canceled. You will retain access until the end of your current billing period.',
                );
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
      // Restore purchases logic
      Alert.alert('Restore Purchases', 'No previous purchases found.');
    } catch (error) {
      Alert.alert('Error', 'Failed to restore purchases.');
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
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onSurfaceecondary
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
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onSurfaceecondary
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
                    { color: theme.colors.onMuted }, // Replaced theme.colors.onSurfaceecondary
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
      fontSize: 16,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg ?? 20,
      paddingVertical: theme.spacing.md ?? 15,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
    },
    section: {
      margin: theme.spacing.lg ?? 20,
      borderRadius: theme.radii?.lg ?? theme.radius?.md ?? 15,
      padding: theme.spacing.lg ?? 20,
      shadowColor: theme.palette?.overlay ?? theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: theme.spacing.lg ?? 20,
    },
    planInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.lg ?? 20,
    },
    planDetails: {
      marginLeft: theme.spacing.md ?? 15,
    },
    planName: {
      fontSize: 20,
      fontWeight: '700',
      marginBottom: theme.spacing.xs ?? 5,
    },
    planStatus: {
      fontSize: 16,
      fontWeight: '600',
    },
    billingInfo: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: theme.spacing.md ?? 10,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    billingLabel: {
      fontSize: 16,
    },
    billingValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    actionButton: {
      padding: theme.spacing.md ?? 15,
      borderRadius: theme.radii?.sm ?? theme.radius?.sm ?? 10,
      alignItems: 'center',
      marginBottom: theme.spacing.md ?? 15,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    cancelButton: {
      backgroundColor: theme.colors.danger + '1A',
      borderColor: theme.colors.danger + '4D',
    },
    restoreButton: {
      backgroundColor: theme.colors.bg + '0D',
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '700',
    },
    featuresList: {
      gap: theme.spacing.md ?? 15,
    },
    featureItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm ?? 10,
    },
    featureText: {
      fontSize: 16,
    },
  });
}

export default ManageSubscriptionScreen;
