/**
 * Admin External Services Monitoring Screen for Mobile
 * Monitoring interface for external services, APIs, and third-party integrations
 */

import { Ionicons } from "@expo/vector-icons";
import { logger, useAuthStore } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/adminAPI";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ExternalService {
  id: string;
  name: string;
  type:
    | "payment"
    | "storage"
    | "email"
    | "sms"
    | "analytics"
    | "maps"
    | "weather"
    | "ai";
  provider: string;
  status: "healthy" | "degraded" | "down" | "maintenance";
  uptime: number;
  responseTime: number;
  lastCheck: string;
  errorRate: number;
  monthlyUsage: number;
  monthlyCost: number;
  apiKeyStatus: "active" | "expired" | "invalid" | "quota_exceeded";
  endpoint: string;
}

interface ServiceAlert {
  id: string;
  serviceId: string;
  type: "error" | "warning" | "info";
  message: string;
  timestamp: string;
  resolved: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

interface ServiceMetrics {
  totalServices: number;
  healthyServices: number;
  degradedServices: number;
  downServices: number;
  averageUptime: number;
  totalMonthlyCost: number;
  totalMonthlyUsage: number;
}

export default function AdminExternalServicesScreen({
  navigation,
}: AdminScreenProps<"AdminExternalServices">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [services, setServices] = useState<ExternalService[]>([]);
  const [alerts, setAlerts] = useState<ServiceAlert[]>([]);
  const [metrics, setMetrics] = useState<ServiceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "healthy" | "degraded" | "down"
  >("all");

  useEffect(() => {
    void loadExternalServicesData();
  }, []);

  const loadExternalServicesData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockServices: ExternalService[] = [
        {
          id: "1",
          name: "Stripe Payment",
          type: "payment",
          provider: "Stripe",
          status: "healthy",
          uptime: 99.9,
          responseTime: 245,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 0.1,
          monthlyUsage: 15420,
          monthlyCost: 462.6,
          apiKeyStatus: "active",
          endpoint: "https://api.stripe.com/v1",
        },
        {
          id: "2",
          name: "Cloudinary Storage",
          type: "storage",
          provider: "Cloudinary",
          status: "healthy",
          uptime: 99.8,
          responseTime: 180,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 0.2,
          monthlyUsage: 8920,
          monthlyCost: 89.2,
          apiKeyStatus: "active",
          endpoint: "https://api.cloudinary.com/v1_1",
        },
        {
          id: "3",
          name: "SendGrid Email",
          type: "email",
          provider: "SendGrid",
          status: "degraded",
          uptime: 98.5,
          responseTime: 1200,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 1.5,
          monthlyUsage: 45600,
          monthlyCost: 45.6,
          apiKeyStatus: "active",
          endpoint: "https://api.sendgrid.com/v3",
        },
        {
          id: "4",
          name: "Twilio SMS",
          type: "sms",
          provider: "Twilio",
          status: "healthy",
          uptime: 99.7,
          responseTime: 320,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 0.3,
          monthlyUsage: 2340,
          monthlyCost: 23.4,
          apiKeyStatus: "active",
          endpoint: "https://api.twilio.com/2010-04-01",
        },
        {
          id: "5",
          name: "Google Analytics",
          type: "analytics",
          provider: "Google",
          status: "healthy",
          uptime: 99.9,
          responseTime: 150,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 0.1,
          monthlyUsage: 0,
          monthlyCost: 0,
          apiKeyStatus: "active",
          endpoint: "https://analytics.google.com/analytics/web",
        },
        {
          id: "6",
          name: "Google Maps",
          type: "maps",
          provider: "Google",
          status: "down",
          uptime: 0,
          responseTime: 0,
          lastCheck: "2024-01-15T11:45:00Z",
          errorRate: 100,
          monthlyUsage: 0,
          monthlyCost: 0,
          apiKeyStatus: "quota_exceeded",
          endpoint: "https://maps.googleapis.com/maps/api",
        },
        {
          id: "7",
          name: "OpenWeather API",
          type: "weather",
          provider: "OpenWeather",
          status: "healthy",
          uptime: 99.6,
          responseTime: 280,
          lastCheck: "2024-01-15T12:00:00Z",
          errorRate: 0.4,
          monthlyUsage: 15600,
          monthlyCost: 15.6,
          apiKeyStatus: "active",
          endpoint: "https://api.openweathermap.org/data/2.5",
        },
        {
          id: "8",
          name: "OpenAI API",
          type: "ai",
          provider: "OpenAI",
          status: "maintenance",
          uptime: 0,
          responseTime: 0,
          lastCheck: "2024-01-15T10:30:00Z",
          errorRate: 0,
          monthlyUsage: 0,
          monthlyCost: 0,
          apiKeyStatus: "active",
          endpoint: "https://api.openai.com/v1",
        },
      ];

      const mockAlerts: ServiceAlert[] = [
        {
          id: "1",
          serviceId: "3",
          type: "warning",
          message: "High response time detected (1200ms)",
          timestamp: "2024-01-15T11:30:00Z",
          resolved: false,
          severity: "medium",
        },
        {
          id: "2",
          serviceId: "6",
          type: "error",
          message: "API quota exceeded - service unavailable",
          timestamp: "2024-01-15T11:45:00Z",
          resolved: false,
          severity: "critical",
        },
        {
          id: "3",
          serviceId: "8",
          type: "info",
          message: "Scheduled maintenance in progress",
          timestamp: "2024-01-15T10:30:00Z",
          resolved: false,
          severity: "low",
        },
      ];

      const mockMetrics: ServiceMetrics = {
        totalServices: 8,
        healthyServices: 5,
        degradedServices: 1,
        downServices: 1,
        averageUptime: 87.4,
        totalMonthlyCost: 636.4,
        totalMonthlyUsage: 88880,
      };

      setServices(mockServices);
      setAlerts(mockAlerts);
      setMetrics(mockMetrics);
    } catch (error: unknown) {
      logger.error("Error loading external services data:", { error });
      Alert.alert("Error", "Failed to load external services data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadExternalServicesData();
    setRefreshing(false);
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
        return "#10B981";
      case "degraded":
        return "#F59E0B";
      case "down":
        return "#EF4444";
      case "maintenance":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "healthy":
        return "checkmark-circle";
      case "degraded":
        return "warning";
      case "down":
        return "close-circle";
      case "maintenance":
        return "construct";
      default:
        return "help-circle";
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "payment":
        return "card";
      case "storage":
        return "cloud";
      case "email":
        return "mail";
      case "sms":
        return "chatbubble";
      case "analytics":
        return "analytics";
      case "maps":
        return "map";
      case "weather":
        return "partly-sunny";
      case "ai":
        return "bulb";
      default:
        return "cog";
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "low":
        return "#10B981";
      case "medium":
        return "#F59E0B";
      case "high":
        return "#EF4444";
      case "critical":
        return "#DC2626";
      default:
        return "#6B7280";
    }
  };

