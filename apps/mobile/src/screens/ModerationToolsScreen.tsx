import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useCallback, useEffect, useState } from "react";
import type { ComponentProps, ReactElement } from "react";
import {
  Alert,
  FlatList,
  Linking,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@mobile/theme";
import { logger } from "@pawfectmatch/core";
import { moderationAPI } from "../services/api";
import type { NavigationProp } from "@react-navigation/native";
import type { RootStackParamList } from "../navigation/types";

interface ModerationToolsScreenProps {
  navigation: NavigationProp<RootStackParamList>;
}

type IoniconName = ComponentProps<typeof Ionicons>["name"];

interface ModerationTool {
  id: string;
  title: string;
  description: string;
  icon: IoniconName;
  color: string;
  action: () => void;
  badge?: string;
}

function ModerationToolsScreen({
  navigation,
}: ModerationToolsScreenProps): ReactElement {
  const theme = useTheme();
  const styles = makeStyles(theme);
  const [pendingReports, setPendingReports] = useState(12);
  const [activeModerators, setActiveModerators] = useState(47);
  const [resolutionRate, setResolutionRate] = useState(98.5);
  const [refreshing, setRefreshing] = useState(false);

  // Load moderation stats on mount
  useEffect(() => {
    void loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const stats = await moderationAPI.getStats();
      setPendingReports(stats.pendingReports);
      setActiveModerators(stats.activeModerators);
      setResolutionRate(stats.resolutionRate);
    } catch (error) {
      logger.error('Failed to load moderation stats', { error });
      // Keep default values on error
    }
  };

  const moderationTools: ModerationTool[] = [
    {
      id: "reports",
      title: "User Reports",
      description: "Review and moderate reported content",
      icon: "flag-outline",
      color: theme.colors.danger,
      badge: pendingReports.toString(),
      action: () => {
        // Navigate to moderation reports screen (using AdminUploads as reports are handled there)
        // In a real app, you'd have a dedicated AdminReports screen
        try {
          (navigation as any).navigate("AdminUploads");
        } catch (error) {
          logger.error("Failed to navigate to reports", { error });
          Alert.alert("Navigation Error", "Unable to navigate to reports screen.");
        }
      },
    },
    {
      id: "content",
      title: "Content Moderation",
      description: "Review photos and profiles for violations",
      icon: "images-outline",
      color: theme.colors.warning,
      action: () => {
        // Navigate to uploads screen for content moderation
        try {
          (navigation as any).navigate("AdminUploads");
        } catch (error) {
          logger.error("Failed to navigate to content moderation", { error });
          Alert.alert("Navigation Error", "Unable to navigate to content moderation.");
        }
      },
    },
    {
      id: "messages",
      title: "Message Monitoring",
      description: "Monitor chat messages for inappropriate content",
      icon: "chatbubble-ellipses-outline",
      color: theme.colors.info,
      action: () => {
        // Navigate to admin chats screen
        try {
          (navigation as any).navigate("AdminChats");
        } catch (error) {
          logger.error("Failed to navigate to message monitoring", { error });
          navigation.goBack();
        }
      },
    },
    {
      id: "users",
      title: "User Management",
      description: "Manage user accounts and permissions",
      icon: "people-outline",
      color: theme.colors.success,
      action: () => {
        // Navigate to admin users screen
        try {
          (navigation as any).navigate("AdminUsers");
        } catch (error) {
          logger.error("Failed to navigate to user management", { error });
          Alert.alert("Navigation Error", "Unable to navigate to user management.");
        }
      },
    },
    {
      id: "analytics",
      title: "Moderation Analytics",
      description: "View moderation statistics and reports",
      icon: "bar-chart-outline",
      color: theme.colors.info,
      action: () => {
        // Navigate to admin analytics screen
        try {
          (navigation as any).navigate("AdminAnalytics");
        } catch (error) {
          logger.error("Failed to navigate to analytics", { error });
          Alert.alert("Navigation Error", "Unable to navigate to analytics dashboard.");
        }
      },
    },
    {
      id: "settings",
      title: "Moderation Settings",
      description: "Configure moderation rules and thresholds",
      icon: "settings-outline",
      color: theme.colors.primary,
      action: () => {
        // Navigate to admin config screen for moderation settings
        try {
          (navigation as any).navigate("AdminConfig");
        } catch (error) {
          logger.error("Failed to navigate to moderation settings", { error });
          Alert.alert("Navigation Error", "Unable to navigate to moderation settings.");
        }
      },
    },
  ];

  const handleToolPress = useCallback(
    (tool: ModerationTool) => {
      Haptics.selectionAsync().catch(() => {});
      tool.action();
    },
    [navigation],
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadStats();
    } catch (error) {
      logger.error('Failed to refresh moderation stats', { error });
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={theme.palette.gradients.primary}
        style={StyleSheet.absoluteFillObject}
      />

      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
             testID="ModerationToolsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(
                () => {},
              );
              navigation.goBack();
            }}
          >
            <BlurView intensity={20} style={styles.backButtonBlur}>
              <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
            </BlurView>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Moderation Tools</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Stats Bar */}
        <BlurView intensity={15} style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{pendingReports}</Text>
            <Text style={styles.statLabel}>Pending Reports</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{activeModerators}</Text>
            <Text style={styles.statLabel}>Active Moderators</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{resolutionRate.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>Resolution Rate</Text>
          </View>
        </BlurView>

        {/* Content */}
        <FlatList
          data={moderationTools}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={theme.colors.onSurface}
            />
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.toolCard}
               testID="ModerationToolsScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                handleToolPress(item);
              }}
            >
              <BlurView intensity={20} style={styles.toolBlur}>
                <View style={styles.toolContent}>
                  <View
                    style={StyleSheet.flatten([
                      styles.toolIcon,
                      { backgroundColor: item.color },
                    ])}
                  >
                    <Ionicons name={item.icon} size={24} color={theme.colors.onPrimary} />
                  </View>
                  <View style={styles.toolText}>
                    <View style={styles.toolHeader}>
                      <Text style={styles.toolTitle}>{item.title}</Text>
                      {item.badge && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{item.badge}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.toolDescription}>
                      {item.description}
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.colors.onMuted}
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          )}
          ListHeaderComponent={
            <BlurView intensity={10} style={styles.infoCard}>
              <Ionicons
                name="shield-checkmark-outline"
                size={24}
                color={theme.colors.success}
              />
              <Text style={styles.infoText}>
                Use these tools to maintain a safe and positive community for
                all pet lovers.
              </Text>
            </BlurView>
          }
        />

        {/* Quick Actions */}
        <BlurView intensity={15} style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
             testID="ModerationToolsScreen-button-2" accessibilityLabel="Emergency moderation mode" accessibilityRole="button" onPress={() => {
              // Navigate to admin security screen for emergency actions
              try {
                (navigation as any).navigate("AdminSecurity");
              } catch (error) {
                logger.error("Failed to navigate to emergency mode", { error });
                Alert.alert(
                  "Emergency Mode",
                  "Navigate to Security Dashboard for emergency moderation actions.",
                );
              }
            }}
          >
            <Ionicons name="warning-outline" size={20} color={theme.colors.danger} />
            <Text style={styles.quickActionText}>Emergency Mode</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
             testID="ModerationToolsScreen-button-2" accessibilityLabel="Community guidelines" accessibilityRole="button" onPress={async () => {
              try {
                const url = 'https://pawfectmatch.com/community-guidelines';
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  await Linking.openURL(url);
                  logger.info('Community guidelines opened', { url });
                } else {
                  Alert.alert('Guidelines', `Visit ${url} to view community guidelines.`);
                }
              } catch (error) {
                logger.error('Failed to open guidelines', { error });
                Alert.alert('Error', 'Unable to open community guidelines.');
              }
            }}
          >
            <Ionicons name="document-text-outline" size={20} color={theme.colors.info} />
            <Text style={styles.quickActionText}>Guidelines</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionButton}
             testID="ModerationToolsScreen-button-2" accessibilityLabel="Moderator training" accessibilityRole="button" onPress={async () => {
              try {
                const url = 'https://pawfectmatch.com/moderator-training';
                const canOpen = await Linking.canOpenURL(url);
                if (canOpen) {
                  await Linking.openURL(url);
                  logger.info('Moderator training opened', { url });
                } else {
                  Alert.alert('Training', `Visit ${url} to access moderator training resources.`);
                }
              } catch (error) {
                logger.error('Failed to open training', { error });
                Alert.alert('Error', 'Unable to open training resources.');
              }
            }}
          >
            <Ionicons name="school-outline" size={20} color={theme.colors.success} />
            <Text style={styles.quickActionText}>Training</Text>
          </TouchableOpacity>
        </BlurView>
      </SafeAreaView>
    </View>
  );
}

