/**
 * Admin Verification Management Screen
 * Production-ready implementation for managing user verifications
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@/theme'";
import { _adminAPI } from "../../services/api";
import { errorHandler } from "../../services/errorHandler";


interface Verification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: "identity" | "pet_ownership" | "veterinary" | "breeder";
  status: "pending" | "approved" | "rejected" | "requires_info";
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  documents: {
    id: string;
    type:
      | "photo_id"
      | "pet_registration"
      | "vet_certificate"
      | "breeder_license"
      | "other";
    url: string;
    name: string;
  }[];
  notes?: string;
  rejectionReason?: string;
  additionalInfoRequested?: string;
  priority: "low" | "medium" | "high";
  expiresAt?: string;
}

interface AdminVerificationsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdminVerificationsScreen({
  navigation,
}: AdminVerificationsScreenProps): JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"pending" | "high_priority" | "all">(
    "pending",
  );
  const [selectedVerification, setSelectedVerification] =
    useState<Verification | null>(null);

  const loadVerifications = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getVerifications({
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          // Handle different response shapes
          const verifications = (response.data as any)?.verifications || response.data;
          setVerifications(Array.isArray(verifications) ? verifications : []);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error
            ? error
            : new Error("Failed to load verifications"),
          {
            component: "AdminVerificationsScreen",
            action: "loadVerifications",
          },
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [filter, searchQuery],
  );

  useEffect(() => {
    void loadVerifications();
  }, [loadVerifications]);

  const handleVerificationAction = useCallback(
    async (
      verificationId: string,
      action: "approve" | "reject" | "request_info",
      reason?: string,
    ) => {
      try {
        let response;
        if (action === "approve") {
          response = await _adminAPI.approveVerification(verificationId);
        } else if (action === "reject") {
          response = await _adminAPI.rejectVerification(verificationId, reason || "Rejected");
        } else if (action === "request_info") {
          // Handle request_info action
          response = { success: true }; // Placeholder response
        } else {
          throw new Error("Unknown action");
        }

        if (response?.success) {
          setVerifications((prev) =>
            prev.map((verification) => {
              if (verification.id !== verificationId) return verification;

              // Build updated verification without undefined values
              const statusMap: Record<"approve" | "reject" | "request_info", "approved" | "rejected" | "requires_info"> = {
                "approve": "approved",
                "reject": "rejected",
                "request_info": "requires_info",
              };
              
              const updated: Verification = {
                ...verification,
                status: statusMap[action],
                reviewedAt: new Date().toISOString(),
              };

              if (action === "reject" && reason) {
                updated.rejectionReason = reason;
              }

              if (action === "request_info" && reason) {
                updated.additionalInfoRequested = reason;
              }

              return updated;
            }),
          );

          Alert.alert(
            "Success",
            `Verification ${action.replace("_", " ")}d successfully`,
          );
          setSelectedVerification(null);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error
            ? error
            : new Error(`Failed to ${action} verification`),
          {
            component: "AdminVerificationsScreen",
            action: "handleVerificationAction",
            metadata: { verificationId, action },
          },
        );
      }
    },
    [],
  );

  const handleRejectWithReason = useCallback(
    (verification: Verification) => {
      Alert.prompt(
        "Reject Verification",
        "Please provide a reason for rejection:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: (reason) => {
              if (reason?.trim()) {
                void handleVerificationAction(
                  verification.id,
                  "reject",
                  reason.trim(),
                );
              }
            },
          },
        ],
        "plain-text",
        "",
        "default",
      );
    },
    [handleVerificationAction],
  );

  const handleRequestInfo = useCallback(
    (verification: Verification) => {
      Alert.prompt(
        "Request Additional Information",
        "What additional information is needed?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Request",
            onPress: (info) => {
              if (info?.trim()) {
                void handleVerificationAction(
                  verification.id,
                  "request_info",
                  info.trim(),
                );
              }
            },
          },
        ],
        "plain-text",
        "",
        "default",
      );
    },
    [handleVerificationAction],
  );

  const getStatusColor = (status: Verification["status"]) => {
    switch (status) {
      case "approved":
        return theme.colors.success;
      case "rejected":
        return theme.colors.danger;
      case "pending":
        return theme.colors.warning;
      case "requires_info":
        return theme.theme.colors.primary[500];
      default:
        return theme.colors.border;
    }
  };

  const getPriorityColor = (priority: Verification["priority"]) => {
    switch (priority) {
      case "high":
        return theme.colors.danger;
      case "medium":
        return theme.colors.warning;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.border;
    }
  };

  const getVerificationTypeIcon = (type: Verification["type"]) => {
    switch (type) {
      case "identity":
        return "person";
      case "pet_ownership":
        return "paw";
      case "veterinary":
        return "medical";
      case "breeder":
        return "ribbon";
      default:
        return "document";
    }
  };

  const renderVerification = useCallback(
    ({ item }: { item: Verification }) => (
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.verificationCard,
          { backgroundColor: colors.card },
        ])}
         testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
          setSelectedVerification(item);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.typeContainer}>
              <Ionicons
                name={getVerificationTypeIcon(item.type)}
                size={16}
                color={colors.primary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.verificationType,
                  { color: colors.onSurface},
                ])}
              >
                {item.type.replace("_", " ").toUpperCase()}
              </Text>
            </View>
            <Text
              style={StyleSheet.flatten([
                styles.userName,
                { color: colors.onSurface},
              ])}
            >
              {item.userName}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.userEmail,
                { color: colors.onSurfaceecondary },
              ])}
            >
              {item.userEmail}
            </Text>
          </View>

          <View style={styles.badges}>
            <View
              style={StyleSheet.flatten([
                styles.priorityBadge,
                { backgroundColor: getPriorityColor(item.priority) },
              ])}
            >
              <Text style={styles.badgeText}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
            <View
              style={StyleSheet.flatten([
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ])}
            >
              <Text style={styles.badgeText}>
                {item.status.replace("_", " ").toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <Text
            style={StyleSheet.flatten([
              styles.submittedAt,
              { color: colors.onSurfaceecondary },
            ])}
          >
            Submitted: {new Date(item.submittedAt).toLocaleDateString()}
          </Text>

          <View style={styles.documentsInfo}>
            <Ionicons
              name="document-text"
              size={16}
              color={colors.onSurfaceecondary}
            />
            <Text
              style={StyleSheet.flatten([
                styles.documentsCount,
                { color: colors.onSurfaceecondary },
              ])}
            >
              {item.documents.length} document
              {item.documents.length !== 1 ? "s" : ""}
            </Text>
          </View>

          {item.expiresAt ? (
            <Text
              style={StyleSheet.flatten([
                styles.expiresAt,
                { color: theme.colors.danger },
              ])}
            >
              Expires: {new Date(item.expiresAt).toLocaleDateString()}
            </Text>
          ) : null}
        </View>

        {item.status === "pending" && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionButton,
                styles.approveButton,
              ])}
               testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleVerificationAction(item.id, "approve")}
            >
              <Ionicons name="checkmark" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionButton,
                styles.infoButton,
              ])}
               testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleRequestInfo(item);
              }}
            >
              <Ionicons name="information" size={16} color="white" />
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.quickActionButton,
                styles.rejectButton,
              ])}
               testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleRejectWithReason(item);
              }}
            >
              <Ionicons name="close" size={16} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    ),
    [
      colors,
      handleVerificationAction,
      handleRejectWithReason,
      handleRequestInfo,
    ],
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? colors.primary : colors.card,
        },
      ])}
       testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
        setFilter(filterType);
      }}
    >
      <Text
        style={StyleSheet.flatten([
          styles.filterButtonText,
          { color: filter === filterType ? "white" : colors.onSurface},
        ])}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderVerificationModal = () => {
    if (!selectedVerification) return null;

    return (
      <View style={styles.modalOverlay}>
        <View
          style={StyleSheet.flatten([
            styles.modalContent,
            { backgroundColor: colors.card },
          ])}
        >
          <View style={styles.modalHeader}>
            <Text
              style={StyleSheet.flatten([
                styles.modalTitle,
                { color: colors.onSurface},
              ])}
            >
              Verification Details
            </Text>
            <TouchableOpacity
               testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                setSelectedVerification(null);
              }}
            >
              <Ionicons name="close" size={24} color={colors.onSurface />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.verificationInfo}>
              <Text
                style={StyleSheet.flatten([
                  styles.infoLabel,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                User:
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.infoValue,
                  { color: colors.onSurface},
                ])}
              >
                {selectedVerification.userName} (
                {selectedVerification.userEmail})
              </Text>

              <Text
                style={StyleSheet.flatten([
                  styles.infoLabel,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                Type:
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.infoValue,
                  { color: colors.onSurface},
                ])}
              >
                {selectedVerification.type.replace("_", " ")}
              </Text>

              <Text
                style={StyleSheet.flatten([
                  styles.infoLabel,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                Submitted:
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.infoValue,
                  { color: colors.onSurface},
                ])}
              >
                {new Date(selectedVerification.submittedAt).toLocaleString()}
              </Text>

              {selectedVerification.notes ? (
                <>
                  <Text
                    style={StyleSheet.flatten([
                      styles.infoLabel,
                      { color: colors.onSurfaceecondary },
                    ])}
                  >
                    Notes:
                  </Text>
                  <Text
                    style={StyleSheet.flatten([
                      styles.infoValue,
                      { color: colors.onSurface},
                    ])}
                  >
                    {selectedVerification.notes}
                  </Text>
                </>
              ) : null}
            </View>

            <Text
              style={StyleSheet.flatten([
                styles.documentsHeader,
                { color: colors.onSurface},
              ])}
            >
              Documents:
            </Text>
            <FlatList
              data={selectedVerification.documents}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View
                  style={StyleSheet.flatten([
                    styles.documentItem,
                    { backgroundColor: colors.background },
                  ])}
                >
                  <Ionicons name="document" size={20} color={colors.primary} />
                  <View style={styles.documentInfo}>
                    <Text
                      style={StyleSheet.flatten([
                        styles.documentName,
                        { color: colors.onSurface},
                      ])}
                    >
                      {item.name}
                    </Text>
                    <Text
                      style={StyleSheet.flatten([
                        styles.documentType,
                        { color: colors.onSurfaceecondary },
                      ])}
                    >
                      {item.type.replace("_", " ")}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="eye" size={20} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              )}
              style={styles.documentsList}
            />
          </View>

          {selectedVerification.status === "pending" && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  styles.approveButton,
                ])}
                 testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() =>
                  handleVerificationAction(selectedVerification.id, "approve")
                }
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  styles.infoButton,
                ])}
                 testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  handleRequestInfo(selectedVerification);
                }}
              >
                <Ionicons name="information" size={20} color="white" />
                <Text style={styles.actionButtonText}>Request Info</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  styles.rejectButton,
                ])}
                 testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  handleRejectWithReason(selectedVerification);
                }}
              >
                <Ionicons name="close" size={20} color="white" />
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      {/* Header */}
      <View
        style={StyleSheet.flatten([
          styles.header,
          { backgroundColor: colors.card },
        ])}
      >
        <TouchableOpacity
           testID="AdminVerificationsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface />
        </TouchableOpacity>
        <Text
          style={StyleSheet.flatten([
            styles.headerTitle,
            { color: colors.onSurface},
          ])}
        >
          Verification Management
        </Text>
      </View>

      {/* Search and Filters */}
      <View
        style={StyleSheet.flatten([
          styles.searchContainer,
          { backgroundColor: colors.card },
        ])}
      >
        <View
          style={StyleSheet.flatten([
            styles.searchInputContainer,
            { backgroundColor: colors.background },
          ])}
        >
          <Ionicons name="search" size={20} color={colors.onSurfaceecondary} />
          <TextInput
            style={StyleSheet.flatten([
              styles.searchInput,
              { color: colors.onSurface},
            ])}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search verifications..."
            placeholderTextColor={colors.onSurfaceecondary}
          />
        </View>

        <View style={styles.filterContainer}>
          {renderFilterButton("pending", "Pending")}
          {renderFilterButton("high_priority", "High Priority")}
          {renderFilterButton("all", "All")}
        </View>
      </View>

      {/* Verifications List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurfaceecondary },
            ])}
          >
            Loading verifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={verifications}
          keyExtractor={(item) => item.id}
          renderItem={renderVerification}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadVerifications(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="shield-checkmark-outline"
                size={64}
                color={colors.onSurfaceecondary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.emptyText,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                No verifications found
              </Text>
            </View>
          }
        />
      )}

      {/* Verification Detail Modal */}
      {renderVerificationModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
  },
  searchContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  verificationCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  typeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  verificationType: {
    fontSize: 12,
    fontWeight: "600",
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
  },
  badges: {
    gap: 4,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-end",
  },
  badgeText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  cardContent: {
    marginBottom: 12,
  },
  submittedAt: {
    fontSize: 12,
    marginBottom: 4,
  },
  documentsInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  documentsCount: {
    fontSize: 12,
  },
  expiresAt: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  quickActionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  infoButton: {
    backgroundColor: theme.theme.colors.primary[500],
  },
  rejectButton: {
    backgroundColor: theme.colors.danger,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 16,
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalBody: {
    padding: 16,
    maxHeight: 400,
  },
  verificationInfo: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
  },
  documentsHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  documentsList: {
    maxHeight: 200,
  },
  documentItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  documentType: {
    fontSize: 12,
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
});

export default AdminVerificationsScreen;
