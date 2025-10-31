/**
 * Health Information Step Component
 */

import { useTheme } from '@/theme';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { PetFormData } from '../types';

interface HealthInfoStepProps {
  formData: PetFormData;
  updateHealthInfo: (field: string, value: boolean) => void;
}

export const HealthInfoStep: React.FC<HealthInfoStepProps> = ({ formData, updateHealthInfo }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  const healthOptions = [
    { key: 'vaccinated', label: 'Vaccinated', icon: '💉' },
    { key: 'spayedNeutered', label: 'Spayed/Neutered', icon: '🏥' },
    { key: 'microchipped', label: 'Microchipped', icon: '🔍' },
  ];

  return (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Health Information</Text>
      <Text style={styles.stepSubtitle}>Help potential matches know your pet's health status</Text>

      <View style={styles.healthOptions}>
        {healthOptions.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[
              styles.healthOption,
              formData.healthInfo[option.key as keyof typeof formData.healthInfo] &&
                styles.selectedHealthOption,
            ]}
            testID="HealthInfoStep-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={() => {
              updateHealthInfo(
                option.key,
                !formData.healthInfo[option.key as keyof typeof formData.healthInfo],
              );
            }}
          >
            <Text style={styles.healthIcon}>{option.icon}</Text>
            <Text
              style={[
                styles.healthLabel,
                formData.healthInfo[option.key as keyof typeof formData.healthInfo] &&
                  styles.selectedHealthLabel,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.healthNote}>
        💡 Providing health information helps build trust with potential adopters and ensures better
        matches.
      </Text>
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    stepContainer: {
      flex: 1,
    },
    stepTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    stepSubtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
      marginBottom: 32,
    },
    healthOptions: {
      gap: 16,
      marginBottom: 24,
    },
    healthOption: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#f9fafb',
      borderWidth: 1,
      borderColor: '#e5e7eb',
      borderRadius: 12,
      padding: 16,
    },
    selectedHealthOption: {
      backgroundColor: '#f0fdf4',
      borderColor: '#10b981',
    },
    healthIcon: {
      fontSize: 24,
      marginRight: 12,
    },
    healthLabel: {
      fontSize: 16,
      color: theme.colors.onMuted,
      fontWeight: '500',
    },
    selectedHealthLabel: {
      color: '#10b981',
      fontWeight: '600',
    },
    healthNote: {
      fontSize: 14,
      color: theme.colors.onMuted,
      lineHeight: 20,
      fontStyle: 'italic',
    },
  });
