/**
 * Sighting Modal Component
 * Form for reporting pet sighting
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { SightingFormData } from '../types';

interface SightingModalProps {
  visible: boolean;
  formData: SightingFormData;
  onClose: () => void;
  onUpdateForm: (field: keyof SightingFormData, value: string) => void;
  onUseCurrentLocation: () => void;
  onSubmit: () => void;
}

export const SightingModal: React.FC<SightingModalProps> = ({
  visible,
  formData,
  onClose,
  onUpdateForm,
  onUseCurrentLocation,
  onSubmit,
}) => {
  const theme = useTheme();

  const styles = React.useMemo(
    () =>
      StyleSheet.create({
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'center' as const,
          alignItems: 'center' as const,
        },
        modalContent: {
          borderRadius: theme.radii.lg,
          padding: theme.spacing.md,
          margin: theme.spacing.md,
          maxHeight: '90%',
          width: '90%',
          maxWidth: 400,
          backgroundColor: theme.colors.bg,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '600' as const,
          marginBottom: theme.spacing.md,
          textAlign: 'center' as const,
          color: theme.colors.onSurface,
        },
        modalForm: {
          maxHeight: 500,
        },
        formLabel: {
          fontSize: 16,
          fontWeight: '500' as const,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        input: {
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          fontSize: 16,
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderColor: theme.colors.border,
        },
        textArea: {
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          fontSize: 16,
          minHeight: 80,
          textAlignVertical: 'top' as const,
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderColor: theme.colors.border,
        },
        currentLocationButton: {
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
          marginTop: theme.spacing.sm,
          backgroundColor: theme.colors.primary,
        },
        currentLocationText: {
          fontSize: 14,
          fontWeight: '500' as const,
          color: theme.colors.onPrimary,
        },
        modalActions: {
          flexDirection: 'row' as const,
          justifyContent: 'space-between' as const,
          marginTop: theme.spacing.md,
          gap: theme.spacing.md,
        },
        modalButton: {
          flex: 1,
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          alignItems: 'center' as const,
        },
        cancelButton: {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        cancelButtonText: {
          fontSize: 16,
          fontWeight: '500' as const,
          color: theme.colors.onSurface,
        },
        reportButton: {
          backgroundColor: theme.colors.success,
        },
        reportButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Report Pet Sighting</Text>

          <View style={styles.modalForm}>
            <Text style={styles.formLabel}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="Where did you see the pet?"
              placeholderTextColor={theme.colors.onMuted}
              value={formData.location}
              onChangeText={(value) => onUpdateForm('location', value)}
            />

            <TouchableOpacity style={styles.currentLocationButton} onPress={onUseCurrentLocation}>
              <Text style={styles.currentLocationText}>📍 Use Current Location</Text>
            </TouchableOpacity>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Describe what you saw, pet's behavior, direction of travel..."
              placeholderTextColor={theme.colors.onMuted}
              value={formData.description}
              onChangeText={(value) => onUpdateForm('description', value)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.formLabel}>Contact Info (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="How can the owner reach you?"
              placeholderTextColor={theme.colors.onMuted}
              value={formData.contactInfo}
              onChangeText={(value) => onUpdateForm('contactInfo', value)}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.reportButton]} onPress={onSubmit}>
              <Text style={styles.reportButtonText}>📍 Report Sighting</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

