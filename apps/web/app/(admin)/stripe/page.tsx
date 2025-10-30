'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedInput,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import {
  ArrowPathIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  PencilIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';

interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  isLiveMode: boolean;
  isConfigured: boolean;
}

interface Subscription {
  id: string;
  customerId: string;
  customerEmail: string;
  customerName: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  createdAt: string;
}

interface PaymentMethod {
  id: string;
  customerId: string;
  type: 'card' | 'bank_account';
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  bankAccount?: {
    bankName: string;
    last4: string;
    routingNumber: string;
  };
  isDefault: boolean;
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
}

export default function StripeManagementPage() {
  const [stripeConfig, setStripeConfig] = useState<StripeConfig>({
    secretKey: '',
    publishableKey: '',
    webhookSecret: '',
    isLiveMode: false,
    isConfigured: false,
  });

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [_paymentMethods, _setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingMetrics, setBillingMetrics] = useState<BillingMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [_selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'subscriptions' | 'payments' | 'config'>(
    'overview',
  );

  // Load Stripe configuration
  useEffect(() => {
    loadStripeConfig();
    loadBillingData();
  }, []);

  const loadStripeConfig = async () => {
    try {
      const response = await fetch('/api/admin/stripe/config');
      if (response.ok) {
        const config = await response.json();
        setStripeConfig(config);
      }
    } catch (error) {
      console.error('Failed to load Stripe config:', error);
    }
  };

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      const [subscriptionsRes, metricsRes] = await Promise.all([
        fetch('/api/admin/stripe/subscriptions'),
        fetch('/api/admin/stripe/metrics'),
      ]);

      if (subscriptionsRes.ok) {
        const subs = await subscriptionsRes.json();
        setSubscriptions(subs);
      }

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setBillingMetrics(metrics);
      }
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveStripeConfig = async () => {
    setIsConfiguring(true);
    try {
      const response = await fetch('/api/admin/stripe/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stripeConfig),
      });

      if (response.ok) {
        const result = await response.json();
        setStripeConfig(result);
        setShowConfigModal(false);
        await loadBillingData();
      }
    } catch (error) {
      console.error('Failed to save Stripe config:', error);
    } finally {
      setIsConfiguring(false);
    }
  };

  const cancelSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/admin/stripe/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadBillingData();
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  const reactivateSubscription = async (subscriptionId: string) => {
    try {
      const response = await fetch(`/api/admin/stripe/subscriptions/${subscriptionId}/reactivate`, {
        method: 'POST',
      });

      if (response.ok) {
        await loadBillingData();
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'canceled':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'trialing':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'usd') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <LoadingSkeleton
          variant="card"
          count={3}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Stripe Payment Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage payments, subscriptions, and billing for all customers
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <EnhancedButton
            onClick={() => setShowConfigModal(true)}
            variant="secondary"
            icon={<PencilIcon className="h-5 w-5" />}
            ariaLabel="Configure Stripe settings"
          >
            Configure Stripe
          </EnhancedButton>
          <EnhancedButton
            onClick={loadBillingData}
            variant="primary"
            icon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Refresh billing data"
          >
            Refresh Data
          </EnhancedButton>
        </div>
      </div>

      {/* Configuration Status */}
      <EnhancedCard className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCardIcon className="h-8 w-8 text-blue-500" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Stripe Configuration
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {stripeConfig.isConfigured ? 'Configured and Active' : 'Not Configured'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {stripeConfig.isConfigured ? (
              <CheckCircleIcon className="h-6 w-6 text-green-500" />
            ) : (
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
            )}
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${stripeConfig.isConfigured
                ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                : 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                }`}
            >
              {stripeConfig.isConfigured ? 'Active' : 'Setup Required'}
            </span>
          </div>
        </div>
      </EnhancedCard>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: ChartBarIcon },
            { id: 'subscriptions', label: 'Subscriptions', icon: UserGroupIcon },
            { id: 'payments', label: 'Payment Methods', icon: CreditCardIcon },
            { id: 'config', label: 'Configuration', icon: PencilIcon },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <tab.icon className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && billingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(billingMetrics.totalRevenue)}
                </p>
              </div>
              <CurrencyDollarIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Monthly Recurring Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(billingMetrics.monthlyRecurringRevenue)}
                </p>
              </div>
              <ReceiptPercentIcon className="h-8 w-8 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {billingMetrics.activeSubscriptions}
                </p>
              </div>
              <UserGroupIcon className="h-8 w-8 text-purple-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Churn Rate</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {billingMetrics.churnRate.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-red-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">ARPU</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(billingMetrics.averageRevenuePerUser)}
                </p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-indigo-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Conversion Rate
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {billingMetrics.conversionRate.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Customer Subscriptions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage all customer subscriptions and billing
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Next Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {subscriptions.map((subscription) => (
                  <tr
                    key={subscription.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {subscription.customerName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {subscription.customerEmail}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {subscription.planName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {subscription.interval}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(subscription.status)}`}
                      >
                        {subscription.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(subscription.amount, subscription.currency)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(subscription.currentPeriodEnd)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {subscription.status === 'active' ? (
                          <EnhancedButton
                            onClick={() => cancelSubscription(subscription.id)}
                            variant="secondary"
                            size="sm"
                            ariaLabel="Cancel subscription"
                          >
                            Cancel
                          </EnhancedButton>
                        ) : subscription.status === 'canceled' ? (
                          <EnhancedButton
                            onClick={() => reactivateSubscription(subscription.id)}
                            variant="primary"
                            size="sm"
                            ariaLabel="Reactivate subscription"
                          >
                            Reactivate
                          </EnhancedButton>
                        ) : null}
                        <EnhancedButton
                          onClick={() => setSelectedSubscription(subscription)}
                          variant="secondary"
                          size="sm"
                          icon={<EyeIcon className="h-4 w-4" />}
                          ariaLabel="View subscription details"
                        >
                          View
                        </EnhancedButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      )}

      {/* Configuration Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Configure Stripe API
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Secret Key
                  </label>
                  <EnhancedInput
                    type="password"
                    value={stripeConfig.secretKey}
                    onChange={(value: string) => setStripeConfig({ ...stripeConfig, secretKey: value })}
                    placeholder="sk_live_..."
                    ariaLabel="Stripe secret key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Publishable Key
                  </label>
                  <EnhancedInput
                    type="text"
                    value={stripeConfig.publishableKey}
                    onChange={(value: string) =>
                      setStripeConfig({ ...stripeConfig, publishableKey: value })
                    }
                    placeholder="pk_live_..."
                    ariaLabel="Stripe publishable key"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Webhook Secret
                  </label>
                  <EnhancedInput
                    type="password"
                    value={stripeConfig.webhookSecret}
                    onChange={(value: string) => setStripeConfig({ ...stripeConfig, webhookSecret: value })}
                    placeholder="whsec_..."
                    ariaLabel="Stripe webhook secret"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={stripeConfig.isLiveMode}
                    onChange={(e) =>
                      setStripeConfig({ ...stripeConfig, isLiveMode: e.target.checked })
                    }
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Live Mode (Production)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <EnhancedButton
                  onClick={() => setShowConfigModal(false)}
                  variant="secondary"
                  ariaLabel="Cancel configuration"
                >
                  Cancel
                </EnhancedButton>
                <EnhancedButton
                  onClick={saveStripeConfig}
                  variant="primary"
                  disabled={isConfiguring}
                  ariaLabel="Save Stripe configuration"
                >
                  {isConfiguring ? 'Saving...' : 'Save Configuration'}
                </EnhancedButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
