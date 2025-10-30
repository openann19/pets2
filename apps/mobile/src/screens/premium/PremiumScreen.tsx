import { Ionicons } from '@expo/vector-icons';
import type { AppTheme } from '@mobile/theme';
import { useTheme } from '@mobile/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
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
import { SuccessMorphButton } from '../../components/micro/SuccessMorph';

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
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      color: theme.colors.onPrimary,
      opacity: 0.9,
      textAlign: 'center',
    },
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
    footer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onPrimary,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    restoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.onPrimary,
      opacity: 0.15,
    },
    restoreButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.primary,
      fontWeight: theme.typography.h2.weight,
    },
  });
}

export function PremiumScreen(): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { t } = useTranslation('premium');
  const {
    billingPeriod,
    selectedTier,
    isLoading,
    isRestoring,
    subscriptionTiers,
    setBillingPeriod,
    setSelectedTier,
    handleSubscribe,
    handleRestorePurchases,
    handleGoBack,
  } = usePremiumScreen();

  const renderTierCard = useCallback(
    (tier: (typeof subscriptionTiers)[0]) => {
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

          <SuccessMorphButton
            onPress={() => handleSubscribe(tier.id)}
            style={
              StyleSheet.flatten([
                styles.subscribeButton,
                isSelected && styles.subscribeButtonSelected,
              ]) as any
            }
            textStyle={styles.subscribeButtonText}
          >
            {isLoading && selectedTier === tier.id ? (
              <ActivityIndicator
                color={theme.colors.onSurface}
                testID="loading-indicator"
              />
            ) : (
              <Text style={styles.subscribeButtonText}>
                {isSelected ? t('subscribe_now') : t('select_plan')}
              </Text>
            )}
          </SuccessMorphButton>
        </TouchableOpacity>
      );
    },
    [billingPeriod, selectedTier, isLoading, theme, styles, handleSubscribe, setSelectedTier, t],
  );

  // Access palette gradients - AppTheme has palette property
  const gradientColors = theme.palette.gradients.primary;

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

          <Text style={styles.title}>{t('upgrade_title')}</Text>
          <Text style={styles.subtitle}>{t('upgrade_subtitle')}</Text>
        </View>

        <View style={styles.billingToggle}>
          <TouchableOpacity
            style={[
              styles.billingOption,
              billingPeriod === 'monthly' && styles.billingOptionActive,
            ]}
            testID="PremiumScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              setBillingPeriod('monthly');
            }}
          >
            <Text
              style={[styles.billingText, billingPeriod === 'monthly' && styles.billingTextActive]}
            >
              {t('premium_monthly')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.billingOption, billingPeriod === 'yearly' && styles.billingOptionActive]}
            testID="PremiumScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              setBillingPeriod('yearly');
            }}
          >
            <Text
              style={[styles.billingText, billingPeriod === 'yearly' && styles.billingTextActive]}
            >
              {t('premium_yearly')}
            </Text>
            <View style={styles.saveBadge}>
              <Text style={styles.saveText}>{t('save_badge_default')}</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.tiersContainer}>
          {subscriptionTiers.map((tier) => (
            <React.Fragment key={tier.id}>{renderTierCard(tier)}</React.Fragment>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('cancel_anytime')} • {t('secure_payment')} • {t('money_back')}
          </Text>

          {/* Restore Purchases Button */}
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            disabled={isRestoring}
            accessibilityLabel="Restore purchases"
            accessibilityRole="button"
            accessibilityHint="Restore your previous purchases"
          >
            {isRestoring ? (
              <ActivityIndicator
                color={theme.colors.primary}
                size="small"
              />
            ) : (
              <>
                <Ionicons
                  name="refresh-outline"
                  size={16}
                  color={theme.colors.primary}
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.restoreButtonText}>Restore Purchases</Text>
              </>
            )}
          </TouchableOpacity>
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
