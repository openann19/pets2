/**
 * Incident Report Modal Component
 * Form for reporting safety incidents
 */
import React from 'react';
import { View, StyleSheet, Text, TextInput, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useTheme } from '@mobile/theme';
import type { IncidentReport } from '../types';
import { INCIDENT_TYPES, SEVERITY_OPTIONS } from '../types';

interface IncidentReportModalProps {
  visible: boolean;
  reportForm: Partial<IncidentReport>;
  onClose: () => void;
  onUpdateForm: (field: keyof IncidentReport, value: any) => void;
  onSubmit: () => void;
}

export const IncidentReportModal: React.FC<IncidentReportModalProps> = ({
  visible,
  reportForm,
  onClose,
  onUpdateForm,
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
          maxHeight: '80%',
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
          maxHeight: 400,
        },
        formLabel: {
          fontSize: 16,
          fontWeight: '500' as const,
          marginBottom: theme.spacing.sm,
          marginTop: theme.spacing.md,
          color: theme.colors.onSurface,
        },
        typeOptions: {
          gap: theme.spacing.sm,
        },
        typeOption: {
          paddingVertical: theme.spacing.md,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
        },
        typeOptionText: {
          fontSize: 16,
        },
        severityOptions: {
          flexDirection: 'row' as const,
          gap: theme.spacing.sm,
        },
        severityOption: {
          flex: 1,
          paddingVertical: theme.spacing.sm,
          paddingHorizontal: theme.spacing.md,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          alignItems: 'center' as const,
        },
        severityText: {
          fontSize: 14,
          fontWeight: '500' as const,
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
        input: {
          borderWidth: 1,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          fontSize: 16,
          backgroundColor: theme.colors.surface,
          color: theme.colors.onSurface,
          borderColor: theme.colors.border,
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
        submitButton: {
          backgroundColor: theme.colors.primary,
        },
        submitButtonText: {
          fontSize: 16,
          fontWeight: '600' as const,
          color: theme.colors.onPrimary,
        },
      }),
    [theme],
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return theme.colors.danger;
      case 'high':
        return theme.colors.danger;
      case 'medium':
        return theme.colors.warning;
      default:
        return theme.colors.success;
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Report Safety Concern</Text>

          <ScrollView style={styles.modalForm}>
            <Text style={styles.formLabel}>Incident Type</Text>
            <View style={styles.typeOptions}>
              {INCIDENT_TYPES.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor:
                        reportForm.type === option.value ? theme.colors.primary : theme.colors.surface,
                      borderColor: theme.colors.border,
                    },
                  ]}
                  onPress={() => onUpdateForm('type', option.value)}
                >
                  <Text
                    style={[
                      styles.typeOptionText,
                      {
                        color:
                          reportForm.type === option.value
                            ? theme.colors.onPrimary
                            : theme.colors.onSurface,
                      },
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Severity</Text>
            <View style={styles.severityOptions}>
              {SEVERITY_OPTIONS.map((severity) => {
                const isSelected = reportForm.severity === severity.value;
                return (
                  <TouchableOpacity
                    key={severity.value}
                    style={[
                      styles.severityOption,
                      {
                        backgroundColor: isSelected
                          ? getSeverityColor(severity.value)
                          : theme.colors.surface,
                        borderColor: theme.colors.border,
                      },
                    ]}
                    onPress={() => onUpdateForm('severity', severity.value)}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        {
                          color: isSelected ? theme.colors.onPrimary : theme.colors.onSurface,
                        },
                      ]}
                    >
                      {severity.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.formLabel}>Description</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Please describe what happened..."
              placeholderTextColor={theme.colors.onMuted}
              value={reportForm.description}
              onChangeText={(description) => onUpdateForm('description', description)}
              multiline
              numberOfLines={4}
            />

            <Text style={styles.formLabel}>Location (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Where did this occur?"
              placeholderTextColor={theme.colors.onMuted}
              value={reportForm.location}
              onChangeText={(location) => onUpdateForm('location', location)}
            />

            <Text style={styles.formLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="How should we contact you?"
              placeholderTextColor={theme.colors.onMuted}
              value={reportForm.contactInfo?.name}
              onChangeText={(name) => onUpdateForm('contactInfo', { name })}
            />
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.modalButton, styles.submitButton]} onPress={onSubmit}>
              <Text style={styles.submitButtonText}>Submit Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

