import React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n";
import { queryClient } from "./config/queryClient";
import { ThemeProvider } from "./theme/Provider";
import type { RootStackParamList } from "./navigation/types";
import AdminNavigator from "./navigation/AdminNavigator";
import BottomTabNavigator from "./navigation/BottomTabNavigator";
import { screenTransitions } from "./navigation/transitions";

// Authentication Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";
import ForgotPasswordScreen from "./screens/ForgotPasswordScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";

// Onboarding Screens
// import WelcomeScreen from "./screens/onboarding/WelcomeScreen";
// import UserIntentScreen from "./screens/onboarding/UserIntentScreen";
// import PetProfileSetupScreen from "./screens/onboarding/PetProfileSetupScreen";
// import PreferencesSetupScreen from "./screens/onboarding/PreferencesSetupScreen";

// Main Screens
import HomeScreen from "./screens/HomeScreen";
import SwipeScreen from "./screens/SwipeScreen";
import MatchesScreen from "./screens/MatchesScreen";
import ProfileScreen from "./screens/ProfileScreen";
import ChatScreen from "./screens/ChatScreen";

// Premium & Subscription Screens
import PremiumScreen from "./screens/PremiumScreen";
import PremiumSuccessScreen from "./screens/PremiumSuccessScreen";
import PremiumCancelScreen from "./screens/PremiumCancelScreen";
import SubscriptionManagerScreen from "./screens/premium/SubscriptionManagerScreen";
import SubscriptionSuccessScreen from "./screens/premium/SubscriptionSuccessScreen";
import ManageSubscriptionScreen from "./screens/ManageSubscriptionScreen";

// AI Screens
import AIBioScreen from "./screens/AIBioScreen";
import AIPhotoAnalyzerScreen from "./screens/AIPhotoAnalyzerScreen";
import AICompatibilityScreen from "./screens/AICompatibilityScreen";

// Settings & Privacy Screens
import SettingsScreen from "./screens/SettingsScreen";
import PrivacySettingsScreen from "./screens/PrivacySettingsScreen";
import BlockedUsersScreen from "./screens/BlockedUsersScreen";
import SafetyCenterScreen from "./screens/SafetyCenterScreen";
import VerificationCenterScreen from "./screens/VerificationCenterScreen";
import NotificationPreferencesScreen from "./screens/NotificationPreferencesScreen";
import HelpSupportScreen from "./screens/HelpSupportScreen";
import AboutTermsPrivacyScreen from "./screens/AboutTermsPrivacyScreen";
import DeactivateAccountScreen from "./screens/DeactivateAccountScreen";
import EditProfileScreen from "./screens/EditProfileScreen";
import AdvancedFiltersScreen from "./screens/AdvancedFiltersScreen";
import ModerationToolsScreen from "./screens/ModerationToolsScreen";

// Pet Management Screens
import MyPetsScreen from "./screens/MyPetsScreen";
import CreatePetScreen from "./screens/CreatePetScreen";
import MapScreen from "./screens/MapScreen";

// Adoption Screens
import AdoptionManagerScreen from "./screens/adoption/AdoptionManagerScreen";
import AdoptionApplicationScreen from "./screens/adoption/AdoptionApplicationScreen";

// Calling Screens
// import ActiveCallScreen from "./screens/calling/ActiveCallScreen";
// import IncomingCallScreen from "./screens/calling/IncomingCallScreen";

// Advanced Feature Screens
import MemoryWeaveScreen from "./screens/MemoryWeaveScreen";
import ARScentTrailsScreen from "./screens/ARScentTrailsScreen";
import StoriesScreen from "./screens/StoriesScreen";
import LeaderboardScreen from "./screens/leaderboard/LeaderboardScreen";
import CommunityScreen from "./screens/CommunityScreen";
// import ModernSwipeScreen from "./screens/ModernSwipeScreen";
// import ModernCreatePetScreen from "./screens/ModernCreatePetScreen";

// Test/Demo Screens
// ComponentShowcaseScreen removed
import ComponentTestScreen from "./screens/ComponentTestScreen";
import NewComponentsTestScreen from "./screens/NewComponentsTestScreen";
import MigrationExampleScreen from "./screens/MigrationExampleScreen";
import PremiumDemoScreen from "./screens/PremiumDemoScreen";
import UIDemoScreen from "./screens/UIDemoScreen";

// Live Streaming Screens
import GoLiveScreen from "./screens/GoLiveScreen";
import LiveViewerScreen from "./screens/LiveViewerScreen";
import LiveBrowseScreen from "./screens/LiveBrowseScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabsScreen = (): React.ReactElement => <HomeScreen />;

