/**
 * Admin Navigator for Mobile
 * Handles admin-specific navigation and role-based access
 */

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAdminAuth } from '@pawfectmatch/admin-core';

// Admin Screens
import AdminAnalyticsScreen from '../screens/admin/AdminAnalyticsScreen';
import { AnalyticsConfigScreen } from '../screens/admin/analytics/AnalyticsConfigScreen';
import AdminBillingScreen from '../screens/admin/AdminBillingScreen';
import AdminChatsScreen from '../screens/admin/AdminChatsScreen';
import AdminConfigScreen from '../screens/admin/AdminConfigScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminReportsScreen from '../screens/admin/AdminReportsScreen';
import AdminSecurityScreen from '../screens/admin/AdminSecurityScreen';
import AdminServicesScreen from '../screens/admin/AdminServicesScreen';
import AdminSupportScreen from '../screens/admin/AdminSupportScreen';
import AdminUploadsScreen from '../screens/admin/AdminUploadsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminVerificationsScreen from '../screens/admin/AdminVerificationsScreen';
import { useTheme } from '@mobile/theme';
import type { AppTheme } from '@mobile/theme';
import type { AdminStackParamList } from './types';

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator(): React.JSX.Element {
  const theme = useTheme();
  const styles = makeStyles(theme);

  // Use shared admin auth hook
  const { isAuthenticated, isLoading } = useAdminAuth();

  // Loading state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={theme.colors.primary}
        />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Check admin access using shared hook
  if (!isAuthenticated) {
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
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{
          title: 'Admin Dashboard',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminAnalytics"
        component={AdminAnalyticsScreen}
        options={{
          title: 'Analytics Dashboard',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AnalyticsConfig"
        component={AnalyticsConfigScreen}
        options={{
          title: 'Analytics Configuration',
          headerShown: true,
        }}
      />

      <Stack.Screen
        name="AdminUsers"
        component={AdminUsersScreen}
        options={{
          title: 'User Management',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminSecurity"
        component={AdminSecurityScreen}
        options={{
          title: 'Security Dashboard',
          headerShown: false, // Custom header in component
        }}
      />

      <Stack.Screen
        name="AdminBilling"
        component={AdminBillingScreen}
        options={{
          title: 'Billing Management',
          headerShown: false, // Custom header in component
        }}
      />

      {/* Chat Moderation */}
      <Stack.Screen
        name="AdminChats"
        component={AdminChatsScreen}
        options={{
          title: 'Chat Moderation',
          headerShown: false,
        }}
      />

      {/* Upload Management */}
      <Stack.Screen
        name="AdminUploads"
        component={AdminUploadsScreen}
        options={{
          title: 'Upload Management',
          headerShown: false,
        }}
      />

      {/* Verification Management */}
      <Stack.Screen
        name="AdminVerifications"
        component={AdminVerificationsScreen}
        options={{
          title: 'Verification Management',
          headerShown: false,
        }}
      />

      {/* Services Management */}
      <Stack.Screen
        name="AdminServices"
        component={AdminServicesScreen}
        options={{
          title: 'Services Management',
          headerShown: false,
        }}
      />

      {/* Configuration Management */}
      <Stack.Screen
        name="AdminConfig"
        component={AdminConfigScreen}
        options={{
          title: 'API Configuration',
          headerShown: false,
        }}
      />

      {/* Reports Management */}
      <Stack.Screen
        name="AdminReports"
        component={AdminReportsScreen}
        options={{
          title: 'User Reports',
          headerShown: false,
        }}
      />

      {/* Support Chat Management */}
      <Stack.Screen
        name="AdminSupport"
        component={AdminSupportScreen}
        options={{
          title: 'Support Chats',
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}

const makeStyles = (theme: AppTheme) =>
  StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.bg,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.onMuted,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.bg,
      paddingHorizontal: 32,
    },
    errorTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.danger,
      marginBottom: 16,
      textAlign: 'center',
    },
    errorMessage: {
      fontSize: 16,
      color: theme.colors.onMuted,
      textAlign: 'center',
      lineHeight: 24,
    },
  });
