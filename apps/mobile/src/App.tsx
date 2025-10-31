import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { ThemeProvider } from '@/theme';
import { queryClient } from './config/queryClient';
import i18n from './i18n';
import AdminNavigator from './navigation/AdminNavigator';
import BottomTabNavigator from './navigation/BottomTabNavigator';
import { screenTransitions } from './navigation/transitions';
import type { RootStackParamList } from './navigation/types';
import AppChrome from './chrome/AppChrome';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NavigationGuard } from './navigation/NavigationGuard';
import { ProtectedRoute } from './navigation/ProtectedRoute';
import { useBadgeCount } from './hooks/useBadgeCount';
import { notificationService } from './services/notifications';

// Authentication Screens
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';

// Onboarding Screens
import WelcomeScreen from './screens/onboarding/WelcomeScreen';
// import UserIntentScreen from "./screens/onboarding/UserIntentScreen";
// import PetProfileSetupScreen from "./screens/onboarding/PetProfileSetupScreen";
// import PreferencesSetupScreen from "./screens/onboarding/PreferencesSetupScreen";

// Main Screens
import ChatScreen from './screens/ChatScreen';
import HomeScreen from './screens/HomeScreen';
import MatchesScreen from './screens/MatchesScreen';
import ProfileScreen from './screens/ProfileScreen';
import SwipeScreen from './screens/SwipeScreen';
import PetProfileScreen from './screens/PetProfileScreen';

// Premium & Subscription Screens - Lazy loaded for performance (P-03)
import PremiumCancelScreen from './screens/PremiumCancelScreen';
// import { LazyPremiumScreen, LazyManageSubscriptionScreen, LazySubscriptionManagerScreen } from './navigation/lazyScreens';
import PremiumSuccessScreen from './screens/PremiumSuccessScreen';
import { SubscriptionSuccessScreen } from './screens/premium/SubscriptionSuccessScreen';
import PremiumScreen from './screens/PremiumScreen';
import ManageSubscriptionScreen from './screens/ManageSubscriptionScreen';

// AI Screens - Lazy loaded for performance (P-03)
// import {
//   LazyAIBioScreen,
//   LazyAICompatibilityScreen,
//   LazyAIPhotoAnalyzerScreen,
// } from './navigation/lazyScreens';
import AIBioScreen from './screens/AIBioScreen';
import AICompatibilityScreen from './screens/AICompatibilityScreen';
import AIPhotoAnalyzerScreen from './screens/AIPhotoAnalyzerScreen';

// Settings & Privacy Screens
import AboutTermsPrivacyScreen from './screens/AboutTermsPrivacyScreen';
import AdvancedFiltersScreen from './screens/AdvancedFiltersScreen';
import BlockedUsersScreen from './screens/BlockedUsersScreen';
import DeactivateAccountScreen from './screens/DeactivateAccountScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import ModerationToolsScreen from './screens/ModerationToolsScreen';
import NotificationPreferencesScreen from './screens/NotificationPreferencesScreen';
import PrivacySettingsScreen from './screens/PrivacySettingsScreen';
import SafetyCenterScreen from './screens/SafetyCenterScreen';
import SettingsScreen from './screens/SettingsScreen';
import VerificationCenterScreen from './screens/VerificationCenterScreen';

// Pet Management Screens
import CreatePetScreen from './screens/CreatePetScreen';
import MapScreen from './screens/MapScreen';
import MyPetsScreen from './screens/MyPetsScreen';

// Adoption Screens
import AdoptionApplicationScreen from './screens/adoption/AdoptionApplicationScreen';
import AdoptionManagerScreen from './screens/adoption/AdoptionManagerScreen';

// Calling Screens
// import ActiveCallScreen from "./screens/calling/ActiveCallScreen";
// import IncomingCallScreen from "./screens/calling/IncomingCallScreen";

// Advanced Feature Screens
import ARScentTrailsScreen from './screens/ARScentTrailsScreen';
import CommunityScreen from './screens/CommunityScreen';
import MemoryWeaveScreen from './screens/MemoryWeaveScreen';
import StoriesScreen from './screens/StoriesScreen';
import LeaderboardScreen from './screens/leaderboard/LeaderboardScreen';
// import ModernSwipeScreen from "./screens/ModernSwipeScreen";
// import ModernCreatePetScreen from "./screens/ModernCreatePetScreen";

