/**
 * Billing Filters Section Component
 * Provides filter controls for status and plan
 */

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface BillingFiltersSectionProps {
  selectedStatus: 'all' | 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete';
  selectedPlan: 'all' | 'basic' | 'premium' | 'ultimate';
  onStatusChange: (status: 'all' | 'active' | 'canceled' | 'past_due' | 'trialing' | 'incomplete') => void;
  onPlanChange: (plan: 'all' | 'basic' | 'premium' | 'ultimate') => void;
}

export const BillingFiltersSection = ({
  selectedStatus,
  selectedPlan,
  onStatusChange,
  onPlanChange,
}: BillingFiltersSectionProps): React.JSX.Element => {
  const theme = useTheme();
  const styles = makeStyles(theme);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Status:</Text>
        <View style={styles.filterButtons}>
          {(['all', 'active', 'canceled', 'past_due', 'trialing', 'incomplete'] as const).map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedStatus === status && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedStatus === status ? theme.colors.primary : theme.colors.surface,
                  },
                ]}
                testID={`BillingFiltersSection-button-status-${status}`}
                accessibilityLabel={`Filter by status: ${status}`}
                accessibilityRole="button"
                onPress={() => onStatusChange(status)}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color:
                        selectedStatus === status
                          ? theme.colors.onPrimary
                          : theme.colors.onMuted,
                    },
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: theme.colors.onSurface }]}>Plan:</Text>
        <View style={styles.filterButtons}>
          {(['all', 'basic', 'premium', 'ultimate'] as const).map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[
                styles.filterButton,
                selectedPlan === plan && styles.filterButtonActive,
                {
                  backgroundColor:
                    selectedPlan === plan ? theme.colors.primary : theme.colors.surface,
                },
              ]}
              testID={`BillingFiltersSection-button-plan-${plan}`}
              accessibilityLabel={`Filter by plan: ${plan}`}
              accessibilityRole="button"
              onPress={() => onPlanChange(plan)}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      selectedPlan === plan ? theme.colors.onPrimary : theme.colors.onMuted,
                  },
                ]}
              >
                {plan.charAt(0).toUpperCase() + plan.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.md,
      gap: theme.spacing.md,
    },
    filterRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    filterLabel: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      minWidth: theme.spacing['3xl'],
    },
    filterButtons: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    filterButton: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    filterButtonActive: {
      // Active state handled by backgroundColor
    },
    filterText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
  });

