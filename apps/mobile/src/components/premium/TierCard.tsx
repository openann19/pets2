/**
 * TierCard Component
 * Displays individual subscription tier card
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { SuccessMorphButton } from '../micro/SuccessMorph';

interface SubscriptionTier {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  popular?: boolean;
}

interface TierCardProps {
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  isSelected: boolean;
  isLoading: boolean;
  onSelect: () => void;
  onSubscribe: () => void;
}

export function TierCard({
  tier,
  billingPeriod,
  isSelected,
  isLoading,
  onSelect,
  onSubscribe,
}: TierCardProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');

  const price = tier.price[billingPeriod];
  const yearlyDiscount =
    billingPeriod === 'yearly'
      ? Math.round((1 - tier.price.yearly / 12 / tier.price.monthly) * 100)
      : 0;

  const styles = StyleSheet.create({
    tierCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      borderWidth: 2,
      borderColor: 'transparent',
      position: 'relative',
    },
    tierCardSelected: {
      borderColor: theme.colors.primary,
      ...theme.shadows.elevation2,
    },
    tierCardPopular: {
      borderColor: theme.colors.success,
    },
    popularBadge: {
      position: 'absolute',
      top: -12,
      right: theme.spacing.lg,
      backgroundColor: theme.colors.success,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    popularText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onPrimary,
    },
    tierName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xs,
    },
    priceSymbol: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    priceAmount: {
      fontSize: theme.typography.h1.size * 1.5,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    pricePeriod: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginLeft: theme.spacing.xs,
    },
    discount: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.success,
      marginBottom: theme.spacing.md,
    },
    featuresContainer: {
      marginVertical: theme.spacing.md,
      gap: theme.spacing.sm,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    featureText: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.onMuted,
      flex: 1,
    },
    subscribeButton: {
      backgroundColor: theme.colors.border,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.lg,
      alignItems: 'center',
    },
    subscribeButtonSelected: {
      backgroundColor: theme.colors.primary,
    },
    subscribeButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onPrimary,
    },
  });

  return (
    <TouchableOpacity
      testID={`tier-${tier.id}-card`}
      onPress={onSelect}
      style={[
        styles.tierCard,
        isSelected && styles.tierCardSelected,
        tier.popular && styles.tierCardPopular,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${tier.name} tier subscription plan`}
      accessibilityState={{ selected: isSelected }}
    >
      {tier.popular ? (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>{t('most_popular')}</Text>
        </View>
      ) : null}

      <Text style={styles.tierName}>{tier.name}</Text>

      <View style={styles.priceContainer}>
        <Text style={styles.priceSymbol}>$</Text>
        <Text style={styles.priceAmount}>
          {billingPeriod === 'yearly' ? (price / 12).toFixed(2) : price}
        </Text>
        <Text style={styles.pricePeriod}>
          {t('price_per_month', { period: billingPeriod === 'yearly' ? 'mo' : 'month' })}
        </Text>
      </View>

      {billingPeriod === 'yearly' && yearlyDiscount > 0 && (
        <Text style={styles.discount}>{t('save_discount', { discount: yearlyDiscount })}</Text>
      )}

      <View style={styles.featuresContainer}>
        {tier.features.map((feature, index) => (
          <View key={index} style={styles.featureRow}>
            <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <SuccessMorphButton
        onPress={onSubscribe}
        style={
          StyleSheet.flatten([
            styles.subscribeButton,
            isSelected && styles.subscribeButtonSelected,
          ]) as any
        }
        textStyle={styles.subscribeButtonText}
      >
        {isLoading && isSelected ? (
          <ActivityIndicator color={theme.colors.onSurface} testID="loading-indicator" />
        ) : (
          <Text style={styles.subscribeButtonText}>
            {isSelected ? t('subscribe_now') : t('select_plan')}
          </Text>
        )}
      </SuccessMorphButton>
    </TouchableOpacity>
  );
}

