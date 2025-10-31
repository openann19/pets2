/**
 * PremiumHeader Component
 * Header section for premium screen
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';

interface PremiumHeaderProps {
  onBack: () => void;
}

export function PremiumHeader({ onBack }: PremiumHeaderProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');

  const styles = StyleSheet.create({
    header: {
      padding: theme.spacing.lg,
      paddingTop: theme.spacing['4xl'],
      alignItems: 'center',
    },
    backButton: {
      position: 'absolute',
      top: theme.spacing['4xl'],
      left: theme.spacing.lg,
      zIndex: 10,
    },
    title: {
      fontSize: theme.typography.h1.size,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.onPrimary,
      marginBottom: theme.spacing.xs,
    },
    subtitle: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
      color: theme.colors.onPrimary,
      opacity: 0.9,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.header}>
      <TouchableOpacity
        testID="premium-back-button"
        accessibilityLabel="Back"
        accessibilityRole="button"
        onPress={onBack}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
      </TouchableOpacity>

      <Text style={styles.title}>{t('upgrade_title')}</Text>
      <Text style={styles.subtitle}>{t('upgrade_subtitle')}</Text>
    </View>
  );
}

