/**
 * Verification Modal Component
 * Displays detailed verification information in a modal
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type { Verification } from '../types';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    modalOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      borderRadius: 16,
      overflow: 'hidden',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
    },
    modalBody: {
      padding: 16,
      maxHeight: 400,
    },
    verificationInfo: {
      marginBottom: 16,
    },
    infoLabel: {
      fontSize: 12,
      fontWeight: '600',
      marginTop: 8,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 14,
    },
    documentsHeader: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 8,
    },
    documentsList: {
      maxHeight: 200,
    },
    documentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 8,
      marginBottom: 8,
    },
    documentInfo: {
      flex: 1,
      marginStart: theme.spacing.sm,
    },
    documentName: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 2,
    },
    documentType: {
      fontSize: 12,
    },
    modalActions: {
      flexDirection: 'row',
      padding: 16,
      gap: 8,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
      gap: 4,
    },
    actionButtonText: {
      fontSize: 14,
      color: 'white',
      fontWeight: '600',
    },
  });
}

interface VerificationModalProps {
  verification: Verification;
  onClose: () => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestInfo: (id: string, message: string) => Promise<void>;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  verification,
  onClose,
  onApprove,
  onReject,
  onRequestInfo,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  return (
    <View style={styles.modalOverlay}>
      <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
            Verification Details
          </Text>
          <TouchableOpacity
            onPress={onClose}
            testID="close-modal-button"
            accessibilityLabel="Close modal"
            accessibilityRole="button"
          >
            <Ionicons
              name="close"
              size={24}
              color={colors.onSurface}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <View style={styles.verificationInfo}>
            <Text style={[styles.infoLabel, { color: colors.onMuted }]}>User:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {verification.userName} ({verification.userEmail})
            </Text>

            <Text style={[styles.infoLabel, { color: colors.onMuted }]}>Type:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {verification.type.replace('_', ' ')}
            </Text>

            <Text style={[styles.infoLabel, { color: colors.onMuted }]}>Submitted:</Text>
            <Text style={[styles.infoValue, { color: colors.onSurface }]}>
              {new Date(verification.submittedAt).toLocaleString()}
            </Text>

            {verification.notes ? (
              <>
                <Text style={[styles.infoLabel, { color: colors.onMuted }]}>Notes:</Text>
                <Text style={[styles.infoValue, { color: colors.onSurface }]}>
                  {verification.notes}
                </Text>
              </>
            ) : null}
          </View>

          <Text style={[styles.documentsHeader, { color: colors.onSurface }]}>
            Documents:
          </Text>
          <FlatList
            data={verification.documents}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={[styles.documentItem, { backgroundColor: colors.bg }]}>
                <Ionicons
                  name="document"
                  size={20}
                  color={colors.primary}
                />
                <View style={styles.documentInfo}>
                  <Text style={[styles.documentName, { color: colors.onSurface }]}>
                    {item.name}
                  </Text>
                  <Text style={[styles.documentType, { color: colors.onMuted }]}>
                    {item.type.replace('_', ' ')}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Ionicons
                    name="eye"
                    size={20}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            )}
            style={styles.documentsList}
          />
        </View>

        {verification.status === 'pending' && (
          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.success }]}
              onPress={() => {
                void onApprove(verification.id);
              }}
              testID="modal-approve-button"
              accessibilityLabel="Approve verification"
              accessibilityRole="button"
            >
              <Ionicons
                name="checkmark"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => {
                Alert.prompt(
                  'Request Additional Information',
                  'What additional information is needed?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Request',
                      onPress: (info) => {
                        if (info?.trim()) {
                          void onRequestInfo(verification.id, info.trim());
                        }
                      },
                    },
                  ],
                  'plain-text',
                  '',
                  'default',
                );
              }}
              testID="modal-request-info-button"
              accessibilityLabel="Request additional information"
              accessibilityRole="button"
            >
              <Ionicons
                name="information"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Request Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.danger }]}
              onPress={() => {
                Alert.prompt(
                  'Reject Verification',
                  'Please provide a reason for rejection:',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Reject',
                      style: 'destructive',
                      onPress: (reason) => {
                        if (reason?.trim()) {
                          void onReject(verification.id, reason.trim());
                        }
                      },
                    },
                  ],
                  'plain-text',
                  '',
                  'default',
                );
              }}
              testID="modal-reject-button"
              accessibilityLabel="Reject verification"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

