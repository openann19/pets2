/**
 * Description Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface DescriptionSectionProps {
  description: string;
  onDescriptionChange: (value: string) => void;
}

export const DescriptionSection: React.FC<DescriptionSectionProps> = ({
  description,
  onDescriptionChange,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Description *</Text>
      <BlurView intensity={20} style={[styles.sectionCard, { borderRadius: theme.radii.md }]}>
        <TextInput
          style={[
            styles.textInput,
            styles.textArea,
            { borderColor: colors.border, backgroundColor: colors.surface, color: colors.onSurface },
          ]}
          value={description}
          onChangeText={onDescriptionChange}
          placeholder="Tell potential adopters about your pet's personality, habits, and what makes them special..."
          placeholderTextColor={colors.onMuted}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </BlurView>
    </View>
  );
};

function makeStyles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      padding: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.body.size * 1.125,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.sm,
    },
    sectionCard: {
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    textInput: {
      borderWidth: 1,
      borderRadius: theme.radii.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.sm,
      fontSize: 16,
    },
    textArea: {
      minHeight: 120,
      textAlignVertical: 'top',
    },
  });
}

