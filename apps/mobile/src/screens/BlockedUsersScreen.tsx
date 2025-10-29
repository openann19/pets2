import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import React, { useCallback, useEffect } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { useTheme } from "@mobile/src/theme";
import { useBlockedUsersScreen } from "../hooks/screens/useBlockedUsersScreen";

interface BlockedUser {
  id: string;
  name: string;
  email: string;
  blockedAt: string;
  reason?: string;
  avatar?: string;
}

interface BlockedUsersScreenProps {
  navigation: {
    goBack: () => void;
  };
}

function BlockedUsersScreen({
  navigation,
}: BlockedUsersScreenProps): JSX.Element {
  const { colors } = useTheme();
  const {
    blockedUsers,
    loading,
    refreshing,
    loadBlockedUsers,
    refreshBlockedUsers,
    unblockUser,
  } = useBlockedUsersScreen();

  useEffect(() => {
    void loadBlockedUsers();
  }, [loadBlockedUsers]);

  const handleUnblockUser = useCallback(async (userId: string) => {
    Alert.alert("Unblock User", "Are you sure you want to unblock this user?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Unblock",
        style: "destructive",
        onPress: async () => {
          await unblockUser(userId);
        },
      },
    ]);
  }, [unblockUser]);

  const _handleUnblockUser = useCallback(
    async (userId: string, userName: string) => {
      Alert.alert(
        "Unblock User",
        `Are you sure you want to unblock ${userName}? They will be able to contact you again.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Unblock",
            style: "destructive",
            onPress: async () => {
              try {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                await unblockUser(userId);
              } catch (error) {
                logger.error("Failed to unblock user:", { error });
              }
            },
          },
        ],
      );
    },
    [unblockUser],
  );

  const renderBlockedUser = useCallback(
    ({ item }: { item: BlockedUser }) => (
      <BlurView intensity={20} style={styles.userCard}>
        <View style={styles.userInfo}>
          <View
            style={StyleSheet.flatten([
              styles.avatar,
              { backgroundColor: colors.primary },
            ])}
          >
            <Text style={styles.avatarText}>
              {item.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text
              style={StyleSheet.flatten([
                styles.userName,
                { color: colors.onSurface},
              ])}
            >
              {item.name}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.userEmail,
                { color: colors.onSurfaceecondary },
              ])}
            >
              {item.email}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.blockedDate,
                { color: colors.onSurfaceecondary },
              ])}
            >
              Blocked {new Date(item.blockedAt).toLocaleDateString()}
            </Text>
            {item.reason && (
              <Text
                style={StyleSheet.flatten([
                  styles.blockReason,
                  { color: colors.danger },
                ])}
              >
                Reason: {item.reason}
              </Text>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={StyleSheet.flatten([
            styles.unblockButton,
            { backgroundColor: colors.primary },
          ])}
           testID="BlockedUsersScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleUnblockUser(item.id)}
        >
          <Ionicons name="person-remove-outline" size={16} color="white" />
          <Text style={styles.unblockButtonText}>Unblock</Text>
        </TouchableOpacity>
      </BlurView>
    ),
    [colors, handleUnblockUser],
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
             testID="BlockedUsersScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
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
          <Text style={styles.headerTitle}>Blocked Users</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Content */}
        <View style={styles.content}>
          <BlurView intensity={10} style={styles.infoCard}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.info
           } }/>
            <Text style={styles.infoText}>
              Blocked users cannot contact you or view your profile. You can
              unblock them at any time.
            </Text>
          </BlurView>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading blocked users...</Text>
            </View>
          ) : (
            <FlatList
              data={blockedUsers}
              keyExtractor={(item) => item.id}
              renderItem={renderBlockedUser}
              contentContainerStyle={styles.listContainer}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={refreshBlockedUsers}
                  tintColor="white"
                />
              }
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons
                    name="people-outline"
                    size={64}
                    color="rgba(255,255,255,0.5)"
                  />
                  <Text style={styles.emptyText}>No blocked users</Text>
                  <Text style={styles.emptySubtext}>
                    Users you block will appear here
                  </Text>
                </View>
              }
            />
          )}
        </View>
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
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "white",
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "white",
    fontSize: 16,
  },
  listContainer: {
    paddingBottom: 20,
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  userInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 2,
  },
  blockedDate: {
    fontSize: 12,
    marginBottom: 2,
  },
  blockReason: {
    fontSize: 12,
    fontStyle: "italic",
  },
  unblockButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  unblockButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 14,
    textAlign: "center",
  },
});

export default BlockedUsersScreen;
