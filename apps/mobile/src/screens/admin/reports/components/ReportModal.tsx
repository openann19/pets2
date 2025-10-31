/**
 * Report Detail Modal Component
 * Shows full report details and allows status updates
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { UserReport } from '../types';

interface ReportModalProps {
  visible: boolean;
  report: UserReport | null;
  onClose: () => void;
  onUpdateStatus: (reportId: string, status: string, notes?: string) => Promise<void>;
}

export function ReportModal({
  visible,
  report,
  onClose,
  onUpdateStatus,
}: ReportModalProps): React.JSX.Element {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const handleStatusUpdate = async (status: string) => {
    if (!report) return;

    Alert.alert(
      'Update Status',
      `Are you sure you want to mark this report as ${status}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setUpdating(true);
              await onUpdateStatus(report.id, status, notes.trim() || undefined);
              setNotes('');
            } catch (error) {
              // Error handled in parent
            } finally {
              setUpdating(false);
            }
          },
        },
      ],
    );
  };

  if (!report) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Report Details</Text>
            <TouchableOpacity
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Type</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{report.type}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Reason</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{report.reason}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Description</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                {report.description || 'No description provided'}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Reporter</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                {report.reporterName} ({report.reporterEmail})
              </Text>
            </View>

            {report.reportedUserName ? (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.onMuted }]}>Reported User</Text>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                  {report.reportedUserName}
                </Text>
              </View>
            ) : null}

            {report.reportedPetName ? (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.onMuted }]}>Reported Pet</Text>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                  {report.reportedPetName}
                </Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Priority</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{report.priority}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Status</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>{report.status}</Text>
            </View>

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>Submitted</Text>
              <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                {new Date(report.submittedAt).toLocaleString()}
              </Text>
            </View>

            {report.resolvedAt ? (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.onMuted }]}>Resolved</Text>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                  {new Date(report.resolvedAt).toLocaleString()}
                </Text>
              </View>
            ) : null}

            {report.resolutionNotes ? (
              <View style={styles.section}>
                <Text style={[styles.label, { color: theme.colors.onMuted }]}>Resolution Notes</Text>
                <Text style={[styles.value, { color: theme.colors.onSurface }]}>
                  {report.resolutionNotes}
                </Text>
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={[styles.label, { color: theme.colors.onMuted }]}>
                Add Resolution Notes (optional)
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: theme.colors.bg, color: theme.colors.onSurface }]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Enter notes about resolution..."
                placeholderTextColor={theme.colors.onMuted}
                multiline
                numberOfLines={3}
              />
            </View>
          </ScrollView>

          {report.status !== 'resolved' && report.status !== 'dismissed' ? (
            <View style={[styles.actions, { borderTopColor: theme.colors.border }]}>
              <TouchableOpacity
                style={[styles.actionButton, styles.dismissButton, { backgroundColor: theme.colors.onMuted }]}
                onPress={() => handleStatusUpdate('dismissed')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <>
                    <Ionicons
                      name="close-circle"
                      size={16}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                      Dismiss
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.resolveButton, { backgroundColor: theme.colors.success }]}
                onPress={() => handleStatusUpdate('resolved')}
                disabled={updating}
              >
                {updating ? (
                  <ActivityIndicator color={theme.colors.onPrimary} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={16}
                      color={theme.colors.onPrimary}
                    />
                    <Text style={[styles.actionButtonText, { color: theme.colors.onPrimary }]}>
                      Resolve
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modal: {
      borderTopLeftRadius: theme.radii['2xl'],
      borderTopRightRadius: theme.radii['2xl'],
      maxHeight: '90%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    content: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size * 0.875,
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
    input: {
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      marginTop: theme.spacing.sm,
      minHeight: 80,
      textAlignVertical: 'top',
    },
    actions: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      borderTopWidth: 1,
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.md,
      gap: theme.spacing.sm,
    },
    dismissButton: {},
    resolveButton: {},
    actionButtonText: {
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });
