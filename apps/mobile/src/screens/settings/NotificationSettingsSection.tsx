/**
 * 🔔 NOTIFICATION SETTINGS SECTION
 * Extracted from SettingsScreen
 */

import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "@/theme";

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "toggle" | "navigation" | "action";
  value?: boolean;
  destructive?: boolean;
}

interface NotificationSettingsSectionProps {
  settings: SettingItem[];
  onToggle: (id: string, value: boolean) => void;
}

export function NotificationSettingsSection({
  settings,
  onToggle,
}: NotificationSettingsSectionProps) {
  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={StyleSheet.flatten([
        styles.settingItem,
        item.destructive && styles.settingItemDestructive,
      ])}
       testID="NotificationSettingsSection-button-2" accessibilityLabel="Interactive element" accessibilityRole="button" onPress={() => {
        if (item.type === "toggle") {
          onToggle(item.id, !(item.value ?? false));
        }
      }}
      disabled={item.type === "toggle"}
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon}
            size={20}
            color={item.destructive ? "#ef4444" : "#6b7280"}
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={StyleSheet.flatten([
              styles.settingTitle,
              item.destructive && styles.settingTitleDestructive,
            ])}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={StyleSheet.flatten([
                styles.settingSubtitle,
                item.destructive && styles.settingSubtitleDestructive,
              ])}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.settingRight}>
        {item.type === "toggle" && (
          <Switch
            value={item.value ?? false}
            onValueChange={(value) => { onToggle(item.id, value); }}
            trackColor={{ false: theme.colors.neutral[300], true: theme.colors.secondary[500] }}
            thumbColor={(item.value ?? false) ? theme.colors.neutral[0] : theme.colors.neutral[100]}
          />
        )}
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color={theme.colors.neutral[400]} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <View style={styles.sectionContent}>
        {settings.map(renderSettingItem)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: theme.colors.neutral[500],
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: theme.colors.neutral[0],
    borderRadius: 12,
    shadowColor: theme.colors.neutral[950],
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral[100],
  },
  settingItemDestructive: {
    borderBottomColor: "#FEF2F2",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: theme.colors.neutral[100],
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  settingIconDestructive: {
    backgroundColor: "#FEF2F2",
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.neutral[900],
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: theme.colors.danger,
  },
  settingSubtitle: {
    fontSize: 13,
    color: theme.colors.neutral[500],
  },
  settingSubtitleDestructive: {
    color: "#FCA5A5",
  },
  settingRight: {
    marginLeft: 12,
  },
});
