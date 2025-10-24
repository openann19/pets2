import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";

interface DeactivateAccountScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function DeactivateAccountScreen({
  navigation,
}: DeactivateAccountScreenProps): JSX.Element {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const reasons = [
    "Taking a break from dating",
    "Found a partner",
    "Not enjoying the app",
    "Privacy concerns",
    "Too many notifications",
    "Other",
  ];

  const handleDeactivate = useCallback(async () => {
    if (!reason) {
      Alert.alert("Required", "Please select a reason for deactivation.");
      return;
    }

    if (confirmText.toLowerCase() !== "deactivate") {
      Alert.alert(
        "Confirmation Required",
        'Please type "deactivate" to confirm.',
      );
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => {});

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      Alert.alert(
        "Account Deactivated",
        "Your account has been temporarily deactivated. You can reactivate it anytime by logging back in.",
        [
          {
            text: "OK",
            onPress: () => {
              // In real app, would log out user
              navigation.goBack();
            },
          },
        ],
      );
    } catch (error) {
      Alert.alert("Error", "Failed to deactivate account. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [reason, confirmText, navigation]);

  const selectReason = useCallback((selectedReason: string) => {
    Haptics.selectionAsync().catch(() => {});
    setReason(selectedReason);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#ff9a9e", "#fecfef", "#ff9a9e"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Deactivate Account</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Warning */}
          <BlurView intensity={15} style={styles.warningCard}>
            <Ionicons name="warning-outline" size={24} color="#F59E0B" />
            <Text style={styles.warningText}>
              Deactivating your account will temporarily hide your profile and
              pause all activity. You can reactivate anytime by logging back in.
            </Text>
          </BlurView>

          {/* Reason Selection */}
          <Text style={styles.sectionTitle}>Why are you deactivating?</Text>

          {reasons.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.reasonCard,
                reason === item && styles.reasonCardSelected,
              ]}
              onPress={() => {
                selectReason(item);
              }}
            >
              <BlurView
                intensity={reason === item ? 25 : 15}
                style={styles.reasonBlur}
              >
                <Text
                  style={[
                    styles.reasonText,
                    reason === item && styles.reasonTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {reason === item && (
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                )}
              </BlurView>
            </TouchableOpacity>
          ))}

          {/* Custom Reason */}
          {reason === "Other" && (
            <BlurView intensity={15} style={styles.customReasonCard}>
              <TextInput
                style={styles.customReasonInput}
                placeholder="Please tell us more..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                multiline
                numberOfLines={3}
                value={reason}
                onChangeText={setReason}
              />
            </BlurView>
          )}

          {/* Confirmation */}
          <Text style={styles.sectionTitle}>Confirm Deactivation</Text>

          <BlurView intensity={15} style={styles.confirmationCard}>
            <Text style={styles.confirmationText}>
              Type "deactivate" to confirm:
            </Text>
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
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deactivateButton,
                (!reason ||
                  confirmText.toLowerCase() !== "deactivate" ||
                  loading) &&
                  styles.buttonDisabled,
              ]}
              onPress={handleDeactivate}
              disabled={
                !reason || confirmText.toLowerCase() !== "deactivate" || loading
              }
            >
              <Text style={styles.deactivateButtonText}>
                {loading ? "Deactivating..." : "Deactivate Account"}
              </Text>
            </TouchableOpacity>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: "hidden",
  },
  backButtonBlur: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  warningCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  warningText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "white",
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 16,
    marginTop: 8,
  },
  reasonCard: {
    borderRadius: 12,
    marginBottom: 8,
    overflow: "hidden",
  },
  reasonCardSelected: {
    transform: [{ scale: 1.02 }],
  },
  reasonBlur: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  reasonText: {
    fontSize: 16,
    color: "white",
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: "600",
  },
  customReasonCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  customReasonInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  confirmationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  confirmationText: {
    fontSize: 16,
    color: "white",
    marginBottom: 12,
    fontWeight: "600",
  },
  confirmationInput: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 8,
    padding: 12,
    color: "white",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  deactivateButton: {
    backgroundColor: "#EF4444",
  },
  deactivateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  helpText: {
    textAlign: "center",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 32,
  },
});

export default DeactivateAccountScreen;
