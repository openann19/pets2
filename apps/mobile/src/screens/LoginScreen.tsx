import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { useTranslation } from 'react-i18next';
import { useLoginScreen } from '../hooks/screens/useLoginScreen';
import type { RootStackScreenProps } from '../navigation/types';

type LoginScreenProps = RootStackScreenProps<'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const theme = useTheme();
  const { t } = useTranslation('auth');
  const { values, errors, setValue, handleSubmit, navigateToRegister, navigateToForgotPassword } =
    useLoginScreen({ navigation });

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
      padding: theme.spacing.lg + theme.spacing.xs,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: theme.spacing['2xl'] + theme.spacing.xs,
    },
    logo: {
      fontSize: theme.typography.h1.size * 1.166,
      fontWeight: theme.typography.h1.weight,
      color: theme.colors.primary as string,
      marginBottom: theme.spacing.sm,
    },
    tagline: {
      fontSize: theme.typography.body.size,
      color: theme.colors.onMuted,
    },
    form: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg + theme.spacing.xs,
      shadowColor: theme.colors.bg,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 2,
    },
    title: {
      fontSize: theme.typography.h2.size * 1.2,
      fontWeight: theme.typography.h1.weight,
      marginBottom: theme.spacing.lg + theme.spacing.xs,
      textAlign: 'center',
      color: theme.colors.onSurface,
    },
    inputGroup: {
      marginBottom: theme.spacing.lg,
    },
    label: {
      fontSize: theme.typography.body.size * 0.875,
      fontWeight: theme.typography.h2.weight,
      marginBottom: theme.spacing.xs + theme.spacing.xs / 2,
      color: theme.colors.onSurface,
    },
    input: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md,
      fontSize: theme.typography.body.size,
      color: theme.colors.onSurface,
    },
    errorText: {
      color: theme.colors.danger,
      fontSize: theme.typography.body.size * 0.75,
      marginTop: theme.spacing.xs,
    },
    forgotPassword: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.lg + theme.spacing.xs,
    },
    forgotPasswordText: {
      color: theme.colors.primary as string,
      fontSize: theme.typography.body.size * 0.875,
    },
    button: {
      backgroundColor: theme.colors.primary as string,
      borderRadius: theme.radii.md,
      padding: theme.spacing.md + theme.spacing.xs,
      alignItems: 'center',
      marginVertical: theme.spacing.lg,
    },
    buttonText: {
      color: theme.colors.bg,
      fontSize: theme.typography.body.size,
      fontWeight: theme.typography.h1.weight,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.lg,
    },
    registerText: {
      color: theme.colors.onMuted,
    },
    registerLink: {
      color: theme.colors.primary as string,
      fontWeight: 'bold',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                onChangeText={(text) => {
                  setValue('email', text);
                }}
                placeholder={t('email_placeholder')}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('password_label')}</Text>
              <TextInput
                style={styles.input}
                value={values.password}
                onChangeText={(text) => {
                  setValue('password', text);
                }}
                placeholder={t('password_placeholder')}
                secureTextEntry
              />
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity
              style={styles.forgotPassword}
              testID="LoginScreen-forgot-password-button"
              accessibilityLabel={t('forgot_password_link')}
              accessibilityRole="button"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              onPress={handleForgotPassword}
            >
              <Text style={styles.forgotPasswordText}>{t('forgot_password_link')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.button}
              testID="LoginScreen-sign-in-button"
              accessibilityLabel={t('sign_in_button')}
              accessibilityRole="button"
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>{t('sign_in_button')}</Text>
            </TouchableOpacity>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>{t('no_account_text')}</Text>
              <TouchableOpacity
                testID="LoginScreen-register-button"
                accessibilityLabel={t('sign_up_link')}
                accessibilityRole="button"
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                onPress={navigateToRegister}
              >
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
