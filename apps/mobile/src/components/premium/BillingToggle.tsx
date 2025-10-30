import React from "react";
import { View, StyleSheet, TouchableOpacity, Text } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

interface BillingToggleProps {
  billingPeriod: "monthly" | "yearly";
  onToggle: (period: "monthly" | "yearly") => void;
}

export const BillingToggle: React.FC<BillingToggleProps> = ({
  billingPeriod,
  onToggle,
}) => {
  const theme = useTheme();
  const styles = React.useMemo(() => makeStyles(theme), [theme]);

  return (
    <View style={[styles.billingToggle, { backgroundColor: theme.colors.surface }]}>
      <TouchableOpacity
        style={[
          styles.billingButton,
          billingPeriod === "monthly" && [
            styles.billingButtonActive,
            { backgroundColor: theme.colors.primary },
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
              color: billingPeriod === "monthly" ? theme.colors.onPrimary : theme.colors.onMuted,
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
            { backgroundColor: theme.colors.primary },
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
              color: billingPeriod === "yearly" ? theme.colors.onPrimary : theme.colors.onMuted,
            },
          ]}
        >
          Yearly
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    billingToggle: {
      flexDirection: "row",
      borderRadius: theme.radii.lg,
      padding: theme.spacing.xs,
      marginBottom: theme.spacing["2xl"],
    },
    billingButton: {
      flex: 1,
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      alignItems: "center",
    },
    billingButtonActive: {
      shadowOpacity: 0.3,
      shadowOffset: { width: 0, height: 2 },
      shadowRadius: 4,
      elevation: 5,
    },
    billingButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
  });
