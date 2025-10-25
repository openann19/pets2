/**
 * Admin Reports Management Screen for Mobile
 * Management interface for generating and viewing various admin reports
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

interface Report {
  id: string;
  name: string;
  type:
    | "analytics"
    | "financial"
    | "user"
    | "system"
    | "security"
    | "compliance";
  status: "generating" | "completed" | "failed" | "scheduled";
  createdAt: string;
  completedAt?: string;
  fileSize?: number;
  downloadUrl?: string;
  parameters: Record<string, unknown>;
  generatedBy: string;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: Report["type"];
  parameters: Array<{
    name: string;
    type: "date" | "select" | "text" | "number";
    required: boolean;
    options?: string[];
    defaultValue?: unknown;
  }>;
  scheduleOptions: {
    daily: boolean;
    weekly: boolean;
    monthly: boolean;
    custom: boolean;
  };
}

interface ReportStats {
  totalReports: number;
  completedReports: number;
  failedReports: number;
  scheduledReports: number;
  totalFileSize: number;
  averageGenerationTime: number;
}

export default function AdminReportsScreen({
  navigation,
}: AdminScreenProps<"AdminReports">): React.JSX.Element {
  const { colors } = useTheme();
  const { user: _user } = useAuthStore();
  const [reports, setReports] = useState<Report[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState<
    "reports" | "templates" | "stats"
  >("reports");

  useEffect(() => {
    void loadReportsData();
  }, []);

  const loadReportsData = async (): Promise<void> => {
    try {
      setLoading(true);

      // Mock data for now - replace with actual API call
      const mockReports: Report[] = [
        {
          id: "1",
          name: "Monthly User Analytics",
          type: "analytics",
          status: "completed",
          createdAt: "2024-01-15T09:00:00Z",
          completedAt: "2024-01-15T09:05:00Z",
          fileSize: 2.4,
          downloadUrl:
            "https://reports.example.com/monthly-analytics-2024-01.pdf",
          parameters: { period: "2024-01", includeInactive: false },
          generatedBy: "admin@example.com",
        },
        {
          id: "2",
          name: "Financial Summary Q4 2023",
          type: "financial",
          status: "completed",
          createdAt: "2024-01-10T14:30:00Z",
          completedAt: "2024-01-10T14:35:00Z",
          fileSize: 1.8,
          downloadUrl: "https://reports.example.com/financial-q4-2023.pdf",
          parameters: { quarter: "Q4", year: 2023 },
          generatedBy: "admin@example.com",
        },
        {
          id: "3",
          name: "User Registration Report",
          type: "user",
          status: "generating",
          createdAt: "2024-01-15T12:00:00Z",
          parameters: { dateRange: "2024-01-01 to 2024-01-15" },
          generatedBy: "admin@example.com",
        },
        {
          id: "4",
          name: "System Performance Analysis",
          type: "system",
          status: "failed",
          createdAt: "2024-01-14T16:45:00Z",
          parameters: { period: "last_30_days" },
          generatedBy: "admin@example.com",
        },
        {
          id: "5",
          name: "Security Audit Report",
          type: "security",
          status: "scheduled",
          createdAt: "2024-01-15T08:00:00Z",
          parameters: { schedule: "weekly" },
          generatedBy: "admin@example.com",
        },
      ];

      const mockTemplates: ReportTemplate[] = [
        {
          id: "1",
          name: "User Analytics Report",
          description:
            "Comprehensive user analytics including registration, activity, and engagement metrics",
          type: "analytics",
          parameters: [
            { name: "startDate", type: "date", required: true },
            { name: "endDate", type: "date", required: true },
            {
              name: "includeInactive",
              type: "select",
              required: false,
              options: ["true", "false"],
              defaultValue: "false",
            },
          ],
          scheduleOptions: {
            daily: true,
            weekly: true,
            monthly: true,
            custom: true,
          },
        },
        {
          id: "2",
          name: "Financial Summary",
          description: "Revenue, subscription, and payment analytics",
          type: "financial",
          parameters: [
            {
              name: "period",
              type: "select",
              required: true,
              options: ["monthly", "quarterly", "yearly"],
            },
            {
              name: "year",
              type: "number",
              required: true,
              defaultValue: 2024,
            },
          ],
          scheduleOptions: {
            daily: false,
            weekly: false,
            monthly: true,
            custom: true,
          },
        },
        {
          id: "3",
          name: "System Performance",
          description: "Server performance, uptime, and resource utilization",
          type: "system",
          parameters: [
            {
              name: "period",
              type: "select",
              required: true,
              options: ["last_7_days", "last_30_days", "last_90_days"],
            },
          ],
          scheduleOptions: {
            daily: true,
            weekly: true,
            monthly: true,
            custom: true,
          },
        },
        {
          id: "4",
          name: "Security Audit",
          description: "Security events, failed logins, and threat analysis",
          type: "security",
          parameters: [
            {
              name: "severity",
              type: "select",
              required: false,
              options: ["low", "medium", "high", "critical"],
            },
            { name: "dateRange", type: "date", required: true },
          ],
          scheduleOptions: {
            daily: false,
            weekly: true,
            monthly: true,
            custom: true,
          },
        },
      ];

      const mockStats: ReportStats = {
        totalReports: 156,
        completedReports: 142,
        failedReports: 8,
        scheduledReports: 6,
        totalFileSize: 1247.8,
        averageGenerationTime: 4.2,
      };

      setReports(mockReports);
      setTemplates(mockTemplates);
      setStats(mockStats);
    } catch (error: unknown) {
      logger.error("Error loading reports data:", { error });
      Alert.alert("Error", "Failed to load reports data");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (): Promise<void> => {
    setRefreshing(true);
    await loadReportsData();
    setRefreshing(false);
  };

  const generateReport = async (templateId: string): Promise<void> => {
    try {
      // TODO: Implement report generation
      Alert.alert("Success", "Report generation started");
      await loadReportsData();
    } catch (error: unknown) {
      logger.error("Error generating report:", { error });
      Alert.alert("Error", "Failed to generate report");
    }
  };

  const downloadReport = async (reportId: string): Promise<void> => {
    try {
      // TODO: Implement report download
      Alert.alert("Success", "Report download started");
    } catch (error: unknown) {
      logger.error("Error downloading report:", { error });
      Alert.alert("Error", "Failed to download report");
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "completed":
        return "#10B981";
      case "generating":
        return "#F59E0B";
      case "failed":
        return "#EF4444";
      case "scheduled":
        return "#8B5CF6";
      default:
        return "#6B7280";
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case "completed":
        return "checkmark-circle";
      case "generating":
        return "hourglass";
      case "failed":
        return "close-circle";
      case "scheduled":
        return "calendar";
      default:
        return "help-circle";
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case "analytics":
        return "analytics";
      case "financial":
        return "card";
      case "user":
        return "people";
      case "system":
        return "server";
      case "security":
        return "shield";
      case "compliance":
        return "document-text";
      default:
        return "document";
    }
  };

  const formatFileSize = (sizeInMB: number): string => {
    if (sizeInMB < 1) {
      return `${(sizeInMB * 1024).toFixed(0)} KB`;
    }
    return `${sizeInMB.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading reports...
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
            Reports Management
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
              selectedTab === "reports" && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("reports");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "reports" ? "#fff" : colors.text },
              ]}
            >
              Reports
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "templates" && {
                backgroundColor: colors.primary,
              },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("templates");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "templates" ? "#fff" : colors.text },
              ]}
            >
              Templates
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "stats" && { backgroundColor: colors.primary },
            ]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setSelectedTab("stats");
            }}
          >
            <Text
              style={[
                styles.tabText,
                { color: selectedTab === "stats" ? "#fff" : colors.text },
              ]}
            >
              Statistics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reports Tab */}
        {selectedTab === "reports" && (
          <View style={styles.tabContent}>
            {reports.map((report) => (
              <View
                key={report.id}
                style={[styles.reportCard, { backgroundColor: colors.surface }]}
              >
                <View style={styles.reportHeader}>
                  <View style={styles.reportInfo}>
                    <Ionicons
                      name={getTypeIcon(report.type)}
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.reportDetails}>
                      <Text style={[styles.reportName, { color: colors.text }]}>
                        {report.name}
                      </Text>
                      <Text
                        style={[
                          styles.reportType,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {report.type.charAt(0).toUpperCase() +
                          report.type.slice(1)}{" "}
                        Report
                      </Text>
                    </View>
                  </View>

                  <View style={styles.reportStatus}>
                    <Ionicons
                      name={getStatusIcon(report.status)}
                      size={20}
                      color={getStatusColor(report.status)}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(report.status) },
                      ]}
                    >
                      {report.status.charAt(0).toUpperCase() +
                        report.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.reportMetadata}>
                  <Text
                    style={[
                      styles.metadataItem,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Created: {new Date(report.createdAt).toLocaleString()}
                  </Text>
                  {report.completedAt && (
                    <Text
                      style={[
                        styles.metadataItem,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Completed: {new Date(report.completedAt).toLocaleString()}
                    </Text>
                  )}
                  {report.fileSize && (
                    <Text
                      style={[
                        styles.metadataItem,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Size: {formatFileSize(report.fileSize)}
                    </Text>
                  )}
                  <Text
                    style={[
                      styles.metadataItem,
                      { color: colors.textSecondary },
                    ]}
                  >
                    By: {report.generatedBy}
                  </Text>
                </View>

                {report.status === "completed" && report.downloadUrl && (
                  <TouchableOpacity
                    style={[
                      styles.downloadButton,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => downloadReport(report.id)}
                  >
                    <Ionicons name="download" size={16} color="#fff" />
                    <Text style={styles.downloadButtonText}>Download</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Templates Tab */}
        {selectedTab === "templates" && (
          <View style={styles.tabContent}>
            {templates.map((template) => (
              <View
                key={template.id}
                style={[
                  styles.templateCard,
                  { backgroundColor: colors.surface },
                ]}
              >
                <View style={styles.templateHeader}>
                  <View style={styles.templateInfo}>
                    <Ionicons
                      name={getTypeIcon(template.type)}
                      size={24}
                      color={colors.primary}
                    />
                    <View style={styles.templateDetails}>
                      <Text
                        style={[styles.templateName, { color: colors.text }]}
                      >
                        {template.name}
                      </Text>
                      <Text
                        style={[
                          styles.templateDescription,
                          { color: colors.textSecondary },
                        ]}
                      >
                        {template.description}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.templateParameters}>
                  <Text
                    style={[styles.parametersTitle, { color: colors.text }]}
                  >
                    Parameters:
                  </Text>
                  {template.parameters.map((param, index) => (
                    <Text
                      key={index}
                      style={[
                        styles.parameterItem,
                        { color: colors.textSecondary },
                      ]}
                    >
                      • {param.name} ({param.type}) {param.required ? "*" : ""}
                    </Text>
                  ))}
                </View>

                <View style={styles.templateSchedule}>
                  <Text style={[styles.scheduleTitle, { color: colors.text }]}>
                    Schedule Options:
                  </Text>
                  <View style={styles.scheduleOptions}>
                    {Object.entries(template.scheduleOptions).map(
                      ([option, enabled]) => (
                        <View key={option} style={styles.scheduleOption}>
                          <Ionicons
                            name={enabled ? "checkmark-circle" : "close-circle"}
                            size={16}
                            color={enabled ? "#10B981" : "#6B7280"}
                          />
                          <Text
                            style={[
                              styles.scheduleOptionText,
                              {
                                color: enabled
                                  ? colors.text
                                  : colors.textSecondary,
                              },
                            ]}
                          >
                            {option.charAt(0).toUpperCase() + option.slice(1)}
                          </Text>
                        </View>
                      ),
                    )}
                  </View>
                </View>

                <TouchableOpacity
                  style={[
                    styles.generateButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() => generateReport(template.id)}
                >
                  <Ionicons name="add-circle" size={16} color="#fff" />
                  <Text style={styles.generateButtonText}>Generate Report</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Statistics Tab */}
        {selectedTab === "stats" && stats && (
          <View style={styles.tabContent}>
            <View
              style={[styles.statsCard, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Overview
              </Text>

              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.primary }]}>
                    {stats.totalReports}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Total Reports
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#10B981" }]}>
                    {stats.completedReports}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Completed
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#EF4444" }]}>
                    {stats.failedReports}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Failed
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#8B5CF6" }]}>
                    {stats.scheduledReports}
                  </Text>
                  <Text
                    style={[styles.statLabel, { color: colors.textSecondary }]}
                  >
                    Scheduled
                  </Text>
                </View>
              </View>

              <View style={styles.additionalStats}>
                <View style={styles.additionalStatItem}>
                  <Text
                    style={[styles.additionalStatValue, { color: colors.text }]}
                  >
                    {formatFileSize(stats.totalFileSize)}
                  </Text>
                  <Text
                    style={[
                      styles.additionalStatLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Total File Size
                  </Text>
                </View>

                <View style={styles.additionalStatItem}>
                  <Text
                    style={[styles.additionalStatValue, { color: colors.text }]}
                  >
                    {stats.averageGenerationTime}m
                  </Text>
                  <Text
                    style={[
                      styles.additionalStatLabel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Avg Generation Time
                  </Text>
                </View>
              </View>
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
  reportCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  reportInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reportDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reportName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  reportType: {
    fontSize: 14,
  },
  reportStatus: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  reportMetadata: {
    marginBottom: 16,
  },
  metadataItem: {
    fontSize: 12,
    marginBottom: 2,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  downloadButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  templateCard: {
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  templateHeader: {
    marginBottom: 16,
  },
  templateInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  templateDetails: {
    marginLeft: 12,
    flex: 1,
  },
  templateName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  templateParameters: {
    marginBottom: 16,
  },
  parametersTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  parameterItem: {
    fontSize: 14,
    marginBottom: 2,
  },
  templateSchedule: {
    marginBottom: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  scheduleOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  scheduleOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scheduleOptionText: {
    fontSize: 14,
  },
  generateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  statsCard: {
    padding: 20,
    borderRadius: 12,
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
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  additionalStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  additionalStatItem: {
    alignItems: "center",
  },
  additionalStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  additionalStatLabel: {
    fontSize: 14,
  },
});
