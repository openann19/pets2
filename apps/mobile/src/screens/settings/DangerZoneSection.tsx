/**
 * ⚠️ DANGER ZONE SECTION
 * Handles destructive account actions
 */

import { Ionicons } from "@expo/vector-icons";
import React, { type ComponentProps } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Theme } from '../../theme/unified-theme';

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  type: "toggle" | "navigation" | "action";
  destructive?: boolean;
}

interface DangerZoneSectionProps {
  settings: SettingItem[];
  onAction: (id: string) => void;
}

export function DangerZoneSection({
  settings,
  onAction,
}: DangerZoneSectionProps) {
  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.id}
      style={StyleSheet.flatten([
        styles.settingItem,
        styles.settingItemDestructive,
      ])}
      onPress={() => {
        if (item.type === "action") {
          onAction(item.id);
        }
      }}
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon as ComponentProps<typeof Ionicons>["name"]}
            size={20}
            color="Theme.colors.status.error"
          />
        </View>
        <View style={styles.settingText}>
          <Text
            style={StyleSheet.flatten([
              styles.settingTitle,
              styles.settingTitleDestructive,
            ])}
          >
            {item.title}
          </Text>
          {item.subtitle && (
            <Text
              style={StyleSheet.flatten([
                styles.settingSubtitle,
                styles.settingSubtitleDestructive,
              ])}
            >
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingRight}>
        {item.type === "navigation" && (
          <Ionicons name="chevron-forward" size={20} color="Theme.colors.neutral[400]" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>ACCOUNT ACTIONS</Text>
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
    color: "Theme.colors.neutral[500]",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    backgroundColor: "Theme.colors.neutral[0]",
    borderRadius: 12,
    shadowColor: "Theme.colors.neutral[950]",
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
    borderBottomColor: "Theme.colors.neutral[100]",
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
    backgroundColor: "Theme.colors.neutral[100]",
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
    color: "Theme.colors.neutral[900]",
    marginBottom: 2,
  },
  settingTitleDestructive: {
    color: "Theme.colors.status.error",
  },
  settingSubtitle: {
    fontSize: 13,
    color: "Theme.colors.neutral[500]",
  },
  settingSubtitleDestructive: {
    color: "#FCA5A5",
  },
  settingRight: {
    marginLeft: 12,
  },
});
