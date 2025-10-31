/**
 * User Actions Modal
 * Modal for delete and reset password actions
 */

import { Ionicons } from '@expo/vector-icons';
import { memo, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';

interface UserActionsModalProps {
  visible: boolean;
  userName: string;
  userEmail: string;
  isLoading: boolean;
  onClose: () => void;
  onDelete: (reason?: string) => void;
  onResetPassword: () => void;
}

export const UserActionsModal = memo<UserActionsModalProps>(
  ({ visible, userName, userEmail, isLoading, onClose, onDelete, onResetPassword }) => {
    const theme = useTheme();
    const styles = useMemo(() => makeStyles(theme), [theme]);

    const handleDelete = () => {
      Alert.prompt(
        'Delete User',
        `Are you sure you want to delete ${userName}? This action cannot be undone. All user data, pets, and matches will be permanently deleted.\n\nPlease provide a reason:`,
        [
          { text: 'Cancel', style: 'cancel', onPress: onClose },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: (reason) => {
              onDelete(reason?.trim());
            },
          },
        ],
        'plain-text',
        '',
        'default',
      );
    };

    const handleResetPassword = () => {
      Alert.alert(
        'Reset Password',
        `Generate a new temporary password for ${userName}? The user will need to change it on their next login.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Reset',
            onPress: () => {
              onResetPassword();
            },
          },
        ],
      );
    };

    return (
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={onClose}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.colors.onSurface }]}>
                User Actions
              </Text>
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

            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: theme.colors.onSurface }]}>{userName}</Text>
              <Text style={[styles.userEmail, { color: theme.colors.onMuted }]}>{userEmail}</Text>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.info }]}
                onPress={handleResetPassword}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Reset user password"
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="key-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionButtonText}>Reset Password</Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
                onPress={handleDelete}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Delete user"
              >
                {isLoading ? (
                  <ActivityIndicator
                    size="small"
                    color="#FFFFFF"
                  />
                ) : (
                  <>
                    <Ionicons
                      name="trash-outline"
                      size={20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.actionButtonText}>Delete User</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  },
);

UserActionsModal.displayName = 'UserActionsModal';

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: theme.spacing.lg,
    },
    container: {
      width: '100%',
      maxWidth: 400,
      borderRadius: theme.radii.xl,
      padding: theme.spacing.lg,
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
    },
    userInfo: {
      marginBottom: theme.spacing.lg,
      paddingBottom: theme.spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    userName: {
      fontSize: theme.typography.h2.size,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs,
    },
    userEmail: {
      fontSize: theme.typography.body.size,
    },
    actions: {
      gap: theme.spacing.md,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      padding: theme.spacing.md,
      borderRadius: theme.radii.lg,
      gap: theme.spacing.sm,
    },
    actionButtonText: {
      color: '#FFFFFF',
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.body.weight,
    },
  });

