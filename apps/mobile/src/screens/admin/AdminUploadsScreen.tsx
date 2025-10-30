import React from "react";
/**
 * Admin Upload Management Screen
 * Production-ready implementation for managing user uploads
 */

import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@mobile/src/theme'";
import { _adminAPI } from "../../services/api";
import { errorHandler } from "../../services/errorHandler";


const { width: SCREEN_WIDTH } = Dimensions.get("window");
const IMAGE_SIZE = (SCREEN_WIDTH - 48) / 2;

interface Upload {
  id: string;
  userId: string;
  userName: string;
  petId?: string;
  petName?: string;
  type: "profile" | "pet" | "verification";
  url: string;
  thumbnailUrl?: string;
  uploadedAt: string;
  status: "pending" | "approved" | "rejected";
  flagged: boolean;
  flagReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  metadata?: {
    fileSize: number;
    dimensions?: { width: number; height: number };
    contentType: string;
  };
}

interface AdminUploadsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdminUploadsScreen({
  navigation,
}: AdminUploadsScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"pending" | "flagged" | "all">(
    "pending",
  );
  const [selectedUpload, setSelectedUpload] = useState<Upload | null>(null);

  const loadUploads = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getUploads({
          filter,
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          // Handle different response shapes
          const uploads = (response.data as any)?.uploads || response.data;
          setUploads(Array.isArray(uploads) ? uploads : []);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error ? error : new Error("Failed to load uploads"),
          {
            component: "AdminUploadsScreen",
            action: "loadUploads",
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
    void loadUploads();
  }, [loadUploads]);

  const handleUploadAction = useCallback(
    async (uploadId: string, action: "approve" | "reject", reason?: string) => {
      try {
        const response = await _adminAPI.moderateUpload({
          uploadId,
          action,
          ...(reason && { reason }),
        });

        if (response?.success) {
          setUploads((prev) =>
            prev.map((upload) => {
              if (upload.id !== uploadId) return upload;

              const updated: Upload = {
                ...upload,
                status: action === "approve" ? "approved" : "rejected",
                reviewedAt: new Date().toISOString(),
              };

              if (action === "reject" && reason) {
                updated.rejectionReason = reason;
              }

              return updated;
            }),
          );

          Alert.alert("Success", `Upload ${action}d successfully`);
          setSelectedUpload(null);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error
            ? error
            : new Error(`Failed to ${action} upload`),
          {
            component: "AdminUploadsScreen",
            action: "handleUploadAction",
            metadata: { uploadId, action },
          },
        );
      }
    },
    [],
  );

  const handleRejectWithReason = useCallback(
    (upload: Upload) => {
      Alert.prompt(
        "Reject Upload",
        "Please provide a reason for rejection:",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Reject",
            style: "destructive",
            onPress: (reason) => {
              if (reason?.trim()) {
                void handleUploadAction(upload.id, "reject", reason.trim());
              }
            },
          },
        ],
        "plain-text",
        "",
        "default",
      );
    },
    [handleUploadAction],
  );

  const renderUpload = useCallback(
    ({ item }: { item: Upload }) => (
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.uploadCard,
          { backgroundColor: colors.card },
        ])}
         testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
          setSelectedUpload(item);
        }}
      >
        <Image
          source={{ uri: item.thumbnailUrl || item.url }}
          style={styles.uploadImage}
          resizeMode="cover"
        />

        <View style={styles.uploadOverlay}>
          {item.flagged ? (
            <View
              style={StyleSheet.flatten([
                styles.flagBadge,
                { backgroundColor: theme.colors.danger },
              ])}
            >
              <Ionicons name="flag" size={12} color="white" />
            </View>
          ) : null}

          <View
            style={StyleSheet.flatten([
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ])}
          >
            <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.uploadInfo}>
          <Text
            style={StyleSheet.flatten([
              styles.userName,
              { color: colors.onSurface},
            ])}
            numberOfLines={1}
          >
            {item.userName}
          </Text>
          <Text
            style={StyleSheet.flatten([
              styles.uploadType,
              { color: colors.onSurfaceecondary },
            ])}
          >
            {item.type} • {new Date(item.uploadedAt).toLocaleDateString()}
          </Text>
        </View>
      </TouchableOpacity>
    ),
    [colors],
  );

  const getStatusColor = (status: Upload["status"]) => {
    switch (status) {
      case "approved":
        return theme.colors.success;
      case "rejected":
        return theme.colors.danger;
      case "pending":
        return theme.colors.warning;
      default:
        return theme.colors.border;
    }
  };

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? colors.primary : colors.card,
        },
      ])}
       testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
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

  const renderUploadModal = () => {
    if (!selectedUpload) return null;

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
              Upload Details
            </Text>
            <TouchableOpacity
               testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                setSelectedUpload(null);
              }}
            >
              <Ionicons name="close" size={24} color={colors.onSurface />
            </TouchableOpacity>
          </View>

          <Image
            source={{ uri: selectedUpload.url }}
            style={styles.modalImage}
            resizeMode="contain"
          />

          <View style={styles.uploadDetails}>
            <Text
              style={StyleSheet.flatten([
                styles.detailLabel,
                { color: colors.onSurfaceecondary },
              ])}
            >
              User:
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.detailValue,
                { color: colors.onSurface},
              ])}
            >
              {selectedUpload.userName}
            </Text>

            <Text
              style={StyleSheet.flatten([
                styles.detailLabel,
                { color: colors.onSurfaceecondary },
              ])}
            >
              Type:
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.detailValue,
                { color: colors.onSurface},
              ])}
            >
              {selectedUpload.type}
            </Text>

            <Text
              style={StyleSheet.flatten([
                styles.detailLabel,
                { color: colors.onSurfaceecondary },
              ])}
            >
              Uploaded:
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.detailValue,
                { color: colors.onSurface},
              ])}
            >
              {new Date(selectedUpload.uploadedAt).toLocaleString()}
            </Text>

            {selectedUpload.petName ? (
              <>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailLabel,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  Pet:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailValue,
                    { color: colors.onSurface},
                  ])}
                >
                  {selectedUpload.petName}
                </Text>
              </>
            ) : null}

            {selectedUpload.flagReason ? (
              <>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailLabel,
                    { color: theme.colors.danger },
                  ])}
                >
                  Flag Reason:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailValue,
                    { color: theme.colors.danger },
                  ])}
                >
                  {selectedUpload.flagReason}
                </Text>
              </>
            ) : null}

            {selectedUpload.metadata ? (
              <>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailLabel,
                    { color: colors.onSurfaceecondary },
                  ])}
                >
                  File Size:
                </Text>
                <Text
                  style={StyleSheet.flatten([
                    styles.detailValue,
                    { color: colors.onSurface},
                  ])}
                >
                  {(selectedUpload.metadata.fileSize / 1024 / 1024).toFixed(2)}{" "}
                  MB
                </Text>
              </>
            ) : null}
          </View>

          {selectedUpload.status === "pending" && (
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  styles.approveButton,
                ])}
                 testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleUploadAction(selectedUpload.id, "approve")}
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text style={styles.actionButtonText}>Approve</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  styles.rejectButton,
                ])}
                 testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  handleRejectWithReason(selectedUpload);
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
           testID="AdminUploadsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
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
          Upload Management
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
            placeholder="Search uploads..."
            placeholderTextColor={colors.onSurfaceecondary}
          />
        </View>

        <View style={styles.filterContainer}>
          {renderFilterButton("pending", "Pending")}
          {renderFilterButton("flagged", "Flagged")}
          {renderFilterButton("all", "All")}
        </View>
      </View>

      {/* Uploads Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurfaceecondary },
            ])}
          >
            Loading uploads...
          </Text>
        </View>
      ) : (
        <FlatList
          data={uploads}
          keyExtractor={(item) => item.id}
          renderItem={renderUpload}
          numColumns={2}
          contentContainerStyle={styles.listContainer}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadUploads(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="images-outline"
                size={64}
                color={colors.onSurfaceecondary}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.emptyText,
                  { color: colors.onSurfaceecondary },
                ])}
              >
                No uploads found
              </Text>
            </View>
          }
        />
      )}

      {/* Upload Detail Modal */}
      {renderUploadModal()}
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
  row: {
    justifyContent: "space-between",
  },
  uploadCard: {
    width: IMAGE_SIZE,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: theme.colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadImage: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
  },
  uploadOverlay: {
    position: "absolute",
    top: 8,
    left: 8,
    right: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flagBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    color: "white",
    fontWeight: "600",
  },
  uploadInfo: {
    padding: 12,
  },
  userName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  uploadType: {
    fontSize: 12,
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
    width: SCREEN_WIDTH - 32,
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
  modalImage: {
    width: "100%",
    height: 300,
  },
  uploadDetails: {
    padding: 16,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    padding: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  rejectButton: {
    backgroundColor: theme.colors.danger,
  },
  actionButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});

export default AdminUploadsScreen;
