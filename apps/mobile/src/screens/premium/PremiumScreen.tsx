import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/src/theme';
import { useTheme } from '@mobile/src/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Footer from '../../components/Footer';
import { usePremiumScreen } from '../../hooks/screens/premium';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing['4xl'],
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing['4xl'],
      left: theme.spacing.lg,
      zIndex: 10,
    },
    title: {
      fontSize: 32,
      fontWeight: '700',
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: 16,
      color: `${theme.colors.onPrimary}E6`,
      textAlign: 'center',
    },
    billingToggle: {
      flexDirection: 'row',
      backgroundColor: `${theme.colors.onPrimary}33`,
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
      fontSize: 16,
      fontWeight: '600',
      color: `${theme.colors.onPrimary}CC`,
    },
    billingTextActive: {
      color: theme.palette.brand[600],
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
    tiersContainer: {
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
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
      fontSize: 12,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    tierName: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.xs,
    },
    priceContainer: {
      flexDirection: 'row',
      alignItems: 'baseline',
      marginBottom: theme.spacing.xs,
    },
    priceSymbol: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    priceAmount: {
      fontSize: 48,
      fontWeight: '700',
      color: theme.colors.onSurface,
    },
    pricePeriod: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginLeft: theme.spacing.xs,
    },
    discount: {
      fontSize: 14,
      fontWeight: '600',
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
      fontSize: 14,
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
      fontSize: 16,
      fontWeight: '700',
      color: theme.colors.onPrimary,
    },
    footer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: 12,
      color: `${theme.colors.onPrimary}CC`,
      textAlign: 'center',
    },
  });
}

export function PremiumScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const {
    billingPeriod,
    selectedTier,
    isLoading,
    subscriptionTiers,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleGoBack,
  } = usePremiumScreen();

  const renderTierCard = (tier: (typeof subscriptionTiers)[0]) => {
    const isSelected = selectedTier === tier.id;
    const price = tier.price[billingPeriod];
    const yearlyDiscount =
      billingPeriod === 'yearly'
        ? Math.round((1 - tier.price.yearly / 12 / tier.price.monthly) * 100)
        : 0;

    return (
      <TouchableOpacity
        key={tier.id}
        testID={`tier-${tier.id}-card`}
        onPress={() => {
          setSelectedTier(tier.id);
        }}
        style={StyleSheet.flatten([
          styles.tierCard,
          isSelected && styles.tierCardSelected,
          tier.popular && styles.tierCardPopular,
        ])}
        accessibilityRole="button"
        accessibilityLabel={`${tier.name} tier subscription plan`}
        accessibilityState={{ selected: isSelected }}
      >
        {tier.popular ? (
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>Most Popular</Text>
          </View>
        ) : null}

        <Text style={styles.tierName}>{tier.name}</Text>

        <View style={styles.priceContainer}>
          <Text style={styles.priceSymbol}>$</Text>
          <Text style={styles.priceAmount}>
            {billingPeriod === 'yearly' ? (price / 12).toFixed(2) : price}
          </Text>
          <Text style={styles.pricePeriod}>/{billingPeriod === 'yearly' ? 'mo' : 'month'}</Text>
        </View>

        {billingPeriod === 'yearly' && yearlyDiscount > 0 && (
          <Text style={styles.discount}>Save {yearlyDiscount}%</Text>
        )}

        <View style={styles.featuresContainer}>
          {tier.features.map((feature, index) => (
            <View
              key={index}
              style={styles.featureRow}
            >
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={theme.colors.success}
              />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.subscribeButton,
            isSelected && styles.subscribeButtonSelected,
          ])}
          testID={`subscribe-${tier.name.toLowerCase()}-button`}
          accessibilityLabel={
            isSelected ? 'You are subscribed to this plan' : 'Subscribe to this plan'
          }
          accessibilityRole="button"
          onPress={() => handleSubscribe(tier.id)}
          disabled={isLoading}
        >
          {isLoading && selectedTier === tier.id ? (
            <ActivityIndicator
              color={theme.colors.onSurface}
              testID="loading-indicator"
            />
          ) : (
            <Text style={styles.subscribeButtonText}>
              {isSelected ? 'Subscribe Now' : 'Select Plan'}
            </Text>
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  // Access palette safely - resolve.ts AppTheme doesn't have palette yet
  const gradientColors = (theme as any).palette?.gradients?.primary ?? [
    theme.colors.primary,
    (theme as any).palette?.brand?.[600] ?? theme.colors.primary,
  ];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            testID="premium-back-button"
            accessibilityLabel="Back"
            accessibilityRole="button"
            onPress={handleGoBack}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={theme.colors.onSurface}
            />
          </TouchableOpacity>

          <Text style={styles.title}>Upgrade to Premium</Text>
          <Text style={styles.subtitle}>Find your perfect match with advanced features</Text>
        </View>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ])}
            testID="PremiumScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              setBillingPeriod('monthly');
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.billingText,
                billingPeriod === 'monthly' && styles.billingTextActive,
              ])}
            >
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.billingOption,
              billingPeriod === 'yearly' && styles.billingOptionActive,
            ])}
            testID="PremiumScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              setBillingPeriod('yearly');
            }}
          >
            <Text
              style={StyleSheet.flatten([
                styles.billingText,
                billingPeriod === 'yearly' && styles.billingTextActive,
              ])}
            >
              Yearly
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>Save 20%</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tiersContainer}>{subscriptionTiers.map(renderTierCard)}</View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Cancel anytime • Secure payment • Money-back guarantee
          </Text>
        </View>
      </ScrollView>

      {/* Professional Premium Footer */}
      <Footer
        showCopyright
        showLegal
        showVersion={false}
        showSupport
        variant="premium"
      />
    </LinearGradient>
  );
}
