/**
 * PremiumFooter Component
 * Footer section with restore purchases and legal text
 */
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { useTranslation } from 'react-i18next';

interface PremiumFooterProps {
  isRestoring: boolean;
  onRestorePurchases: () => void;
}

export function PremiumFooter({
  isRestoring,
  onRestorePurchases,
}: PremiumFooterProps): React.JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('premium');

  const styles = StyleSheet.create({
    footer: {
      padding: theme.spacing.lg,
      alignItems: 'center',
    },
    footerText: {
      fontSize: theme.typography.body.size * 0.75,
      color: theme.colors.onPrimary,
      opacity: 0.8,
      textAlign: 'center',
      marginBottom: theme.spacing.md,
    },
    restoreButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      marginTop: theme.spacing.md,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.onPrimary,
      opacity: 0.15,
    },
    restoreButtonText: {
      fontSize: theme.typography.body.size * 0.875,
      color: theme.colors.primary,
      fontWeight: theme.typography.h2.weight,
    },
  });

  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {t('cancel_anytime')} • {t('secure_payment')} • {t('money_back')}
      </Text>

      <TouchableOpacity
        style={styles.restoreButton}
        onPress={onRestorePurchases}
        disabled={isRestoring}
        accessibilityLabel="Restore purchases"
        accessibilityRole="button"
        accessibilityHint="Restore your previous purchases"
      >
        {isRestoring ? (
          <ActivityIndicator color={theme.colors.primary} size="small" />
        ) : (
          <>
            <Ionicons
              name="refresh-outline"
              size={16}
              color={theme.colors.primary}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.restoreButtonText}>Restore Purchases</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

