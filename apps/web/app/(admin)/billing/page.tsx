'use client';

import {
  EnhancedButton,
  EnhancedCard,
  EnhancedDropdown,
  EnhancedInput,
  LoadingSkeleton,
} from '@/components/admin/UIEnhancements';
import { Icon } from '@/components/UI/icon-helper';
import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  ChartBarIcon,
  CheckCircleIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  EyeIcon,
  PlusIcon,
  ReceiptPercentIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@pawfectmatch/core';
import { useCallback, useEffect, useState, type ComponentType } from 'react';

interface Customer {
  id: string;
  name: string;
  email: string;
  subscriptionTier: 'basic' | 'premium' | 'gold';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'trialing';
  monthlyRevenue: number;
  totalRevenue: number;
  joinDate: string;
  lastPayment: string;
  nextBilling: string;
  paymentMethod: string;
  lifetimeValue: number;
  churnRisk: 'low' | 'medium' | 'high';
}

interface BillingMetrics {
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  annualRecurringRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  averageRevenuePerUser: number;
  conversionRate: number;
  revenueGrowth: number;
  customerGrowth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  churnedCustomersThisMonth: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  customers: number;
  newCustomers: number;
  churnedCustomers: number;
}

interface PaymentMethod {
  id: string;
  customerId: string;
  customerName: string;
  type: 'card' | 'bank_account' | 'paypal';
  last4: string;
  brand?: string;
  expMonth?: number;
  expYear?: number;
  isDefault: boolean;
  status: 'active' | 'expired' | 'failed';
}

type TabId = 'overview' | 'customers' | 'revenue' | 'payments';

