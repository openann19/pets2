import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "@mobile/src/theme";

interface BillingToggleProps {
  billingPeriod: "monthly" | "yearly";
  onToggle: (period: "monthly" | "yearly") => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  billingPeriod,
  onToggle,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  
  return (
    <View style={[styles.billingToggle, { backgroundColor: theme.palette.neutral[800] }]>
      <TouchableOpacity
        style={[
          styles.billingButton,
          billingPeriod === "monthly" && [
            styles.billingButtonActive,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => onToggle("monthly")}
        testID="billing-monthly"
        accessibilityLabel="Monthly billing"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.billingButtonText,
            {
              color: billingPeriod === "monthly" ? colors.onPrimary : theme.palette.neutral[400],
            },
          ]}
        >
          Monthly
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.billingButton,
          billingPeriod === "yearly" && [
            styles.billingButtonActive,
            { backgroundColor: colors.primary },
          ],
        ]}
        onPress={() => onToggle("yearly")}
        testID="billing-yearly"
        accessibilityLabel="Yearly billing"
        accessibilityRole="button"
      >
        <Text
          style={[
            styles.billingButtonText,
            {
              color: billingPeriod === "yearly" ? colors.onPrimary : theme.palette.neutral[400],
            },
          ]}
        >
          Yearly
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  billingToggle: {
    flexDirection: "row",
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
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  billingButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
