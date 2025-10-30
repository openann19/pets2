import React, { useMemo } from "react";
import { View, StyleSheet, Switch, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Text } from "react-native";
import { useTheme } from "@mobile/theme";
import type { AppTheme } from "@mobile/theme";

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
  const styles = useMemo(() => createStyles(theme), [theme]);
  const onPressSafe = onPress ?? (() => undefined);
  const onToggleSafe = onToggle ?? (() => undefined);
  const isToggle = item.type === "toggle";
  const isNavigation = item.type === "navigation";
  const iconColor = item.destructive ? theme.colors.danger : theme.colors.onMuted;
  const switchValue = Boolean(item.value);

  return (
    <TouchableOpacity
      style={StyleSheet.flatten([
        styles.settingItem,
        item.destructive && styles.settingItemDestructive,
      ])}
      onPress={() => {
        if (!isToggle) {
          onPressSafe(item.id);
        }
      }}
      disabled={isToggle}
      testID={`setting-item-${item.id}`}
      accessibilityLabel={`${item.title}${item.subtitle ? `: ${item.subtitle}` : ''}`}
      accessibilityRole={isToggle ? "text" : "button"}
      accessibilityHint={
        isToggle
          ? undefined
          : item.type === "action"
            ? "Activates this account action"
            : "Opens the related settings screen"
      }
    >
      <View style={styles.settingLeft}>
        <View
          style={StyleSheet.flatten([
            styles.settingIcon,
            item.destructive && styles.settingIconDestructive,
          ])}
        >
          <Ionicons
            name={item.icon as any}
            size={20}
            color={iconColor}
            accessibilityLabel={`${item.title} icon`}
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
        {isToggle && (
          <Switch
            value={switchValue}
            onValueChange={(value) => {
              if (category) {
                onToggleSafe(item.id, value);
              }
            }}
            trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            thumbColor={switchValue ? theme.colors.onPrimary : theme.colors.surface}
            accessibilityLabel={`${item.title} toggle`}
          />
        )}
        {isNavigation && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.colors.onMuted}
            accessibilityElementsHidden
            importantForAccessibility="no"
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    settingItem: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: theme.colors.border,
    },
    settingItemDestructive: {
      borderBottomColor: theme.colors.danger,
    },
    settingLeft: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    settingIcon: {
      width: 40,
      height: 40,
      borderRadius: theme.radii.md,
      backgroundColor: theme.colors.surface,
      justifyContent: "center",
      alignItems: "center",
      marginRight: theme.spacing.sm,
    },
    settingIconDestructive: {
      backgroundColor: `${theme.colors.danger}1A`,
    },
    settingText: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.onSurface,
      marginBottom: 2,
    },
    settingTitleDestructive: {
      color: theme.colors.danger,
    },
    settingSubtitle: {
      fontSize: 13,
      color: theme.colors.onMuted,
    },
    settingSubtitleDestructive: {
      color: theme.colors.danger,
    },
    settingRight: {
      marginLeft: theme.spacing.sm,
    },
  });
