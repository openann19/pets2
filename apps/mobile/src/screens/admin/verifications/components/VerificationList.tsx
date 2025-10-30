import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Verification } from "../hooks/useAdminVerifications";
import { useTheme } from "@mobile/src/theme";
import type { AppTheme } from "@mobile/src/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
    listContainer: {
      paddingBottom: 16,
    },
    card: {
      borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardSelected: {
    borderWidth: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: "600",
  },
  timestamp: {
    fontSize: 12,
  },
  cardBody: {
    gap: 8,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  verificationType: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  documents: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  documentCount: {
    fontSize: 14,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
});
}


interface VerificationListProps {
  verifications: Verification[];
  selectedVerification: Verification | null;
  onSelect: (verification: Verification) => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestInfo: (id: string, message: string) => void;
}

export const VerificationList = ({
  verifications,
  selectedVerification,
  onSelect,
  onApprove,
  onReject,
  onRequestInfo,
}: VerificationListProps): React.JSX.Element => {
    const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const getStatusColor = (status: Verification["status"]) => {
    switch (status) {
      case "approved":
        return theme.colors.success;
      case "rejected":
        return theme.colors.danger;
      case "requires_info":
        return theme.colors.warning;
      default:
        return theme.colors.onMuted;
    }
  };

  const getStatusIcon = (status: Verification["status"]) => {
    switch (status) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "requires_info":
        return "alert-circle";
      default:
        return "time";
    }
  };

  const renderVerificationItem = ({ item }: { item: Verification }) => {
    const isSelected = selectedVerification?.id === item.id;
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);

    return (
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: colors.surface },
          isSelected && [styles.cardSelected, { borderColor: colors.primary }],
        ]}
        onPress={() => onSelect(item)}
        testID={`verification-${item.id}`}
        accessibilityLabel={`Verification ${item.type} from ${item.userName}`}
        accessibilityRole="button"
      >
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor} />
              <Text style={[styles.statusText, { color: statusColor }]}>
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
              </Text>
            </View>
            {item.priority === "high" && (
              <View style={[styles.priorityBadge, { backgroundColor: theme.colors.danger + "20" }]}>
                <Ionicons name="flag" size={12} color={theme.colors.danger} />
                <Text style={[styles.priorityText, { color: theme.colors.danger }]}>High</Text>
              </View>
            )}
          </View>
          <Text style={[styles.timestamp, { color: colors.onMuted }]}>
            {new Date(item.submittedAt).toLocaleDateString()}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.userInfo}>
            <Ionicons name="person" size={20} color={colors.primary} />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.onSurface }]}>{item.userName}</Text>
              <Text style={[styles.userEmail, { color: colors.onMuted }]}>
                {item.userEmail}
              </Text>
            </View>
          </View>

          <View style={styles.verificationType}>
            <Ionicons name="document-text" size={16} color={colors.onMuted} />
            <Text style={[styles.typeText, { color: colors.onMuted }]}>
              {item.type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
          </View>

          {item.documents && item.documents.length > 0 && (
            <View style={styles.documents}>
              <Ionicons name="images" size={16} color={colors.onMuted} />
              <Text style={[styles.documentCount, { color: colors.onMuted }]}>
                {item.documents.length} document{item.documents.length !== 1 ? "s" : ""}
              </Text>
            </View>
          )}
        </View>

        {isSelected && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
              onPress={() => onApprove(item.id)}
              testID={`approve-${item.id}`}
              accessibilityLabel="Approve verification"
              accessibilityRole="button"
            >
              <Ionicons name="checkmark" size={18} color={theme.colors.surface} />
              <Text style={styles.actionText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
              onPress={() => {
                // Simple request - in real app would show modal
                onRequestInfo(item.id, "Please provide additional information");
              }}
              testID={`request-info-${item.id}`}
              accessibilityLabel="Request additional information"
              accessibilityRole="button"
            >
              <Ionicons name="help-circle" size={18} color={theme.colors.surface} />
              <Text style={styles.actionText}>Request Info</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.colors.danger }]}
              onPress={() => {
                // Simple reject - in real app would show modal for reason
                onReject(item.id, "Verification rejected");
              }}
              testID={`reject-${item.id}`}
              accessibilityLabel="Reject verification"
              accessibilityRole="button"
            >
              <Ionicons name="close" size={18} color={theme.colors.surface} />
              <Text style={styles.actionText}>Reject</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={verifications}
      renderItem={renderVerificationItem}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={64} color={colors.onMuted} />
          <Text style={[styles.emptyText, { color: colors.onMuted }]}>
            No verifications found
          </Text>
        </View>
      }
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
    />
  );
};
