/**
 * 🔐 Password Confirmation Modal
 * Used for GDPR account deletion and other sensitive operations
 */

import React, { useState } from "react";
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { logger } from "@pawfectmatch/core";
import { Theme } from '../theme/unified-theme';

interface PasswordConfirmationModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  error?: string | null;
  isLoading?: boolean;
}

export function PasswordConfirmationModal({
  visible,
  onClose,
  onConfirm,
  title = "Confirm Your Password",
  message = "Please enter your password to confirm this action",
  confirmText = "Confirm",
  cancelText = "Cancel",
  error,
  isLoading = false,
}: PasswordConfirmationModalProps): React.JSX.Element {
  const [password, setPassword] = useState("");
  const [isSecureTextEntry, setIsSecureTextEntry] = useState(true);

  const handleConfirm = async () => {
    if (!password.trim()) {
      Alert.alert("Error", "Please enter your password");
      return;
    }

    try {
      await onConfirm(password);
      setPassword("");
      onClose();
    } catch (err) {
      // Error is handled by parent component
      logger.error("Password confirmation failed", { error: err });
    }
  };

  const handleCancel = () => {
    setPassword("");
    onClose();
  };

  const togglePasswordVisibility = () => {
    setIsSecureTextEntry((prev) => !prev);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed" size={28} color="Theme.colors.status.error" />
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Password Input */}
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter your password"
              secureTextEntry={isSecureTextEntry}
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.eyeIcon}
              disabled={isLoading}
            >
              <Ionicons
                name={isSecureTextEntry ? "eye-off" : "eye"}
                size={20}
                color="Theme.colors.neutral[500]"
              />
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={16} color="Theme.colors.status.error" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={StyleSheet.flatten([styles.button, styles.cancelButton])}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>{cancelText}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([styles.button, styles.confirmButton])}
              onPress={handleConfirm}
              disabled={isLoading || !password.trim()}
            >
              <LinearGradient
                colors={
                  isLoading || !password.trim()
                    ? ["Theme.colors.neutral[400]", "Theme.colors.neutral[500]"]
                    : ["Theme.colors.status.error", "#DC2626"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradientButton}
              >
                <Text style={styles.confirmButtonText}>
                  {isLoading ? "Processing..." : confirmText}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 20,
    padding: 24,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "Theme.colors.neutral[900]",
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    textAlign: "center",
    lineHeight: 20,
  },
  passwordContainer: {
    position: "relative",
    marginBottom: 16,
  },
  passwordInput: {
    height: 50,
    backgroundColor: "Theme.colors.background.secondary",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
  },
  eyeIcon: {
    position: "absolute",
    right: 16,
    top: 15,
    padding: 4,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: "Theme.colors.status.error",
    marginLeft: 8,
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "Theme.colors.neutral[100]",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[700]",
  },
  confirmButton: {
    overflow: "hidden",
  },
  gradientButton: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[0]",
  },
});
