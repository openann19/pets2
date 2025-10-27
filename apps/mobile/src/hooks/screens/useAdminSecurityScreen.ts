/**
 * Admin Security Screen Hook
 * Provides security monitoring, threat detection, and incident response
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { logger } from "@pawfectmatch/core";
import * as Haptics from "expo-haptics";
import type { AdminScreenProps } from "../../navigation/types";
import { useErrorHandler } from "../useErrorHandler";

interface SecurityEvent {
  id: string;
  type:
    | "login_attempt"
    | "suspicious_activity"
    | "api_abuse"
    | "data_breach"
    | "failed_login";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  userName?: string;
  ipAddress: string;
  userAgent: string;
  location?: string;
  timestamp: Date;
  description: string;
  status: "active" | "resolved" | "investigating";
  resolution?: string;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  activeThreats: number;
  blockedIPs: number;
  suspiciousLogins: number;
  apiRateLimitHits: number;
  dataBreaches: number;
  resolvedIncidents: number;
}

interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  threshold: number;
  action: "alert" | "block" | "ban";
  lastTriggered?: Date;
}

interface UseAdminSecurityScreenParams {
  navigation: AdminScreenProps<"AdminSecurity">["navigation"];
}

export interface AdminSecurityScreenState {
  // Data
  events: SecurityEvent[];
  metrics: SecurityMetrics;
  rules: SecurityRule[];

  // Filters
  severityFilter: "all" | "low" | "medium" | "high" | "critical";
  statusFilter: "all" | "active" | "resolved" | "investigating";
  typeFilter: "all" | SecurityEvent["type"];
  searchQuery: string;

  // UI State
  isLoading: boolean;
  isRefreshing: boolean;
  isProcessingAction: boolean;

  // Actions
  onRefresh: () => Promise<void>;
  onSeverityFilterChange: (severity: "all" | "low" | "medium" | "high" | "critical") => void;
  onStatusFilterChange: (status: "all" | "active" | "resolved" | "investigating") => void;
  onTypeFilterChange: (type: "all" | SecurityEvent["type"]) => void;
  onSearchChange: (query: string) => void;
  onEventSelect: (event: SecurityEvent) => void;
  onResolveEvent: (eventId: string, resolution: string) => Promise<void>;
  onBlockIP: (ipAddress: string) => Promise<void>;
  onUnblockIP: (ipAddress: string) => Promise<void>;
  onEnableRule: (ruleId: string) => Promise<void>;
  onDisableRule: (ruleId: string) => Promise<void>;
  onUpdateRule: (
    ruleId: string,
    updates: Partial<SecurityRule>,
  ) => Promise<void>;
  onBackPress: () => void;
}

/**
 * Hook for admin security screen
 * Provides comprehensive security monitoring and incident management
 */
