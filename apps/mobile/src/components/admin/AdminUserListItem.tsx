import { Ionicons } from "@expo/vector-icons";
import { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { ThemeColors } from "../../theme/Provider";
import type { AdminUserStatus } from "../../services/adminUsersService";

type IoniconName =
  | "paw"
  | "heart"
  | "chatbubble"
  | "calendar"
  | "checkmark"
  | "checkmark-circle"
  | "pause-circle"
  | "ban"
  | "time"
  | "help-circle"
  | "pause"
  | "play"
  | "shield-checkmark"
  | "alert-circle";

export interface AdminUserListMetrics {
  pets: number;
  matches: number;
  messages: number;
}

export interface AdminUserListItemViewModel {
  id: string;
  initials: string;
  fullName: string;
  email: string;
  status: AdminUserStatus;
  statusLabel: string;
  statusColor: string;
  statusIcon: IoniconName;
  verified: boolean;
  createdDateLabel: string;
  metrics: AdminUserListMetrics;
  isSelected: boolean;
  isActionLoading: boolean;
  primaryAction: {
    icon: IoniconName;
    tint: string;
    accessibilityLabel: string;
  };
  secondaryAction: {
    icon: IoniconName;
    tint: string;
    accessibilityLabel: string;
  };
  onSelect: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

export interface AdminUserListItemProps {
  data: AdminUserListItemViewModel;
  colors: ThemeColors;
  onSelect: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}

const MetricBadge = ({
  icon,
  color,
  label,
}: {
  icon: IoniconName;
  color: string;
  label: string;
}) => (
  <View style={styles.metricItem}>
    <Ionicons name={icon} size={16} color={color} />
    <Text style={styles.metricText}>{label}</Text>
  </View>
);

export const AdminUserListItem = memo<AdminUserListItemProps>(
  ({ data, colors, onSelect, onPrimaryAction, onSecondaryAction }) => {
    return (
      <TouchableOpacity
        style={StyleSheet.flatten([
          styles.container,
          { backgroundColor: colors.surface },
          data.isSelected && styles.selectedContainer,
        ])}
        onPress={onSelect}
        accessibilityRole="button"
        accessibilityLabel={`User ${data.fullName}`}
      >
        <View style={styles.headerRow}>
          <View style={styles.avatarContainer}>
            <Text
              style={StyleSheet.flatten([
                styles.avatarText,
                { color: colors.text },
              ])}
            >
              {data.initials}
            </Text>
          </View>
          <View style={styles.titleContainer}>
            <Text
              style={StyleSheet.flatten([
                styles.fullName,
                { color: colors.text },
              ])}
            >
              {data.fullName}
            </Text>
            <Text
              style={StyleSheet.flatten([
                styles.email,
                { color: colors.textMuted },
              ])}
            >
              {data.email}
            </Text>
            <View style={styles.badgeRow}>
              <View
                style={StyleSheet.flatten([
                  styles.statusBadge,
                  { backgroundColor: data.statusColor },
                ])}
              >
                <Ionicons name={data.statusIcon} size={12} color="#FFFFFF" />
                <Text style={styles.statusText}>{data.statusLabel}</Text>
              </View>
              {data.verified ? (
                <View
                  style={StyleSheet.flatten([
                    styles.verifiedBadge,
                    { backgroundColor: colors.success },
                  ])}
                >
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              ) : null}
            </View>
          </View>
          <View style={styles.actionColumn}>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                { backgroundColor: data.primaryAction.tint },
              ])}
              onPress={onPrimaryAction}
              accessibilityRole="button"
              accessibilityLabel={data.primaryAction.accessibilityLabel}
            >
              {data.isActionLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons
                  name={data.primaryAction.icon}
                  size={16}
                  color="#ffffff"
                />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={StyleSheet.flatten([
                styles.actionButton,
                { backgroundColor: data.secondaryAction.tint },
              ])}
              onPress={onSecondaryAction}
              accessibilityRole="button"
              accessibilityLabel={data.secondaryAction.accessibilityLabel}
            >
              {data.isActionLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons
                  name={data.secondaryAction.icon}
                  size={16}
                  color="#ffffff"
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.metricsRow}>
          <MetricBadge
            icon="paw"
            color={colors.success}
            label={`${data.metrics.pets} pets`}
          />
          <MetricBadge
            icon="heart"
            color="#3B82F6"
            label={`${data.metrics.matches} matches`}
          />
          <MetricBadge
            icon="chatbubble"
            color={colors.secondary}
            label={`${data.metrics.messages} messages`}
          />
          <MetricBadge
            icon="calendar"
            color={colors.gray500}
            label={data.createdDateLabel}
          />
        </View>
      </TouchableOpacity>
    );
  },
);

AdminUserListItem.displayName = "AdminUserListItem";

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedContainer: {
    borderWidth: 1,
    borderColor: "#3B82F6",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(139, 92, 246, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
  },
  titleContainer: {
    flex: 1,
    marginHorizontal: 16,
  },
  fullName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  statusText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  verifiedBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  verifiedText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionColumn: {
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  metricsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 12,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  metricText: {
    fontSize: 13,
    color: "#666666",
  },
});

export default AdminUserListItem;
