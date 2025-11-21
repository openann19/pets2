/**
 * Premium Feature Gate Component
 * Blocks premium features behind subscription verification
 * 
 * WI-005: Premium Subscription Gating
 */
import React, { type ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { usePremium } from "../hooks/usePremium";
import { logger } from "@pawfectmatch/core";

export interface PremiumGateProps {
  feature: keyof import("../services/PremiumService").PremiumLimits;
  children: ReactNode;
  fallback?: ReactNode;
  onUpgradePress?: () => void;
  showUpgradePrompt?: boolean;
  upgradeMessage?: string;
}

/**
 * Premium Feature Gate - Blocks access to premium features
 */
export const PremiumGate: React.FC<PremiumGateProps> = ({
  feature,
  children,
  fallback,
  onUpgradePress,
  showUpgradePrompt = true,
  upgradeMessage,
}) => {
  const { canUseFeature, isLoading, isActive } = usePremium();
  const canUse = canUseFeature(feature);

  // Show loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If user can use the feature, render children
  if (canUse) {
    return <>{children}</>;
  }

  // If custom fallback provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }

  // Default upgrade prompt
  if (showUpgradePrompt) {
    return (
      <View style={styles.upgradeContainer}>
        <View style={styles.upgradeContent}>
          <Text style={styles.upgradeTitle}>Premium Feature</Text>
          <Text style={styles.upgradeMessage}>
            {upgradeMessage || `This feature requires a premium subscription.`}
          </Text>
          <TouchableOpacity
            style={styles.upgradeButton}
            onPress={() => {
              logger.info("Premium upgrade prompt tapped", { feature });
              onUpgradePress?.();
            }}
          >
            <Text style={styles.upgradeButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Hide feature if no upgrade prompt
  return null;
};

/**
 * Hook for premium feature gating
 */
export const usePremiumGate = (feature: keyof import("../services/PremiumService").PremiumLimits) => {
  const { canUseFeature, isLoading, isActive } = usePremium();
  
  return {
    canUse: canUseFeature(feature),
    isLoading,
    isActive,
    feature,
  };
};

/**
 * Premium Badge Component
 */
export const PremiumBadge: React.FC<{ size?: "small" | "medium" | "large" }> = ({ 
  size = "medium" 
}) => {
  const { isActive } = usePremium();
  
  if (!isActive) {
    return null;
  }

  const sizeStyles = {
    small: { fontSize: 10, paddingHorizontal: 6, paddingVertical: 2 },
    medium: { fontSize: 12, paddingHorizontal: 8, paddingVertical: 4 },
    large: { fontSize: 14, paddingHorizontal: 10, paddingVertical: 6 },
  };

  return (
    <View style={[styles.badge, sizeStyles[size]]}>
      <Text style={[styles.badgeText, { fontSize: sizeStyles[size].fontSize }]}>
        PREMIUM
      </Text>
    </View>
  );
};

/**
 * Usage Limit Indicator
 */
export const UsageLimitIndicator: React.FC<{
  feature: keyof import("../services/PremiumService").PremiumLimits;
  currentUsage?: number;
}> = ({ feature, currentUsage = 0 }) => {
  const { limits, getRemainingUsage } = usePremium();
  const limit = limits[feature];
  const remaining = getRemainingUsage(feature);

  if (typeof limit !== "number" || limit === -1) {
    return null; // No limit or boolean feature
  }

  const usagePercentage = (currentUsage / limit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usagePercentage >= 100;

  return (
    <View style={styles.usageContainer}>
      <View style={styles.usageBar}>
        <View 
          style={[
            styles.usageFill, 
            { 
              width: `${Math.min(usagePercentage, 100)}%`,
              backgroundColor: isAtLimit ? "#ef4444" : isNearLimit ? "#f59e0b" : "#10b981"
            }
          ]} 
        />
      </View>
      <Text style={[
        styles.usageText,
        { color: isAtLimit ? "#ef4444" : isNearLimit ? "#f59e0b" : "#6b7280" }
      ]}>
        {currentUsage} / {limit === -1 ? "∞" : limit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  upgradeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9fafb",
  },
  upgradeContent: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    maxWidth: 300,
  },
  upgradeTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
  },
  upgradeMessage: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 24,
  },
  upgradeButton: {
    backgroundColor: "#ec4899",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
  },
  upgradeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  badge: {
    backgroundColor: "#ec4899",
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  badgeText: {
    color: "white",
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  usageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  usageBar: {
    flex: 1,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    marginRight: 8,
  },
  usageFill: {
    height: "100%",
    borderRadius: 2,
  },
  usageText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 60,
    textAlign: "right",
  },
});

export default PremiumGate;