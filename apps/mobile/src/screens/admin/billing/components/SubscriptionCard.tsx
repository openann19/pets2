/**
 * Subscription Card Component
 * Displays individual subscription information with actions
 */

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { Subscription } from '../hooks/useAdminBilling';

interface SubscriptionCardProps {
  subscription: Subscription;
  isActionLoading: boolean;
  onCancel: (subscriptionId: string) => void;
  onReactivate: (subscriptionId: string) => void;
}

const formatCurrency = (amount: number, currency: string = 'USD'): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount / 100);

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const getStatusColor = (status: string, theme: AppTheme): string => {
  switch (status) {
    case 'active':
      return theme.colors.success;
    case 'canceled':
      return theme.colors.border;
    case 'past_due':
      return theme.colors.warning;
    case 'trialing':
      return theme.colors.info;
    case 'incomplete':
      return theme.colors.danger;
    default:
      return theme.colors.border;
  }
};

const getStatusIcon = (status: string): string => {
  switch (status) {
    case 'active':
      return 'checkmark-circle';
    case 'canceled':
      return 'close-circle';
    case 'past_due':
      return 'warning';
    case 'trialing':
      return 'time';
    case 'incomplete':
      return 'alert-circle';
    default:
      return 'help-circle';
  }
};

const getPlanColor = (planId: string, theme: AppTheme): string => {
  switch (planId) {
    case 'basic':
      return theme.colors.border;
    case 'premium':
      return theme.colors.info;
    case 'ultimate':
      return theme.colors.primary;
    default:
      return theme.colors.border;
  }
};

export const SubscriptionCard = ({
  subscription,
  isActionLoading,
  onCancel,
  onReactivate,
}: SubscriptionCardProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.header}>
        <View style={styles.info}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, { color: theme.colors.onSurface }]}>
              {subscription.userName
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </Text>
          </View>
          <View style={styles.details}>
            <Text style={[styles.userName, { color: theme.colors.onSurface }]}>
              {subscription.userName}
            </Text>
            <Text style={[styles.userEmail, { color: theme.colors.onMuted }]}>
              {subscription.userEmail}
            </Text>
            <View style={styles.meta}>
              <View
                style={[
                  styles.planBadge,
                  { backgroundColor: getPlanColor(subscription.planId, theme) },
                ]}
              >
                <Text style={styles.planText}>{subscription.planName}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: getStatusColor(subscription.status, theme) },
                ]}
              >
                <Ionicons
                  name={getStatusIcon(subscription.status)}
                  size={12}
                  color={theme.colors.onSurface}
                />
                <Text style={styles.statusText}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          {subscription.cancelAtPeriodEnd ? (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              testID="SubscriptionCard-button-reactivate"
              accessibilityLabel="Reactivate subscription"
              accessibilityRole="button"
              onPress={() => onReactivate(subscription.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onSurface}
                />
              ) : (
                <Ionicons
                  name="play"
                  size={16}
                  color={theme.colors.onSurface}
                />
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
              testID="SubscriptionCard-button-cancel"
              accessibilityLabel="Cancel subscription"
              accessibilityRole="button"
              onPress={() => onCancel(subscription.id)}
              disabled={isActionLoading}
            >
              {isActionLoading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.colors.onSurface}
                />
              ) : (
                <Ionicons
                  name="pause"
                  size={16}
                  color={theme.colors.onSurface}
                />
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons
            name="cash"
            size={16}
            color={theme.colors.success}
          />
          <Text style={[styles.statText, { color: theme.colors.onMuted }]}>
            {formatCurrency(subscription.amount, subscription.currency)}/{subscription.interval}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="calendar"
            size={16}
            color={theme.colors.info}
          />
          <Text style={[styles.statText, { color: theme.colors.onMuted }]}>
            Next: {formatDate(subscription.currentPeriodEnd)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons
            name="time"
            size={16}
            color={theme.colors.border}
          />
          <Text style={[styles.statText, { color: theme.colors.onMuted }]}>
            Created: {formatDate(subscription.createdAt)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    card: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      ...theme.shadows.elevation2,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    info: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: theme.spacing['3xl'],
      height: theme.spacing['3xl'],
      borderRadius: theme.radii.full,
      backgroundColor: theme.colors.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginEnd: theme.spacing.md,
    },
    avatarText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
    details: {
      flex: 1,
    },
    userName: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs / 2,
    },
    userEmail: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.xs,
    },
    meta: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    planBadge: {
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.radii.sm,
    },
    planText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.625,
      fontWeight: theme.typography.h2.weight,
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: theme.spacing.xs / 2,
      borderRadius: theme.radii.sm,
      gap: theme.spacing.xs,
    },
    statusText: {
      color: theme.colors.onSurface,
      fontSize: theme.typography.body.size * 0.625,
      fontWeight: theme.typography.h2.weight,
    },
    actions: {
      flexDirection: 'row',
      gap: theme.spacing.sm,
    },
    actionButton: {
      width: theme.spacing.xl,
      height: theme.spacing.xl,
      borderRadius: theme.radii.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    stats: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    statText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.body.weight,
    },
  });

