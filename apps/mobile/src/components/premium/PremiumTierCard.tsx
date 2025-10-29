import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface SubscriptionTier {
  id: string;
  name: string;
  price: { monthly: number; yearly: number };
  features: string[];
  popular?: boolean;
}

interface PremiumTierCardProps {
  tier: SubscriptionTier;
  billingPeriod: "monthly" | "yearly";
  isSelected: boolean;
  onPress: () => void;
}

export const PremiumTierCard: React.FC<PremiumTierCardProps> = ({
  tier,
  billingPeriod,
  isSelected,
  onPress,
}) => (
  <TouchableOpacity
    style={[
      styles.tierCard,
      {
        borderColor: isSelected ? "#ec4899" : "#374151",
      },
    ]}
    onPress={onPress}
    testID={`tier-${tier.id}`}
    accessibilityLabel={`${tier.name} tier`}
    accessibilityRole="button"
  >
    {tier.popular && (
      <View style={[styles.popularBadge, { backgroundColor: "#ec4899" }]>
        <Text style={styles.popularText}>Most Popular</Text>
      </View>
    )}

    <View style={styles.tierHeader}>
      <Text style={[styles.tierName, { color: "#ffffff" }]>
        {tier.name}
      </Text>
      <View style={styles.tierPricing}>
        <Text style={[styles.tierPrice, { color: "#ffffff" }]>
          ${tier.price[billingPeriod]}
        </Text>
        <Text style={[styles.tierDuration, { color: "#9ca3af" }]>
          /{billingPeriod === "monthly" ? "month" : "year"}
        </Text>
      </View>
    </View>

    <View style={styles.tierFeatures}>
      {tier.features.map((feature, index) => (
        <View key={index} style={styles.tierFeature}>
          <Ionicons
            name="checkmark"
            size={16}
            color="#10b981"
          />
          <Text style={[styles.tierFeatureText, { color: "#d1d5db" }]>
            {feature}
          </Text>
        </View>
      ))}
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  tierCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    position: "relative",
    backgroundColor: "#1f2937",
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
    color: "#ffffff",
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
});
