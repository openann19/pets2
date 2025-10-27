import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { request } from "../../services/api";
import { Theme } from '../../theme/unified-theme';

type AdoptionStackParamList = {
  ApplicationReview: { applicationId: string };
};

type ApplicationReviewScreenProps = NativeStackScreenProps<
  AdoptionStackParamList,
  "ApplicationReview"
>;

interface Application {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantLocation: string;
  applicantExperience: string;
  homeType: string;
  hasChildren: boolean;
  hasOtherPets: boolean;
  yardSize: string;
  workSchedule: string;
  applicationDate: string;
  status: "pending" | "approved" | "rejected" | "interview";
  petName: string;
  petPhoto: string;
  notes: string;
  questions: Array<{
    question: string;
    answer: string;
  }>;
}

const ApplicationReviewScreen = ({
  navigation,
  route,
}: ApplicationReviewScreenProps) => {
  const { applicationId } = route.params;
  const [application, setApplication] = useState<Application | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for now - would fetch from API
  React.useEffect(() => {
    const loadApplication = async () => {
      try {
        setIsLoading(true);
        // Fetch application details from API
        const applicationData = await request<Application>(
          `/api/adoption/applications/${applicationId}`,
          {
            method: "GET",
          },
        );

        setApplication(applicationData);
      } catch (error) {
        logger.error("Failed to load application:", { error });
        Alert.alert("Error", "Failed to load application details");
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [applicationId]);

  const handleStatusChange = (newStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      "Update Application Status",
      `Change application status to ${newStatus}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            try {
              await request(
                `/api/adoption/applications/${applicationId}/review`,
                {
                  method: "POST",
                  body: { status: newStatus },
                },
              );

              if (application) {
                setApplication({ ...application, status: newStatus as any });
                Alert.alert(
                  "Success",
                  `Application status updated to ${newStatus}`,
                );
              }
            } catch (error) {
              logger.error("Failed to update application status:", { error });
              Alert.alert("Error", "Failed to update application status");
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "Theme.colors.status.warning";
      case "approved":
        return "Theme.colors.status.success";
      case "rejected":
        return "Theme.colors.status.error";
      case "interview":
        return "#8b5cf6";
      default:
        return "Theme.colors.neutral[500]";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return "⏳";
      case "approved":
        return "✅";
      case "rejected":
        return "❌";
      case "interview":
        return "💬";
      default:
        return "❓";
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading application...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!application) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#ff6b6b" />
          <Text style={styles.emptyTitle}>Application Not Found</Text>
          <Text style={styles.emptySubtitle}>
            Unable to load application details
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Application Review</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="share-outline" size={20} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Application Status */}
        <View style={styles.statusSection}>
          <BlurView intensity={20} style={styles.statusCard}>
            <View style={styles.statusHeader}>
              <View style={styles.petInfo}>
                <Image
                  source={{ uri: application.petPhoto }}
                  style={styles.petImage}
                />
                <View style={styles.petDetails}>
                  <Text style={styles.petName}>{application.petName}</Text>
                  <Text style={styles.applicantName}>
                    {application.applicantName}
                  </Text>
                </View>
              </View>
              <View
                style={StyleSheet.flatten([
                  styles.statusBadge,
                  {
                    backgroundColor: `${getStatusColor(application.status)}20`,
                  },
                ])}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.statusText,
                    { color: getStatusColor(application.status) },
                  ])}
                >
                  {getStatusIcon(application.status)}{" "}
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </Text>
              </View>
            </View>
            <Text style={styles.applicationDate}>
              Applied on{" "}
              {new Date(application.applicationDate).toLocaleDateString()}
            </Text>
          </BlurView>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.contactInfo}>
              <View style={styles.contactItem}>
                <Ionicons name="mail" size={20} color="Theme.colors.status.info" />
                <Text style={styles.contactText}>
                  {application.applicantEmail}
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="call" size={20} color="Theme.colors.status.success" />
                <Text style={styles.contactText}>
                  {application.applicantPhone}
                </Text>
              </View>
              <View style={styles.contactItem}>
                <Ionicons name="location" size={20} color="Theme.colors.status.error" />
                <Text style={styles.contactText}>
                  {application.applicantLocation}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Home & Lifestyle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home & Lifestyle</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.lifestyleGrid}>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Home Type</Text>
                <Text style={styles.lifestyleValue}>
                  {application.homeType}
                </Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Yard Size</Text>
                <Text style={styles.lifestyleValue}>
                  {application.yardSize}
                </Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Work Schedule</Text>
                <Text style={styles.lifestyleValue}>
                  {application.workSchedule}
                </Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Has Children</Text>
                <Text style={styles.lifestyleValue}>
                  {application.hasChildren ? "Yes" : "No"}
                </Text>
              </View>
              <View style={styles.lifestyleItem}>
                <Text style={styles.lifestyleLabel}>Has Other Pets</Text>
                <Text style={styles.lifestyleValue}>
                  {application.hasOtherPets ? "Yes" : "No"}
                </Text>
              </View>
            </View>
          </BlurView>
        </View>

        {/* Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pet Experience</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <Text style={styles.experienceText}>
              {application.applicantExperience}
            </Text>
          </BlurView>
        </View>

        {/* Application Questions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Application Questions</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <View style={styles.questionsList}>
              {application.questions.map((qa, index) => (
                <View key={index} style={styles.questionItem}>
                  <Text style={styles.questionText}>{qa.question}</Text>
                  <Text style={styles.answerText}>{qa.answer}</Text>
                </View>
              ))}
            </View>
          </BlurView>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Notes</Text>
          <BlurView intensity={20} style={styles.sectionCard}>
            <Text style={styles.notesText}>
              {application.notes ||
                "No notes added yet. Add your observations about this applicant."}
            </Text>
          </BlurView>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleStatusChange("approved");
              }}
            >
              <LinearGradient
                colors={["Theme.colors.status.success", "#047857"]}
                style={styles.actionGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="Theme.colors.neutral[0]" />
                <Text style={styles.actionText}>Approve</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleStatusChange("interview");
              }}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                style={styles.actionGradient}
              >
                <Ionicons name="chatbubble" size={24} color="Theme.colors.neutral[0]" />
                <Text style={styles.actionText}>Schedule Interview</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                handleStatusChange("rejected");
              }}
            >
              <LinearGradient
                colors={["Theme.colors.status.error", "#dc2626"]}
                style={styles.actionGradient}
              >
                <Ionicons name="close-circle" size={24} color="Theme.colors.neutral[0]" />
                <Text style={styles.actionText}>Reject</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Applicant</Text>
          <View style={styles.contactActions}>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Alert.alert(
                  "Email",
                  `Send email to ${application.applicantEmail}`,
                );
              }}
            >
              <LinearGradient
                colors={["Theme.colors.status.info", "#1d4ed8"]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="mail" size={20} color="Theme.colors.neutral[0]" />
                <Text style={styles.contactButtonText}>Email</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Alert.alert("Call", `Call ${application.applicantPhone}`);
              }}
            >
              <LinearGradient
                colors={["Theme.colors.status.success", "#047857"]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="call" size={20} color="Theme.colors.neutral[0]" />
                <Text style={styles.contactButtonText}>Call</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                Alert.alert(
                  "Message",
                  `Send message to ${application.applicantPhone}`,
                );
              }}
            >
              <LinearGradient
                colors={["#8b5cf6", "#7c3aed"]}
                style={styles.contactButtonGradient}
              >
                <Ionicons name="chatbubble" size={20} color="Theme.colors.neutral[0]" />
                <Text style={styles.contactButtonText}>Message</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "Theme.colors.neutral[0]",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  statusSection: {
    padding: 20,
  },
  statusCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  statusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  petImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  petDetails: {
    flex: 1,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
  },
  applicantName: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  applicationDate: {
    fontSize: 14,
    color: "Theme.colors.neutral[500]",
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "Theme.colors.neutral[800]",
    marginBottom: 12,
  },
  sectionCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  contactInfo: {
    gap: 12,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  contactText: {
    fontSize: 16,
    color: "Theme.colors.neutral[700]",
    fontWeight: "500",
  },
  lifestyleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  lifestyleItem: {
    width: "48%",
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  lifestyleLabel: {
    fontSize: 12,
    color: "Theme.colors.neutral[500]",
    fontWeight: "500",
    marginBottom: 4,
  },
  lifestyleValue: {
    fontSize: 14,
    color: "Theme.colors.neutral[800]",
    fontWeight: "600",
  },
  experienceText: {
    fontSize: 16,
    lineHeight: 24,
    color: "Theme.colors.neutral[600]",
  },
  questionsList: {
    gap: 16,
  },
  questionItem: {
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "Theme.colors.neutral[100]",
  },
  questionText: {
    fontSize: 16,
    fontWeight: "600",
    color: "Theme.colors.neutral[800]",
    marginBottom: 8,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 20,
    color: "Theme.colors.neutral[500]",
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
    color: "Theme.colors.neutral[600]",
    fontStyle: "italic",
  },
  actionsGrid: {
    gap: 12,
  },
  actionButton: {
    borderRadius: 12,
    overflow: "hidden",
  },
  actionGradient: {
    padding: 20,
    alignItems: "center",
  },
  actionText: {
    color: "Theme.colors.neutral[0]",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  contactActions: {
    flexDirection: "row",
    gap: 12,
  },
  contactButton: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  contactButtonGradient: {
    padding: 16,
    alignItems: "center",
  },
  contactButtonText: {
    color: "Theme.colors.neutral[0]",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: "Theme.colors.primary[500]",
    fontWeight: "600",
  },
});