export default function BillingDashboardPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [billingMetrics, setBillingMetrics] = useState<BillingMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setSelectedCustomer] = useState<Customer | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTier, setFilterTier] = useState<'all' | 'basic' | 'premium' | 'gold'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'canceled' | 'past_due'>(
    'all',
  );
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const loadBillingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [customersRes, metricsRes, revenueRes, paymentsRes] = await Promise.all([
        fetch(`/api/admin/billing/customers?dateRange=${dateRange}`),
        fetch('/api/admin/billing/metrics'),
        fetch(`/api/admin/billing/revenue?dateRange=${dateRange}`),
        fetch('/api/admin/billing/payment-methods'),
      ]);

      if (customersRes.ok) {
        const customers = await customersRes.json();
        setCustomers(customers);
      }

      if (metricsRes.ok) {
        const metrics = await metricsRes.json();
        setBillingMetrics(metrics);
      }

      if (revenueRes.ok) {
        const revenue = await revenueRes.json();
        setRevenueData(revenue);
      }

      if (paymentsRes.ok) {
        const payments = await paymentsRes.json();
        setPaymentMethods(payments);
      }
    } catch (error) {
      logger.error('Failed to load billing data:', { error });
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, setCustomers, setBillingMetrics, setRevenueData, setPaymentMethods, setIsLoading]);

  // Load billing data
  useEffect(() => {
    loadBillingData();
  }, [loadBillingData]);

  const exportCustomers = async () => {
    try {
      const response = await fetch('/api/admin/billing/customers/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format: 'csv' }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      logger.error('Failed to export customers:', { error });
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

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
      case 'premium':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/20';
      case 'gold':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const getChurnRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/20';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'high':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/20';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTier = filterTier === 'all' || customer.subscriptionTier === filterTier;
    const matchesStatus = filterStatus === 'all' || customer.subscriptionStatus === filterStatus;

    return matchesSearch && matchesTier && matchesStatus;
  });

  const tabs: ReadonlyArray<{ id: TabId; label: string; icon: ComponentType<{ className?: string }> }> = [
    { id: 'overview', label: 'Overview', icon: ({ className }) => <Icon icon={ChartBarIcon} className={className} /> },
    { id: 'customers', label: 'Customers', icon: ({ className }) => <Icon icon={UserGroupIcon} className={className} /> },
    { id: 'revenue', label: 'Revenue', icon: ({ className }) => <Icon icon={CurrencyDollarIcon} className={className} /> },
    { id: 'payments', label: 'Payment Methods', icon: ({ className }) => <Icon icon={CreditCardIcon} className={className} /> },
  ] as const;

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Billing Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive billing management for all customers
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <EnhancedDropdown
            label="Date range"
            options={[
              { value: '7d', label: 'Last 7 days' },
              { value: '30d', label: 'Last 30 days' },
              { value: '90d', label: 'Last 90 days' },
              { value: '1y', label: 'Last year' },
            ]}
            value={dateRange}
            onChange={(v: string | number) => setDateRange(v as '7d' | '30d' | '90d' | '1y')}
          />
          <EnhancedButton
            onClick={exportCustomers}
            variant="secondary"
            icon={<ArrowDownTrayIcon className="h-5 w-5" />}
            ariaLabel="Export customers"
          >
            Export
          </EnhancedButton>
          <EnhancedButton
            onClick={loadBillingData}
            variant="primary"
            icon={<ArrowPathIcon className="h-5 w-5" />}
            ariaLabel="Refresh billing data"
          >
            Refresh
          </EnhancedButton>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab: (typeof tabs)[number]) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
            >
              <Icon icon={tab.icon} className="h-5 w-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && billingMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(billingMetrics.totalRevenue)}
                </p>
                <div className="flex items-center mt-1">
                  {billingMetrics.revenueGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ml-1 ${billingMetrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {Math.abs(billingMetrics.revenueGrowth).toFixed(1)}%
                  </span>
                </div>
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  ARR: {formatCurrency(billingMetrics.annualRecurringRevenue)}
                </p>
              </div>
              <ReceiptPercentIcon className="h-8 w-8 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(billingMetrics.totalCustomers)}
                </p>
                <div className="flex items-center mt-1">
                  {billingMetrics.customerGrowth >= 0 ? (
                    <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span
                    className={`text-sm ml-1 ${billingMetrics.customerGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {Math.abs(billingMetrics.customerGrowth).toFixed(1)}%
                  </span>
                </div>
              </div>
              <UserGroupIcon className="h-8 w-8 text-purple-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Subscriptions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(billingMetrics.activeSubscriptions)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Churn: {billingMetrics.churnRate.toFixed(1)}%
                </p>
              </div>
              <ChartBarIcon className="h-8 w-8 text-indigo-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Average Revenue Per User
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(billingMetrics.averageRevenuePerUser)}
                </p>
              </div>
              <BanknotesIcon className="h-8 w-8 text-yellow-500" />
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
              <ArrowTrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  New Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(billingMetrics.newCustomersThisMonth)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
              </div>
              <PlusIcon className="h-8 w-8 text-blue-500" />
            </div>
          </EnhancedCard>

          <EnhancedCard className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Churned Customers
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatNumber(billingMetrics.churnedCustomersThisMonth)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This month</p>
              </div>
              <ArrowTrendingDownIcon className="h-8 w-8 text-red-500" />
            </div>
          </EnhancedCard>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Customer Management
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage all customer subscriptions and billing information
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <EnhancedInput
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(v: string | number) => setSearchTerm(v)}
                  ariaLabel="Search customers"
                />
                <EnhancedDropdown
                  label="Tier"
                  options={[
                    { value: 'all', label: 'All Tiers' },
                    { value: 'basic', label: 'Basic' },
                    { value: 'premium', label: 'Premium' },
                    { value: 'gold', label: 'Gold' },
                  ]}
                  value={filterTier}
                  onChange={(v: string | number) => setFilterTier(v as 'all' | 'basic' | 'premium' | 'gold')}
                />
                <EnhancedDropdown
                  label="Status"
                  options={[
                    { value: 'all', label: 'All Status' },
                    { value: 'active', label: 'Active' },
                    { value: 'canceled', label: 'Canceled' },
                    { value: 'past_due', label: 'Past Due' },
                  ]}
                  value={filterStatus}
                  onChange={(v: string | number) => setFilterStatus(v as 'all' | 'active' | 'canceled' | 'past_due')}
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Monthly Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    LTV
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Churn Risk
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
                {filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTierColor(customer.subscriptionTier)}`}
                      >
                        {customer.subscriptionTier}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(customer.subscriptionStatus)}`}
                      >
                        {customer.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(customer.monthlyRevenue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatCurrency(customer.lifetimeValue)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getChurnRiskColor(customer.churnRisk)}`}
                      >
                        {customer.churnRisk}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {formatDate(customer.nextBilling)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <EnhancedButton
                        onClick={() => setSelectedCustomer(customer)}
                        variant="secondary"
                        size="sm"
                        icon={<EyeIcon className="h-4 w-4" />}
                        ariaLabel="View customer details"
                      >
                        View
                      </EnhancedButton>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Revenue Analytics
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Track revenue trends and performance metrics
            </p>
          </div>

          <div className="space-y-6">
            {revenueData.map((data, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {data.month}
                  </h4>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(data.revenue)}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Customers</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {formatNumber(data.customers)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">New Customers</p>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      +{formatNumber(data.newCustomers)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-600 dark:text-gray-400">Churned Customers</p>
                    <p className="text-lg font-semibold text-red-600 dark:text-red-400">
                      -{formatNumber(data.churnedCustomers)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </EnhancedCard>
      )}

      {/* Payment Methods Tab */}
      {activeTab === 'payments' && (
        <EnhancedCard className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Payment Methods
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Monitor customer payment methods and status
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
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Default
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {paymentMethods.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {payment.customerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                        {payment.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {payment.type === 'card' ? (
                          <>
                            {payment.brand} •••• {payment.last4}
                            {payment.expMonth && payment.expYear && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                Expires {payment.expMonth}/{payment.expYear}
                              </div>
                            )}
                          </>
                        ) : (
                          `•••• ${payment.last4}`
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${payment.status === 'active'
                          ? 'text-green-800 bg-green-100 dark:text-green-400 dark:bg-green-900/20'
                          : payment.status === 'expired'
                            ? 'text-yellow-800 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/20'
                            : 'text-red-800 bg-red-100 dark:text-red-400 dark:bg-red-900/20'
                          }`}
                      >
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payment.isDefault ? (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <div className="h-5 w-5" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnhancedCard>
      )}
    </div>
  );
}
