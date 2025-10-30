/**
 * Application Card Component
 * Displays a single adoption application
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  applicationCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  applicationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  applicantInfo: {
    flex: 1,
    marginRight: 8,
  },
  applicantName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  petName: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  applicationDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
}


interface Application {
  id: string;
  petId: string;
  petName: string;
  applicantName: string;
  applicantEmail: string;
  status: "pending" | "approved" | "rejected" | "withdrawn";
  submittedAt: string;
  experience: string;
  livingSpace: string;
  references: number;
}

interface ApplicationCardProps {
  application: Application;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
  onApprove?: (applicationId: string) => void;
  onReject?: (applicationId: string) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  getStatusColor,
  getStatusIcon,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  return (
    <View style={[styles.applicationCard, { backgroundColor: colors.surface }]} testID={`application-card-${application.id}`} accessibilityRole="none">
      <View style={styles.applicationHeader}>
        <View style={styles.applicantInfo}>
          <Text style={[styles.applicantName, { color: colors.onSurface }]}>{application.applicantName}</Text>
          <Text style={[styles.petName, { color: colors.onMuted }]}>Applying for: {application.petName}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(application.status)}20` }]}>
          <Text style={[styles.statusText, { color: getStatusColor(application.status) }]}>
            {getStatusIcon(application.status)} {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.applicationDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="mail" size={16} color={colors.onMuted} />
          <Text style={[styles.detailText, { color: colors.onMuted }]}>{application.applicantEmail}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="home" size={16} color={colors.onMuted} />
          <Text style={[styles.detailText, { color: colors.onMuted }]}>{application.livingSpace}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="star" size={16} color={colors.onMuted} />
          <Text style={[styles.detailText, { color: colors.onMuted }]}>{application.experience}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people" size={16} color={colors.onMuted} />
          <Text style={[styles.detailText, { color: colors.onMuted }]}>{application.references} references</Text>
        </View>
      </View>

      {application.status === "pending" && onApprove && onReject && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger }]}
            onPress={() => onReject(application.id)}
            testID={`reject-app-${application.id}`}
            accessibilityLabel="Reject application"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText]}>Reject</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.success }]}
            onPress={() => onApprove(application.id)}
            testID={`approve-app-${application.id}`}
            accessibilityLabel="Approve application"
            accessibilityRole="button"
          >
            <Text style={[styles.actionButtonText]}>Approve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};
