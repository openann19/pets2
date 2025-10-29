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
import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';

type ResetPasswordScreenProps = RootStackScreenProps<"ResetPassword">;

function ResetPasswordScreen({
  navigation,
  route,
}: ResetPasswordScreenProps): JSX.Element {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const {
    values,
    errors,
    loading,
    setValue,
    handleSubmit,
    navigateBack,
  } = useResetPasswordScreen({ navigation, route });

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
      color: theme.colors.onSurface
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
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
      color: theme.colors.onSurface
      marginBottom: 8,
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
      color: theme.colors.onMuted,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton}  testID="ResetPasswordScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={navigateBack}>
            <Text style={styles.backButtonText}>{t('back_button')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('set_new_password_title')}</Text>
            <Text style={styles.subtitle}>
              {t('set_new_password_subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('new_password_label')}</Text>
              <TextInput
                style={errors.password ? [styles.input, styles.inputError] : styles.input}
                value={values.password}
                onChangeText={(value) => { setValue("password", value); }}
                placeholder={t('new_password_placeholder')}
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
              {errors.password ? (
                <Text style={styles.errorText}>{errors.password}</Text>
              ) : null}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('confirm_new_password_label')}</Text>
              <TextInput
                style={errors.confirmPassword ? [styles.input, styles.inputError] : styles.input}
                value={values.confirmPassword}
                onChangeText={(value) => { setValue("confirmPassword", value); }}
                placeholder={t('confirm_new_password_placeholder')}
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
               testID="ResetPasswordScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleSubmit}
              disabled={loading}
            >
              <Text
                style={[
                  styles.buttonText,
                  loading && styles.buttonTextDisabled,
                ]}
              >
                {loading ? t('resetting') : t('reset_password_button')}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default ResetPasswordScreen;
