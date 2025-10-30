import React from "react";
import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
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

interface SettingItemProps {
  item: SettingItem;
  category?: "notifications" | "preferences";
  onPress?: (id: string) => void;
  onToggle?: (id: string, value: boolean) => void;
}

export const SettingItemComponent: React.FC<SettingItemProps> = ({
  item,
  category,
  onPress,
  onToggle,
}) => {
  const theme = useTheme();
  return (
  <TouchableOpacity
    style={StyleSheet.flatten([
      styles.settingItem,
      item.destructive && styles.settingItemDestructive,
      { borderBottomColor: theme.colors.border },
    ])}
    onPress={() => {
      if (item.type === "navigation" || item.type === "action") {
        onPress?.(item.id);
      }
    }}
    disabled={item.type === "toggle"}
    testID={`setting-item-${item.id}`}
    accessibilityLabel={`${item.title}${item.subtitle ? `: ${item.subtitle}` : ''}`}
    accessibilityRole={item.type === "toggle" ? "text" : "button"}
  >
    <View style={styles.settingLeft}>
      <View
        style={StyleSheet.flatten([
          styles.settingIcon,
          item.destructive && styles.settingIconDestructive,
          { backgroundColor: theme.colors.surface },
        ])}
      >
        <Ionicons
          name={item.icon as any}
          size={20}
          color={item.destructive ? theme.colors.danger : theme.palette.neutral[500]}
          accessibilityLabel={`${item.title} icon`}
        />
      </View>
      <View style={styles.settingText}>
        <Text
          style={StyleSheet.flatten([
            styles.settingTitle,
            item.destructive && styles.settingTitleDestructive,
            { color: theme.colors.onSurface },
          ])}
        >
          {item.title}
        </Text>
        {item.subtitle && (
          <Text
            style={StyleSheet.flatten([
              styles.settingSubtitle,
              item.destructive && styles.settingSubtitleDestructive,
              { color: theme.colors.onMuted },
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
          value={item.value}
          onValueChange={(value) =>
            category && onToggle?.(item.id, value)
          }
          trackColor={{ false: theme.palette.neutral[300], true: theme.colors.primary }}
          thumbColor={item.value ? theme.colors.onPrimary : theme.palette.neutral[100]}
        />
      )}
      {item.type === "navigation" && (
        <Ionicons name="chevron-forward" size={20} color={theme.palette.neutral[400]} />
      )}
    </View>
  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
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
    // background color set via theme override
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
    // color set via theme override
    marginBottom: 2,
  },
  settingTitleDestructive: {},
  settingSubtitle: {
    fontSize: 13,
  },
  settingSubtitleDestructive: {
    color: "#FCA5A5",
  },
  settingRight: {
    marginLeft: 12,
  },
});
