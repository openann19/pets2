/**
 * BillingPeriodToggle Component
 * Toggles between monthly and yearly billing
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';

interface BillingPeriodToggleProps {
  billingPeriod: 'monthly' | 'yearly';
  onPeriodChange: (period: 'monthly' | 'yearly') => void;
}

export function BillingPeriodToggle({
  billingPeriod,
  onPeriodChange,
}: BillingPeriodToggleProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');

  const styles = StyleSheet.create({
    billingToggle: {
      flexDirection: 'row',
      backgroundColor: theme.colors.onPrimary,
      opacity: 0.2,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.xs,
      marginHorizontal: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    },
    billingOption: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      borderRadius: theme.radii.md,
      alignItems: 'center',
      position: 'relative',
    },
    billingOptionActive: {
      backgroundColor: theme.colors.onPrimary,
    },
    billingText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onPrimary,
      opacity: 0.8,
    },
    billingTextActive: {
      color: theme.colors.primary,
    },
    saveBadge: {
      position: 'absolute',
      top: -8,
      right: 8,
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.xs,
      paddingVertical: 2,
      borderRadius: theme.radii.md,
    },
    saveText: {
      fontSize: 10,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
  });

  return (
    <View style={styles.billingToggle}>
      <TouchableOpacity
        style={[styles.billingOption, billingPeriod === 'monthly' && styles.billingOptionActive]}
        testID="billing-toggle-monthly"
        accessibilityLabel="Monthly billing"
        accessibilityRole="button"
        accessibilityState={{ selected: billingPeriod === 'monthly' }}
        onPress={() => onPeriodChange('monthly')}
      >
        <Text style={[styles.billingText, billingPeriod === 'monthly' && styles.billingTextActive]}>
          {t('premium_monthly')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.billingOption, billingPeriod === 'yearly' && styles.billingOptionActive]}
        testID="billing-toggle-yearly"
        accessibilityLabel="Yearly billing"
        accessibilityRole="button"
        accessibilityState={{ selected: billingPeriod === 'yearly' }}
        onPress={() => onPeriodChange('yearly')}
      >
        <Text style={[styles.billingText, billingPeriod === 'yearly' && styles.billingTextActive]}>
          {t('premium_yearly')}
        </Text>
        <View style={styles.saveBadge}>
          <Text style={styles.saveText}>{t('save_badge_default')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

