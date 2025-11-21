import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { logger, useAuthStore } from "@pawfectmatch/core";
import React, { useState, useEffect } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { authService } from "../services/AuthService";
import { biometricService } from "../services/BiometricService";
import { Button } from "../components/Button";
import Text, {
  Heading1,
  Heading2,
  Body,
  Label,
  BodySmall,
} from "../components/Text";
import {
  getTextColorString,
  getPrimaryColor,
  getStatusColor,
} from "../theme/helpers";

// Define the navigation props type
type RootStackParamList = {
  Home: undefined;
  Login: undefined;
  Register: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, "Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  // Get theme colors using helpers
  const primaryColor = getPrimaryColor();
  const textSecondaryColor = getTextColorString("secondary");
  const errorColor = getStatusColor("error");

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

      logger.info("Login successful", { userId: response.user._id });
      navigation.navigate("Home" as never);
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
            userId: response.user._id,
          });
          navigation.navigate("Home" as never);
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
    navigation.navigate("ForgotPassword" as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Heading1 color="primary" style={styles.logo}>
              PawfectMatch
            </Heading1>
            <Body color="secondary" style={styles.tagline}>
              Find your pet&apos;s perfect match
            </Body>
          </View>

          <View style={styles.form}>
            <Heading2 color="primary" style={styles.title}>
              Welcome Back
            </Heading2>

            <View style={styles.inputGroup}>
              <Label color="primary" style={styles.label}>
                Email
              </Label>
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
                <Text style={[styles.errorText, { color: errorColor }]}>
                  {errors.email}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Label color="primary" style={styles.label}>
                Password
              </Label>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="********"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onPress={() => {
                    setShowPassword(!showPassword);
                  }}
                  style={styles.passwordToggle}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={textSecondaryColor}
                  />
                </Button>
              </View>
              {errors.password && (
                <Text style={[styles.errorText, { color: errorColor }]}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* Remember Me and Forgot Password */}
            <View style={styles.optionsContainer}>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  setRememberMe(!rememberMe);
                }}
                style={styles.rememberMeContainer}
              >
                <View style={styles.checkbox}>
                  {rememberMe && (
                    <Ionicons name="checkmark" size={16} color={primaryColor} />
                  )}
                </View>
                <BodySmall color="primary" style={styles.rememberMeText}>
                  Remember me
                </BodySmall>
              </Button>

              <Button variant="ghost" size="sm" onPress={handleForgotPassword}>
                <BodySmall color="primary" style={styles.forgotPasswordText}>
                  Forgot password?
                </BodySmall>
              </Button>
            </View>

            {/* Login Button */}
            <Button
              title="Sign In"
              variant="primary"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
              onPress={handleLogin}
              style={styles.button}
              glowEffect
              rippleEffect
              pressEffect
            />

            {/* Biometric Login */}
            {biometricAvailable && biometricEnabled && (
              <Button
                variant="outline"
                size="lg"
                onPress={handleBiometricLogin}
                disabled={isLoading}
                style={styles.biometricButton}
                leftIcon="finger-print"
                glowEffect
                rippleEffect
              >
                <Body color="primary" style={styles.biometricButtonText}>
                  Use {biometricService.getBiometricTypeName()}
                </Body>
              </Button>
            )}

            <View style={styles.registerContainer}>
              <Body color="secondary" style={styles.registerText}>
                Don&apos;t have an account?{" "}
              </Body>
              <Button
                variant="ghost"
                size="sm"
                onPress={() => {
                  navigation.navigate("Register" as never);
                }}
              >
                <Body color="primary" style={styles.registerLink}>
                  Sign Up
                </Body>
              </Button>
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
    marginBottom: 8,
  },
  tagline: {
    textAlign: "center",
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
    marginBottom: 24,
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 6,
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
    padding: 8,
    minWidth: 40,
  },
  errorText: {
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
    padding: 0,
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
    // Color handled by ModernTypography
  },
  forgotPasswordText: {
    // Color handled by ModernTypography
  },
  button: {
    marginVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    // Color handled by Button component
  },
  biometricButton: {
    marginBottom: 16,
  },
  biometricButtonText: {
    marginLeft: 8,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    // Color handled by ModernTypography
  },
  registerLink: {
    fontWeight: "bold",
  },
});

export default LoginScreen;
