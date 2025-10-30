import React from "react";
/**
 * Admin Chat Moderation Screen
 * Production-ready implementation for moderating user chats
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
import { useTheme } from '@mobile/src/theme';
import { _adminAPI } from "../../services/api";
import { errorHandler } from "../../services/errorHandler";


interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  message: string;
  timestamp: string;
  flagged: boolean;
  flagReason?: string;
  reviewed: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  action?: "approved" | "removed" | "warned";
}

interface AdminChatsScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function AdminChatsScreen({ navigation }: AdminChatsScreenProps): React.JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "flagged" | "unreviewed">(
    "flagged",
  );

  const loadMessages = useCallback(
    async (refresh = false) => {
      try {
        if (refresh) setRefreshing(true);
        else setLoading(true);

        const response = await _adminAPI.getChatMessages({
          filter,
          search: searchQuery,
          limit: 50,
        });

        if (response?.success && response.data) {
          // Ensure data is an array
          const dataArray = Array.isArray(response.data) ? response.data : [response.data];
          setMessages(dataArray as ChatMessage[]);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error
            ? error
            : new Error("Failed to load chat messages"),
          {
            component: "AdminChatsScreen",
            action: "loadMessages",
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
    void loadMessages();
  }, [loadMessages]);

  const handleMessageAction = useCallback(
    async (messageId: string, action: "approve" | "remove" | "warn") => {
      try {
        const response = await _adminAPI.moderateMessage({
          messageId,
          action,
        });

        if (response?.success) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === messageId
                ? {
                    ...msg,
                    reviewed: true,
                    reviewedAt: new Date().toISOString(),
                    action:
                      action === "approve"
                        ? "approved"
                        : action === "remove"
                          ? "removed"
                          : "warned",
                  }
                : msg,
            ),
          );

          Alert.alert("Success", `Message ${action}d successfully`);
        }
      } catch (error) {
        errorHandler.handleError(
          error instanceof Error
            ? error
            : new Error(`Failed to ${action} message`),
          {
            component: "AdminChatsScreen",
            action: "handleMessageAction",
            metadata: { messageId, action },
          },
        );
      }
    },
    [],
  );

  const renderMessage = useCallback(
    ({ item }: { item: ChatMessage }) => (
      <View
        style={StyleSheet.flatten([
          styles.messageCard,
          { backgroundColor: colors.card },
        ])}
      >
        <View style={styles.messageHeader}>
          <View style={styles.userInfo}>
            <Text
              style={StyleSheet.flatten([
                styles.senderName,
                { color: colors.onSurface},
              ])}
            >
              {item.senderName} → {item.receiverName}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.timestamp,
                { color: colors.onMuted },
              ])}
            >
              {new Date(item.timestamp).toLocaleString()}
            </Text>
          </View>
          {item.flagged ? (
            <View
              style={StyleSheet.flatten([
                styles.flagBadge,
                { backgroundColor: theme.colors.danger },
              ])}
            >
              <Ionicons name="flag" size={12} color="white" />
              <Text style={styles.flagText}>Flagged</Text>
            </View>
          ) : null}
        </View>

        <Text
          style={StyleSheet.flatten([
            styles.messageText,
            { color: colors.onSurface},
          ])}
        >
          {item.message}
        </Text>

        {item.flagReason ? (
          <Text
            style={StyleSheet.flatten([
              styles.flagReason,
              { color: theme.colors.danger },
            ])}
          >
            Reason: {item.flagReason}
          </Text>
        ) : null}

        {item.reviewed ? (
          <View
            style={StyleSheet.flatten([
              styles.reviewedBadge,
              { backgroundColor: colors.success },
            ])}
          >
            <Text style={styles.reviewedText}>
              {item.action?.toUpperCase()} by {item.reviewedBy}
            </Text>
          </View>
        ) : (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.approveButton,
              ])}
               testID="AdminChatsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleMessageAction(item.id, "approve")}
            >
              <Ionicons name="checkmark" size={16} color="white" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.warnButton,
              ])}
               testID="AdminChatsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleMessageAction(item.id, "warn")}
            >
              <Ionicons name="warning" size={16} color="white" />
              <Text style={styles.actionButtonText}>Warn</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                styles.removeButton,
              ])}
               testID="AdminChatsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleMessageAction(item.id, "remove")}
            >
              <Ionicons name="trash" size={16} color="white" />
              <Text style={styles.actionButtonText}>Remove</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    ),
    [colors, handleMessageAction],
  );

  const renderFilterButton = (filterType: typeof filter, label: string) => (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.filterButton,
        {
          backgroundColor: filter === filterType ? colors.primary : colors.card,
        },
      ])}
       testID="AdminChatsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
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
           testID="AdminChatsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface }/>
        </TouchableOpacity>
        <Text
          style={StyleSheet.flatten([
            styles.headerTitle,
            { color: colors.onSurface},
          ])}
        >
          Chat Moderation
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
          <Ionicons name="search" size={20} color={colors.onMuted} />
          <TextInput
            style={StyleSheet.flatten([
              styles.searchInput,
              { color: colors.onSurface},
            ])}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search messages..."
            placeholderTextColor={colors.onMuted}
          />
        </View>

        <View style={styles.filterContainer}>
          {renderFilterButton("flagged", "Flagged")}
          {renderFilterButton("unreviewed", "Unreviewed")}
          {renderFilterButton("all", "All")}
        </View>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onMuted },
            ])}
          >
            Loading messages...
          </Text>
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadMessages(true)}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="chatbubbles-outline"
                size={64}
                color={colors.onMuted}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.emptyText,
                  { color: colors.onMuted },
                ])}
              >
                No messages found
              </Text>
            </View>
          }
        />
      )}
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
  messageCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: theme.colors.border,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  messageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
  },
  flagBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  flagText: {
    fontSize: 12,
    color: "white",
    fontWeight: "500",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  flagReason: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 12,
  },
  reviewedBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  reviewedText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButton: {
    backgroundColor: theme.colors.success,
  },
  warnButton: {
    backgroundColor: theme.colors.warning,
  },
  removeButton: {
    backgroundColor: theme.colors.danger,
  },
  actionButtonText: {
    fontSize: 12,
    color: "white",
    fontWeight: "600",
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
});

export default AdminChatsScreen;
