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
import { useTheme } from '../theme/Provider';
import { useTranslation } from 'react-i18next';

type ForgotPasswordScreenProps = RootStackScreenProps<"ForgotPassword">;

function ForgotPasswordScreen({
  navigation,
}: ForgotPasswordScreenProps): JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const {
    values,
    errors,
    loading,
    setValue,
    handleSubmit,
    navigateBack,
  } = useForgotPasswordScreen({ navigation });

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
    backButton: {
      marginBottom: 20,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary as string,
    },
    header: {
      marginBottom: 40,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textMuted,
      lineHeight: 24,
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
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
    },
    input: {
      backgroundColor: theme.colors.bgElevated,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: theme.colors.text,
    },
    inputError: {
      borderColor: theme.colors.danger,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: 12,
      marginTop: 4,
    },
    button: {
      backgroundColor: theme.colors.primary as string,
      borderRadius: 8,
      padding: 15,
      alignItems: "center",
      marginVertical: 16,
    },
    buttonDisabled: {
      backgroundColor: theme.colors.bgElevated,
    },
    buttonText: {
      color: theme.colors.bg,
      fontSize: 16,
      fontWeight: "bold",
    },
    buttonTextDisabled: {
      color: theme.colors.textMuted,
    },
    helpText: {
      alignItems: "center",
      marginTop: 16,
    },
    helpTextContent: {
      color: theme.colors.textMuted,
      fontSize: 14,
    },
    linkText: {
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
          <TouchableOpacity style={styles.backButton}  testID="ForgotPasswordScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={navigateBack}>
            <Text style={styles.backButtonText}>{t('back_button')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('reset_password_title')}</Text>
            <Text style={styles.subtitle}>
              {t('reset_password_subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('email_address_label')}</Text>
              <TextInput
                style={errors.email ? [styles.input, styles.inputError] : styles.input}
                value={values.email}
                onChangeText={(text) => { setValue("email", text); }}
                placeholder={t('email_address_placeholder')}
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
               testID="ForgotPasswordScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleSubmit}
              disabled={loading}
            >
              <Text
                style={[
                  styles.buttonText,
                  loading && styles.buttonTextDisabled,
                ]}
              >
                {loading ? t('sending') : t('send_reset_link')}
              </Text>
            </TouchableOpacity>

            <View style={styles.helpText}>
              <Text style={styles.helpTextContent}>
                {t('remember_password')}
                <Text
                  style={styles.linkText}
                  onPress={() => navigation.navigate("Login")}
                >
                  {t('sign_in_link')}
                </Text>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ForgotPasswordScreen;
