import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { logger, useAuthStore } from "@pawfectmatch/core";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/AuthService";
import { biometricService } from "../services/BiometricService";

// Define the navigation props type
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const {
    setUser,
    setTokens,
    setError,
    setIsLoading: setAuthLoading,
  } = useAuthStore();

  // Check biometric availability on mount
  useEffect(() => {
    const checkBiometricAvailability = async () => {
      try {
        const capabilities = await biometricService.checkBiometricSupport();
        const enabled = await biometricService.isBiometricEnabled();
        setBiometricAvailable(
          capabilities.hasHardware && capabilities.isEnrolled,
        );
        setBiometricEnabled(enabled);
      } catch (error) {
        logger.error("Failed to check biometric availability", { error });
      }
    };

    void checkBiometricAvailability();
  }, []);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthLoading(true);
    setError(null);

    try {
      const response = await authService.login({ email, password });

      // Store authentication data
      setUser(response.user);
      setTokens(response.accessToken, response.refreshToken);

      // Store remember me preference
      if (rememberMe) {
        await authService.storeRememberMe(email);
      }

      logger.info("Login successful", { userId: response.user.id });
      navigation.navigate("Home");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Login failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Login Failed", errorMessage);
      logger.error("Login failed", { error, email });
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    if (!biometricAvailable) return;

    setIsLoading(true);
    setAuthLoading(true);
    setError(null);

    try {
      const result = await biometricService.authenticate(
        "Login to PawfectMatch",
      );

      if (result.success) {
        // Get stored credentials and login
        const credentials = await authService.getBiometricCredentials();
        if (credentials) {
          const response = await authService.login({
            email: credentials.email,
            password: credentials.password,
          });

          setUser(response.user);
          setTokens(response.accessToken, response.refreshToken);

          logger.info("Biometric login successful", {
            userId: response.user.id,
          });
          navigation.navigate("Home");
        } else {
          throw new Error("No biometric credentials found");
        }
      } else {
        throw new Error(result.error || "Biometric authentication failed");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Biometric login failed";
      setError(errorMessage);
      logger.error("Biometric login failed", { error });
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate("ForgotPassword");
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
                value={email}
                onChangeText={setEmail}
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
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View style={styles.checkbox}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color="#ec4899" />
                  )}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Biometric Login */}
            {biometricAvailable && biometricEnabled && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={handleBiometricLogin}
                disabled={isLoading}
              >
                <Ionicons name="finger-print" size={24} color="#ec4899" />
                <Text style={styles.biometricButtonText}>
                  Use {biometricService.getBiometricTypeName()}
                </Text>
              </TouchableOpacity>
            )}

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
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
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  passwordToggle: {
    padding: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#ec4899",
    borderRadius: 4,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rememberMeText: {
    fontSize: 14,
    color: "#333",
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
  buttonDisabled: {
    backgroundColor: "#d1d5db",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#ec4899",
    borderRadius: 8,
    padding: 15,
    marginBottom: 16,
  },
  biometricButtonText: {
    color: "#ec4899",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
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
