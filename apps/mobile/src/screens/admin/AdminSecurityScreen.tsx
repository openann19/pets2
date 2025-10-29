/**
 * Admin Security Screen for Mobile
 * Comprehensive security monitoring and threat management
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from '@mobile/src/theme';
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/api";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface SecurityAlert {
  id: string;
  type:
    | "suspicious_login"
    | "blocked_ip"
    | "reported_content"
    | "spam_detected"
    | "data_breach"
    | "unusual_activity";
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  location?: string;
  resolved: boolean;
  resolvedBy?: string;
  resolvedAt?: string;
}

interface SecurityMetrics {
  totalAlerts: number;
  criticalAlerts: number;
  highAlerts: number;
  mediumAlerts: number;
  lowAlerts: number;
  resolvedAlerts: number;
  pendingAlerts: number;
  suspiciousLogins: number;
  blockedIPs: number;
  reportedContent: number;
  spamDetected: number;
  dataBreaches: number;
  unusualActivity: number;
}

export default function AdminSecurityScreen({
  navigation,
}: AdminScreenProps<"AdminSecurity">): React.JSX.Element {
  const theme = useTheme();
  const { colors } = theme;
  const { user: _user } = useAuthStore();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<SecurityAlert[]>([]);
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<
    "all" | "critical" | "high" | "medium" | "low"
  >("all");
  const [selectedType, setSelectedType] = useState<
    | "all"
    | "suspicious_login"
    | "blocked_ip"
    | "reported_content"
    | "spam_detected"
    | "data_breach"
    | "unusual_activity"
  >("all");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    void loadSecurityData();
  }, []);

  useEffect(() => {
    filterAlerts();
  }, [alerts, selectedSeverity, selectedType]);

  const loadSecurityData = async (): Promise<void> => {
    try {
      setLoading(true);
      const [alertsResponse, metricsResponse] = await Promise.all([
        adminAPI.getSecurityAlerts({
          page: 1,
          limit: 100,
          sort: "timestamp",
          order: "desc",
        }),
        adminAPI.getSecurityMetrics(),
      ]);

      setAlerts(alertsResponse.data.alerts as SecurityAlert[]);
      setMetrics(metricsResponse.data as SecurityMetrics);
    } catch (error: unknown) {
      logger.error("Error loading security data:", { error });
      Alert.alert("Error", "Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadSecurityData();
    setRefreshing(false);
  };

  const filterAlerts = (): void => {
    let filtered = alerts;

    // Filter by severity
    if (selectedSeverity !== "all") {
      filtered = filtered.filter(
        (alert) => alert.severity === selectedSeverity,
      );
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((alert) => alert.type === selectedType);
    }

    setFilteredAlerts(filtered);
  };

  const handleResolveAlert = async (alertId: string): Promise<void> => {
    if (Haptics) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }

    try {
      setActionLoading(alertId);
      const response = await adminAPI.resolveSecurityAlert({ alertId, action: "resolved" });

      if (response.success) {
        setAlerts((prevAlerts) =>
          prevAlerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  resolved: true,
                  ...(_user?.email && { resolvedBy: _user.email }),
                  resolvedAt: new Date().toISOString(),
                }
              : alert,
          ),
        );

        Alert.alert("Success", "Alert resolved successfully");
      }
    } catch (error) {
      logger.error("Error resolving alert:", { error });
      Alert.alert("Error", "Failed to resolve alert");
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlockIP = async (alertId: string, ipAddress: string) => {
    Alert.alert(
      "Block IP Address",
      `Are you sure you want to block IP address ${ipAddress}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Block",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(alertId);
              const response = await adminAPI.blockIPAddress({ ipAddress, reason: "Manual block" });

              if (response.success) {
                Alert.alert("Success", "IP address blocked successfully");
                await loadSecurityData(); // Refresh data
              }
            } catch (error) {
              logger.error("Error blocking IP:", { error });
              Alert.alert("Error", "Failed to block IP address");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return theme.colors.danger;
      case "high":
        return theme.colors.warning;
      case "medium":
        return theme.colors.info;
      case "low":
        return theme.colors.success;
      default:
        return theme.colors.border;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "suspicious_login":
        return "log-in";
      case "blocked_ip":
        return "shield";
      case "reported_content":
        return "flag";
      case "spam_detected":
        return "mail";
      case "data_breach":
        return "lock-closed";
      case "unusual_activity":
        return "eye";
      default:
        return "alert";
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const renderAlertItem = ({ item }: { item: SecurityAlert }) => {
    const isActionLoading = actionLoading === item.id;

    return (
      <View
        style={StyleSheet.flatten([
          styles.alertCard,
          { backgroundColor: colors.surface },
          item.resolved && styles.alertCardResolved,
        ])}
      >
        <View style={styles.alertHeader}>
          <View style={styles.alertInfo}>
            <View
              style={StyleSheet.flatten([
                styles.severityIndicator,
                { backgroundColor: getSeverityColor(item.severity) },
              ])}
            />
            <View style={styles.alertDetails}>
              <View style={styles.alertTitleRow}>
                <Ionicons
                  name={getTypeIcon(item.type)}
                  size={20}
                  color={getSeverityColor(item.severity)}
                />
                <Text
                  style={StyleSheet.flatten([
                    styles.alertTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  {item.title}
                </Text>
                <View
                  style={StyleSheet.flatten([
                    styles.severityBadge,
                    { backgroundColor: getSeverityColor(item.severity) },
                  ])}
                >
                  <Text style={styles.severityText}>
                    {item.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.alertDescription,
                  { color: colors.onMuted },
                ])}
              >
                {item.description}
              </Text>
              <Text
                style={StyleSheet.flatten([
                  styles.alertTimestamp,
                  { color: colors.onMuted },
                ])}
              >
                {formatDate(item.timestamp)}
              </Text>
            </View>
          </View>

          {!item.resolved && (
            <View style={styles.alertActions}>
              <TouchableOpacity
                style={StyleSheet.flatten([
                  styles.actionButton,
                  { backgroundColor: theme.colors.success },
                ])}
                 testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleResolveAlert(item.id)}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator size="small" color={theme.colors.onSurface} }/>
                ) : (
                  <Ionicons name="checkmark" size={16} color={theme.colors.onSurface} }/>
                )}
              </TouchableOpacity>

              {item.ipAddress ? (
                <TouchableOpacity
                  style={StyleSheet.flatten([
                    styles.actionButton,
                    { backgroundColor: theme.colors.danger },
                  ])}
                   testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => handleBlockIP(item.id, item.ipAddress!)}
                  disabled={isActionLoading}
                >
                  <Ionicons name="ban" size={16} color={theme.colors.onSurface} }/>
                </TouchableOpacity>
              ) : null}
            </View>
          )}
        </View>

        {item.resolved ? (
          <View style={styles.resolvedInfo}>
            <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} }/>
            <Text
              style={StyleSheet.flatten([
                styles.resolvedText,
                { color: colors.onMuted },
              ])}
            >
              Resolved by {item.resolvedBy} on {formatDate(item.resolvedAt!)}
            </Text>
          </View>
        ) : null}

        {/* Additional Info */}
        <View style={styles.alertMeta}>
          {item.userEmail ? (
            <View style={styles.metaItem}>
              <Ionicons name="person" size={14} color={colors.onMuted} />
              <Text
                style={StyleSheet.flatten([
                  styles.metaText,
                  { color: colors.onMuted },
                ])}
              >
                {item.userEmail}
              </Text>
            </View>
          ) : null}
          {item.ipAddress ? (
            <View style={styles.metaItem}>
              <Ionicons name="globe" size={14} color={colors.onMuted} />
              <Text
                style={StyleSheet.flatten([
                  styles.metaText,
                  { color: colors.onMuted },
                ])}
              >
                {item.ipAddress}
              </Text>
            </View>
          ) : null}
          {item.location ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="location"
                size={14}
                color={colors.onMuted}
              />
              <Text
                style={StyleSheet.flatten([
                  styles.metaText,
                  { color: colors.onMuted },
                ])}
              >
                {item.location}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.background },
        ])}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text
            style={StyleSheet.flatten([
              styles.loadingText,
              { color: colors.onSurface},
            ])}
          >
            Loading security data...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={StyleSheet.flatten([
        styles.container,
        { backgroundColor: colors.background },
      ])}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
           testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
            navigation.goBack();
          }}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.onSurface }//>
        </TouchableOpacity>
        <Text
          style={StyleSheet.flatten([styles.title, { color: colors.onSurface}])}
        >
          Security Dashboard
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={StyleSheet.flatten([
              styles.refreshButton,
              { backgroundColor: colors.primary },
            ])}
             testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={onRefresh}
            disabled={refreshing}
          >
            <Ionicons name="refresh" size={20} color={theme.colors.onSurface} }/>
          </TouchableOpacity>
        </View>
      </View>

      {/* Security Metrics */}
      {metrics ? (
        <View style={styles.metricsContainer}>
          <Text
            style={StyleSheet.flatten([
              styles.sectionTitle,
              { color: colors.onSurface},
            ])}
          >
            Security Overview
          </Text>
          <View style={styles.metricsGrid}>
            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.danger} }/>
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Critical
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: theme.colors.danger },
                ])}
              >
                {metrics.criticalAlerts}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="warning" size={20} color={theme.colors.warning} }/>
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  High
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: theme.colors.warning },
                ])}
              >
                {metrics.highAlerts}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="information-circle" size={20} color={theme.colors.info} }/>
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Medium
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: theme.colors.info },
                ])}
              >
                {metrics.mediumAlerts}
              </Text>
            </View>

            <View
              style={StyleSheet.flatten([
                styles.metricCard,
                { backgroundColor: colors.surface },
              ])}
            >
              <View style={styles.metricHeader}>
                <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} }/>
                <Text
                  style={StyleSheet.flatten([
                    styles.metricTitle,
                    { color: colors.onSurface},
                  ])}
                >
                  Resolved
                </Text>
              </View>
              <Text
                style={StyleSheet.flatten([
                  styles.metricValue,
                  { color: theme.colors.success },
                ])}
              >
                {metrics.resolvedAlerts}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <Text
            style={StyleSheet.flatten([
              styles.filterLabel,
              { color: colors.onSurface},
            ])}
          >
            Severity:
          </Text>
          <View style={styles.filterButtons}>
            {(["all", "critical", "high", "medium", "low"] as const).map(
              (severity) => (
                <TouchableOpacity
                  key={severity}
                  style={StyleSheet.flatten([
                    styles.filterButton,
                    selectedSeverity === severity && styles.filterButtonActive,
                    {
                      backgroundColor:
                        selectedSeverity === severity
                          ? colors.primary
                          : colors.surface,
                    },
                  ])}
                   testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                    setSelectedSeverity(severity);
                  }}
                >
                  <Text
                    style={StyleSheet.flatten([
                      styles.filterText,
                      {
                        color:
                          selectedSeverity === severity
                            ? theme.colors.onSurface
                            : colors.onSurface
                      },
                    ])}
                  >
                    {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  </Text>
                </TouchableOpacity>
              ),
            )}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text
            style={StyleSheet.flatten([
              styles.filterLabel,
              { color: colors.onSurface},
            ])}
          >
            Type:
          </Text>
          <View style={styles.filterButtons}>
            {(
              [
                "all",
                "suspicious_login",
                "blocked_ip",
                "reported_content",
                "spam_detected",
                "data_breach",
                "unusual_activity",
              ] as const
            ).map((type) => (
              <TouchableOpacity
                key={type}
                style={StyleSheet.flatten([
                  styles.filterButton,
                  selectedType === type && styles.filterButtonActive,
                  {
                    backgroundColor:
                      selectedType === type ? colors.primary : colors.surface,
                  },
                ])}
                 testID="AdminSecurityScreen-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
                  setSelectedType(type);
                }}
              >
                <Text
                  style={StyleSheet.flatten([
                    styles.filterText,
                    { color: selectedType === type ? theme.colors.onSurface : colors.onSurface},
                  ])}
                >
                  {type
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Alerts List */}
      <FlatList
        data={filteredAlerts}
        renderItem={renderAlertItem}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    flex: 1,
    marginLeft: 8,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 44) / 2,
    borderRadius: 12,
    padding: 16,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metricTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 60,
  },
  filterButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterButtonActive: {
    // Active state handled by backgroundColor
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  alertCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: theme.colors.onSurface,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  alertCardResolved: {
    opacity: 0.7,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  alertInfo: {
    flexDirection: "row",
    flex: 1,
  },
  severityIndicator: {
    width: 4,
    height: "100%",
    borderRadius: 2,
    marginRight: 12,
  },
  alertDetails: {
    flex: 1,
  },
  alertTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  severityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    color: theme.colors.onSurface,
    fontSize: 10,
    fontWeight: "600",
  },
  alertDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  alertTimestamp: {
    fontSize: 12,
  },
  alertActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  resolvedInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  resolvedText: {
    fontSize: 12,
    fontStyle: "italic",
  },
  alertMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
});
