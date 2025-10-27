import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "../theme/Provider";
import { usePremiumScreen } from "../hooks/screens/usePremiumScreen";
import type { NavigationProp } from "../navigation/types";
import { PremiumTierCard } from "../components/premium/PremiumTierCard";
import { BillingToggle } from "../components/premium/BillingToggle";
import { useTranslation } from 'react-i18next';

interface PremiumScreenProps {
  navigation: NavigationProp;
}

function PremiumScreen({ navigation }: PremiumScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');
  const colors = theme.colors;
  const isDark = theme.scheme === 'dark';

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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.gray900 }]}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          styles.headerBlur,
          {
            backgroundColor:
              Platform.OS === "ios"
                ? "rgba(255,255,255,0.08)"
                : colors.glassDarkMedium,
          },
        ]}
      >
        <TouchableOpacity
           testID="PremiumScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            handleGoBack();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.white }]}>
          {t('go_premium')}
        </Text>
        <View style={{ width: 60 }} />
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
          style={[
            styles.subscribeButton,
            { backgroundColor: colors.primary },
            isLoading && { opacity: 0.7 },
          ]}
           testID="PremiumScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleSubscribe(selectedTier)}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={theme.colors.neutral[0}]} } size="small" />
          ) : (
            <>
              <Text style={styles.subscribeButtonText}>{t('premium_subscribe')}</Text>
              <Ionicons name="arrow-forward" size={20} color={theme.colors.neutral[0]}} />
            }<}/>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
  },
  headerBlur: {
    ...Platform.select({
      ios: {},
      android: {},
    }),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  billingToggle: {
    flexDirection: "row",
    backgroundColor: theme.colors.neutral[800],
    borderRadius: 12,
    padding: 4,
    marginBottom: 30,
  },
  billingButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  billingButtonActive: {
    shadowColor: theme.colors.neutral[950],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  billingButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tiersContainer: {
    gap: 20,
    marginBottom: 30,
  },
  tierCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    position: "relative",
  },
  popularBadge: {
    position: "absolute",
    top: -8,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: theme.colors.neutral[0],
    fontSize: 12,
    fontWeight: "600",
  },
  tierHeader: {
    marginBottom: 20,
  },
  tierName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  tierPricing: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: "bold",
    marginRight: 4,
  },
  tierDuration: {
    fontSize: 16,
  },
  tierFeatures: {
    gap: 12,
  },
  tierFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tierFeatureText: {
    fontSize: 15,
    flex: 1,
  },
  subscribeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  subscribeButtonText: {
    color: theme.colors.neutral[0],
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default PremiumScreen;