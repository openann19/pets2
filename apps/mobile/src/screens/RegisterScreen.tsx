import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRegisterScreen } from "../hooks/screens/useRegisterScreen";
import type { RootStackScreenProps } from "../navigation/types";
import { useTheme } from "@/theme";
import { useTranslation } from 'react-i18next';

type RegisterScreenProps = RootStackScreenProps<"Register">;

const RegisterScreen = ({ navigation }: RegisterScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const { values, errors, setValue, handleSubmit, navigateToLogin } =
    useRegisterScreen({ navigation });

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
    },
    backButton: {
      marginBottom: 16,
    },
    backButtonText: {
      fontSize: 16,
      color: theme.colors.primary as string,
    },
    header: {
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      marginBottom: 8,
      color: theme.colors.onSurface
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.onMuted,
    },
    form: {
      backgroundColor: theme.colors.bg,
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
    termsContainer: {
      marginTop: 16,
      marginBottom: 32,
    },
    termsText: {
      color: theme.colors.onMuted,
      fontSize: 12,
      textAlign: "center",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton}  testID="RegisterScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={navigateToLogin}>
            <Text style={styles.backButtonText}>{t('back_to_login')}</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>{t('create_account')}</Text>
            <Text style={styles.subtitle}>
              {t('create_account_subtitle')}
            </Text>
          </View>

          <View style={styles.form}>
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
              <Text style={styles.label}>{t('first_name_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.firstName}
                onChangeText={(text) => { setValue("firstName", text); }}
                placeholder={t('first_name_placeholder')}
              />
              {errors.firstName && (
                <Text style={styles.errorText}>{errors.firstName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('last_name_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.lastName}
                onChangeText={(text) => { setValue("lastName", text); }}
                placeholder={t('last_name_placeholder')}
              />
              {errors.lastName && (
                <Text style={styles.errorText}>{errors.lastName}</Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('date_of_birth_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.dateOfBirth}
                onChangeText={(text) => { setValue("dateOfBirth", text); }}
                placeholder={t('date_of_birth_placeholder')}
                keyboardType="numbers-and-punctuation"
              />
              {errors.dateOfBirth && (
                <Text style={styles.errorText}>{errors.dateOfBirth}</Text>
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('confirm_password_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.confirmPassword}
                onChangeText={(text) => { setValue("confirmPassword", text); }}
                placeholder={t('confirm_password_placeholder')}
                secureTextEntry
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            <TouchableOpacity style={styles.button}  testID="RegisterScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={handleSubmit}>
              <Text style={styles.buttonText}>{t('create_account_button')}</Text>
            </TouchableOpacity>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                {t('terms_agreement')}
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default RegisterScreen;
