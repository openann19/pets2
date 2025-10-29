import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, type ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "@mobile/src/theme";

interface QuickActionCardProps {
  icon: string;
  title: string;
  gradient: "primary" | "secondary" | "success" | "purple";
  backgroundColor: string;
  badge?: number;
  onPress: () => void;
  style?: ViewStyle;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon,
  title,
  gradient,
  backgroundColor,
  badge,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const { colors } = theme;
  
  return (
    <TouchableOpacity 
      style={[styles.actionCard, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.actionContent}>
        <View
          style={StyleSheet.flatten([
            styles.actionIcon,
            { backgroundColor },
          ])}
        >
          <Ionicons name={icon as any} size={24} color={colors.onPrimary} />
        </View>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, { color: colors.onSurface}]>{title}</Text>
        </View>
        {badge !== undefined && badge > 0 && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]>
            <Text style={[styles.badgeText, { color: colors.onPrimary }]>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  actionCard: {
    flex: 1,
  },
  actionContent: {
    alignItems: "center",
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "bold",
  },
});
