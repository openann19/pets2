/**
 * Period Selector Component
 * Displays period selection buttons (7d, 30d, 90d)
 */

import * as Haptics from 'expo-haptics';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      gap: theme.spacing.xs,
    },
    periodButton: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      borderRadius: theme.radii.lg,
    },
    periodText: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
    },
  });
}

interface PeriodSelectorProps {
  selectedPeriod: '7d' | '30d' | '90d';
  onPeriodChange: (period: '7d' | '30d' | '90d') => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const handlePeriodChange = (period: '7d' | '30d' | '90d') => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPeriodChange(period);
  };

  return (
    <View style={styles.container}>
      {(['7d', '30d', '90d'] as const).map((period) => (
        <TouchableOpacity
          key={period}
          style={[
            styles.periodButton,
            {
              backgroundColor: selectedPeriod === period ? colors.primary : colors.surface,
            },
          ]}
          onPress={() => handlePeriodChange(period)}
          testID={`period-selector-${period}`}
          accessibilityLabel={`Select ${period} period`}
          accessibilityRole="button"
          accessibilityState={{ selected: selectedPeriod === period }}
        >
          <Text
            style={[
              styles.periodText,
              {
                color: selectedPeriod === period ? colors.onPrimary : colors.onSurface,
              },
            ]}
          >
            {period}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

