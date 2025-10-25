import { Ionicons } from "@expo/vector-icons";
import { logger } from "@pawfectmatch/core";
import { useAuthStore } from "@pawfectmatch/core";
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AdvancedCard, CardConfigs } from "../components/Advanced/AdvancedCard";
import { matchesAPI } from "../services/api";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";

type ProfileScreenProps = NativeStackScreenProps<RootStackParamList, "Profile">;

const ProfileScreen = ({ navigation, route }: ProfileScreenProps) => {
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    email: true,
    push: true,
  });
  const [privacy, setPrivacy] = useState({
    showLocation: true,
    showAge: true,
    showBreed: true,
  });

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          void (async () => {
            try {
              logout?.();
              await AsyncStorage.clear();
              navigation.reset({
                index: 0,
                routes: [{ name: "Login" }],
              });
            } catch (error) {
              logger.error("Logout error:", { error });
            }
          })();
        },
      },
    ]);
  };

  const handleSettingToggle = (setting: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setNotifications((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handlePrivacyToggle = (setting: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPrivacy((prev) => ({
      ...prev,
      [setting]: !prev[setting as keyof typeof prev],
    }));
  };

  const handleNotificationToggle = (key: string) => () => {
    handleSettingToggle(key);
  };
  const handlePrivacySettingToggle = (key: string) => () => {
    handlePrivacyToggle(key);
  };

  const menuItems = [
    {
      title: "My Pets",
      icon: "paw",
      color: "#ec4899",
      onPress: () => navigation.navigate("MyPets"),
    },
    {
      title: "Settings",
      icon: "settings",
      color: "#3b82f6",
      onPress: () => navigation.navigate("Settings"),
    },
    {
      title: "Add New Pet",
      icon: "add-circle",
      color: "#10b981",
      onPress: () => navigation.navigate("CreatePet"),
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
      icon: "information",
      color: "#f59e0b",
      onPress: () => {
        Alert.alert("About", "PawfectMatch v1.0.0");
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate("Settings")}
          >
            <Ionicons name="settings" size={24} color="#666" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Card */}
        <AdvancedCard
          {...CardConfigs.glass({
            interactions: ["hover", "press", "glow"],
            haptic: "light",
            apiAction: async () => {
              const userProfile = await matchesAPI.getUserProfile();
              logger.info("Loaded user profile:", { userProfile });
            },
          })}
          style={styles.header}
        >
          <View style={styles.profileSection}>
            <Image
              source={{
                uri:
                  user?.avatar ??
                  "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=150",
              }}
              style={styles.profileImage}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>
                {user?.firstName ?? "User"} {user?.lastName ?? ""}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email ?? "user@example.com"}
              </Text>
              <Text style={styles.memberSince}>
                Member since {new Date().getFullYear()}
              </Text>
            </View>
          </View>
        </AdvancedCard>

        {/* Quick Stats */}
        <AdvancedCard
          {...CardConfigs.glass({
            interactions: ["hover", "press", "glow"],
            haptic: "light",
            apiAction: async () => {
              const [matches] = await Promise.all([
                matchesAPI.getMatches().catch(() => []),
                matchesAPI.getUserProfile().catch(() => null),
              ]);
              logger.info("Loaded stats:", { matches: matches.length });
            },
          })}
          style={styles.statsSection}
        >
          <View style={styles.statsContent}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Matches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Messages</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pets</Text>
            </View>
          </View>
        </AdvancedCard>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item) => (
            <AdvancedCard
              key={item.title}
              {...CardConfigs.glass({
                interactions: ["hover", "press", "glow", "bounce"],
                haptic: "medium",
                onPress: () => {
                  try {
                    item.onPress();
                  } catch (error) {
                    logger.error("Menu item action failed:", { error });
                  }
                },
                apiAction: async () => {
                  logger.info(`Menu item ${item.title} API action`);
                },
              })}
              style={styles.menuItem}
            >
              <View style={styles.menuItemContent}>
                <LinearGradient
                  colors={[`${item.color}20`, `${item.color}10`]}
                  style={styles.menuIcon}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={24}
                    color={item.color}
                  />
                </LinearGradient>
                <Text style={styles.menuText}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </View>
            </AdvancedCard>
          ))}
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <BlurView intensity={20} style={styles.settingsCard}>
            {Object.entries(notifications).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    {key.charAt(0).toUpperCase() + key.slice(1)} Notifications
                  </Text>
                  <Text style={styles.settingDescription}>
                    Receive {key} notifications
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={handleNotificationToggle(key)}
                  trackColor={{ false: "#e5e7eb", true: "#fce7f3" }}
                  thumbColor={value ? "#ec4899" : "#9ca3af"}
                />
              </View>
            ))}
          </BlurView>
        </View>

        {/* Privacy */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <BlurView intensity={20} style={styles.settingsCard}>
            {Object.entries(privacy).map(([key, value]) => (
              <View key={key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>
                    Show {key.replace(/([A-Z])/g, " $1").toLowerCase()}
                  </Text>
                  <Text style={styles.settingDescription}>
                    {value ? "Visible to others" : "Hidden from others"}
                  </Text>
                </View>
                <Switch
                  value={value}
                  onValueChange={handlePrivacySettingToggle(key)}
                  trackColor={{ false: "#e5e7eb", true: "#fce7f3" }}
                  thumbColor={value ? "#ec4899" : "#9ca3af"}
                />
              </View>
            ))}
          </BlurView>
        </View>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.logoutGradient}
          >
            <Ionicons name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerButton: {
    padding: 8,
  },
  headerBlur: {
    borderRadius: 20,
    overflow: "hidden",
    padding: 20,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
    color: "#9ca3af",
  },
  statsSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    marginBottom: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#ec4899",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    paddingLeft: 4,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: "hidden",
    padding: 16,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  settingInfo: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: "#6b7280",
  },
  logoutButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  statsContent: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  menuItemContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default ProfileScreen;
