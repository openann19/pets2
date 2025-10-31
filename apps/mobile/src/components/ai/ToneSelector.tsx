/**
 * Tone Selector Component
 * Allows users to select the tone for AI bio generation
 */

import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

export interface Tone {
  id: string;
  label: string;
  icon: string;
  color: string;
}

interface ToneSelectorProps {
  tones: Tone[];
  selectedTone: string | null;
  onToneSelect: (toneId: string) => void;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  tones,
  selectedTone,
  onToneSelect,
}) => {
  const theme: AppTheme = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Bio Tone</Text>
      <View style={styles.toneGrid}>
        {tones.map((tone) => (
          <TouchableOpacity
            key={tone.id}
            style={[
              styles.toneOption,
              selectedTone === tone.id && styles.selectedTone,
              { borderColor: tone.color },
            ]}
            onPress={() => onToneSelect(tone.id)}
            accessibilityLabel={`Select ${tone.label} tone`}
            accessibilityRole="button"
            testID={`tone-option-${tone.id}`}
          >
            <Text style={styles.toneEmoji}>{tone.icon}</Text>
            <Text
              style={[
                styles.toneLabel,
                selectedTone === tone.id && { color: tone.color },
              ]}
            >
              {tone.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
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
    toneGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.sm,
    },
    toneOption: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    selectedTone: {
      borderWidth: 2,
    },
    toneEmoji: {
      fontSize: 24,
      marginBottom: theme.spacing.xs,
    },
    toneLabel: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      color: theme.colors.onMuted,
    },
  });
};