export function useAdminSecurityScreen({
  navigation,
}: UseAdminSecurityScreenParams): AdminSecurityScreenState {
  const { handleNetworkError, handleOfflineError } = useErrorHandler();

  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [rules, setRules] = useState<SecurityRule[]>([]);

  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalEvents: 0,
    criticalEvents: 0,
    activeThreats: 0,
    blockedIPs: 0,
    suspiciousLogins: 0,
    apiRateLimitHits: 0,
    dataBreaches: 0,
    resolvedIncidents: 0,
  });

  const [severityFilter, setSeverityFilter] = useState<
    "all" | "low" | "medium" | "high" | "critical"
  >("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "resolved" | "investigating"
  >("active");
  const [typeFilter, setTypeFilter] = useState<"all" | SecurityEvent["type"]>(
    "all",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Mock data loading - replace with real API calls
  const loadSecurityData = useCallback(
    async (options?: { force?: boolean }) => {
      try {
        if (!options?.force) {
          setIsLoading(true);
        }

        // Simulate API calls
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockEvents: SecurityEvent[] = [
          {
            id: "sec1",
            type: "failed_login",
            severity: "medium",
            userId: "user1",
            userName: "Alice Johnson",
            ipAddress: "192.168.1.100",
            userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)",
            location: "New York, US",
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            description: "Multiple failed login attempts",
            status: "active",
          },
          {
            id: "sec2",
            type: "suspicious_activity",
            severity: "high",
            userId: "user2",
            userName: "Bob Smith",
            ipAddress: "10.0.0.50",
            userAgent: "Unknown",
            location: "Unknown",
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            description: "Unusual API usage pattern detected",
            status: "investigating",
          },
          {
            id: "sec3",
            type: "api_abuse",
            severity: "critical",
            ipAddress: "203.0.113.1",
            userAgent: "Bot/1.0",
            location: "Unknown",
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            description: "Rate limit exceeded - potential DDoS attempt",
            status: "active",
            resolution: "IP temporarily blocked",
          },
        ];

        const mockRules: SecurityRule[] = [
          {
            id: "rule1",
            name: "Failed Login Threshold",
            description: "Alert when user fails to login more than 5 times",
            enabled: true,
            threshold: 5,
            action: "alert",
            lastTriggered: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
          {
            id: "rule2",
            name: "API Rate Limit",
            description: "Block IP after excessive API calls",
            enabled: true,
            threshold: 1000,
            action: "block",
          },
          {
            id: "rule3",
            name: "Suspicious Location",
            description: "Alert on logins from unusual locations",
            enabled: false,
            threshold: 1,
            action: "alert",
          },
        ];

        const mockMetrics: SecurityMetrics = {
          totalEvents: 247,
          criticalEvents: 3,
          activeThreats: 8,
          blockedIPs: 12,
          suspiciousLogins: 45,
          apiRateLimitHits: 23,
          dataBreaches: 0,
          resolvedIncidents: 156,
        };

        setEvents(mockEvents);
        setRules(mockRules);
        setMetrics(mockMetrics);

        logger.info("Security data loaded", {
          eventsCount: mockEvents.length,
          rulesCount: mockRules.length,
          metrics: mockMetrics,
        });
      } catch (error) {
        const err =
          error instanceof Error
            ? error
            : new Error("Failed to load security data");
        logger.error("Failed to load admin security data", { error: err });
        handleNetworkError(err, "admin.security.load");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [handleNetworkError],
  );

  useEffect(() => {
    void loadSecurityData();
  }, [loadSecurityData]);

  const filteredEvents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return events.filter((event) => {
      // Severity filter
      if (severityFilter !== "all" && event.severity !== severityFilter)
        return false;

      // Status filter
      if (statusFilter !== "all" && event.status !== statusFilter) return false;

      // Type filter
      if (typeFilter !== "all" && event.type !== typeFilter) return false;

      // Search filter
      if (query.length > 0) {
        const searchableText = [
          event.userName,
          event.ipAddress,
          event.description,
          event.location,
        ]
          .join(" ")
          .toLowerCase();
        return searchableText.includes(query);
      }

      return true;
    });
  }, [events, severityFilter, statusFilter, typeFilter, searchQuery]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await loadSecurityData({ force: true });
  }, [loadSecurityData]);

  const onSeverityFilterChange = useCallback(
    (severity: typeof severityFilter) => {
      setSeverityFilter(severity);
    },
    [],
  );

  const onStatusFilterChange = useCallback((status: typeof statusFilter) => {
    setStatusFilter(status);
  }, []);

  const onTypeFilterChange = useCallback((type: typeof typeFilter) => {
    setTypeFilter(type);
  }, []);

  const onSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const onEventSelect = useCallback((event: SecurityEvent) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    // In a real app, this would open a detailed view
    Alert.alert(
      "Security Event",
      `${event.description}\n\nSeverity: ${event.severity.toUpperCase()}\nIP: ${event.ipAddress}`,
      [{ text: "OK" }],
    );
  }, []);

  const onResolveEvent = useCallback(
    async (eventId: string, resolution: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 600));

        setEvents((prev) =>
          prev.map((event) =>
            event.id === eventId
              ? { ...event, status: "resolved" as const, resolution }
              : event,
          ),
        );

        setMetrics((prev) => ({
          ...prev,
          activeThreats: Math.max(0, prev.activeThreats - 1),
          resolvedIncidents: prev.resolvedIncidents + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("Security event resolved", { eventId, resolution });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to resolve event");
        logger.error("Failed to resolve security event", {
          error: err,
          eventId,
        });
        handleNetworkError(err, "admin.security.resolve");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onBlockIP = useCallback(
    async (ipAddress: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setMetrics((prev) => ({
          ...prev,
          blockedIPs: prev.blockedIPs + 1,
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        ).catch(() => {});
        logger.info("IP address blocked", { ipAddress });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to block IP");
        logger.error("Failed to block IP address", { error: err, ipAddress });
        handleNetworkError(err, "admin.security.block-ip");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onUnblockIP = useCallback(
    async (ipAddress: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setMetrics((prev) => ({
          ...prev,
          blockedIPs: Math.max(0, prev.blockedIPs - 1),
        }));

        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success,
        ).catch(() => {});
        logger.info("IP address unblocked", { ipAddress });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to unblock IP");
        logger.error("Failed to unblock IP address", { error: err, ipAddress });
        handleNetworkError(err, "admin.security.unblock-ip");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onEnableRule = useCallback(
    async (ruleId: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        setRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId ? { ...rule, enabled: true } : rule,
          ),
        );

        logger.info("Security rule enabled", { ruleId });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to enable rule");
        logger.error("Failed to enable security rule", { error: err, ruleId });
        handleNetworkError(err, "admin.security.enable-rule");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onDisableRule = useCallback(
    async (ruleId: string) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 400));

        setRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId ? { ...rule, enabled: false } : rule,
          ),
        );

        logger.info("Security rule disabled", { ruleId });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to disable rule");
        logger.error("Failed to disable security rule", { error: err, ruleId });
        handleNetworkError(err, "admin.security.disable-rule");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  const onUpdateRule = useCallback(
    async (ruleId: string, updates: Partial<SecurityRule>) => {
      setIsProcessingAction(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        setRules((prev) =>
          prev.map((rule) =>
            rule.id === ruleId ? { ...rule, ...updates } : rule,
          ),
        );

        logger.info("Security rule updated", { ruleId, updates });
      } catch (error) {
        const err =
          error instanceof Error ? error : new Error("Failed to update rule");
        logger.error("Failed to update security rule", { error: err, ruleId });
        handleNetworkError(err, "admin.security.update-rule");
      } finally {
        setIsProcessingAction(false);
      }
    },
    [handleNetworkError],
  );

  return {
    // Data
    events: filteredEvents,
    metrics,
    rules,

    // Filters
    severityFilter,
    statusFilter,
    typeFilter,
    searchQuery,

    // UI State
    isLoading,
    isRefreshing,
    isProcessingAction,

    // Actions
    onRefresh,
    onSeverityFilterChange,
    onStatusFilterChange,
    onTypeFilterChange,
    onSearchChange,
    onEventSelect,
    onResolveEvent,
    onBlockIP,
    onUnblockIP,
    onEnableRule,
    onDisableRule,
    onUpdateRule,
    onBackPress: () => navigation.goBack(),
  };
}

export default useAdminSecurityScreen;