const makeStyles = (theme: ReturnType<typeof useTheme>) =>
  StyleSheet.create({
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
      color: theme.colors.onSurface,
    },
    headerSpacer: {
      width: 40,
    },
    statsBar: {
      marginHorizontal: 20,
      marginBottom: 16,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-around",
    },
    statItem: {
      alignItems: "center",
    },
    statNumber: {
      fontSize: 20,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    statLabel: {
      fontSize: 12,
      color: theme.colors.onMuted,
      marginTop: 2,
    },
    statDivider: {
      width: 1,
      height: 30,
      backgroundColor: theme.colors.border,
      opacity: 0.5,
    },
    listContainer: {
      paddingHorizontal: 20,
      paddingBottom: 100,
    },
    infoCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
      borderRadius: 12,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    infoText: {
      flex: 1,
      marginStart: theme.spacing.sm,
      fontSize: 14,
      color: theme.colors.onSurface,
      lineHeight: 20,
    },
    toolCard: {
      marginBottom: 12,
      borderRadius: 16,
      overflow: "hidden",
    },
    toolBlur: {
      padding: 16,
    },
    toolContent: {
      flexDirection: "row",
      alignItems: "center",
    },
    toolIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      marginEnd: theme.spacing.lg,
    },
    toolText: {
      flex: 1,
    },
    toolHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 4,
    },
    toolTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: theme.colors.onSurface,
    },
    badge: {
      backgroundColor: theme.colors.danger,
      borderRadius: 10,
      paddingHorizontal: 8,
      paddingVertical: 2,
      marginLeft: 8,
    },
    badgeText: {
      color: theme.colors.onPrimary,
      fontSize: 12,
      fontWeight: "bold",
    },
    toolDescription: {
      fontSize: 14,
      color: theme.colors.onMuted,
      lineHeight: 20,
    },
    quickActions: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-around",
      padding: 16,
      paddingBottom: 32,
    },
    quickActionButton: {
      alignItems: "center",
      padding: 12,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
      opacity: 0.7,
      minWidth: 80,
    },
    quickActionText: {
      color: theme.colors.onSurface,
      fontSize: 12,
      marginTop: 4,
      textAlign: "center",
    },
  });

export default ModerationToolsScreen;