// Test/Demo Screens
// ComponentShowcaseScreen removed
import ComponentTestScreen from './screens/ComponentTestScreen';
import MigrationExampleScreen from './screens/MigrationExampleScreen';
import NewComponentsTestScreen from './screens/NewComponentsTestScreen';
import PremiumDemoScreen from './screens/PremiumDemoScreen';
import UIDemoScreen from './screens/UIDemoScreen';
import MotionLabScreen from './labs/motion/MotionLabScreen';

// Live Streaming Screens
import GoLiveScreen from './screens/GoLiveScreen';
import LiveBrowseScreen from './screens/LiveBrowseScreen';
import LiveViewerScreen from './screens/LiveViewerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const MainTabsScreen = (): React.ReactElement => <HomeScreen />;

const AppNavigator = (): React.ReactElement => (
  <Stack.Navigator
    initialRouteName="Home"
    screenOptions={{ headerShown: false }}
  >
    {/* Authentication Screens */}
    <Stack.Screen
      name="Login"
      component={LoginScreen}
    />
    <Stack.Screen
      name="Register"
      component={RegisterScreen}
    />
    <Stack.Screen
      name="ForgotPassword"
      component={ForgotPasswordScreen}
    />
    <Stack.Screen
      name="ResetPassword"
      component={ResetPasswordScreen}
    />

    {/* Onboarding Screens */}
    <Stack.Screen
      name="Welcome"
      component={WelcomeScreen}
    />

    {/* Main Tab Navigator (with EnhancedTabBar) - Protected */}
    <Stack.Screen name="Home">
      {(props) => (
        <ErrorBoundary screenName="Home">
          <ProtectedRoute {...props} component={BottomTabNavigator} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen
      name="Main"
      component={HomeScreen}
      options={screenTransitions.fluid}
    />
    <Stack.Screen name="Swipe">
      {(props) => (
        <ErrorBoundary screenName="Swipe">
          <ProtectedRoute {...props} component={SwipeScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="Matches">
      {(props) => (
        <ErrorBoundary screenName="Matches">
          <ProtectedRoute {...props} component={MatchesScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="Profile">
      {(props) => (
        <ErrorBoundary screenName="Profile">
          <ProtectedRoute {...props} component={ProfileScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="PetProfile">
      {(props) => (
        <ErrorBoundary screenName="PetProfile">
          <ProtectedRoute {...props} component={PetProfileScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="Settings">
      {(props) => (
        <ErrorBoundary screenName="Settings">
          <ProtectedRoute {...props} component={SettingsScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="Chat">
      {(props) => (
        <ErrorBoundary screenName="Chat">
          <ProtectedRoute {...props} component={ChatScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen
      name="MainTabs"
      component={MainTabsScreen}
    />

    {/* Pet Management Screens - Protected */}
    <Stack.Screen name="MyPets">
      {(props) => (
        <ErrorBoundary screenName="MyPets">
          <ProtectedRoute {...props} component={MyPetsScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen name="CreatePet">
      {(props) => (
        <ErrorBoundary screenName="CreatePet">
          <ProtectedRoute {...props} component={CreatePetScreen} />
        </ErrorBoundary>
      )}
    </Stack.Screen>
    <Stack.Screen
      name="Map"
      component={MapScreen}
      options={screenTransitions.fluid}
    />

    {/* Premium & Subscription Screens - Lazy loaded for performance (P-03) */}
    <Stack.Screen
      name="Premium"
      component={PremiumScreen}
    />
    <Stack.Screen
      name="Subscription"
      component={PremiumScreen}
    />
    <Stack.Screen
      name="PremiumSuccess"
      component={PremiumSuccessScreen}
    />
    <Stack.Screen
      name="PremiumCancel"
      component={PremiumCancelScreen}
    />
    <Stack.Screen
      name="ManageSubscription"
      component={ManageSubscriptionScreen}
    />
    <Stack.Screen
      name="SubscriptionSuccess"
      component={SubscriptionSuccessScreen}
    />
    <Stack.Screen
      name="ManageSubscription"
      component={ManageSubscriptionScreen}
    />

    {/* AI Screens - Lazy loaded for performance (P-03) */}
    <Stack.Screen
      name="AIBio"
      component={AIBioScreen}
    />
    <Stack.Screen
      name="AIPhotoAnalyzer"
      component={AIPhotoAnalyzerScreen}
    />
    <Stack.Screen
      name="AICompatibility"
      component={AICompatibilityScreen}
    />

    {/* Settings & Privacy Screens */}
    <Stack.Screen
      name="PrivacySettings"
      component={PrivacySettingsScreen}
    />
    <Stack.Screen
      name="BlockedUsers"
      component={BlockedUsersScreen}
    />
    <Stack.Screen
      name="SafetyCenter"
      component={SafetyCenterScreen}
    />
    <Stack.Screen
      name="VerificationCenter"
      component={VerificationCenterScreen}
      options={screenTransitions.fluid}
    />
    <Stack.Screen
      name="NotificationPreferences"
      component={NotificationPreferencesScreen}
    />
    <Stack.Screen
      name="HelpSupport"
      component={HelpSupportScreen}
    />
    <Stack.Screen
      name="AboutTermsPrivacy"
      component={AboutTermsPrivacyScreen}
    />
    <Stack.Screen
      name="DeactivateAccount"
      component={DeactivateAccountScreen}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
    />
    <Stack.Screen
      name="AdvancedFilters"
      component={AdvancedFiltersScreen}
    />
    <Stack.Screen
      name="ModerationTools"
      component={ModerationToolsScreen}
    />

    {/* Adoption Screens */}
    <Stack.Screen
      name="AdoptionManager"
      component={AdoptionManagerScreen}
    />
    <Stack.Screen
      name="AdoptionApplication"
      component={AdoptionApplicationScreen}
    />

    {/* Admin Navigator */}
    <Stack.Screen
      name="AdminDashboard"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminUsers"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminAnalytics"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminBilling"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminSecurity"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminChats"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminUploads"
      component={AdminNavigator}
    />
    <Stack.Screen
      name="AdminVerifications"
      component={AdminNavigator}
    />

    {/* Calling Screens - Commented out due to prop requirements */}
    {/* <Stack.Screen name="ActiveCall" component={ActiveCallScreen} /> */}
    {/* <Stack.Screen name="IncomingCall" component={IncomingCallScreen} /> */}

    {/* Advanced Feature Screens */}
    <Stack.Screen
      name="MemoryWeave"
      component={MemoryWeaveScreen}
    />
    <Stack.Screen
      name="ARScentTrails"
      component={ARScentTrailsScreen}
      options={screenTransitions.fluid}
    />
    <Stack.Screen
      name="Stories"
      component={StoriesScreen}
    />
    <Stack.Screen
      name="Leaderboard"
      component={LeaderboardScreen}
    />
    <Stack.Screen
      name="Community"
      component={CommunityScreen}
    />

    {/* Test/Demo Screens */}
    <Stack.Screen
      name="ComponentTest"
      component={ComponentTestScreen}
    />
    <Stack.Screen
      name="NewComponentsTest"
      component={NewComponentsTestScreen}
    />
    <Stack.Screen
      name="MigrationExample"
      component={MigrationExampleScreen}
    />
    <Stack.Screen
      name="PremiumDemo"
      component={PremiumDemoScreen}
    />
    <Stack.Screen
      name="UIDemo"
      component={UIDemoScreen}
      options={screenTransitions.fluid}
    />
    <Stack.Screen
      name="MotionLab"
      component={MotionLabScreen}
      options={{ presentation: 'modal', headerShown: false }}
    />

    {/* Live Streaming Screens */}
    <Stack.Screen
      name="GoLive"
      component={GoLiveScreen}
      options={{ presentation: 'modal' }}
    />
    <Stack.Screen
      name="LiveViewer"
      component={LiveViewerScreen}
    />
    <Stack.Screen
      name="LiveBrowse"
      component={LiveBrowseScreen}
    />
  </Stack.Navigator>
);

function AppContent(): React.ReactElement {
  // Initialize badge count management
  useBadgeCount();

  // Initialize notification service on app start (without auto-requesting permission)
  // Permission will be requested via NotificationPermissionPrompt component
  React.useEffect(() => {
    // Initialize without auto-request - we'll show our custom prompt first
    notificationService.initialize(false).catch((error) => {
      // Non-critical error - notifications may not be available
      console.warn('Failed to initialize notification service:', error);
    });
  }, []);

  return (
    <NavigationGuard>
      <StatusBar style="dark" />
      <AppChrome>
        <AppNavigator />
      </AppChrome>
    </NavigationGuard>
  );
}

export default function App(): React.ReactElement {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary screenName="App">
        <I18nextProvider i18n={i18n}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <AppContent />
            </ThemeProvider>
          </QueryClientProvider>
        </I18nextProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
