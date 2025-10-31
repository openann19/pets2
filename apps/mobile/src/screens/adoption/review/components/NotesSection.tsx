/**
 * Notes Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { Application } from '../types';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    section: {
      paddingHorizontal: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
    },
    sectionTitle: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.md,
    },
    sectionCard: {
      borderRadius: theme.radii.md,
      overflow: 'hidden',
      padding: theme.spacing.md,
    },
    notesText: {
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.lineHeight * 1.5,
    },
  });
}

interface NotesSectionProps {
  application: Application;
}

export const NotesSection: React.FC<NotesSectionProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Your Notes</Text>
      <BlurView intensity={20} style={styles.sectionCard}>
        <Text style={[styles.notesText, { color: colors.onSurface }]}>
          {application.notes || 'No notes added yet. Add your observations about this applicant.'}
        </Text>
      </BlurView>
    </View>
  );
};

