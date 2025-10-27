import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResetPasswordScreen } from "../hooks/screens/useResetPasswordScreen";
import type { RootStackScreenProps } from "../navigation/types";
import { Theme } from '../theme/unified-theme';

type ResetPasswordScreenProps = RootStackScreenProps<"ResetPassword">;

function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps): JSX.Element {
  const {
    values,
    errors,
    loading,
    setValue,
    handleSubmit,
    navigateBack,
  } = useResetPasswordScreen({ navigation, route });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={navigateBack}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Enter your new password below. Make sure it's secure and easy to
              remember.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>New Password</Text>
              <TextInput
                style={errors.password ? [styles.input, styles.inputError] : styles.input}
                value={values.password}
                onChangeText={(value) => setValue("password", value)}
                placeholder="Enter new password"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm New Password</Text>
              <TextInput
                style={errors.confirmPassword ? [styles.input, styles.inputError] : styles.input}
                value={values.confirmPassword}
                onChangeText={(value) => setValue("confirmPassword", value)}
                placeholder="Confirm new password"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.confirmPassword ? (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              ) : null}
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && styles.buttonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text
                style={[
                  styles.buttonText,
                  loading && styles.buttonTextDisabled,
                ]}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "Theme.colors.neutral[0]",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: "Theme.colors.primary[500]",
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  form: {
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 16,
    padding: 20,
    shadowColor: "Theme.colors.neutral[950]",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "Theme.colors.background.secondary",
    borderWidth: 1,
    borderColor: "Theme.colors.neutral[200]",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#333",
  },
  inputError: {
    borderColor: "Theme.colors.status.error",
  },
  errorText: {
    color: "Theme.colors.status.error",
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: "Theme.colors.primary[500]",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginVertical: 16,
  },
  buttonDisabled: {
    backgroundColor: "Theme.colors.neutral[100]",
  },
  buttonText: {
    color: "Theme.colors.neutral[0]",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonTextDisabled: {
    color: "Theme.colors.neutral[400]",
  },
});

export default ResetPasswordScreen;
