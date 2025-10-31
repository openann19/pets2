/**
 * Disclosures Tab Component
 * Displays health disclosure information
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@/theme';
import { HEALTH_DISCLOSURE_CATEGORIES } from '../types';

interface DisclosuresTabProps {
  onManageDisclosures: () => void;
}

export const DisclosuresTab: React.FC<DisclosuresTabProps> = ({ onManageDisclosures }) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        tabContent: {
          padding: theme.spacing.md,
        },
        sectionTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        sectionDescription: {
          fontSize: 14,
          marginBottom: theme.spacing.md,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
        disclosureCard: {
          padding: theme.spacing.md,
          borderRadius: theme.radii.lg,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.surface,
        },
        disclosureTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        disclosureText: {
          fontSize: 14,
          lineHeight: 20,
          color: theme.colors.onMuted,
        },
        disclosureButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.lg,
          alignItems: 'center' as const,
          marginTop: theme.spacing.md,
          backgroundColor: theme.colors.primary,
        },
        disclosureButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Health Disclosures 🏥</Text>

      <Text style={styles.sectionDescription}>
        Important health information to consider for safe pet interactions.
      </Text>

      {HEALTH_DISCLOSURE_CATEGORIES.map((category, index) => (
        <View key={index} style={styles.disclosureCard}>
          <Text style={styles.disclosureTitle}>{category.title}</Text>
          <Text style={styles.disclosureText}>{category.description}</Text>
        </View>
      ))}

      <TouchableOpacity style={styles.disclosureButton} onPress={onManageDisclosures}>
        <Text style={styles.disclosureButtonText}>📋 Manage Health Disclosures</Text>
      </TouchableOpacity>
    </View>
  );
};

