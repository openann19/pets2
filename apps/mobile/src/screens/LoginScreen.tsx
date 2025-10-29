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
import { useTheme } from "@/theme";
import { useTranslation } from 'react-i18next';

type LoginScreenProps = RootStackScreenProps<"Login">;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
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

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.bg,
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
      color: theme.colors.primary as string,
      marginBottom: 8,
    },
    tagline: {
      fontSize: 16,
      color: theme.colors.onMuted,
    },
    form: {
      backgroundColor: theme.colors.bgElevated,
      borderRadius: 16,
      padding: 20,
      shadowColor: theme.colors.bg,
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
      color: theme.colors.onSurface
    },
    inputGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      marginBottom: 6,
      color: theme.colors.onSurface
    },
    input: {
      backgroundColor: theme.colors.bgElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.onSurface
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: 4,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 20,
    },
    forgotPasswordText: {
      color: theme.colors.primary as string,
      fontSize: 14,
    },
    button: {
      backgroundColor: theme.colors.primary as string,
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      marginVertical: 16,
    },
    buttonText: {
      color: theme.colors.bg,
      fontSize: 16,
      fontWeight: "bold",
    },
    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 16,
    },
    registerText: {
      color: theme.colors.onMuted,
    },
    registerLink: {
      color: theme.colors.primary as string,
      fontWeight: "bold",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Text style={styles.logo}>{t('logo_text')}</Text>
            <Text style={styles.tagline}>{t('tagline')}</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.title}>{t('welcome_back')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('email_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.email}
                onChangeText={(text) => { setValue("email", text); }}
                placeholder={t('email_placeholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              {errors.email && (
                <Text style={styles.errorText}>{errors.email}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('password_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.password}
                onChangeText={(text) => { setValue("password", text); }}
                placeholder={t('password_placeholder')}
                secureTextEntry
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password}</Text>
              )}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
               testID="LoginScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>{t('forgot_password_link')}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}  testID="LoginScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('sign_in_button')}</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t('no_account_text')}</Text>
              <TouchableOpacity  testID="LoginScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={navigateToRegister}>
                <Text style={styles.registerLink}>{t('sign_up_link')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
