import { Ionicons } from '@expo/vector-icons';
import { logger } from '@pawfectmatch/core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import type { RootStackParamList } from '../navigation/types';
import { _subscriptionAPI as premiumAPI } from '../services/api';

type ManageSubscriptionScreenProps = NativeStackScreenProps<RootStackParamList, 'ManageSubscription'>;

interface SubscriptionData {
  id?: string;
  status?: 'active' | 'inactive' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete';
  plan?: string | {
    name?: string;
    duration?: string;
    price?: string;
  };
  nextBillingDate?: string;
}

const ManageSubscriptionScreen = ({ navigation }: ManageSubscriptionScreenProps): React.JSX.Element => {
  const { colors } = useTheme();
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
        setSubscription({
          id: data.id,
          status: data.status,
          plan: typeof data.plan === 'string' ? { name: data.plan } : data.plan as any,
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
                  'Authorization': `Bearer ${await AsyncStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                  subscriptionId: subscription?.id
                })
              });

              if (response.ok) {
                Alert.alert('Success', 'Your subscription has been canceled. You will retain access until the end of your current billing period.');
                navigation.goBack();
              } else {
                throw new Error('Failed to cancel subscription');
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again or contact support.');
              logger.error('Cancel subscription error:', { error });
            }
          }
        },
      ]
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading subscription...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Manage Subscription</Text>
          <View style={{ width: 24 }} /> {/* Spacer for alignment */}
        </View>

        {/* Subscription Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Plan</Text>

          <View style={styles.planInfo}>
            <Ionicons name="star" size={30} color={colors.primary} />
            <View style={styles.planDetails}>
              <Text style={[styles.planName, { color: colors.text }]}>
                {typeof subscription?.plan === 'object' ? subscription.plan.name : subscription?.plan || 'Free Plan'}
              </Text>
              <Text style={[styles.planStatus, { color: subscription?.status === 'active' ? colors.success : colors.error }]}>
                {subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </Text>
            </View>
          </View>

          {subscription?.status === 'active' && (
            <>
              <View style={styles.billingInfo}>
                <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>
                  Billing Period:
                </Text>
                <Text style={[styles.billingValue, { color: colors.text }]}>
                  {typeof subscription?.plan === 'object' ? subscription.plan.duration : 'monthly'}
                </Text>
              </View>

              <View style={styles.billingInfo}>
                <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>
                  Next Billing Date:
                </Text>
                <Text style={[styles.billingValue, { color: colors.text }]}>
                  {subscription?.nextBillingDate || 'N/A'}
                </Text>
              </View>

              <View style={styles.billingInfo}>
                <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>
                  Amount:
                </Text>
                <Text style={[styles.billingValue, { color: colors.text }]}>
                  ${typeof subscription?.plan === 'object' ? subscription.plan.price : '0.00'}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Actions</Text>

          {subscription?.status === 'active' ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.cancelButton]}
              onPress={handleCancelSubscription}
            >
              <Text style={[styles.actionButtonText, { color: colors.error }]}>
                Cancel Subscription
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Premium')}
            >
              <Text style={styles.actionButtonText}>
                Upgrade to Premium
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.restoreButton]}
            onPress={handleRestorePurchases}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>

        {/* Plan Features */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Premium Features</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Unlimited swipes
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                See who liked you
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Priority matching
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Advanced filters
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                AI bio generation
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Photo analysis
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.featureText, { color: colors.text }]}>
                Compatibility insights
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  section: {
    margin: 20,
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
  },
  planInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  planDetails: {
    marginLeft: 15,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 5,
  },
  planStatus: {
    fontSize: 16,
    fontWeight: '600',
  },
  billingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  billingLabel: {
    fontSize: 16,
  },
  billingValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,0,0,0.1)',
    borderColor: 'rgba(255,0,0,0.3)',
  },
  restoreButton: {
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  featuresList: {
    gap: 15,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureText: {
    fontSize: 16,
  },
});

export default ManageSubscriptionScreen;
