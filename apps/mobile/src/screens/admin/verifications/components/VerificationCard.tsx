/**
 * Verification Card Component
 * Displays individual verification card in the list
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Verification } from '../types';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    card: {
      padding: 16,
      borderRadius: 12,
      marginBottom: 12,
      shadowColor: theme.colors.border,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    userInfo: {
      flex: 1,
    },
    typeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
      gap: 6,
    },
    verificationType: {
      fontSize: 12,
      fontWeight: '600',
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 2,
    },
    userEmail: {
      fontSize: 14,
    },
    badges: {
      gap: 4,
    },
    priorityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-end',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-end',
    },
    badgeText: {
      fontSize: 10,
      color: 'white',
      fontWeight: '600',
    },
    cardContent: {
      marginBottom: 12,
    },
    submittedAt: {
      fontSize: 12,
      marginBottom: 4,
    },
    documentsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginBottom: 4,
    },
    documentsCount: {
      fontSize: 12,
    },
    expiresAt: {
      fontSize: 12,
      fontWeight: '500',
    },
    quickActions: {
      flexDirection: 'row',
      gap: 8,
    },
    quickActionButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
}

interface VerificationCardProps {
  verification: Verification;
  onPress: (verification: Verification) => void;
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string, reason: string) => Promise<void>;
  onRequestInfo: (id: string, message: string) => Promise<void>;
}

const getStatusColor = (status: Verification['status'], colors: AppTheme['colors']) => {
  switch (status) {
    case 'approved':
      return colors.success;
    case 'rejected':
      return colors.danger;
    case 'pending':
      return colors.warning;
    case 'requires_info':
      return colors.info;
    default:
      return colors.border;
  }
};

const getPriorityColor = (priority: Verification['priority'], colors: AppTheme['colors']) => {
  switch (priority) {
    case 'high':
      return colors.danger;
    case 'medium':
      return colors.warning;
    case 'low':
      return colors.success;
    default:
      return colors.border;
  }
};

const getVerificationTypeIcon = (type: Verification['type']) => {
  switch (type) {
    case 'identity':
      return 'person';
    case 'pet_ownership':
      return 'paw';
    case 'veterinary':
      return 'medical';
    case 'breeder':
      return 'ribbon';
    default:
      return 'document';
  }
};

export const VerificationCard: React.FC<VerificationCardProps> = ({
  verification,
  onPress,
  onApprove,
  onReject,
  onRequestInfo,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors } = theme;

  const statusColor = getStatusColor(verification.status, colors);
  const priorityColor = getPriorityColor(verification.priority, colors);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => onPress(verification)}
      testID={`verification-card-${verification.id}`}
      accessibilityLabel={`Verification ${verification.type} from ${verification.userName}`}
      accessibilityRole="button"
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <View style={styles.typeContainer}>
            <Ionicons
              name={getVerificationTypeIcon(verification.type) as any}
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.verificationType, { color: colors.onSurface }]}>
              {verification.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.userName, { color: colors.onSurface }]}>
            {verification.userName}
          </Text>
          <Text style={[styles.userEmail, { color: colors.onMuted }]}>
            {verification.userEmail}
          </Text>
        </View>

        <View style={styles.badges}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityColor }]}>
            <Text style={styles.badgeText}>{verification.priority.toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.badgeText}>
              {verification.status.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        <Text style={[styles.submittedAt, { color: colors.onMuted }]}>
          Submitted: {new Date(verification.submittedAt).toLocaleDateString()}
        </Text>

        <View style={styles.documentsInfo}>
          <Ionicons
            name="document-text"
            size={16}
            color={colors.onMuted}
          />
          <Text style={[styles.documentsCount, { color: colors.onMuted }]}>
            {verification.documents.length} document{verification.documents.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {verification.expiresAt ? (
          <Text style={[styles.expiresAt, { color: colors.danger }]}>
            Expires: {new Date(verification.expiresAt).toLocaleDateString()}
          </Text>
        ) : null}
      </View>

      {verification.status === 'pending' && (
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.success }]}
            onPress={(e) => {
              e.stopPropagation();
              void onApprove(verification.id);
            }}
            testID={`approve-quick-${verification.id}`}
            accessibilityLabel="Approve verification"
            accessibilityRole="button"
          >
            <Ionicons
              name="checkmark"
              size={16}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.primary }]}
            onPress={(e) => {
              e.stopPropagation();
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
            testID={`request-info-quick-${verification.id}`}
            accessibilityLabel="Request additional information"
            accessibilityRole="button"
          >
            <Ionicons
              name="information"
              size={16}
              color="white"
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickActionButton, { backgroundColor: colors.danger }]}
            onPress={(e) => {
              e.stopPropagation();
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
            testID={`reject-quick-${verification.id}`}
            accessibilityLabel="Reject verification"
            accessibilityRole="button"
          >
            <Ionicons
              name="close"
              size={16}
              color="white"
            />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};