const AppNavigator = (): React.ReactElement => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
  >
    {/* Authentication Screens */}
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />

    {/* Main Tab Navigator (with EnhancedTabBar) */}
    <Stack.Screen name="Home" component={BottomTabNavigator} />
    <Stack.Screen name="Main" component={HomeScreen} />
    <Stack.Screen name="Swipe" component={SwipeScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Matches" component={MatchesScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Profile" component={ProfileScreen} options={screenTransitions.scale} />
    <Stack.Screen name="Settings" component={SettingsScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Chat" component={ChatScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="MainTabs" component={MainTabsScreen} />

    {/* Onboarding Screens - Commented out due to navigation prop requirements */}
    {/* These screens expect specific navigation props that will be handled by their own navigators */}

    {/* Pet Management Screens */}
    <Stack.Screen name="MyPets" component={MyPetsScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="CreatePet" component={CreatePetScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Map" component={MapScreen} options={screenTransitions.fluid} />

    {/* Premium & Subscription Screens */}
    <Stack.Screen name="Premium" component={PremiumScreen} />
    <Stack.Screen name="Subscription" component={PremiumScreen} />
    <Stack.Screen name="PremiumSuccess" component={PremiumSuccessScreen} />
    <Stack.Screen name="PremiumCancel" component={PremiumCancelScreen} />
    <Stack.Screen
      name="SubscriptionManager"
      component={SubscriptionManagerScreen}
    />
    <Stack.Screen
      name="SubscriptionSuccess"
      component={SubscriptionSuccessScreen}
    />
    <Stack.Screen
      name="ManageSubscription"
      component={ManageSubscriptionScreen}
    />

    {/* AI Screens */}
    <Stack.Screen name="AIBio" component={AIBioScreen} />
    <Stack.Screen name="AIPhotoAnalyzer" component={AIPhotoAnalyzerScreen} />
    <Stack.Screen name="AICompatibility" component={AICompatibilityScreen} />

    {/* Settings & Privacy Screens */}
    <Stack.Screen name="PrivacySettings" component={PrivacySettingsScreen} />
    <Stack.Screen name="BlockedUsers" component={BlockedUsersScreen} />
    <Stack.Screen name="SafetyCenter" component={SafetyCenterScreen} />
    <Stack.Screen name="VerificationCenter" component={VerificationCenterScreen} options={screenTransitions.fluid} />
    <Stack.Screen
      name="NotificationPreferences"
      component={NotificationPreferencesScreen}
    />
    <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
    <Stack.Screen
      name="AboutTermsPrivacy"
      component={AboutTermsPrivacyScreen}
    />
    <Stack.Screen
      name="DeactivateAccount"
      component={DeactivateAccountScreen}
    />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    <Stack.Screen name="AdvancedFilters" component={AdvancedFiltersScreen} />
    <Stack.Screen name="ModerationTools" component={ModerationToolsScreen} />

    {/* Adoption Screens */}
    <Stack.Screen name="AdoptionManager" component={AdoptionManagerScreen} />
    <Stack.Screen
      name="AdoptionApplication"
      component={AdoptionApplicationScreen}
    />

    {/* Admin Navigator */}
    <Stack.Screen name="AdminDashboard" component={AdminNavigator} />
    <Stack.Screen name="AdminUsers" component={AdminNavigator} />
    <Stack.Screen name="AdminAnalytics" component={AdminNavigator} />
    <Stack.Screen name="AdminBilling" component={AdminNavigator} />
    <Stack.Screen name="AdminSecurity" component={AdminNavigator} />
    <Stack.Screen name="AdminChats" component={AdminNavigator} />
    <Stack.Screen name="AdminUploads" component={AdminNavigator} />
    <Stack.Screen name="AdminVerifications" component={AdminNavigator} />

    {/* Calling Screens - Commented out due to prop requirements */}
    {/* <Stack.Screen name="ActiveCall" component={ActiveCallScreen} /> */}
    {/* <Stack.Screen name="IncomingCall" component={IncomingCallScreen} /> */}

    {/* Advanced Feature Screens */}
    <Stack.Screen name="MemoryWeave" component={MemoryWeaveScreen} />
    <Stack.Screen name="ARScentTrails" component={ARScentTrailsScreen} options={screenTransitions.fluid} />
    <Stack.Screen name="Stories" component={StoriesScreen} />
    <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
    <Stack.Screen name="Community" component={CommunityScreen} />

    {/* Test/Demo Screens */}
    <Stack.Screen name="ComponentTest" component={ComponentTestScreen} />
    <Stack.Screen
      name="NewComponentsTest"
      component={NewComponentsTestScreen}
    />
    <Stack.Screen name="MigrationExample" component={MigrationExampleScreen} />
    <Stack.Screen name="PremiumDemo" component={PremiumDemoScreen} />
    <Stack.Screen name="UIDemo" component={UIDemoScreen} options={screenTransitions.fluid} />

    {/* Live Streaming Screens */}
    <Stack.Screen name="GoLive" component={GoLiveScreen} options={{ presentation: "modal" }} />
    <Stack.Screen name="LiveViewer" component={LiveViewerScreen} />
    <Stack.Screen name="LiveBrowse" component={LiveBrowseScreen} />
  </Stack.Navigator>
);

export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <I18nextProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <NavigationContainer>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
          </ThemeProvider>
        </QueryClientProvider>
      </I18nextProvider>
    </GestureHandlerRootView>
  );
}
