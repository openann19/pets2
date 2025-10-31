/**
 * Health Info Section Component
 */

import { BlurView } from 'expo-blur';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

interface HealthInfoSectionProps {
  healthInfo: {
    vaccinated: boolean;
    spayedNeutered: boolean;
    microchipped: boolean;
  };
  onToggleHealth: (field: string) => void;
}

export const HealthInfoSection: React.FC<HealthInfoSectionProps> = ({
  healthInfo,
  onToggleHealth,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Health Information</Text>
      <BlurView intensity={20} style={[styles.sectionCard, { borderRadius: theme.radii.md }]}>
        <View style={styles.healthGrid}>
          {Object.entries(healthInfo).map(([key, value]) => (
            <TouchableOpacity
              key={key}
              style={styles.healthItem}
              onPress={() => onToggleHealth(key)}
              testID={`health-${key}`}
              accessibilityLabel={`${key} - ${value ? 'Yes' : 'No'}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: value }}
            >
              <View
                style={[
                  styles.healthCheckbox,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  value && [styles.healthCheckboxActive, { backgroundColor: colors.primary, borderColor: colors.primary }],
                ]}
              >
                {value && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colors.onPrimary}
                  />
                )}
              </View>
              <Text style={[styles.healthText, { color: colors.onSurface }]}>
                {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
    healthGrid: {
      gap: theme.spacing.sm,
    },
    healthItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    healthCheckbox: {
      width: 24,
      height: 24,
      borderRadius: theme.radii.xs,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    healthCheckboxActive: {
      borderWidth: 2,
    },
    healthText: {
      fontSize: 16,
      fontWeight: '500',
    },
  });
}

