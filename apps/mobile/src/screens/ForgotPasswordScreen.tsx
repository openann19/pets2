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
import { useForgotPasswordScreen } from "../hooks/screens/useForgotPasswordScreen";
import type { RootStackScreenProps } from "../navigation/types";
import { Theme } from '../theme/unified-theme';

type ForgotPasswordScreenProps = RootStackScreenProps<"ForgotPassword">;

function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): JSX.Element {
  const {
    values,
    errors,
    loading,
    setValue,
    handleSubmit,
    navigateBack,
  } = useForgotPasswordScreen({ navigation });

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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a link to reset your
              password.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={errors.email ? [styles.input, styles.inputError] : styles.input}
                value={values.email}
                onChangeText={(text) => setValue("email", text)}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                editable={!loading}
              />
              {errors.email ? (
                <Text style={styles.errorText}>{errors.email}</Text>
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
                {loading ? "Sending..." : "Send Reset Link"}
              </Text>
            </TouchableOpacity>

            <View style={styles.helpText}>
              <Text style={styles.helpTextContent}>
                Remember your password?{" "}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("Login")}
                >
                  Sign In
                </Text>
              </Text>
            </View>
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
  helpText: {
    alignItems: "center",
    marginTop: 16,
  },
  helpTextContent: {
    color: "#666",
    fontSize: 14,
  },
  linkText: {
    color: "Theme.colors.primary[500]",
    fontWeight: "bold",
  },
});

export default ForgotPasswordScreen;
