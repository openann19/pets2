/**
 * Analysis Details Component
 * Displays detailed analysis text and tips
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function createStyles(theme: AppTheme) {
  const { spacing, radii, colors, typography } = theme;

  return StyleSheet.create({
    resultCard: {
      borderRadius: radii.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      backgroundColor: colors.surface,
      gap: spacing.sm,
      ...theme.shadows.elevation2,
    },
    resultHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    resultTitle: {
      fontSize: typography.h2.size,
      fontWeight: typography.h2.weight,
      color: colors.onSurface,
    },
    detailedText: {
      fontSize: typography.body.size,
      color: colors.onSurface,
      lineHeight: typography.body.lineHeight,
    },
    tipsList: {
      gap: spacing.sm,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.xs,
    },
    tipText: {
      fontSize: typography.body.size,
      flex: 1,
      color: colors.onSurface,
      lineHeight: typography.body.lineHeight,
    },
  });
}

interface Analysis {
  detailed: string;
  tips: string[];
}

interface AnalysisDetailsProps {
  analysis: Analysis;
}

export const AnalysisDetails: React.FC<AnalysisDetailsProps> = ({ analysis }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <>
      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons
            name="document-text"
            size={24}
            color={theme.colors.info}
          />
          <Text style={styles.resultTitle}>Detailed Analysis</Text>
        </View>
        <Text style={styles.detailedText}>{analysis.detailed}</Text>
      </View>

      <View style={styles.resultCard}>
        <View style={styles.resultHeader}>
          <Ionicons
            name="bulb-outline"
            size={24}
            color={theme.colors.warning}
          />
          <Text style={styles.resultTitle}>Tips for Success</Text>
        </View>
        <View style={styles.tipsList}>
          {analysis.tips.map((tip, index) => (
            <View
              key={index}
              style={styles.tipItem}
            >
              <Ionicons
                name="checkmark-circle"
                size={16}
                color={theme.colors.success}
              />
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </View>
    </>
  );
};
