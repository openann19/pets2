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

import { useLoginScreen } from "../hooks/screens/useLoginScreen";
import type { RootStackScreenProps } from "../navigation/types";

type LoginScreenProps = RootStackScreenProps<"Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const {
    values,
    errors,
    setValue,
    handleSubmit,
    navigateToRegister,
    navigateToForgotPassword,
  } = useLoginScreen({ navigation });

  const handleForgotPassword = () => {
    navigateToForgotPassword();
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>PawfectMatch</Text>
            <Text style={styles.tagline}>Find your pet's perfect match</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>Welcome Back</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={values.email}
                onChangeText={(text) => setValue("email", text)}
                placeholder="your@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={values.password}
                onChangeText={(text) => setValue("password", text)}
                placeholder="********"
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={navigateToRegister}>
                <Text style={styles.registerLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ec4899", // pink-600
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: "#ec4899",
    fontSize: 14,
  },
  button: {
    backgroundColor: "#ec4899",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginVertical: 16,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    color: "#666",
  },
  registerLink: {
    color: "#ec4899",
    fontWeight: "bold",
  },
});

export default LoginScreen;
