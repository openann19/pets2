/**
 * Admin Navigator for Mobile
 * Handles admin-specific navigation and role-based access
 */

import { useAuthStore } from "@pawfectmatch/core";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

// Admin Screens
import AdminAnalyticsScreen from "../screens/admin/AdminAnalyticsScreen";
import AdminBillingScreen from "../screens/admin/AdminBillingScreen";
import AdminChatsScreen from "../screens/admin/AdminChatsScreen";
import AdminDashboardScreen from "../screens/admin/AdminDashboardScreen";
import AdminSecurityScreen from "../screens/admin/AdminSecurityScreen";
import AdminServicesScreen from "../screens/admin/AdminServicesScreen";
import AdminUploadsScreen from "../screens/admin/AdminUploadsScreen";
import AdminUsersScreen from "../screens/admin/AdminUsersScreen";
import AdminVerificationsScreen from "../screens/admin/AdminVerificationsScreen";
import { useTheme } from '@mobile/theme';

const Stack = createNativeStackNavigator();

export default function AdminNavigator(): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);
  
  const { user, isLoading } = useAuthStore();

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Check admin access
  if (!user || user.role !== "admin") {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Access Denied</Text>
        <Text style={styles.errorMessage}>
          You don't have permission to access the admin panel.
        </Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName="AdminDashboard"
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.bg,
        },
        headerTintColor: theme.colors.onSurface,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen as React.ComponentType<any>}
        options={{
          title: "Admin Dashboard",
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminAnalytics"
        component={AdminAnalyticsScreen as React.ComponentType<any>}
        options={{
          title: "Analytics Dashboard",
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen as React.ComponentType<any>}
        options={{
          title: "User Management",
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminSecurity"
        component={AdminSecurityScreen as React.ComponentType<any>}
        options={{
          title: "Security Dashboard",
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminBilling"
        component={AdminBillingScreen as React.ComponentType<any>}
        options={{
          title: "Billing Management",
          headerShown: false, // Custom header in component
        }}
      />

      {/* Chat Moderation */}
      <Stack.Screen
        name="AdminChats"
        component={AdminChatsScreen as React.ComponentType<any>}
        options={{
          title: "Chat Moderation",
          headerShown: false,
        }}
      />

      {/* Upload Management */}
      <Stack.Screen
        name="AdminUploads"
        component={AdminUploadsScreen as React.ComponentType<any>}
        options={{
          title: "Upload Management",
          headerShown: false,
        }}
      />

      {/* Verification Management */}
      <Stack.Screen
        name="AdminVerifications"
        component={AdminVerificationsScreen as React.ComponentType<any>}
        options={{
          title: "Verification Management",
          headerShown: false,
        }}
      />

      {/* Services Management */}
      <Stack.Screen
        name="AdminServices"
        component={AdminServicesScreen as React.ComponentType<any>}
        options={{
          title: "Services Management",
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const makeStyles = (theme: any) => StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.onMuted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.bg,
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.danger,
    marginBottom: 16,
    textAlign: "center",
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.onMuted,
    textAlign: "center",
    lineHeight: 24,
  },
});
