/**
 * Admin Billing Screen for Mobile
 * Comprehensive billing management and subscription analytics
 */

import { Ionicons } from '@expo/vector-icons';
import { logger, useAuthStore } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../contexts/ThemeContext';
import type { AdminScreenProps } from '../../navigation/types';
import { _adminAPI as adminAPI } from '../../services/api';
;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface Subscription {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  createdAt: string;
  updatedAt: string;
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
  activeSubscriptions: number;
  canceledSubscriptions: number;
  trialSubscriptions: number;
  pastDueSubscriptions: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  revenueGrowth: number;
  subscriptionGrowth: number;
}

export default function AdminBillingScreen({ navigation }: AdminScreenProps<'AdminBilling'>): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'>('all');
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'basic' | 'premium' | 'ultimate'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    void loadBillingData();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, selectedStatus, selectedPlan]);

  const loadBillingData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [subscriptionsResponse, metricsResponse] = await Promise.all([
        adminAPI.getSubscriptions({
          page: 1,
          limit: 100,
          sort: 'createdAt',
          order: 'desc'
        }),
        adminAPI.getBillingMetrics()
      ]);

      setSubscriptions(subscriptionsResponse.data.subscriptions);
      setMetrics(metricsResponse.data);
    } catch (error: unknown) {
      logger.error('Error loading billing data:', { error });
      Alert.alert('Error', 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadBillingData();
    setRefreshing(false);
  };

  const filterSubscriptions = (): void => {
    let filtered = subscriptions;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sub => sub.status === selectedStatus);
    }

    // Filter by plan
    if (selectedPlan !== 'all') {
      filtered = filtered.filter(sub => sub.planId === selectedPlan);
    }

    setFilteredSubscriptions(filtered);
  };

  const handleCancelSubscription = async (subscriptionId: string): Promise<void> => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel this subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              setActionLoading(subscriptionId);
              const response = await adminAPI.cancelSubscription(subscriptionId);

              if (response.success) {
                setSubscriptions(prevSubs =>
                  prevSubs.map(sub =>
                    sub.id === subscriptionId
                      ? { ...sub, cancelAtPeriodEnd: true }
                      : sub
                  )
                );

                Alert.alert('Success', 'Subscription canceled successfully');
              }
            } catch (error) {
              logger.error('Error canceling subscription:', { error });
              Alert.alert('Error', 'Failed to cancel subscription');
            } finally {
              setActionLoading(null);
            }
          }
        }
      ]
    );
  };

  const handleReactivateSubscription = async (subscriptionId: string) => {
    try {
      setActionLoading(subscriptionId);
      const response = await adminAPI.reactivateSubscription(subscriptionId);

      if (response.success) {
        setSubscriptions(prevSubs =>
          prevSubs.map(sub =>
            sub.id === subscriptionId
              ? { ...sub, cancelAtPeriodEnd: false }
              : sub
          )
        );

        Alert.alert('Success', 'Subscription reactivated successfully');
      }
    } catch (error) {
      logger.error('Error reactivating subscription:', { error });
      Alert.alert('Error', 'Failed to reactivate subscription');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10B981';
      case 'canceled': return '#6B7280';
      case 'past_due': return '#F59E0B';
      case 'trialing': return '#3B82F6';
      case 'incomplete': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return 'checkmark-circle';
      case 'canceled': return 'close-circle';
      case 'past_due': return 'warning';
      case 'trialing': return 'time';
      case 'incomplete': return 'alert-circle';
      default: return 'help-circle';
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basic': return '#6B7280';
      case 'premium': return '#3B82F6';
      case 'ultimate': return '#8B5CF6';
      default: return '#6B7280';
    }
  };

  const formatCurrency = (amount: number, currency = 'USD') =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100) // Assuming amount is in cents
    ;

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const renderSubscriptionItem = ({ item }: { item: Subscription }) => {
    const isActionLoading = actionLoading === item.id;

    return (
      <View style={[styles.subscriptionCard, { backgroundColor: colors.card }]}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <View style={styles.userAvatar}>
              <Text style={[styles.userAvatarText, { color: colors.text }]}>
                {item.userName.split(' ').map(n => n[0]).join('')}
              </Text>
            </View>
            <View style={styles.subscriptionDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {item.userName}
              </Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
                {item.userEmail}
              </Text>
              <View style={styles.subscriptionMeta}>
                <View style={[
                  styles.planBadge,
                  { backgroundColor: getPlanColor(item.planId) }
                ]}>
                  <Text style={styles.planText}>
                    {item.planName}
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(item.status) }
                ]}>
                  <Ionicons
                    name={getStatusIcon(item.status)}
                    size={12}
                    color="#FFFFFF"
                  />
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.subscriptionActions}>
            {item.cancelAtPeriodEnd ? (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#10B981' }]}
                onPress={() => handleReactivateSubscription(item.id)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#F59E0B' }]}
                onPress={() => handleCancelSubscription(item.id)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="pause" size={16} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.subscriptionStats}>
          <View style={styles.statItem}>
            <Ionicons name="cash" size={16} color="#10B981" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              {formatCurrency(item.amount, item.currency)}/{item.interval}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="calendar" size={16} color="#3B82F6" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Next: {formatDate(item.currentPeriodEnd)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time" size={16} color="#6B7280" />
            <Text style={[styles.statText, { color: colors.textSecondary }]}>
              Created: {formatDate(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading billing data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => { navigation.goBack(); }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>
          Billing Management
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Billing Metrics */}
      {metrics ? <View style={styles.metricsContainer}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Revenue Overview
        </Text>
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="cash" size={20} color="#10B981" />
              <Text style={[styles.metricTitle, { color: colors.text }]}>Total Revenue</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(metrics.totalRevenue)}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="trending-up" size={20} color="#3B82F6" />
              <Text style={[styles.metricTitle, { color: colors.text }]}>MRR</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(metrics.monthlyRecurringRevenue)}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="people" size={20} color="#8B5CF6" />
              <Text style={[styles.metricTitle, { color: colors.text }]}>ARPU</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {formatCurrency(metrics.averageRevenuePerUser)}
            </Text>
          </View>

          <View style={[styles.metricCard, { backgroundColor: colors.card }]}>
            <View style={styles.metricHeader}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={[styles.metricTitle, { color: colors.text }]}>Active Subs</Text>
            </View>
            <Text style={[styles.metricValue, { color: colors.text }]}>
              {metrics.activeSubscriptions}
            </Text>
          </View>
        </View>

        <View style={styles.secondaryMetrics}>
          <View style={[styles.secondaryMetricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.secondaryMetricLabel, { color: colors.textSecondary }]}>Conversion Rate</Text>
            <Text style={[styles.secondaryMetricValue, { color: colors.text }]}>
              {metrics.conversionRate.toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.secondaryMetricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.secondaryMetricLabel, { color: colors.textSecondary }]}>Churn Rate</Text>
            <Text style={[styles.secondaryMetricValue, { color: '#EF4444' }]}>
              {metrics.churnRate.toFixed(1)}%
            </Text>
          </View>
          <View style={[styles.secondaryMetricCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.secondaryMetricLabel, { color: colors.textSecondary }]}>Revenue Growth</Text>
            <Text style={[styles.secondaryMetricValue, { color: metrics.revenueGrowth > 0 ? '#10B981' : '#EF4444' }]}>
              {metrics.revenueGrowth > 0 ? '+' : ''}{metrics.revenueGrowth.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View> : null}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Status:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'active', 'canceled', 'past_due', 'trialing', 'incomplete'] as const).map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedStatus === status && styles.filterButtonActive,
                  {
                    backgroundColor: selectedStatus === status ? colors.primary : colors.card
                  }
                ]}
                onPress={() => { setSelectedStatus(status); }}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedStatus === status ? '#FFFFFF' : colors.text }
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={[styles.filterLabel, { color: colors.text }]}>Plan:</Text>
          <View style={styles.filterButtons}>
            {(['all', 'basic', 'premium', 'ultimate'] as const).map((plan) => (
              <TouchableOpacity
                key={plan}
                style={[
                  styles.filterButton,
                  selectedPlan === plan && styles.filterButtonActive,
                  {
                    backgroundColor: selectedPlan === plan ? colors.primary : colors.card
                  }
                ]}
                onPress={() => { setSelectedPlan(plan); }}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedPlan === plan ? '#FFFFFF' : colors.text }
                ]}>
                  {plan.charAt(0).toUpperCase() + plan.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Subscriptions List */}
      <FlatList
        data={filteredSubscriptions}
        renderItem={renderSubscriptionItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  secondaryMetrics: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryMetricCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  secondaryMetricLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  secondaryMetricValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 60,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonActive: {
    // Active state handled by backgroundColor
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  subscriptionCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subscriptionDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 4,
  },
  subscriptionMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  planBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  planText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  subscriptionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscriptionStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
