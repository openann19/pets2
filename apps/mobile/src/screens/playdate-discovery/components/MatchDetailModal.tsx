/**
 * Match Detail Modal Component
 * Modal showing detailed match information
 */
import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { useTheme } from '@mobile/theme';
import { CompatibilityBreakdown } from './CompatibilityBreakdown';
import type { PlaydateMatch } from '../types';

interface MatchDetailModalProps {
  visible: boolean;
  match: PlaydateMatch | null;
  onClose: () => void;
  onCreatePlaydate: (match: PlaydateMatch) => void;
}

export const MatchDetailModal: React.FC<MatchDetailModalProps> = ({
  visible,
  match,
  onClose,
  onCreatePlaydate,
}) => {
  const theme = useTheme();

  if (!match) return null;

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
          padding: theme.spacing.md,
        },
        modalContent: {
          borderRadius: theme.radii.lg,
          maxHeight: '80%',
          width: '100%',
          maxWidth: 400,
          backgroundColor: theme.colors.bg,
        },
        modalHeader: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          alignItems: 'center' as const,
          padding: theme.spacing.md,
          borderBottomWidth: 1,
          borderBottomColor: theme.colors.border,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          color: theme.colors.onSurface,
        },
        closeButton: {
          fontSize: 20,
          fontWeight: '600' as const,
          color: theme.colors.primary,
        },
        modalBody: {
          padding: theme.spacing.md,
          maxHeight: 400,
        },
        petSummary: {
          marginBottom: theme.spacing.md,
        },
        petSummaryName: {
          fontSize: 20,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onSurface,
        },
        petSummaryDetails: {
          fontSize: 14,
          color: theme.colors.onMuted,
        },
        safetyNotes: {
          marginBottom: theme.spacing.md,
        },
        safetyTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        safetyNote: {
          fontSize: 14,
          marginBottom: theme.spacing.xs,
          color: theme.colors.warning,
        },
        activities: {
          marginBottom: theme.spacing.md,
        },
        activitiesTitle: {
          fontSize: 16,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.sm,
          color: theme.colors.onSurface,
        },
        activity: {
          fontSize: 14,
          marginBottom: theme.spacing.xs,
          color: theme.colors.onMuted,
        },
        modalActions: {
          flexDirection: 'row' as const,
          padding: theme.spacing.md,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border,
          gap: theme.spacing.sm,
        },
        modalButton: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
        },
        secondaryButton: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        secondaryButtonText: {
          fontSize: 16,
          fontWeight: '500' as const,
          color: theme.colors.onSurface,
        },
        primaryButton: {
          backgroundColor: theme.colors.primary,
        },
        primaryButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Playmate Details</Text>
            <TouchableOpacity
              testID="close-modal-button"
              accessibilityRole="button"
              accessibilityLabel="Close modal"
              accessibilityHint="Closes the playmate details modal"
              onPress={onClose}
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            <View style={styles.petSummary}>
              <Text style={styles.petSummaryName}>{match.pet2.name}</Text>
              <Text style={styles.petSummaryDetails}>
                {match.pet2.breed} • {match.pet2.age} months • {match.distanceKm.toFixed(1)}km away
              </Text>
            </View>

            <CompatibilityBreakdown match={match} />

            {match.safetyNotes && match.safetyNotes.length > 0 && (
              <View style={styles.safetyNotes}>
                <Text style={styles.safetyTitle}>🛡️ Safety Notes</Text>
                {match.safetyNotes.map((note, index) => (
                  <Text key={index} style={styles.safetyNote}>
                    • {note}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.activities}>
              <Text style={styles.activitiesTitle}>🎾 Suggested Activities</Text>
              {match.recommendedActivities.map((activity, index) => (
                <Text key={index} style={styles.activity}>
                  • {activity}
                </Text>
              ))}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              testID="modal-close-button"
              accessibilityRole="button"
              accessibilityLabel="Close playmate details"
              style={[styles.modalButton, styles.secondaryButton]}
              onPress={onClose}
            >
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="modal-create-playdate-button"
              accessibilityRole="button"
              accessibilityLabel={`Create playdate with ${match.pet2.name}`}
              accessibilityHint="Creates a new playdate and navigates to the playdate builder"
              style={[styles.modalButton, styles.primaryButton]}
              onPress={() => {
                onClose();
                onCreatePlaydate(match);
              }}
            >
              <Text style={styles.primaryButtonText}>🐾 Create Playdate</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

