import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import { Interactive } from '../primitives/Interactive';

interface SubscriptionTier {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  popular?: boolean;
}

interface PremiumTierCardProps {
  tier: SubscriptionTier;
  billingPeriod: 'monthly' | 'yearly';
  isSelected: boolean;
  onPress: () => void;
}

export const PremiumTierCard: React.FC<PremiumTierCardProps> = ({
  tier,
  billingPeriod,
  isSelected,
  onPress,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <Interactive
      variant="lift"
      haptic="light"
      onPress={onPress}
      accessibilityLabel={`${tier.name} tier`}
      accessibilityRole="button"
    >
      <TouchableOpacity
        style={[
          styles.tierCard,
          {
            borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          },
        ]}
        testID={`tier-${tier.id}`}
        activeOpacity={1}
      >
        {tier.popular && (
          <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        )}

        <View style={styles.tierHeader}>
          <Text style={[styles.tierName, { color: theme.colors.onSurface }]}>{tier.name}</Text>
          <View style={styles.tierPricing}>
            <Text style={[styles.tierPrice, { color: theme.colors.onSurface }]}>
              ${tier.price[billingPeriod]}
            </Text>
            <Text style={[styles.tierDuration, { color: theme.colors.onMuted }]}>
              /{billingPeriod === 'monthly' ? 'month' : 'year'}
            </Text>
          </View>
        </View>

        <View style={styles.tierFeatures}>
          {tier.features.map((feature, index) => (
            <View
              key={index}
              style={styles.tierFeature}
            >
              <Ionicons
                name="checkmark"
                size={16}
                color={theme.colors.success}
              />
              <Text style={[styles.tierFeatureText, { color: theme.colors.onMuted }]}>
                {feature}
              </Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    </Interactive>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    tierCard: {
      padding: 24,
      borderRadius: 16,
      borderWidth: 2,
      position: 'relative',
      backgroundColor: theme.colors.surface,
    },
    popularBadge: {
      position: 'absolute',
      top: -8,
      right: 20,
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    popularText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: '600',
    },
    tierHeader: {
      marginBottom: 20,
    },
    tierName: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    tierPricing: {
      flexDirection: 'row',
      alignItems: 'baseline',
    },
    tierPrice: {
      fontSize: 32,
      fontWeight: 'bold',
      marginRight: 4,
    },
    tierDuration: {
      fontSize: 16,
    },
    tierFeatures: {
      gap: 12,
    },
    tierFeature: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    tierFeatureText: {
      fontSize: 15,
      flex: 1,
    },
  });
