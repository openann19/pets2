/**
 * Navigation Type Definitions
 * 
 * Provides complete type safety for React Navigation throughout the app.
 * Defines all routes, params, and navigation helpers.
 */

import type { CompositeNavigationProp, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

// ============================================================================
// Root Stack Navigator
// ============================================================================

export interface RootStackParamList {
  // Onboarding
  Welcome: undefined;
  UserIntent: undefined;
  UserPreferences: undefined;
  
  // Auth
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
  
  // Main App
  Main: undefined;
  Home: undefined;
  Swipe: undefined;
  Map: undefined;
  Chat: undefined;
  Profile: undefined;
  
  // Matches & Chat
  Matches: undefined;
  ChatScreen: { matchId: string };
  MatchDetail: { matchId: string };
  
  // Pets
  MyPets: undefined;
  CreatePet: undefined;
  EditPet: { petId: string };
  PetDetail: { petId: string };
  
  // AI Features
  AIBio: { petId: string };
  AICompatibility: { pet1Id: string; pet2Id: string };
  AIPhotoAnalyzer: { petId: string };
  
  // Premium
  Premium: undefined;
  Subscribe: undefined;
  ManageSubscription: undefined;
  SubscriptionSuccess: { subscriptionId: string };
  
  // Settings
  Settings: undefined;
  PrivacySettings: undefined;
  NotificationSettings: undefined;
  SecurityCenter: undefined;
  
  // GDPR
  DataExport: undefined;
  DeleteAccount: undefined;
  
  // Admin (if applicable)
  AdminDashboard: undefined;
  ModerationTools: undefined;
  
  // Community
  Community: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  
  // Live Features
  GoLive: undefined;
  LiveBrowse: undefined;
  LiveViewer: { liveStreamId: string };
  
  // Stories
  Stories: undefined;
  StoryViewer: { storyId: string };
  
  // AR Features
  ARScentTrails: { petId: string };
  
  // Adoption
  AdoptionListings: undefined;
  AdoptionDetail: { applicationId: string };
  ApplicationReview: { applicationId: string };
  
  // Premium Demo
  PremiumDemo: undefined;
  
  // Verification
  Verification: { petId: string };
  VerificationTiers: undefined;
  
  // Leaderboard
  Leaderboard: undefined;
  
  // Help & Support
  Help: undefined;
  
  // Blocked Users
  BlockedUsers: undefined;
  
  // User Intent Setup
  UserIntentScreen: undefined;
  
  // Preferences Setup
  PreferencesSetup: undefined;
}

// ============================================================================
// Tab Navigator
// ============================================================================

export interface BottomTabParamList {
  Home: undefined;
  Discover: undefined;
  Map: undefined;
  Chat: undefined;
  Profile: undefined;
}

// ============================================================================
// Navigation Prop Types
// ============================================================================

/**
 * Root navigation prop for screens in RootStackNavigator
 */
export type RootNavigationProp<RouteName extends keyof RootStackParamList> =
  NativeStackNavigationProp<RootStackParamList, RouteName>;

/**
 * Tab navigation prop for screens in BottomTabNavigator
 */
export type TabNavigationProp<RouteName extends keyof BottomTabParamList> =
  BottomTabNavigationProp<BottomTabParamList, RouteName>;

/**
 * Composite navigation prop combining stack and tab navigators
 */
export type NavigationProp<RouteName extends keyof RootStackParamList> =
  CompositeNavigationProp<
    RootNavigationProp<RouteName>,
    TabNavigationProp<keyof BottomTabParamList>
  >;

/**
 * Route prop type for accessing route params
 */
export type RouteProps<RouteName extends keyof RootStackParamList> = RouteProp<
  RootStackParamList,
  RouteName
>;

// ============================================================================
// Screen Props Helpers
// ============================================================================

/**
 * Props type for a screen component in the RootStackNavigator
 */
export type RootStackScreenProps<RouteName extends keyof RootStackParamList> = {
  navigation: RootNavigationProp<RouteName>;
  route: RouteProps<RouteName>;
};

/**
 * Props type for a screen component in the BottomTabNavigator
 */
export type TabScreenProps<RouteName extends keyof BottomTabParamList> = {
  navigation: TabNavigationProp<RouteName>;
  route: RouteProp<BottomTabParamList, RouteName>;
};

// ============================================================================
// Hook Helper Types
// ============================================================================

/**
 * Typed navigation hook for RootStackNavigator
 */
export interface UseRootNavigation {
  <RouteName extends keyof RootStackParamList>(
    ...args: Parameters<typeof import("@react-navigation/native").useNavigation>
  ): RootNavigationProp<RouteName>;
}

/**
 * Typed navigation hook for TabNavigator
 */
export interface UseTabNavigation {
  <RouteName extends keyof BottomTabParamList>(
    ...args: Parameters<typeof import("@react-navigation/native").useNavigation>
  ): TabNavigationProp<RouteName>;
}

/**
 * Typed route hook
 */
export interface UseRootRoute {
  <RouteName extends keyof RootStackParamList>(): RouteProps<RouteName>;
}

/**
 * Typed route hook for tabs
 */
export interface UseTabRoute {
  <RouteName extends keyof BottomTabParamList>(): RouteProp<BottomTabParamList, RouteName>;
}

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Navigation options for RootStack screens
 */
export interface RootStackScreenOptions {
  headerShown?: boolean;
  headerTitle?: string;
  headerBackTitle?: string;
  gestureEnabled?: boolean;
  animation?: "default" | "fade" | "slide_from_right" | "slide_from_left";
}

/**
 * Tab options for BottomTabNavigator
 */
export interface TabOptions {
  tabBarLabel?: string;
  tabBarIcon?: (props: {
    color: string;
    size: number;
    focused: boolean;
  }) => JSX.Element;
  tabBarBadge?: string | number;
  tabBarAccessibilityLabel?: string;
}

// ============================================================================
// Global Type Augmentation
// ============================================================================

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default RootStackParamList;

