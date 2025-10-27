import React, { useCallback, useMemo } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { ComponentProps } from "react";
import { logger } from "@pawfectmatch/core";
import { AdvancedCard, CardConfigs } from "../../../components/Advanced/AdvancedCard";
import { useTheme } from '../../../theme/Provider';

interface MenuItem {
  title: string;
  icon: ComponentProps<typeof Ionicons>['name'];
  color: string;
  onPress: () => void;
}

interface ProfileMenuSectionProps {
  onNavigateToMyPets: () => void;
  onNavigateToSettings: () => void;
  onNavigateToCreatePet: () => void;
}

export const ProfileMenuSection: React.FC<ProfileMenuSectionProps> = React.memo(({
  onNavigateToMyPets,
  onNavigateToSettings,
  onNavigateToCreatePet,
}) => {
  const theme = useTheme();
  const menuItems = useMemo<MenuItem[]>(() => [
    {
      title: "My Pets",
      icon: "paw",
      color: theme.colors.primary,
      onPress: onNavigateToMyPets,
    },
    {
      title: "Settings",
      icon: "settings",
      color: theme.colors.primary,
      onPress: onNavigateToSettings,
    },
    {
      title: "Add New Pet",
      icon: "add-circle",
      color: theme.colors.success,
      onPress: onNavigateToCreatePet,
    },
    {
      title: "Help & Support",
      icon: "help-circle",
      color: "#8b5cf6",
      onPress: () => {
        Alert.alert("Help", "Help center coming soon!");
      },
    },
    {
      title: "About",
      icon: "information-circle",
      color: theme.colors.warning,
      onPress: () => {
        Alert.alert("About", "PawfectMatch v1.0.0");
      },
    },
  ], [theme, onNavigateToMyPets, onNavigateToSettings, onNavigateToCreatePet]);

  const styles = StyleSheet.create({
    menuSection: {
      paddingHorizontal: 20,
      marginBottom: 30,
    },
    menuItem: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      backgroundColor: theme.colors.bg,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      shadowColor: theme.colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    menuItemContent: {
      flexDirection: "row" as const,
      alignItems: "center" as const,
      flex: 1,
    },
    menuIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: "center" as const,
      alignItems: "center" as const,
      marginRight: 16,
    },
    menuText: {
      flex: 1,
      fontSize: 16,
      fontWeight: "600" as const,
      color: theme.colors.text,
    },
  });

  const handleMenuItemPress = useCallback((item: MenuItem) => () => {
    try {
      item.onPress();
    } catch (error) {
      logger.error("Menu item action failed:", { error });
    }
  }, []);

  const handleMenuItemApiAction = useCallback((title: string) => async () => {
    logger.info(`Menu item ${title} API action`);
  }, []);

  return (
    <View style={styles.menuSection}>
      {menuItems.map((item) => (
        <AdvancedCard
          key={item.title}
          {...CardConfigs.glass({
            interactions: ["hover", "press", "glow", "bounce"],
            haptic: "medium",
            onPress: handleMenuItemPress(item),
            apiAction: handleMenuItemApiAction(item.title),
          })}
          style={styles.menuItem}
        >
          <View style={styles.menuItemContent}>
            <LinearGradient
              colors={[`${item.color}20`, `${item.color}10`]}
              style={styles.menuIcon}
            >
              <Ionicons name={item.icon} size={24} color={item.color} />
            </LinearGradient>
            <Text style={styles.menuText}>{item.title}</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </View>
        </AdvancedCard>
      ))}
    </View>
  );
});


ProfileMenuSection.displayName = 'ProfileMenuSection';
