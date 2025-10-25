import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Heading2,
  Heading3,
  Body,
  BodySmall,
  Label,
  ButtonText,
} from "../components/Text";
import { Button } from "../components/Button";
import { api } from "../services/api";

type RootStackParamList = {
  DeleteAccount: undefined;
  Settings: undefined;
  Login: undefined;
};

type DeleteAccountScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "DeleteAccount"
>;

interface DeleteReason {
  id: string;
  label: string;
  icon: string;
}

const DELETE_REASONS: DeleteReason[] = [
  { id: "found_match", label: "Found a match", icon: "heart" },
  { id: "not_using", label: "Not using the app anymore", icon: "time" },
  { id: "privacy", label: "Privacy concerns", icon: "shield-checkmark" },
  { id: "too_expensive", label: "Too expensive", icon: "cash" },
  { id: "technical", label: "Technical issues", icon: "bug" },
  { id: "other", label: "Other reason", icon: "ellipsis-horizontal" },
];

export default function DeleteAccountScreen({
  navigation,
}: DeleteAccountScreenProps) {
  const logout = useAuthStore((state) => state.logout);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [dataExported, setDataExported] = useState(false);

  const handleReasonSelect = (reasonId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reasonId);
  };

  const handleExportData = async () => {
    try {
      setIsLoading(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = await api.exportUserData();

      Alert.alert(
        "Data Export Started",
        `Your data export has been initiated. You'll receive a download link at your email within 48 hours.\n\nDownload link expires: ${new Date(result.expiresAt).toLocaleDateString()}`,
        [{ text: "OK" }],
      );

      setDataExported(true);
      logger.info("User data export initiated", {
        expiresAt: result.expiresAt,
      });
    } catch (error) {
      logger.error("Failed to export user data:", { error });
      Alert.alert(
        "Export Failed",
        "Failed to export your data. Please try again or contact support.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!password.trim()) {
      Alert.alert(
        "Password Required",
        "Please enter your password to confirm.",
      );
      return;
    }

    try {
      setIsLoading(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      const result = await api.deleteAccount({
        password,
        reason: selectedReason,
        feedback: feedback.trim() || undefined,
      });

      // Logout user
      logout();

      Alert.alert(
        "Account Deletion Scheduled",
        `Your account will be permanently deleted on ${new Date(result.gracePeriodEndsAt).toLocaleDateString()}.\n\nYou have 30 days to cancel this request by logging back in.\n\nAll your data will be permanently removed after this date.`,
        [
          {
            text: "OK",
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" as never }],
              });
            },
          },
        ],
      );

      logger.info("Account deletion scheduled", {
        gracePeriodEndsAt: result.gracePeriodEndsAt,
      });
    } catch (error) {
      logger.error("Failed to delete account:", { error });
      Alert.alert(
        "Deletion Failed",
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please check your password and try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.warningBox}>
        <Ionicons name="warning" size={48} color="#EF4444" />
        <Heading2 style={styles.warningTitle}>
          Are you sure you want to delete your account?
        </Heading2>
        <Body style={styles.warningText}>
          This action will permanently delete your account and all associated
          data after a 30-day grace period.
        </Body>
      </View>

      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>What will be deleted:</Heading3>
        <View style={styles.listContainer}>
          {[
            "Your profile and pet profiles",
            "All matches and conversations",
            "Photos and media files",
            "Subscription and payment data",
            "Activity history and analytics",
            "Saved preferences and settings",
          ].map((item, index) => (
            <View key={index} style={styles.listItem}>
              <Ionicons name="close-circle" size={20} color="#EF4444" />
              <Body style={styles.listText}>{item}</Body>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Heading3 style={styles.sectionTitle}>Before you go:</Heading3>
        <TouchableOpacity
          style={styles.exportButton}
          onPress={() => {
            void handleExportData();
          }}
          disabled={isLoading || dataExported}
        >
          <Ionicons
            name={dataExported ? "checkmark-circle" : "download"}
            size={24}
            color={dataExported ? "#10B981" : "#8B5CF6"}
          />
          <View style={styles.exportTextContainer}>
            <Label style={styles.exportTitle}>
              {dataExported ? "Data Export Requested" : "Export Your Data"}
            </Label>
            <BodySmall style={styles.exportSubtitle}>
              {dataExported
                ? "Check your email for download link"
                : "Download a copy of your data (GDPR)"}
            </BodySmall>
          </View>
          {isLoading && <ActivityIndicator color="#8B5CF6" />}
        </TouchableOpacity>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="lg"
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.button}
        >
          <ButtonText>Cancel</ButtonText>
        </Button>
        <Button
          variant="gradient"
          size="lg"
          onPress={() => {
            setStep(2);
          }}
          style={styles.button}
          gradientColors={["#EF4444", "#DC2626"]}
        >
          <ButtonText color="inverse">Continue</ButtonText>
        </Button>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Heading2 style={styles.stepTitle}>Why are you leaving?</Heading2>
      <Body style={styles.stepSubtitle}>
        Your feedback helps us improve PawfectMatch
      </Body>

      <View style={styles.reasonsContainer}>
        {DELETE_REASONS.map((reason) => (
          <TouchableOpacity
            key={reason.id}
            style={[
              styles.reasonItem,
              selectedReason === reason.id && styles.reasonItemSelected,
            ]}
            onPress={() => handleReasonSelect(reason.id)}
          >
            <Ionicons
              name={reason.icon as any}
              size={24}
              color={selectedReason === reason.id ? "#8B5CF6" : "#6B7280"}
            />
            <Label
              style={[
                styles.reasonText,
                selectedReason === reason.id && styles.reasonTextSelected,
              ]}
            >
              {reason.label}
            </Label>
            {selectedReason === reason.id && (
              <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.feedbackContainer}>
        <Label style={styles.feedbackLabel}>
          Additional feedback (optional)
        </Label>
        <TextInput
          style={styles.feedbackInput}
          placeholder="Tell us more about your experience..."
          placeholderTextColor="#9CA3AF"
          value={feedback}
          onChangeText={setFeedback}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="lg"
          onPress={() => {
            setStep(1);
          }}
          style={styles.button}
        >
          <ButtonText>Back</ButtonText>
        </Button>
        <Button
          variant="gradient"
          size="lg"
          onPress={() => {
            setStep(3);
          }}
          style={styles.button}
          gradientColors={["#EF4444", "#DC2626"]}
          disabled={!selectedReason}
        >
          <ButtonText color="inverse">Continue</ButtonText>
        </Button>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <View style={styles.finalWarningBox}>
        <Ionicons name="alert-circle" size={64} color="#EF4444" />
        <Heading2 style={styles.finalWarningTitle}>Final Confirmation</Heading2>
        <Body style={styles.finalWarningText}>
          This is your last chance to cancel. Enter your password to confirm
          account deletion.
        </Body>
      </View>

      <View style={styles.section}>
        <Label style={styles.inputLabel}>Enter your password</Label>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#9CA3AF"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.gracePeriodBox}>
        <Ionicons name="time" size={24} color="#F59E0B" />
        <View style={styles.gracePeriodText}>
          <Label style={styles.gracePeriodTitle}>30-Day Grace Period</Label>
          <BodySmall style={styles.gracePeriodSubtitle}>
            You can cancel this request by logging back in within 30 days
          </BodySmall>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          variant="outline"
          size="lg"
          onPress={() => {
            setStep(2);
          }}
          style={styles.button}
          disabled={isLoading}
        >
          <ButtonText>Back</ButtonText>
        </Button>
        <Button
          variant="gradient"
          size="lg"
          onPress={() => {
            void handleDeleteAccount();
          }}
          style={styles.button}
          gradientColors={["#EF4444", "#DC2626"]}
          disabled={isLoading || !password.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <ButtonText color="inverse">Delete My Account</ButtonText>
          )}
        </Button>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="close" size={24} color="#111827" />
        </TouchableOpacity>
        <Heading3 style={styles.headerTitle}>Delete Account</Heading3>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[styles.progressDot, s <= step && styles.progressDotActive]}
          />
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  placeholder: {
    width: 40,
  },
  progressContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },
  progressDotActive: {
    backgroundColor: "#EF4444",
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  warningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  warningText: {
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 12,
  },
  listContainer: {
    gap: 12,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  listText: {
    fontSize: 14,
    color: "#4B5563",
    flex: 1,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  exportTextContainer: {
    flex: 1,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  exportSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 24,
  },
  reasonsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  reasonItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  reasonItemSelected: {
    borderColor: "#8B5CF6",
    backgroundColor: "#F5F3FF",
  },
  reasonText: {
    fontSize: 16,
    color: "#4B5563",
    flex: 1,
  },
  reasonTextSelected: {
    color: "#8B5CF6",
    fontWeight: "600",
  },
  feedbackContainer: {
    marginBottom: 24,
  },
  feedbackLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  feedbackInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
  },
  finalWarningBox: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "#FEE2E2",
  },
  finalWarningTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#EF4444",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  finalWarningText: {
    fontSize: 14,
    color: "#991B1B",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  passwordInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 16,
    color: "#111827",
  },
  gracePeriodBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  gracePeriodText: {
    flex: 1,
  },
  gracePeriodTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#92400E",
    marginBottom: 4,
  },
  gracePeriodSubtitle: {
    fontSize: 12,
    color: "#B45309",
  },
});
