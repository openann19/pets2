/**
 * Emergency Actions Component
 * Emergency action buttons
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '@mobile/theme';

interface EmergencyActionsProps {
  onCreateAlert: () => void;
  onReportSafety: () => void;
  onFindVet: () => void;
}

export const EmergencyActions: React.FC<EmergencyActionsProps> = ({
  onCreateAlert,
  onReportSafety,
  onFindVet,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        emergencyActions: {
          padding: theme.spacing.md,
          gap: theme.spacing.md,
        },
        emergencyButton: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.lg,
          borderRadius: theme.radii.lg,
          alignItems: 'center' as const,
        },
        emergencyButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  return (
    <View style={styles.emergencyActions}>
      <TouchableOpacity
        style={[styles.emergencyButton, { backgroundColor: theme.colors.danger }]}
        onPress={onCreateAlert}
      >
        <Text style={styles.emergencyButtonText}>🚨 Create Lost Pet Alert</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.emergencyButton, { backgroundColor: theme.colors.warning }]}
        onPress={onReportSafety}
      >
        <Text style={styles.emergencyButtonText}>🛡️ Report Safety Concern</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.emergencyButton, { backgroundColor: theme.colors.info || theme.colors.primary }]}
        onPress={onFindVet}
      >
        <Text style={styles.emergencyButtonText}>🏥 Find Emergency Vet</Text>
      </TouchableOpacity>
    </View>
  );
};

