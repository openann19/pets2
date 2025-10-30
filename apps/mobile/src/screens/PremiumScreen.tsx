import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import { haptic } from "@/ui/haptics";
import { trackUserAction } from "@/services/analyticsService";
import { usePremiumScreen } from "../hooks/screens/usePremiumScreen";
import type { NavigationProp } from "../navigation/types";
import { PremiumTierCard } from "../components/premium/PremiumTierCard";
import { BillingToggle } from "../components/premium/BillingToggle";
import { useTranslation } from 'react-i18next';

interface PremiumScreenProps {
  navigation: NavigationProp;
}

function PremiumScreen({ navigation: _navigation }: PremiumScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');
  const styles = useMemo(() => makeStyles(theme), [theme]);

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

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          testID="PremiumScreen-nav-close"
          accessibilityRole="button"
          accessibilityLabel="Close premium screen"
          accessibilityHint="Returns to the previous screen"
          onPress={() => {
            haptic.tap();
            trackUserAction('premium_screen_closed', {});
            handleGoBack();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('go_premium')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Billing Toggle */}
        <BillingToggle
          billingPeriod={billingPeriod}
          onToggle={setBillingPeriod}
        />

        {/* Subscription Tiers */}
        <View style={styles.tiersContainer}>
          {subscriptionTiers
            .filter((tier) => tier.id !== "basic")
            .map((tier) => (
              <PremiumTierCard
                key={tier.id}
                tier={tier}
                billingPeriod={billingPeriod}
                isSelected={selectedTier === tier.id}
                onPress={() => setSelectedTier(tier.id)}
              />
            ))}
        </View>

        {/* Subscribe Button */}
        <TouchableOpacity
          style={[styles.subscribeButton, isLoading && styles.subscribeButtonDisabled]}
          testID="PremiumScreen-subscribe-button"
          accessibilityRole="button"
          accessibilityLabel="Subscribe to premium"
          accessibilityHint={`Subscribe to ${selectedTier} tier`}
          accessibilityState={{ disabled: isLoading }}
          onPress={() => {
            haptic.confirm();
            trackUserAction('premium_subscribe_initiated', {
              tier: selectedTier,
              billingPeriod,
            });
            handleSubscribe(selectedTier);
          }}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.onPrimary} size="small" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>{t('premium_subscribe')}</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.onPrimary} />
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: AppTheme) {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
    },
    header: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "space-between" as const,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      paddingTop: Platform.OS === "ios" ? 50 : theme.spacing.lg,
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    placeholder: {
      width: theme.spacing.xl,
    },
    headerTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onSurface,
    },
    content: {
      flex: 1,
      padding: theme.spacing.lg,
    },
    tiersContainer: {
      gap: theme.spacing.lg,
      marginBottom: theme.spacing["2xl"],
    },
    subscribeButton: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      justifyContent: "center" as const,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.lg,
      backgroundColor: theme.colors.primary,
      gap: theme.spacing.sm,
    },
    subscribeButtonDisabled: {
      opacity: 0.7,
    },
    subscribeButtonText: {
      color: theme.colors.onPrimary,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
  };
}

export default PremiumScreen;