/**
 * Upload Modal Component
 * Displays upload details and moderation actions
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/theme';
import type { AppTheme } from '@/theme';
import type { Upload } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface UploadModalProps {
  upload: Upload | null;
  visible: boolean;
  onClose: () => void;
  onApprove: (uploadId: string) => void;
  onReject: (upload: Upload) => void;
}

const alpha = (color: string, opacity: number): string => {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const UploadModal = ({
  upload,
  visible,
  onClose,
  onApprove,
  onReject,
}: UploadModalProps): React.JSX.Element | null => {
  const theme = useTheme();
  const styles = useMemo(() => makeStyles(theme), [theme]);

  if (!upload) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.content, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Upload Details</Text>
            <TouchableOpacity
              testID="UploadModal-button-close"
              accessibilityLabel="Close upload details"
              accessibilityRole="button"
              onPress={onClose}
            >
              <Ionicons
                name="close"
                size={24}
                color={theme.colors.onSurface}
              />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: upload.url }}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.details}>
            <DetailRow
              label="User:"
              value={upload.userName}
              theme={theme}
            />
            <DetailRow
              label="Type:"
              value={upload.type}
              theme={theme}
            />
            <DetailRow
              label="Uploaded:"
              value={new Date(upload.uploadedAt).toLocaleString()}
              theme={theme}
            />
            {upload.petName ? (
              <DetailRow
                label="Pet:"
                value={upload.petName}
                theme={theme}
              />
            ) : null}
            {upload.flagReason ? (
              <DetailRow
                label="Flag Reason:"
                value={upload.flagReason}
                theme={theme}
                labelColor={theme.colors.danger}
                valueColor={theme.colors.danger}
              />
            ) : null}
            {upload.metadata ? (
              <DetailRow
                label="File Size:"
                value={`${(upload.metadata.fileSize / 1024 / 1024).toFixed(2)} MB`}
                theme={theme}
              />
            ) : null}
          </View>

          {upload.status === 'pending' && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                testID="UploadModal-button-approve"
                accessibilityLabel="Approve upload"
                accessibilityRole="button"
                onPress={() => onApprove(upload.id)}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color={theme.colors.onPrimary}
                />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                testID="UploadModal-button-reject"
                accessibilityLabel="Reject upload"
                accessibilityRole="button"
                onPress={() => onReject(upload)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={theme.colors.onPrimary}
                />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

interface DetailRowProps {
  label: string;
  value: string;
  theme: AppTheme;
  labelColor?: string;
  valueColor?: string;
}

const DetailRow = ({ label, value, theme, labelColor, valueColor }: DetailRowProps) => (
  <View style={makeDetailStyles(theme).row}>
    <Text style={[makeDetailStyles(theme).label, { color: labelColor || theme.colors.onMuted }]}>
      {label}
    </Text>
    <Text style={[makeDetailStyles(theme).value, { color: valueColor || theme.colors.onSurface }]}>
      {value}
    </Text>
  </View>
);

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: alpha(theme.colors.bg, 0.5),
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      width: SCREEN_WIDTH - theme.spacing['2xl'],
      maxHeight: '80%',
      borderRadius: theme.radii.lg + theme.radii.xs,
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    title: {
      fontSize: theme.typography.h2.size * 0.9,
      fontWeight: theme.typography.h2.weight,
    },
    image: {
      width: '100%',
      height: 300,
    },
    details: {
      padding: theme.spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      padding: theme.spacing.lg,
      gap: theme.spacing.md,
    },
    actionButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      borderRadius: theme.radii.sm,
      gap: theme.spacing.sm,
    },
    approveButton: {
      backgroundColor: theme.colors.success,
    },
    rejectButton: {
      backgroundColor: theme.colors.danger,
    },
    actionButtonText: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onPrimary,
      fontWeight: theme.typography.h2.weight,
    },
  });

const makeDetailStyles = (theme: AppTheme) =>
  StyleSheet.create({
    row: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: theme.typography.body.size * 0.75,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    value: {
      fontSize: theme.typography.body.size * 0.875,
    },
  });

