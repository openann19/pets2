import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";

import {
  Heading3,
  Body,
  BodySmall,
  Label,
} from "../Text";
import { matchesAPI } from "../../services/api";
import { logger } from "@pawfectmatch/core";

interface ReportReason {
  id: string;
  label: string;
  icon: string;
  description: string;
}

interface ReportModalProps {
  visible: boolean;
  onClose: () => void;
  targetId: string;
  targetType: "user" | "pet" | "message";
  targetName?: string;
}

const REPORT_REASONS: ReportReason[] = [
  {
    id: "spam",
    label: "Spam or Advertising",
    icon: "megaphone-outline",
    description: "Unwanted promotional content or spam",
  },
  {
    id: "harassment",
    label: "Harassment or Bullying",
    icon: "alert-circle-outline",
    description: "Threatening, intimidating, or abusive behavior",
  },
  {
    id: "fake",
    label: "Fake Profile",
    icon: "person-remove-outline",
    description: "Profile appears to be fake or impersonating someone",
  },
  {
    id: "inappropriate",
    label: "Inappropriate Content",
    icon: "eye-off-outline",
    description: "Contains offensive or inappropriate content",
  },
  {
    id: "scam",
    label: "Scam or Fraud",
    icon: "warning-outline",
    description: "Attempting to scam or defraud users",
  },
  {
    id: "underage",
    label: "Underage User",
    icon: "shield-outline",
    description: "User appears to be underage",
  },
  {
    id: "violence",
    label: "Violence or Threats",
    icon: "flame-outline",
    description: "Contains violent content or threats",
  },
  {
    id: "other",
    label: "Other",
    icon: "ellipsis-horizontal-outline",
    description: "Another reason not listed above",
  },
];

export function ReportModal({
  visible,
  onClose,
  targetId,
  targetType,
  targetName,
}: ReportModalProps) {
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [additionalDetails, setAdditionalDetails] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReasonSelect = (reasonId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedReason(reasonId);
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert("Select a Reason", "Please select a reason for reporting.");
      return;
    }

    try {
      setIsSubmitting(true);
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const reportData = {
        type: targetType,
        targetId,
        reason: selectedReason,
        description: additionalDetails.trim() || undefined,
      };

      await matchesAPI.reportContent(reportData);

      Alert.alert(
        "Report Submitted",
        "Thank you for helping keep PawfectMatch safe. Our moderation team will review this report.",
        [
          {
            text: "OK",
            onPress: () => {
              handleClose();
            },
          },
        ],
      );

      logger.info("Report submitted", {
        targetType,
        targetId,
        reason: selectedReason,
      });
    } catch (error) {
      logger.error("Failed to submit report:", { error, targetId });
      Alert.alert(
        "Submission Failed",
        "Failed to submit report. Please try again or contact support.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSelectedReason("");
    setAdditionalDetails("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={handleClose}
      >
        <BlurView intensity={80} style={styles.blurContainer}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.modalContainer}
            onPress={(e) => {
              e.stopPropagation();
            }}
          >
            <View style={styles.modal}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerTop}>
                  <View style={styles.iconContainer}>
                    <LinearGradient
                      colors={["#ef4444", "#dc2626"]}
                      style={styles.iconGradient}
                    >
                      <Ionicons name="flag" size={24} color="#fff" />
                    </LinearGradient>
                  </View>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={handleClose}
                  >
                    <Ionicons name="close" size={24} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <Heading3 style={styles.title}>Report {targetType}</Heading3>
                {targetName && (
                  <BodySmall style={styles.subtitle}>
                    Reporting: {targetName}
                  </BodySmall>
                )}
                <Body style={styles.description}>
                  Help us understand what's wrong. Your report is anonymous.
                </Body>
              </View>

              {/* Reasons */}
              <ScrollView
                style={styles.reasonsContainer}
                showsVerticalScrollIndicator={false}
              >
                <Label style={styles.sectionLabel}>Select a reason</Label>
                {REPORT_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason.id}
                    style={[
                      styles.reasonItem,
                      selectedReason === reason.id && styles.reasonItemSelected,
                    ]}
                    onPress={() => {
                      handleReasonSelect(reason.id);
                    }}
                    activeOpacity={0.7}
                  >
                    <LinearGradient
                      colors={
                        selectedReason === reason.id
                          ? ["#fef2f2", "#fee2e2"]
                          : ["#ffffff", "#f9fafb"]
                      }
                      style={styles.reasonGradient}
                    >
                      <View style={styles.reasonLeft}>
                        <View
                          style={[
                            styles.reasonIcon,
                            selectedReason === reason.id &&
                              styles.reasonIconSelected,
                          ]}
                        >
                          <Ionicons
                            name={reason.icon as "megaphone-outline"}
                            size={20}
                            color={
                              selectedReason === reason.id
                                ? "#ef4444"
                                : "#6b7280"
                            }
                          />
                        </View>
                        <View style={styles.reasonTextContainer}>
                          <Label
                            style={[
                              styles.reasonLabel,
                              selectedReason === reason.id &&
                                styles.reasonLabelSelected,
                            ]}
                          >
                            {reason.label}
                          </Label>
                          <BodySmall style={styles.reasonDescription}>
                            {reason.description}
                          </BodySmall>
                        </View>
                      </View>
                      {selectedReason === reason.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#ef4444"
                        />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                ))}

                {/* Additional Details */}
                <View style={styles.detailsSection}>
                  <Label style={styles.sectionLabel}>
                    Additional details (optional)
                  </Label>
                  <TextInput
                    style={styles.detailsInput}
                    placeholder="Provide more context about this report..."
                    placeholderTextColor="#9ca3af"
                    value={additionalDetails}
                    onChangeText={setAdditionalDetails}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                  />
                  <BodySmall style={styles.characterCount}>
                    {additionalDetails.length}/500
                  </BodySmall>
                </View>

                {/* Safety Notice */}
                <View style={styles.noticeContainer}>
                  <Ionicons
                    name="information-circle"
                    size={20}
                    color="#6b7280"
                  />
                  <BodySmall style={styles.noticeText}>
                    All reports are reviewed by our moderation team. False
                    reports may result in account suspension.
                  </BodySmall>
                </View>
              </ScrollView>

              {/* Submit Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[
                    styles.submitButton,
                    (!selectedReason || isSubmitting) &&
                      styles.submitButtonDisabled,
                  ]}
                  onPress={() => {
                    void handleSubmit();
                  }}
                  disabled={!selectedReason || isSubmitting}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      !selectedReason || isSubmitting
                        ? ["#d1d5db", "#9ca3af"]
                        : ["#ef4444", "#dc2626"]
                    }
                    style={styles.submitGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <Ionicons name="flag" size={20} color="#fff" />
                        <Label style={styles.submitText}>Submit Report</Label>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  blurContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxWidth: 500,
    maxHeight: "85%",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: "hidden",
  },
  iconGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  reasonsContainer: {
    maxHeight: 400,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  reasonItem: {
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#f3f4f6",
  },
  reasonItemSelected: {
    borderColor: "#ef4444",
  },
  reasonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  reasonLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reasonIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  reasonIconSelected: {
    backgroundColor: "#fee2e2",
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  reasonLabelSelected: {
    color: "#ef4444",
  },
  reasonDescription: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 18,
  },
  detailsSection: {
    marginTop: 24,
    marginBottom: 16,
  },
  detailsInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
    fontFamily: "System",
  },
  characterCount: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "right",
    marginTop: 4,
  },
  noticeContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    marginTop: 8,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  submitButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
});
