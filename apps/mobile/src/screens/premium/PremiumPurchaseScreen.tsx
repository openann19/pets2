/**
 * Premium Subscription Purchase Screen
 * Complete subscription purchase flow with Stripe integration
 * 
 * WI-005: Premium Subscription Gating
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { usePremium } from "../hooks/usePremium";
import { premiumService, type SubscriptionPlan } from "../services/PremiumService";
import { logger } from "@pawfectmatch/core";
import { PremiumBadge } from "./PremiumGate";

export interface PremiumPurchaseScreenProps {
  onPurchaseComplete?: () => void;
  onCancel?: () => void;
}

export const PremiumPurchaseScreen: React.FC<PremiumPurchaseScreenProps> = ({
  onPurchaseComplete,
  onCancel,
}) => {
  const { isActive, isLoading } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<string>("premium");
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const availablePlans = premiumService.getAvailablePlans();
      setPlans(availablePlans);
    } catch (error) {
      logger.error("Failed to load subscription plans", { error });
    }
  };

  const handlePurchase = async () => {
    if (isPurchasing) return;

    setIsPurchasing(true);
    try {
      const result = await premiumService.purchaseSubscription(selectedPlan);
      
      if (result.success) {
        logger.info("Subscription purchase completed", { plan: selectedPlan });
        Alert.alert(
          "Success!",
          "Your premium subscription is now active. Enjoy all premium features!",
          [
            {
              text: "Continue",
              onPress: () => {
                onPurchaseComplete?.();
              },
            },
          ]
        );
      } else {
        logger.error("Subscription purchase failed", { error: result.error });
        Alert.alert(
          "Purchase Failed",
          result.error || "Something went wrong. Please try again.",
          [{ text: "OK" }]
        );
      }
    } catch (error) {
      logger.error("Subscription purchase error", { error });
      Alert.alert(
        "Error",
        "An unexpected error occurred. Please try again.",
        [{ text: "OK" }]
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleRestorePurchases = async () => {
    try {
      const result = await premiumService.restorePurchases();
      
      if (result.success) {
        Alert.alert("Success", result.message);
        onPurchaseComplete?.();
      } else {
        Alert.alert("No Purchases Found", result.message);
      }
    } catch (error) {
      logger.error("Failed to restore purchases", { error });
      Alert.alert("Error", "Failed to restore purchases. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ec4899" />
        <Text style={styles.loadingText}>Loading subscription plans...</Text>
      </View>
    );
  }

  if (isActive) {
    return (
      <View style={styles.activeContainer}>
        <Text style={styles.activeTitle}>You're Already Premium!</Text>
        <Text style={styles.activeMessage}>
          You have an active premium subscription. Enjoy all premium features!
        </Text>
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => onPurchaseComplete?.()}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Upgrade to Premium</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited swipes, AI matching, and exclusive features
        </Text>
      </View>

      <View style={styles.plansContainer}>
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isSelected={selectedPlan === plan.id}
            onSelect={() => setSelectedPlan(plan.id)}
          />
        ))}
      </View>

      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>Premium Features</Text>
        <FeatureList />
      </View>

      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
          onPress={handlePurchase}
          disabled={isPurchasing}
        >
          {isPurchasing ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.purchaseButtonText}>
              Start Premium - ${plans.find(p => p.id === selectedPlan)?.price}/month
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.restoreButton}
          onPress={handleRestorePurchases}
        >
          <Text style={styles.restoreButtonText}>Restore Purchases</Text>
        </TouchableOpacity>

        {onCancel && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const PlanCard: React.FC<{
  plan: SubscriptionPlan;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ plan, isSelected, onSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.planCard, isSelected && styles.planCardSelected]}
      onPress={onSelect}
    >
      {plan.popular && <PremiumBadge size="small" />}
      <View style={styles.planHeader}>
        <Text style={styles.planName}>{plan.name}</Text>
        <Text style={styles.planPrice}>
          ${plan.price}
          <Text style={styles.planInterval}>/{plan.interval}</Text>
        </Text>
      </View>
      <View style={styles.planFeatures}>
        {plan.features.slice(0, 3).map((feature, index) => (
          <Text key={index} style={styles.planFeature}>
            • {feature}
          </Text>
        ))}
        {plan.features.length > 3 && (
          <Text style={styles.planFeatureMore}>
            • +{plan.features.length - 3} more features
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const FeatureList: React.FC = () => {
  const features = [
    "Unlimited daily swipes",
    "AI-powered pet matching",
    "See who liked your pet",
    "Boost your profile visibility",
    "Advanced search filters",
    "Priority customer support",
    "Unlimited rewinds",
    "Super likes",
  ];

  return (
    <View style={styles.featureList}>
      {features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Text style={styles.featureIcon}>✓</Text>
          <Text style={styles.featureText}>{feature}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  activeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  activeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  activeMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  continueButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  continueButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
  },
  plansContainer: {
    marginBottom: 32,
  },
  planCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardSelected: {
    borderColor: "#ec4899",
    shadowColor: "#ec4899",
    shadowOpacity: 0.2,
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  planName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ec4899",
  },
  planInterval: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "normal",
  },
  planFeatures: {
    marginTop: 8,
  },
  planFeature: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  planFeatureMore: {
    fontSize: 14,
    color: "#ec4899",
    fontWeight: "500",
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  featureList: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 16,
    color: "#10b981",
    marginRight: 12,
    fontWeight: "bold",
  },
  featureText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
  },
  actionContainer: {
    marginTop: 20,
  },
  purchaseButton: {
    backgroundColor: "#ec4899",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  purchaseButtonDisabled: {
    opacity: 0.6,
  },
  purchaseButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  restoreButton: {
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  restoreButtonText: {
    color: "#6b7280",
    fontSize: 16,
    textDecorationLine: "underline",
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#9ca3af",
    fontSize: 16,
  },
});

export default PremiumPurchaseScreen;
