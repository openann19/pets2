/**
 * Compatibility Breakdown Component
 * Displays detailed compatibility breakdown
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { SemanticColors } from '@mobile/theme/contracts';
import { useTranslation } from 'react-i18next';

interface Breakdown {
  temperament: number;
  activity: number;
  size: number;
  age: number;
  interests: number;
  lifestyle: number;
}

interface CompatibilityBreakdownProps {
  breakdown: Breakdown;
}

const getScoreColor = (score: number, colors: SemanticColors): string => {
  if (score >= 90) return colors.success;
  if (score >= 80) return colors.primary;
  if (score >= 70) return colors.warning;
  return colors.danger;
};

export const CompatibilityBreakdown: React.FC<CompatibilityBreakdownProps> = ({ breakdown }) => {
  const theme = useTheme();
  const { t } = useTranslation('common');
  const styles = useMemo(() => {
    return StyleSheet.create({
      resultCard: {
        borderRadius: theme.radii.lg,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.elevation2,
      },
      resultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
      },
      resultTitle: {
        fontSize: theme.typography.body.size,
        fontWeight: theme.typography.h2.weight,
        marginLeft: theme.spacing.xs,
        color: theme.colors.onSurface,
      },
      breakdownList: {
        gap: theme.spacing.sm,
      },
      breakdownItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
      },
      breakdownLabel: {
        fontSize: 14,
        width: 80,
        color: theme.colors.onMuted,
      },
      breakdownBar: {
        flex: 1,
        height: 8,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radii.sm,
        overflow: 'hidden',
      },
      breakdownFill: {
        height: '100%',
        borderRadius: theme.radii.sm,
      },
      breakdownScore: {
        fontSize: 14,
        fontWeight: theme.typography.h2.weight,
        width: 40,
        textAlign: 'right',
        color: theme.colors.onSurface,
      },
    });
  }, [theme]);

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="bar-chart"
          size={24}
          color={theme.colors.primary}
        />
        <Text style={styles.resultTitle}>
          {t('compatibility.breakdown_title', 'Compatibility Breakdown')}
        </Text>
      </View>
      <View style={styles.breakdownList}>
        {Object.entries(breakdown).map(([factor, score]) => (
          <View
            key={factor}
            style={styles.breakdownItem}
          >
            <Text style={styles.breakdownLabel}>{t(`compatibility.factors.${factor}`)}</Text>
            <View style={styles.breakdownBar}>
              <View
                style={[
                  styles.breakdownFill,
                  {
                    width: `${score}%`,
                    backgroundColor: getScoreColor(score, theme.colors),
                  },
                ]}
              />
            </View>
            <Text style={styles.breakdownScore}>{t('compatibility.percentage', { score })}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
