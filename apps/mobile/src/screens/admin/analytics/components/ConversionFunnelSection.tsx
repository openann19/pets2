/**
 * Conversion Funnel Section Component
 * Displays user conversion funnel from Free → Premium → Ultimate
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      gap: theme.spacing.md,
    },
    funnelStep: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.sm,
      shadowColor: theme.colors.onSurface,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    stepInfo: {
      flex: 1,
      marginLeft: theme.spacing.md,
    },
    stepLabel: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      marginBottom: theme.spacing.xs / 2,
    },
    stepCount: {
      fontSize: theme.typography.body.size * 0.9,
      marginTop: theme.spacing.xs / 2,
    },
    stepPercentage: {
      fontSize: theme.typography.body.size * 1.2,
      fontWeight: theme.typography.body.weight,
      marginRight: theme.spacing.md,
      minWidth: 60,
      textAlign: 'right',
    },
    arrow: {
      alignItems: 'center',
      marginVertical: theme.spacing.xs,
    },
    dropoffLabel: {
      fontSize: theme.typography.body.size * 0.8,
      fontStyle: 'italic',
      marginTop: theme.spacing.xs / 2,
    },
  });
}

export interface ConversionFunnelData {
  totalFreeUsers: number;
  paywallViews: number;
  premiumSubscribers: number;
  ultimateSubscribers: number;
  freeToPaywallConversion: number; // percentage
  paywallToPremiumConversion: number; // percentage
  premiumToUltimateConversion: number; // percentage
  overallConversionRate: number; // Free → Premium
}

interface ConversionFunnelSectionProps {
  funnel: ConversionFunnelData;
}

export const ConversionFunnelSection: React.FC<ConversionFunnelSectionProps> = ({ funnel }) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  const steps = [
    {
      label: 'Free Users',
      count: funnel.totalFreeUsers,
      percentage: 100,
      icon: 'people-outline' as const,
      color: colors.primary,
      dropoff: 0,
    },
    {
      label: 'Paywall Views',
      count: funnel.paywallViews,
      percentage: funnel.freeToPaywallConversion,
      icon: 'eye-outline' as const,
      color: colors.info,
      dropoff: funnel.totalFreeUsers - funnel.paywallViews,
    },
    {
      label: 'Premium Subscribers',
      count: funnel.premiumSubscribers,
      percentage: funnel.paywallToPremiumConversion,
      icon: 'star-outline' as const,
      color: colors.success,
      dropoff: funnel.paywallViews - funnel.premiumSubscribers,
    },
    {
      label: 'Ultimate Subscribers',
      count: funnel.ultimateSubscribers,
      percentage: funnel.premiumToUltimateConversion,
      icon: 'diamond-outline' as const,
      color: colors.warning,
      dropoff: funnel.premiumSubscribers - funnel.ultimateSubscribers,
    },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.label}>
          <View style={[styles.funnelStep, { backgroundColor: colors.surface }]}>
            <Ionicons name={step.icon} size={24} color={step.color} />
            <View style={styles.stepInfo}>
              <Text style={[styles.stepLabel, { color: colors.onSurface }]}>{step.label}</Text>
              <Text style={[styles.stepCount, { color: colors.onMuted }]}>
                {formatNumber(step.count)} users
              </Text>
              {step.dropoff > 0 && (
                <Text style={[styles.dropoffLabel, { color: colors.danger }]}>
                  Dropoff: {formatNumber(step.dropoff)} ({((step.dropoff / (steps[index - 1]?.count || step.count)) * 100).toFixed(1)}%)
                </Text>
              )}
            </View>
            <Text style={[styles.stepPercentage, { color: step.color }]}>
              {step.percentage.toFixed(1)}%
            </Text>
          </View>
          {index < steps.length - 1 && (
            <View style={styles.arrow}>
              <Ionicons name="chevron-down" size={20} color={colors.border} />
            </View>
          )}
        </React.Fragment>
      ))}
      <View style={[styles.funnelStep, { backgroundColor: colors.surface, marginTop: theme.spacing.md }]}>
        <Ionicons name="trending-up-outline" size={24} color={colors.success} />
        <View style={styles.stepInfo}>
          <Text style={[styles.stepLabel, { color: colors.onSurface }]}>Overall Conversion</Text>
          <Text style={[styles.stepCount, { color: colors.onMuted }]}>
            Free → Premium
          </Text>
        </View>
        <Text style={[styles.stepPercentage, { color: colors.success }]}>
          {funnel.overallConversionRate.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};
