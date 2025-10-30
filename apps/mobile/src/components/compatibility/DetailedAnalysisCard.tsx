/**
 * Detailed Analysis Card Component
 * Shows detailed text analysis and tips
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function createStyles(theme: AppTheme) {
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
      marginBottom: theme.spacing.md,
      gap: theme.spacing.xs,
    },
    resultTitle: {
      fontSize: theme.typography.body.size,
      fontWeight: '600',
      color: theme.colors.onSurface,
    },
    detailedText: {
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.lineHeight,
      color: theme.colors.onSurface,
    },
  });
}

interface DetailedAnalysisCardProps {
  detailed: string;
}

export const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({ detailed }) => {
  const theme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.resultCard}>
      <View style={styles.resultHeader}>
        <Ionicons
          name="document-text"
          size={24}
          color={colors.onMuted}
        />
        <Text style={styles.resultTitle}>Detailed Analysis</Text>
      </View>
      <Text style={styles.detailedText}>{detailed}</Text>
    </View>
  );
};
