/**
 * Revenue Metrics Section Component
 * Displays revenue analytics (ARPU, Conversion, Churn)
 */

import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  revenueGrid: {
    flexDirection: "row",
    gap: 12,
  },
  revenueCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  revenueLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  revenueValue: {
    fontSize: 18,
    fontWeight: "bold",
  },
});
}


interface RevenueData {
  averageRevenuePerUser: number;
  conversionRate: number;
  churnRate: number;
}

interface RevenueMetricsSectionProps {
  revenue: RevenueData;
}

const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export const RevenueMetricsSection: React.FC<RevenueMetricsSectionProps> = ({
  revenue,
}) => {
    const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={styles.revenueGrid}>
      <View style={[styles.revenueCard, { backgroundColor: colors.surface }]>
        <Text style={[styles.revenueLabel, { color: colors.onMuted }]>
          ARPU
        </Text>
        <Text style={[styles.revenueValue, { color: colors.onSurface }]}>
          {formatCurrency(revenue.averageRevenuePerUser)}
        </Text>
      </View>

      <View style={[styles.revenueCard, { backgroundColor: colors.surface }]>
        <Text style={[styles.revenueLabel, { color: colors.onMuted }]>
          Conversion
        </Text>
        <Text style={[styles.revenueValue, { color: colors.onSurface }]>
          {revenue.conversionRate.toFixed(1)}%
        </Text>
      </View>

      <View style={[styles.revenueCard, { backgroundColor: colors.surface }]>
        <Text style={[styles.revenueLabel, { color: colors.onMuted }]>
          Churn
        </Text>
        <Text style={[styles.revenueValue, { color: theme.colors.danger }]>
          {revenue.churnRate.toFixed(1)}%
        </Text>
      </View>
    </View>
  );
};
