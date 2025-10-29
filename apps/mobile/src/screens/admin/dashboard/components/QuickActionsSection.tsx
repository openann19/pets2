/**
 * Quick Actions Section Component
 * Provides quick navigation to admin features
 */

import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme";
import type { AppTheme } from "@/theme";

function __makeStyles_styles(theme: AppTheme) {
  return StyleSheet.create({
  actionsContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  actionCard: {
    width: "23%",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});
}


interface QuickAction {
  id: string;
  title: string;
  icon: string;
  color: string;
  onPress: () => void;
}

interface QuickActionsSectionProps {
  onNavigate: (screen: string) => void;
}

export const QuickActionsSection: React.FC<QuickActionsSectionProps> = ({
  onNavigate,
}) => {
  const theme = useTheme();
  const styles = useMemo(() => __makeStyles_styles(theme), [theme]);
  const { colors, palette } = theme;

  const actions: QuickAction[] = [
    {
      id: "users",
      title: "Users",
      icon: "people",
      color: colors.primary,
      onPress: () => onNavigate("AdminUsers"),
    },
    {
      id: "analytics",
      title: "Analytics",
      icon: "stats-chart",
      color: colors.info,
      onPress: () => onNavigate("AdminAnalytics"),
    },
    {
      id: "security",
      title: "Security",
      icon: "shield",
      color: colors.danger,
      onPress: () => onNavigate("AdminSecurity"),
    },
    {
      id: "billing",
      title: "Billing",
      icon: "cash",
      color: colors.success,
      onPress: () => onNavigate("AdminBilling"),
    },
    {
      id: "verifications",
      title: "Verifications",
      icon: "checkmark-circle",
      color: colors.warning,
      onPress: () => onNavigate("AdminVerifications"),
    },
    {
      id: "chats",
      title: "Chats",
      icon: "chatbubbles",
      color: colors.primary,
      onPress: () => onNavigate("AdminChats"),
    },
    {
      id: "uploads",
      title: "Uploads",
      icon: "cloud-upload",
      color: colors.primary,
      onPress: () => onNavigate("AdminUploads"),
    },
    {
      id: "logs",
      title: "Logs",
      icon: "document-text",
      color: colors.onMuted,
      onPress: () => onNavigate("AdminLogs"),
    },
  ];

  return (
    <View style={styles.actionsContainer}>
      <Text style={[styles.sectionTitle, { color: colors.onSurface }]>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionCard, { backgroundColor: colors.surface }]
            onPress={action.onPress}
            testID={`quick-action-${action.id}`}
            accessibilityLabel={action.title}
            accessibilityRole="button"
          >
            <View style={[styles.actionIconContainer, { backgroundColor: action.color }]>
              <Ionicons name={action.icon as any} size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.actionTitle, { color: colors.onSurface }]>{action.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
