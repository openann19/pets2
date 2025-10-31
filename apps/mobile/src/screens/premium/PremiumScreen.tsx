import { useTheme } from '@mobile/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Footer from '../../components/Footer';
import { usePremiumScreen } from '../../hooks/screens/premium';
import {
  TierCard,
  BillingPeriodToggle,
  PremiumHeader,
  PremiumFooter,
  Microtransactions,
} from '../../components/premium';


export function PremiumScreen(): React.JSX.Element {
  const theme = useTheme();
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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
        },
        scrollView: {
          flex: 1,
        },
        tiersContainer: {
          padding: theme.spacing.lg,
          gap: theme.spacing.md,
        },
        microtransactionsContainer: {
          paddingTop: theme.spacing.lg,
        },
      }),
    [theme],
  );

  // Access palette gradients - AppTheme has palette property
  const gradientColors = theme.palette.gradients.primary;

  const handlePurchaseSuccess = (): void => {
    // Refresh any relevant data after successful purchase
    // This could trigger a refresh of subscription status, etc.
  };

  return (
    <LinearGradient colors={gradientColors} style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <PremiumHeader onBack={handleGoBack} />

        <BillingPeriodToggle billingPeriod={billingPeriod} onPeriodChange={setBillingPeriod} />

        <View style={styles.tiersContainer}>
          {subscriptionTiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              billingPeriod={billingPeriod}
              isSelected={selectedTier === tier.id}
              isLoading={isLoading && selectedTier === tier.id}
              onSelect={() => setSelectedTier(tier.id)}
              onSubscribe={() => handleSubscribe(tier.id)}
            />
          ))}
        </View>

        {/* Microtransactions Section */}
        <View style={styles.microtransactionsContainer}>
          <Microtransactions onPurchaseSuccess={handlePurchaseSuccess} />
        </View>

        <PremiumFooter isRestoring={isRestoring} onRestorePurchases={handleRestorePurchases} />
      </ScrollView>

      {/* Professional Premium Footer */}
      <Footer showCopyright showLegal showVersion={false} showSupport variant="premium" />
    </LinearGradient>
  );
}
