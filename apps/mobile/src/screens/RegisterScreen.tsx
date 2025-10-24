import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { logger, useAuthStore } from "@pawfectmatch/core";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

type RegisterScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "Register"
>;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

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
        setBiometricAvailable(
          capabilities.hasHardware && capabilities.isEnrolled,
        );
      } catch (error) {
        logger.error("Failed to check biometric availability", { error });
      }
    };

    void checkBiometricAvailability();
  }, []);

  const validateForm = () => {
    const newErrors: {
      email?: string;
      password?: string;
      confirmPassword?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
    } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    // Password validation with strength check
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // First name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }

    // Last name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    // Date of birth validation
    if (!formData.dateOfBirth.trim()) {
      newErrors.dateOfBirth = "Date of birth is required";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)) {
      newErrors.dateOfBirth = "Date format should be YYYY-MM-DD";
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      if (age < 13) {
        newErrors.dateOfBirth = "You must be at least 13 years old";
      }
    }

    // Terms acceptance validation
    if (!acceptTerms) {
      Alert.alert(
        "Terms Required",
        "You must accept the Terms of Service and Privacy Policy to continue.",
      );
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setAuthLoading(true);
    setError(null);

    try {
      const registerData = {
        email: formData.email,
        password: formData.password,
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        dateOfBirth: formData.dateOfBirth,
      };

      const response = await authService.register(registerData);

      // Store authentication data
      setUser(response.user);
      setTokens(response.accessToken, response.refreshToken);

      // Offer biometric setup if available
      if (biometricAvailable) {
        Alert.alert(
          "Enable Biometric Login",
          "Would you like to enable biometric authentication for faster login?",
          [
            { text: "Not Now", style: "cancel" },
            {
              text: "Enable",
              onPress: async () => {
                try {
                  await authService.enableBiometricAuthentication();
                  logger.info(
                    "Biometric authentication enabled during registration",
                  );
                } catch (error) {
                  logger.error("Failed to enable biometric authentication", {
                    error,
                  });
                }
              },
            },
          ],
        );
      }

      logger.info("Registration successful", { userId: response.user.id });
      navigation.navigate("Home");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again.";
      setError(errorMessage);
      Alert.alert("Registration Failed", errorMessage);
      logger.error("Registration failed", { error, email: formData.email });
    } finally {
      setIsLoading(false);
      setAuthLoading(false);
    }
  };

  const updateFormField = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.backButtonText}>← Back to Login</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join PawfectMatch to find matches for your pets
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => {
                  updateFormField("email", text);
                }}
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
              <Text style={styles.label}>First Name</Text>
              <TextInput
                style={styles.input}
                value={formData.firstName}
                onChangeText={(text) => {
                  updateFormField("firstName", text);
                }}
                placeholder="John"
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={formData.lastName}
                onChangeText={(text) => {
                  updateFormField("lastName", text);
                }}
                placeholder="Doe"
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={formData.dateOfBirth}
                onChangeText={(text) => {
                  updateFormField("dateOfBirth", text);
                }}
                placeholder="1990-01-01"
                keyboardType="numbers-and-punctuation"
              />
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.password}
                  onChangeText={(text) => {
                    updateFormField("password", text);
                  }}
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
              {formData.password && (
                <View style={styles.passwordStrength}>
                  <Text style={styles.passwordStrengthText}>
                    Password strength:
                  </Text>
                  <View style={styles.strengthBar}>
                    <View
                      style={[
                        styles.strengthFill,
                        {
                          width: `${Math.min(100, (formData.password.length / 12) * 100)}%`,
                          backgroundColor:
                            formData.password.length >= 8
                              ? "#10b981"
                              : "#f59e0b",
                        },
                      ]}
                    />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  value={formData.confirmPassword}
                  onChangeText={(text) => {
                    updateFormField("confirmPassword", text);
                  }}
                  placeholder="********"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsCheckboxContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
              >
                <View style={styles.checkbox}>
                  {acceptTerms && (
                    <Ionicons name="checkmark" size={16} color="#ec4899" />
                  )}
                </View>
                <Text style={styles.termsText}>
                  I agree to the{" "}
                  <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                  <Text style={styles.termsLink}>Privacy Policy</Text>
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>
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
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: "#ec4899",
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  form: {
    backgroundColor: "#fff",
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
  passwordStrength: {
    marginTop: 8,
  },
  passwordStrengthText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  strengthBar: {
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    overflow: "hidden",
  },
  strengthFill: {
    height: "100%",
    borderRadius: 2,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
    marginTop: 4,
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
  termsContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  termsCheckboxContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
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
    marginTop: 2,
  },
  termsText: {
    color: "#666",
    fontSize: 12,
    flex: 1,
    lineHeight: 18,
  },
  termsLink: {
    color: "#ec4899",
    textDecorationLine: "underline",
  },
});

export default RegisterScreen;
