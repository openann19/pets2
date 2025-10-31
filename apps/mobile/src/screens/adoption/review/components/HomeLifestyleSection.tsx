/**
 * Home & Lifestyle Section Component
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
    lifestyleGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: theme.spacing.md,
    },
    lifestyleItem: {
      width: '48%',
    },
    lifestyleLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: theme.spacing.xs / 2,
    },
    lifestyleValue: {
      fontSize: theme.typography.body.size,
    },
  });
}

interface HomeLifestyleSectionProps {
  application: Application;
}

export const HomeLifestyleSection: React.FC<HomeLifestyleSectionProps> = ({ application }) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Home & Lifestyle</Text>
      <BlurView intensity={20} style={styles.sectionCard}>
        <View style={styles.lifestyleGrid}>
          <View style={styles.lifestyleItem}>
            <Text style={[styles.lifestyleLabel, { color: colors.onMuted }]}>Home Type</Text>
            <Text style={[styles.lifestyleValue, { color: colors.onSurface }]}>
              {application.homeType}
            </Text>
          </View>
          <View style={styles.lifestyleItem}>
            <Text style={[styles.lifestyleLabel, { color: colors.onMuted }]}>Yard Size</Text>
            <Text style={[styles.lifestyleValue, { color: colors.onSurface }]}>
              {application.yardSize}
            </Text>
          </View>
          <View style={styles.lifestyleItem}>
            <Text style={[styles.lifestyleLabel, { color: colors.onMuted }]}>Work Schedule</Text>
            <Text style={[styles.lifestyleValue, { color: colors.onSurface }]}>
              {application.workSchedule}
            </Text>
          </View>
          <View style={styles.lifestyleItem}>
            <Text style={[styles.lifestyleLabel, { color: colors.onMuted }]}>Has Children</Text>
            <Text style={[styles.lifestyleValue, { color: colors.onSurface }]}>
              {application.hasChildren ? 'Yes' : 'No'}
            </Text>
          </View>
          <View style={styles.lifestyleItem}>
            <Text style={[styles.lifestyleLabel, { color: colors.onMuted }]}>Has Other Pets</Text>
            <Text style={[styles.lifestyleValue, { color: colors.onSurface }]}>
              {application.hasOtherPets ? 'Yes' : 'No'}
            </Text>
          </View>
        </View>
      </BlurView>
    </View>
  );
};

