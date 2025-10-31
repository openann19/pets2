/**
 * Bio History Section Component
 * Displays previous bio generations
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

export interface BioHistoryItem {
  bio: string;
  matchScore: number;
}

interface BioHistorySectionProps {
  history: BioHistoryItem[];
  onSelectBio?: (bio: BioHistoryItem, index: number) => void;
}

export const BioHistorySection: React.FC<BioHistorySectionProps> = ({
  history,
  onSelectBio,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  if (history.length <= 1) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Previous Versions</Text>
      {history.slice(1).map((bio, index) => (
        <TouchableOpacity
          key={index}
          style={styles.historyItem}
          onPress={() => onSelectBio?.(bio, index + 1)}
          accessibilityLabel={`Previous bio version ${index + 1}`}
          accessibilityRole="button"
          testID={`bio-history-item-${index}`}
        >
          <Text
            style={styles.historyText}
            numberOfLines={2}
          >
            {bio.bio}
          </Text>
          <Text style={styles.historyScore}>{bio.matchScore}%</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const createStyles = (theme: AppTheme) => {
  return StyleSheet.create({
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.md,
    },
    historyItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.radii.md,
      marginBottom: theme.spacing.sm,
      ...theme.shadows.elevation1,
    },
    historyText: {
      flex: 1,
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
      marginRight: theme.spacing.md,
    },
    historyScore: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.success,
    },
  });
};

