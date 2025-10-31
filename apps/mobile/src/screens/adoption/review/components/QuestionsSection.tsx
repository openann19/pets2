/**
 * Questions Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
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
    questionsList: {
      gap: theme.spacing.md,
    },
    questionItem: {
      gap: theme.spacing.xs,
    },
    questionText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h2.weight,
    },
    answerText: {
      fontSize: theme.typography.body.size,
      lineHeight: theme.typography.body.lineHeight * 1.4,
    },
  });
}

interface QuestionsSectionProps {
  application: Application;
}

export const QuestionsSection: React.FC<QuestionsSectionProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Application Questions</Text>
      <BlurView intensity={20} style={styles.sectionCard}>
        <View style={styles.questionsList}>
          {application.questions.map((qa, index) => (
            <View key={index} style={styles.questionItem}>
              <Text style={[styles.questionText, { color: colors.onSurface }]}>
                {qa.question}
              </Text>
              <Text style={[styles.answerText, { color: colors.onMuted }]}>{qa.answer}</Text>
            </View>
          ))}
        </View>
      </BlurView>
    </View>
  );
};

