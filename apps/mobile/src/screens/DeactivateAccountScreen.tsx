import React from "react";
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@mobile/theme';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDeactivateAccountScreen } from '../hooks/screens/useDeactivateAccountScreen';

interface DeactivateAccountScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function DeactivateAccountScreen({ navigation }: DeactivateAccountScreenProps): React.JSX.Element {
  const {
    reason,
    confirmText,
    loading,
    reasons,
    selectReason,
    setConfirmText,
    handleDeactivate,
    handleGoBack,
  } = useDeactivateAccountScreen();
  const theme = useTheme();
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[theme.colors.danger, theme.colors.danger + '40', theme.colors.danger]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            testID="DeactivateAccountScreen-button-2"
            accessibilityLabel="Interactive element"
            accessibilityRole="button"
            onPress={handleGoBack}
          >
            <BlurView
              intensity={20}
              style={styles.backButtonBlur}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="white"
              />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deactivate Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          {/* Warning */}
          <BlurView
            intensity={15}
            style={styles.warningCard}
          >
            <Ionicons
              name="warning-outline"
              size={24}
              color={theme.colors.warning}
            />
            <Text style={styles.warningText}>
              Deactivating your account will temporarily hide your profile and pause all activity.
              You can reactivate anytime by logging back in.
            </Text>
          </BlurView>

          {/* Reason Selection */}
          <Text style={styles.sectionTitle}>Why are you deactivating?</Text>

          {reasons.map((item) => (
            <TouchableOpacity
              key={item}
              style={StyleSheet.flatten([
                styles.reasonCard,
                reason === item && styles.reasonCardSelected,
              ])}
              testID="DeactivateAccountScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                selectReason(item);
              }}
            >
              <BlurView
                intensity={reason === item ? 25 : 15}
                style={styles.reasonBlur}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.reasonText,
                    reason === item && styles.reasonTextSelected,
                  ])}
                >
                  {item}
                </Text>
                {reason === item && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={theme.colors.success}
                  />
                )}
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Custom Reason */}
          {reason === 'Other' && (
            <BlurView
              intensity={15}
              style={styles.customReasonCard}
            >
              <TextInput
                style={styles.customReasonInput}
                placeholder="Please tell us more..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={selectReason}
              />
            </BlurView>
          )}

          {/* Confirmation */}
          <Text style={styles.sectionTitle}>Confirm Deactivation</Text>

          <BlurView
            intensity={15}
            style={styles.confirmationCard}
          >
            <Text style={styles.confirmationText}>Type "deactivate" to confirm:</Text>
            <TextInput
              style={styles.confirmationInput}
              placeholder="deactivate"
              placeholderTextColor="rgba(255,255,255,0.4)"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="none"
            />
          </BlurView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={StyleSheet.flatten([styles.button, styles.cancelButton])}
              testID="DeactivateAccountScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.button,
                styles.deactivateButton,
                (!reason || confirmText.toLowerCase() !== 'deactivate' || loading) &&
                  styles.buttonDisabled,
              ])}
              testID="DeactivateAccountScreen-button-2"
              accessibilityLabel="Interactive element"
              accessibilityRole="button"
              onPress={handleDeactivate}
              disabled={!reason || confirmText.toLowerCase() !== 'deactivate' || loading}
            >
              <Text style={styles.deactivateButtonText}>
                {loading ? 'Deactivating...' : 'Deactivate Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Legal Links */}
          <View style={styles.legalLinks}>
            <Text style={styles.legalLinksText}>
              Before proceeding, please review our{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://pawfectmatch.com/privacy')}
              >
                Privacy Policy
              </Text>
              {' '}and{' '}
              <Text
                style={styles.legalLink}
                onPress={() => Linking.openURL('https://pawfectmatch.com/terms')}
              >
                Terms of Service
              </Text>
              .
            </Text>
          </View>

          {/* Help Text */}
          <Text style={styles.helpText}>
            Need help? Contact our support team before deactivating.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: 'white',
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 16,
    marginTop: 8,
  },
  reasonCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: 'hidden',
  },
  reasonCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  reasonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  reasonText: {
    fontSize: 16,
    color: 'white',
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: '600',
  },
  customReasonCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  customReasonInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  confirmationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  confirmationText: {
    fontSize: 16,
    color: 'white',
    marginBottom: 12,
    fontWeight: '600',
  },
  confirmationInput: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deactivateButton: {
    backgroundColor: '#ef4444', // danger color fallback
  },
  deactivateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpText: {
    textAlign: 'center',
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
  },
  legalLinks: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  legalLinksText: {
    textAlign: 'center',
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
  },
  legalLink: {
    color: 'rgba(255,255,255,0.95)',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});

export default DeactivateAccountScreen;
