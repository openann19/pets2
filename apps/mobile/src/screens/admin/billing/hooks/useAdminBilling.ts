import { logger, useAuthStore } from '@pawfectmatch/core';
import { useEffect, useState } from 'react';

import { _adminAPI as adminAPI } from '../../../../services/api';

export interface Subscription {
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

export interface BillingMetrics {
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

export const useAdminBilling = () => {
  const { user: _user } = useAuthStore();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState<Subscription[]>([]);
  const [metrics, setMetrics] = useState<BillingMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<
    'all' | 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete'
  >('all');
  const [selectedPlan, setSelectedPlan] = useState<'all' | 'basic' | 'premium' | 'ultimate'>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    void loadBillingData();
  }, []);

  useEffect(() => {
    filterSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subscriptions, selectedStatus, selectedPlan]);

  const loadBillingData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [subscriptionsResponse, metricsResponse] = await Promise.all([
        adminAPI.getSubscriptions({
          page: 1,
          limit: 100,
          sort: 'createdAt',
          order: 'desc',
        }),
        adminAPI.getBillingMetrics(),
      ]);

      setSubscriptions(subscriptionsResponse.data.subscriptions as Subscription[]);
      setMetrics(metricsResponse.data as BillingMetrics);
    } catch (error: unknown) {
      logger.error('Error loading billing data:', { error });
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

    if (selectedStatus !== 'all') {
      filtered = filtered.filter((sub) => sub.status === selectedStatus);
    }

    if (selectedPlan !== 'all') {
      filtered = filtered.filter((sub) => sub.planId === selectedPlan);
    }

    setFilteredSubscriptions(filtered);
  };

  const handleCancelSubscription = async (subscriptionId: string): Promise<void> => {
    try {
      setActionLoading(subscriptionId);
      await adminAPI.cancelSubscription({ userId: subscriptionId });
      await loadBillingData();
    } catch (error: unknown) {
      logger.error('Error canceling subscription:', { error });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReactivateSubscription = async (subscriptionId: string): Promise<void> => {
    try {
      setActionLoading(subscriptionId);
      await adminAPI.reactivateSubscription({ userId: subscriptionId });
      await loadBillingData();
    } catch (error: unknown) {
      logger.error('Error reactivating subscription:', { error });
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefundPayment = async (subscriptionId: string, paymentId: string): Promise<void> => {
    try {
      setActionLoading(paymentId);
      // TODO: Implement refundPayment API
      // await adminAPI.refundPayment(paymentId);
      logger.info('Refund payment not yet implemented:', { paymentId });
      await loadBillingData();
    } catch (error: unknown) {
      logger.error('Error refunding payment:', { error });
    } finally {
      setActionLoading(null);
    }
  };

  return {
    subscriptions: filteredSubscriptions,
    metrics,
    loading,
    refreshing,
    selectedStatus,
    selectedPlan,
    actionLoading,
    onRefresh,
    handleStatusFilter: setSelectedStatus,
    handlePlanFilter: setSelectedPlan,
    handleCancelSubscription,
    handleReactivateSubscription,
    handleRefundPayment,
  };
};