  const filteredServices = services.filter((service) => {
    if (selectedFilter === "all") return true;
    return service.status === selectedFilter;
  });

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading external services...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>
            External Services
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Metrics Overview */}
        {metrics && (
          <View
            style={[
              styles.metricsContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Overview
            </Text>

            <View style={styles.metricsGrid}>
              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: colors.primary }]}>
                  {metrics.totalServices}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Total Services
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: "#10B981" }]}>
                  {metrics.healthyServices}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Healthy
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: "#F59E0B" }]}>
                  {metrics.degradedServices}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Degraded
                </Text>
              </View>

              <View style={styles.metricItem}>
                <Text style={[styles.metricValue, { color: "#EF4444" }]}>
                  {metrics.downServices}
                </Text>
                <Text
                  style={[styles.metricLabel, { color: colors.textSecondary }]}
                >
                  Down
                </Text>
              </View>
            </View>

            <View style={styles.additionalMetrics}>
              <View style={styles.additionalMetricItem}>
                <Text
                  style={[styles.additionalMetricValue, { color: colors.text }]}
                >
                  {metrics.averageUptime}%
                </Text>
                <Text
                  style={[
                    styles.additionalMetricLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Avg Uptime
                </Text>
              </View>

              <View style={styles.additionalMetricItem}>
                <Text
                  style={[styles.additionalMetricValue, { color: colors.text }]}
                >
                  ${metrics.totalMonthlyCost}
                </Text>
                <Text
                  style={[
                    styles.additionalMetricLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Monthly Cost
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: "all", label: "All", count: services.length },
              {
                key: "healthy",
                label: "Healthy",
                count: services.filter((s) => s.status === "healthy").length,
              },
              {
                key: "degraded",
                label: "Degraded",
                count: services.filter((s) => s.status === "degraded").length,
              },
              {
                key: "down",
                label: "Down",
                count: services.filter((s) => s.status === "down").length,
              },
            ].map((filter) => (
              <TouchableOpacity
                key={filter.key}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      selectedFilter === filter.key
                        ? colors.primary
                        : colors.border,
                  },
                ]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedFilter(filter.key as any);
                }}
              >
                <Text
                  style={[
                    styles.filterButtonText,
                    {
                      color:
                        selectedFilter === filter.key ? "#fff" : colors.text,
                    },
                  ]}
                >
                  {filter.label} ({filter.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Services List */}
        <View style={styles.servicesContainer}>
          {filteredServices.map((service) => (
            <View
              key={service.id}
              style={[styles.serviceCard, { backgroundColor: colors.surface }]}
            >
              <View style={styles.serviceHeader}>
                <View style={styles.serviceInfo}>
                  <Ionicons
                    name={getTypeIcon(service.type)}
                    size={24}
                    color={colors.primary}
                  />
                  <View style={styles.serviceDetails}>
                    <Text style={[styles.serviceName, { color: colors.text }]}>
                      {service.name}
                    </Text>
                    <Text
                      style={[
                        styles.serviceProvider,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {service.provider}
                    </Text>
                  </View>
                </View>

                <View style={styles.serviceStatus}>
                  <Ionicons
                    name={getStatusIcon(service.status)}
                    size={20}
                    color={getStatusColor(service.status)}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(service.status) },
                    ]}
                  >
                    {service.status.charAt(0).toUpperCase() +
                      service.status.slice(1)}
                  </Text>
                </View>
              </View>

              <View style={styles.serviceMetrics}>
                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {service.uptime}%
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Uptime
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {service.responseTime}ms
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Response
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    {service.errorRate}%
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Error Rate
                  </Text>
                </View>

                <View style={styles.metricItem}>
                  <Text style={[styles.metricValue, { color: colors.text }]}>
                    ${service.monthlyCost}
                  </Text>
                  <Text
                    style={[
                      styles.metricLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Monthly
                  </Text>
                </View>
              </View>

              <View style={styles.serviceFooter}>
                <Text
                  style={[styles.lastCheck, { color: colors.textSecondary }]}
                >
                  Last check: {new Date(service.lastCheck).toLocaleTimeString()}
                </Text>
                <View
                  style={[
                    styles.apiKeyStatus,
                    {
                      backgroundColor:
                        service.apiKeyStatus === "active"
                          ? "#10B98120"
                          : "#EF444420",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.apiKeyStatusText,
                      {
                        color:
                          service.apiKeyStatus === "active"
                            ? "#10B981"
                            : "#EF4444",
                      },
                    ]}
                  >
                    {service.apiKeyStatus.replace("_", " ").toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <View
            style={[
              styles.alertsContainer,
              { backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Active Alerts
            </Text>

            {alerts.map((alert) => (
              <View key={alert.id} style={styles.alertItem}>
                <View
                  style={[
                    styles.alertIcon,
                    {
                      backgroundColor: getSeverityColor(alert.severity) + "20",
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      alert.type === "error"
                        ? "alert-circle"
                        : alert.type === "warning"
                          ? "warning"
                          : "information-circle"
                    }
                    size={20}
                    color={getSeverityColor(alert.severity)}
                  />
                </View>

                <View style={styles.alertContent}>
                  <Text style={[styles.alertMessage, { color: colors.text }]}>
                    {alert.message}
                  </Text>
                  <Text
                    style={[
                      styles.alertTimestamp,
                      { color: colors.textSecondary },
                    ]}
                  >
                    {new Date(alert.timestamp).toLocaleString()}
                  </Text>
                </View>

                <View
                  style={[
                    styles.severityBadge,
                    {
                      backgroundColor: getSeverityColor(alert.severity) + "20",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.severityBadgeText,
                      { color: getSeverityColor(alert.severity) },
                    ]}
                  >
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  placeholder: {
    width: 40,
  },
  metricsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  metricItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  additionalMetrics: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  additionalMetricItem: {
    alignItems: "center",
  },
  additionalMetricValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  additionalMetricLabel: {
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  servicesContainer: {
    gap: 16,
    marginBottom: 24,
  },
  serviceCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  serviceInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  serviceDetails: {
    marginLeft: 12,
    flex: 1,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  serviceProvider: {
    fontSize: 14,
  },
  serviceStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  serviceMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  serviceFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  lastCheck: {
    fontSize: 12,
  },
  apiKeyStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  apiKeyStatusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  alertsContainer: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  alertIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertMessage: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  alertTimestamp: {
    fontSize: 12,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
