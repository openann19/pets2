/**
 * Admin AI Services Management Screen for Mobile
 * Management interface for AI services, models, and performance monitoring
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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import type { AdminScreenProps } from "../../navigation/types";
import { _adminAPI as adminAPI } from "../../services/adminAPI";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface AIService {
  id: string;
  name: string;
  type:
    | "bio_generation"
    | "photo_analysis"
    | "compatibility"
    | "moderation"
    | "recommendations";
  status: "active" | "inactive" | "maintenance" | "error";
  model: string;
  version: string;
  requestsPerMinute: number;
  averageResponseTime: number;
  successRate: number;
  lastUpdated: string;
  costPerRequest: number;
  monthlyUsage: number;
  monthlyCost: number;
}

interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: "active" | "deprecated" | "beta";
  accuracy: number;
  speed: number;
  cost: number;
  lastTrained: string;
}

interface AIPerformance {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  totalCost: number;
  topServices: Array<{
    service: string;
    requests: number;
    cost: number;
  }>;
}

export default function AdminAIServicesScreen({
  navigation,
}: AdminScreenProps<"AdminAIServices">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [services, setServices] = useState<AIService[]>([]);
  const [models, setModels] = useState<AIModel[]>([]);
  const [performance, setPerformance] = useState<AIPerformance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "services" | "models" | "performance"
  >("services");

  useEffect(() => {
    void loadAIServicesData();
  }, []);

  const loadAIServicesData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockServices: AIService[] = [
        {
          id: "1",
          name: "Bio Generation",
          type: "bio_generation",
          status: "active",
          model: "GPT-4",
          version: "1.2.0",
          requestsPerMinute: 45,
          averageResponseTime: 2.3,
          successRate: 98.5,
          lastUpdated: "2024-01-15T10:30:00Z",
          costPerRequest: 0.02,
          monthlyUsage: 12500,
          monthlyCost: 250,
        },
        {
          id: "2",
          name: "Photo Analysis",
          type: "photo_analysis",
          status: "active",
          model: "CLIP-ViT",
          version: "2.1.0",
          requestsPerMinute: 32,
          averageResponseTime: 1.8,
          successRate: 96.2,
          lastUpdated: "2024-01-15T09:15:00Z",
          costPerRequest: 0.015,
          monthlyUsage: 8900,
          monthlyCost: 133.5,
        },
        {
          id: "3",
          name: "Compatibility Scoring",
          type: "compatibility",
          status: "active",
          model: "Custom ML",
          version: "3.0.1",
          requestsPerMinute: 28,
          averageResponseTime: 3.1,
          successRate: 94.8,
          lastUpdated: "2024-01-15T11:45:00Z",
          costPerRequest: 0.03,
          monthlyUsage: 6700,
          monthlyCost: 201,
        },
        {
          id: "4",
          name: "Content Moderation",
          type: "moderation",
          status: "maintenance",
          model: "Moderation API",
          version: "1.5.2",
          requestsPerMinute: 0,
          averageResponseTime: 0,
          successRate: 0,
          lastUpdated: "2024-01-14T16:20:00Z",
          costPerRequest: 0.01,
          monthlyUsage: 0,
          monthlyCost: 0,
        },
        {
          id: "5",
          name: "Recommendations",
          type: "recommendations",
          status: "active",
          model: "Collaborative Filter",
          version: "2.3.0",
          requestsPerMinute: 67,
          averageResponseTime: 0.8,
          successRate: 99.1,
          lastUpdated: "2024-01-15T12:00:00Z",
          costPerRequest: 0.005,
          monthlyUsage: 15600,
          monthlyCost: 78,
        },
      ];

      const mockModels: AIModel[] = [
        {
          id: "1",
          name: "GPT-4",
          provider: "OpenAI",
          version: "4.0",
          status: "active",
          accuracy: 95.2,
          speed: 8.5,
          cost: 0.02,
          lastTrained: "2024-01-10T00:00:00Z",
        },
        {
          id: "2",
          name: "CLIP-ViT",
          provider: "OpenAI",
          version: "2.1",
          status: "active",
          accuracy: 92.8,
          speed: 9.2,
          cost: 0.015,
          lastTrained: "2024-01-08T00:00:00Z",
        },
        {
          id: "3",
          name: "Custom ML",
          provider: "Internal",
          version: "3.0",
          status: "beta",
          accuracy: 88.5,
          speed: 7.1,
          cost: 0.03,
          lastTrained: "2024-01-12T00:00:00Z",
        },
      ];

      const mockPerformance: AIPerformance = {
        totalRequests: 43700,
        successfulRequests: 42500,
        failedRequests: 1200,
        averageResponseTime: 2.1,
        totalCost: 662.5,
        topServices: [
          { service: "Recommendations", requests: 15600, cost: 78 },
          { service: "Bio Generation", requests: 12500, cost: 250 },
          { service: "Photo Analysis", requests: 8900, cost: 133.5 },
          { service: "Compatibility Scoring", requests: 6700, cost: 201 },
        ],
      };

      setServices(mockServices);
      setModels(mockModels);
      setPerformance(mockPerformance);
    } catch (error: unknown) {
      logger.error("Error loading AI services data:", { error });
      Alert.alert("Error", "Failed to load AI services data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadAIServicesData();
    setRefreshing(false);
  };

  const toggleServiceStatus = async (serviceId: string): Promise<void> => {
    try {
      setServices((prev) =>
        prev.map((service) =>
          service.id === serviceId
            ? {
                ...service,
                status: service.status === "active" ? "inactive" : "active",
              }
            : service,
        ),
      );
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error: unknown) {
      logger.error("Error toggling service status:", { error });
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "active":
        return "#10B981";
      case "inactive":
        return "#6B7280";
      case "maintenance":
        return "#F59E0B";
      case "error":
        return "#EF4444";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "active":
        return "checkmark-circle";
      case "inactive":
        return "pause-circle";
      case "maintenance":
        return "construct";
      case "error":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "bio_generation":
        return "document-text";
      case "photo_analysis":
        return "camera";
      case "compatibility":
        return "heart";
      case "moderation":
        return "shield";
      case "recommendations":
        return "bulb";
      default:
        return "cog";
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading AI services...
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
            AI Services Management
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View
          style={[styles.tabContainer, { backgroundColor: colors.surface }]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "services" && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("services");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "services" ? "#fff" : colors.text },
              ]}
            >
              Services
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "models" && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("models");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "models" ? "#fff" : colors.text },
              ]}
            >
              Models
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "performance" && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("performance");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "performance" ? "#fff" : colors.text },
              ]}
            >
              Performance
            </Text>
          </TouchableOpacity>
        </View>

        {/* Services Tab */}
        {selectedTab === "services" && (
          <View style={styles.tabContent}>
            {services.map((service) => (
              <View
                key={service.id}
                style={[
                  styles.serviceCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceInfo}>
                    <Ionicons
                      name={getTypeIcon(service.type)}
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.serviceDetails}>
                      <Text
                        style={[styles.serviceName, { color: colors.text }]}
                      >
                        {service.name}
                      </Text>
                      <Text
                        style={[
                          styles.serviceModel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {service.model} v{service.version}
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
                      {service.requestsPerMinute}
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      RPM
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {service.averageResponseTime}s
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Avg Time
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {service.successRate}%
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Success
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

                <View style={styles.serviceActions}>
                  <Switch
                    value={service.status === "active"}
                    onValueChange={() => toggleServiceStatus(service.id)}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={
                      service.status === "active"
                        ? "#fff"
                        : colors.textSecondary
                    }
                  />
                  <Text style={[styles.toggleLabel, { color: colors.text }]}>
                    {service.status === "active" ? "Active" : "Inactive"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Models Tab */}
        {selectedTab === "models" && (
          <View style={styles.tabContent}>
            {models.map((model) => (
              <View
                key={model.id}
                style={[styles.modelCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.modelHeader}>
                  <View style={styles.modelInfo}>
                    <Text style={[styles.modelName, { color: colors.text }]}>
                      {model.name}
                    </Text>
                    <Text
                      style={[
                        styles.modelProvider,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {model.provider} • v{model.version}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(model.status) + "20" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        { color: getStatusColor(model.status) },
                      ]}
                    >
                      {model.status.charAt(0).toUpperCase() +
                        model.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.modelMetrics}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {model.accuracy}%
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Accuracy
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {model.speed}/10
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Speed
                    </Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      ${model.cost}
                    </Text>
                    <Text
                      style={[
                        styles.metricLabel,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Cost/Req
                    </Text>
                  </View>
                </View>

                <Text
                  style={[styles.lastTrained, { color: colors.textSecondary }]}
                >
                  Last trained:{" "}
                  {new Date(model.lastTrained).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Performance Tab */}
        {selectedTab === "performance" && performance && (
          <View style={styles.tabContent}>
            <View
              style={[
                styles.performanceCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Overview
              </Text>

              <View style={styles.performanceGrid}>
                <View style={styles.performanceItem}>
                  <Text
                    style={[styles.performanceValue, { color: colors.primary }]}
                  >
                    {performance.totalRequests.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.performanceLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total Requests
                  </Text>
                </View>

                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceValue, { color: "#10B981" }]}>
                    {performance.successfulRequests.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.performanceLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Successful
                  </Text>
                </View>

                <View style={styles.performanceItem}>
                  <Text style={[styles.performanceValue, { color: "#EF4444" }]}>
                    {performance.failedRequests.toLocaleString()}
                  </Text>
                  <Text
                    style={[
                      styles.performanceLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Failed
                  </Text>
                </View>

                <View style={styles.performanceItem}>
                  <Text
                    style={[styles.performanceValue, { color: colors.primary }]}
                  >
                    {performance.averageResponseTime}s
                  </Text>
                  <Text
                    style={[
                      styles.performanceLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Avg Response
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.topServicesCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Top Services
              </Text>

              {performance.topServices.map((service, index) => (
                <View key={index} style={styles.topServiceItem}>
                  <View style={styles.topServiceInfo}>
                    <Text
                      style={[styles.topServiceName, { color: colors.text }]}
                    >
                      {service.service}
                    </Text>
                    <Text
                      style={[
                        styles.topServiceRequests,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {service.requests.toLocaleString()} requests
                    </Text>
                  </View>
                  <Text
                    style={[styles.topServiceCost, { color: colors.primary }]}
                  >
                    ${service.cost}
                  </Text>
                </View>
              ))}
            </View>
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
  tabContainer: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
  },
  tabContent: {
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
  serviceModel: {
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
  metricItem: {
    alignItems: "center",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 2,
  },
  metricLabel: {
    fontSize: 12,
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  modelCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modelInfo: {
    flex: 1,
  },
  modelName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  modelProvider: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modelMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  lastTrained: {
    fontSize: 12,
  },
  performanceCard: {
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
  performanceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  performanceItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  performanceValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  performanceLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  topServicesCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  topServiceItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  topServiceInfo: {
    flex: 1,
  },
  topServiceName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  topServiceRequests: {
    fontSize: 14,
  },
  topServiceCost: {
    fontSize: 16,
    fontWeight: "600",
  },
});
